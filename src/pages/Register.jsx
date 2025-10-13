import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Tous les champs sont obligatoires.");
      return;
    }

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));

    try {
      setLoading(true);
      await register(fd);
    } catch (err) {
      toast.error("Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
  {/* ✅ Mobile Header */}
  <div className="md:hidden bg-gradient-to-r from-green-500 to-green-600 text-center py-8 text-white shadow-lg dark:from-green-700 dark:to-green-800">
    <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-lg">
      Chat<span className="text-green-200 dark:text-green-100">App</span>
    </h1>
    <p className="text-sm mt-2 font-light">
      Discutez librement, où que vous soyez 💬
    </p>
  </div>

  {/* 🟢 Left side (formulaire) */}
  <div className="md:flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12">
    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-10 transition-colors duration-300">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
        Créer un compte
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
        Remplissez le formulaire pour rejoindre l’aventure
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        {/* Username */}
        <div className="relative">
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <label
            htmlFor="username"
            className={`absolute left-4 transition-all ${
              formData.username
                ? "top-0 text-sm text-green-500"
                : "top-4 text-gray-400 dark:text-gray-500 text-base"
            }`}
          >
            Nom d’utilisateur
          </label>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <label
            htmlFor="email"
            className={`absolute left-4 transition-all ${
              formData.email
                ? "top-0 text-sm text-green-500"
                : "top-4 text-gray-400 dark:text-gray-500 text-base"
            }`}
          >
            Email
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
          <label
            htmlFor="password"
            className={`absolute left-4 transition-all ${
              formData.password
                ? "top-0 text-sm text-green-500"
                : "top-4 text-gray-400 dark:text-gray-500 text-base"
            }`}
          >
            Mot de passe
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 text-white p-4 rounded-xl font-semibold hover:scale-105 transform transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Création..." : "S’inscrire"}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
        Déjà un compte ?{" "}
        <Link
          to="/login"
          className="text-green-600 dark:text-green-400 hover:underline font-medium"
        >
          Se connecter
        </Link>
      </div>
    </div>
  </div>

  {/* 💚 Right side (logo + slogan desktop) */}
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
</div>

  );
}
