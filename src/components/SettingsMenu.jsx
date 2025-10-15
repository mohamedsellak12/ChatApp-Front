import { useState, useRef, useEffect } from "react";
import { Settings, Sun, Moon, LogOut, User2, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const menuRef = useRef(null);

  // Fermer le menu si on clique à l’extérieur
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
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 animate-fade-in">
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
              onClick={() => setOpen(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
            >
              <User2 className="w-4 h-4" />
              Profile
            </button>
          </Link>

          <hr className="border-gray-200 dark:border-gray-700" />

          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      )}

      {/* ⚠️ Popup confirmation */}
      {showConfirm && (
        <div onClick={() => setShowConfirm(false)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-80 p-5 rounded-2xl shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmation</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm mb-5">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className={`px-4 py-2 rounded-md border ${darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"}`}
              >
                Annuler
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Oui, déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
