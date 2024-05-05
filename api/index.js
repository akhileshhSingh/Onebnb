const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js')
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10); 
const jwtSecret = 'thisisthesecret';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
    
}));


// mongoose.connect(process.env.MONGO_URL);
const run = async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to myDB");
  }
  
  run()
  .catch((err) => console.error(err))

  function getUserDataFromReq(req){
    return new Promise((resolve,reject) =>{
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err;
            resolve(userData);
        });
    });
   
}

app.get('/test',(req,res)=>{
    res.json('test ok');
});

app.post('/register',async(req,res)=>{
    const {name,email,password} = req.body;

    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch(e){
        res.status(422).json(e);
    }
   
});

app.post('/login', async (req,res) =>{
    const {email,password} = req.body;
    const userDoc = await User.findOne({email:email});
    if(userDoc){
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if(passOk){
            jwt.sign({email:userDoc.email, id:userDoc._id},jwtSecret,{},(err,token)=>{
                if(err) throw err;
                res.cookie('token', token, {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'None',
                  }).json(userDoc);
            });
            
        }else{
            res.status(422).json('pass not ok');
        }
    }
    else{
        res.json('not found');
    }
});

// app.get('/profile',(req,res) =>{
//     // console.log(req.headers);
//     const {token} = req.cookies;//cookies not in request headers,unable to use them
//     if(token){
//         jwt.verify(token,jwtSecret,{},async (err,userData) =>{
//             if(err) throw err;
//             const {name,email,_id} = await User.findById(userData.id);
//             res.json({name,email,_id});
//         });
//     }else{
//         res.json(null);
//     }
//     // res.json({token});
// });
app.get('/profile', (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const {name,email,_id} = await User.findById(userData.id);
        res.json({name,email,_id});
      });
    } else {
      res.json(null);
    }
  });

app.post('/logout', (req,res) =>{
    res.cookie('token','').json(true);
})

app.post('/upload-by-link', async (req,res) =>{
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url:link,
        dest:__dirname+ '/uploads/' +newName,
    });
    res.json(newName);
})

// const photosMiddleware = multer({dest:'uploads/'});
// app.post('/upload', photosMiddleware.array('photos', 100) , (req,res) =>{
//     const uploadedFiles = [];
//     for(let i = 0;i<req.files.length;i++){
//         const {path,originalname} = req.files[i];
//         const parts = originalname.split('.');
//         const ext = parts.pop();
//         const newPath = path + '.' + ext;
//         fs.renameSync(path,newPath);
//         uploadedFiles.push(newPath.replace('uploads/', ''));
//     }
//     res.json(uploadedFiles);
// });

const photosMiddleware = multer({ dest: 'uploads/' });

app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const ext = originalname.split('.').pop(); // Get the file extension
        const newName = 'photo' + Date.now() + '.' + ext; // Construct new filename
        const newPath = 'uploads/' + newName; // Construct new file path
        fs.renameSync(path, newPath); // Move the file to the new path
        uploadedFiles.push(newName); // Push the filename to the array
    }
    res.json(uploadedFiles); // Send the array of filenames as response
});

//authenticated users to add new places or accommodations to the system
app.post('/places', (req,res) =>{
    const {token} = req.cookies;
    const {title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body;
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
          if (err) throw err;
         const PlaceDoc = await Place.create({
            owner:userData.id,
            title,address,photos:addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price
        });
        res.json(PlaceDoc);
        });
    
});

//authenticated users to fetch all places that they own
app.get('/user-places',(req,res) =>{
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        res.json( await Place.find({owner:id}) );
    });
});

//details about a specific place by providing its unique identifier(id) in the URL
app.get('/places/:id',async(req,res) =>{
    const {id} = req.params;
    res.json(await Place.findById(id));
});
//uthenticated users to update information about a specific place they own
app.put('/places', async(req,res) =>{
    const {token} = req.cookies;
    const {id,title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const placeDoc = await Place.findById(id);
        if(userData.id === placeDoc.owner.toString()){//placeDoc.owner is not in form of string its in object id whereas userData.id id string
            placeDoc.set({
                title,address,photos:addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price
            })
            await placeDoc.save();
            res.json('ok');
        }
    });
});

//a list of all places available in the system. It retrieves all place documents from the database and responds with them as a JSON array.
app.get('/places', async (req,res) =>{
    res.json( await Place.find());
});
//authenticated users to make bookings for places in the system
app.post('/bookings',async (req,res) => {
    const userData = await getUserDataFromReq(req);
    const {place,checkIn,checkOut,numberOfGuests,name,phone,price} = req.body;
    Booking.create({
        place,checkIn,checkOut,numberOfGuests,name,phone,price,
        user:userData.id,
    }).then((doc) =>{
        res.json(doc);
    }).catch((err) => {
        throw err;
    });
});
//allows authenticated users to fetch their bookings.
//It retrieves booking documents associated with the authenticated user from the database, populates the place field in each booking document with details about the booked place,
//and responds with the populated booking documents as a JSON array.
app.get('/bookings',async (req,res) =>{
    const userData = await getUserDataFromReq(req);//it returns a promise
    //userData.id;not_id weve assigned it as id check login
    res.json(await Booking.find({user:userData.id}).populate('place'));
});

app.listen(4000);
app.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});