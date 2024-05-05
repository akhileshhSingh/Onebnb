import { useContext,useState } from "react";
import {Link} from "react-router-dom";
import { UserContext } from "./UserContext";
import SearchPage from "../src/pages/SearchPage"

export default function Header({bookings}){
  const {user} = useContext(UserContext);
   console.log(bookings);
  const [searchQuery,setSearchQuery] = useState('');
  const [isInputVisible, setInputVisible] = useState(true);
  
  const handleSearchChange = (ev) =>{
    setSearchQuery(ev.target.value);
  };

  const toggleInputVisibility =() =>{
    setInputVisible(prevState => !prevState);
  };

  const onSearch = (searchTerm) =>{
    console.log(searchTerm);
    if(searchTerm != ''){
      window.location.href=`http://localhost:5173/search/${searchTerm}`;
    }
  }
  
  
  return (
    <header className="flex justify-between">
      <Link to={"/"} className="flex items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 -rotate-90"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
        <span className="font-bold text-xl">Onebnb</span>
      </Link>
      <div className="flex gap-1 border border-gray-300 rounded-full py-2 px-4 shadow-md-shadow-gray-300">
        <div className="flex items-center">Anywhere</div>
        <div className="border-l border-gray-300"></div>
        <div className="flex items-center justify-center">Any week</div>
        <div className="border-l border-gray-300"></div>
        <div className="flex items-center justify-center">Add guests</div>

        <div className="relative">
          {
            <input
              type="text"
              placeholder="search by place name"
              value={searchQuery}
              onChange={handleSearchChange}
              className="border-none bg-transparent focus:outline-none "
            />
          }
        </div>
        <button
          className="bg-primary text-white p-4 rounded-full ml-2 -mr-3"
          onClick={() => onSearch(searchQuery)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      <Link
        to={user ? "/account" : "/login"}
        className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        <div className="bg-gray-500 text-white rounded-full border border-gray-500 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 relative top-1"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {!!user && <div>{user.name}</div>}
      </Link>
    </header>
  );
}