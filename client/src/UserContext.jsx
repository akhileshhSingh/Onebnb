// import {createContext , useState , useEffect} from "react";
// import axios from "axios";

// export const UserContext = createContext({});

// export function UserContextProvider({children}){
//     // const [user,setUser] = useState(null);
//     const [user, setUser] = useState(() => {
//         // Initialize user state from local storage (if available)
//         const storedUser = localStorage.getItem("user");
//         return storedUser ? JSON.parse(storedUser) : null;
//       });
//     useEffect(()=>{
//         if (!user) {
//         axios.get('/profile',{withCredentials: true})
//         .then(({data})=>{
//             setUser(data);
//             // Store user data in local storage
//           localStorage.setItem("user", JSON.stringify(data));
//           //set token in cookie
//           document.cookie = `token=${data.token}; Secure; SameSite=None; HttpOnly;`;
//         })
//         .catch(error =>{
//             console.error("Error fetching user data:",error);
//         });
//         }
//     }, [user]);
//     return(
//         <UserContext.Provider value={{user,setUser}}>
//             {children}
//         </UserContext.Provider>
//     );
// }

import {createContext, useEffect, useState} from "react";
import axios from "axios";
import {data} from "autoprefixer";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
  const [user,setUser] = useState(null);
  const [ready,setReady] = useState(false);
  useEffect(() => {
    if (!user) {
      axios.get('/profile').then(({data}) => {
        setUser(data);
        setReady(true);
      });
    }
  }, []);
  return (
    <UserContext.Provider value={{user,setUser,ready}}>
      {children}
    </UserContext.Provider>
  );
}