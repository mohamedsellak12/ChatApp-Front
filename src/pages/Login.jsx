import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";


export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Validation côté client
    if (!identifier || !password) {
      toast.error("Tous les champs sont obligatoires.");
      return;
    }

    try {
      setLoading(true);
      await login(identifier, password);
      toast.success("Loged in ")
    } catch (err) {
      // Gestion des erreurs serveur
     toast.error("something wents wrong , try agin")
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="flex flex-col md:flex-row min-h-screen">

  {/* Right side - illustration */}
  <div className="md:flex-1 bg-gradient-to-tr from-green-400 to-green-600 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6 hidden md:flex relative overflow-hidden transition-colors duration-300">
    {/* Halo lumineux en arrière-plan */}
    <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-green-500 to-green-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 opacity-30 blur-3xl animate-pulse"></div>

    {/* Logo et slogan */}
    <div className="relative text-center z-10">
      {/* Logo principal */}
      <h1 className="text-6xl font-extrabold text-white dark:text-green-400 drop-shadow-lg tracking-wide">
        Chat<span className="text-green-100 dark:text-green-200">App</span>
      </h1>

      {/* Ligne décorative */}
      <div className="mt-3 w-16 h-1 bg-white dark:bg-green-200 mx-auto rounded-full"></div>

      {/* Slogan */}
      <p className="mt-6 text-white dark:text-gray-200 text-lg font-light max-w-sm mx-auto leading-relaxed">
        Discutez librement, connectez-vous instantanément 💬  
        <br />Votre monde, en un seul chat.
      </p>

      {/* Icônes décoratives */}
      <div className="flex justify-center gap-4 mt-6 text-white dark:text-gray-300 text-2xl opacity-80">
        <i className="fab fa-whatsapp"></i>
        <i className="fas fa-comments"></i>
        <i className="fas fa-bolt"></i>
      </div>
    </div>
  </div>

  {/* Right side - form */}
  <div className="md:flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 relative overflow-hidden transition-colors duration-300">
      <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Bienvenue</h2>
      <p className="text-center text-gray-500 dark:text-gray-300 mb-8">
        Connectez-vous pour accéder à votre espace
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Floating Label Input */}
        <div className="relative">
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
          />
          <label
            htmlFor="identifier"
            className={`absolute left-4 transition-all 
              ${identifier ? "top-0 text-sm text-green-500" : "top-4 text-gray-400 dark:text-gray-400 text-base"}`}
          >
            Email ou nom d'utilisateur
          </label>
        </div>

        <div className="relative">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
          />
          <label
            htmlFor="password"
            className={`absolute left-4 transition-all 
              ${password ? "top-0 text-sm text-green-500" : "top-4 text-gray-400 dark:text-gray-400 text-base"}`}
          >
            Mot de passe
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-500 text-white p-4 rounded-xl font-semibold hover:scale-105 transform transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-500 dark:text-gray-300">
        Pas encore de compte?{" "}
        <Link to="/register" className="text-green-600 dark:text-green-400 hover:underline font-medium">
          S'inscrire
        </Link>
      </div>
    </div>
  </div>
</div>



  );
}
