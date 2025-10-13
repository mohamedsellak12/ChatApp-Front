import { useState, useRef, useEffect } from "react";
import { Settings, Sun, Moon, LogOut, User2 } from "lucide-react";
import useDarkMode from "../hooks/useDarkMode.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const{darkMode,toggleDarkMode}= useTheme();
  const {logout}=useAuth()
  const menuRef = useRef(null);

  // 🔒 Fermer le menu si on clique à l’extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* ⚙️ Icône settings */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* 🧭 Popup menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 animate-fade-in"
        >
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 mr-2 text-yellow-400" /> Mode clair
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2 text-gray-400" /> Mode sombre
              </>
            )}
          </button>

          <hr className="border-gray-200 dark:border-gray-700" />
          <Link to="/profile">
           <button
    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl gap-2"
  >
    <User2 className="w-4 h-4" />
    
      Profile
    
  </button>
          </Link>

  <hr className="border-gray-200 dark:border-gray-700" />

  <button
    onClick={logout}
    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl gap-2"
  >
    <LogOut className="w-4 h-4" />
    Logout
  </button>
           
        
        </div>
      )}
    </div>
  );
}
