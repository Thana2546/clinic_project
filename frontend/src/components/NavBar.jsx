import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import {
  FaCircleUser,
  FaArrowRightFromBracket,
  FaIdBadge,
} from "react-icons/fa6";

function NavBar({ toggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate(`/${user.role}/profile`);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sm:px-6 relative z-30">
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:cursor-pointer transition-colors"
      >
        <IoMenu className="size-5 text-black" />
      </button>

      {/* ส่วน User Profile & Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 pl-3 py-1.5 border-l border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
        >
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-700">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
          <FaCircleUser className="size-8 text-slate-400 hover:text-blue-600 transition-colors" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* มือถือจะแสดงชื่อใน Dropdown แทน เพราะด้านบนถูกซ่อนไว้ */}
            <div className="block md:hidden px-4 py-2 border-b border-slate-100 mb-1">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>

            <button
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 transition-colors"
            >
              <FaIdBadge className="size-4" />
              My Profile
            </button>

            <div className="border-t border-slate-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-medium"
            >
              <FaArrowRightFromBracket className="size-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default NavBar;