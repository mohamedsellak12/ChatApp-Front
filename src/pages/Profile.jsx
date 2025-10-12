import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaCamera, FaEdit, FaUser, FaEnvelope, FaLock, FaCheck, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState({ info: false, avatar: false, password: false });
  const [editInfo, setEditInfo] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error("Erreur de chargement des données");
        const data = await res.json();
        setFormData(prev => ({ ...prev, username: data.username, email: data.email }));
        setPreview(data.avatar ? `http://localhost:5000${data.avatar}` : null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [user.token]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files?.length > 0) {
      const file = files[0];
      setFormData(prev => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));

      setLoading(prev => ({ ...prev, avatar: true }));
      const form = new FormData();
      form.append("avatar", file);
      try {
        const res = await fetch("http://localhost:5000/api/auth/update-avatar", {
          method: "PUT",
          headers: { Authorization: `Bearer ${user.token}` },
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur d’upload");
        setUser(prev => ({ ...prev, user: { ...prev.user, avatar: data.avatar } }));
        toast.success("✅ Avatar mis à jour !");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(prev => ({ ...prev, avatar: false }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, info: true }));
    try {
      const res = await fetch("http://localhost:5000/api/auth/update-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ username: formData.username, email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de mise à jour");
      setUser(prev => ({ ...prev, user: { ...prev.user, username: data.username, email: data.email } }));
      toast.success("✅ Informations mises à jour !");
      setEditInfo(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(prev => ({ ...prev, info: false }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword) return toast.error("Remplissez les deux champs !");
    setLoading(prev => ({ ...prev, password: true }));
    try {
      const res = await fetch("http://localhost:5000/api/auth/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de mise à jour");
      toast.success("✅ Mot de passe modifié !");
      setFormData(p => ({ ...p, currentPassword: "", newPassword: "" }));
      setEditPassword(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 via-white to-green-100 p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row gap-8 p-6">
        
        {/* Avatar */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative group">
            <img
              src={preview || "/image.png"}
              alt="Avatar"
              className="w-40 h-40 rounded-full border-4 border-green-400 shadow-xl object-cover transition-transform hover:scale-105"
            />
            <label className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full cursor-pointer transition-all shadow-lg flex items-center justify-center">
              <FaCamera className="text-lg" />
              <input type="file" name="avatar" accept="image/*" className="hidden" onChange={handleChange} />
            </label>
          </div>
          <h3 className="mt-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUser className="text-green-500" /> {formData.username}
          </h3>
          <p className="text-gray-500 flex items-center gap-2">
            <FaEnvelope className="text-green-500" /> {formData.email}
          </p>
          <button
            onClick={logout}
            className="mt-5 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow-lg transition-all"
          >
            <FaTimes /> Déconnexion
          </button>
        </div>

        {/* Infos & Sécurité */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Infos */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUser className="text-green-500" /> Informations
            </h2>
            {!editInfo ? (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm relative flex flex-col gap-3">
                <button
                  onClick={() => setEditInfo(true)}
                  className="absolute top-3 right-3 text-green-500 hover:text-green-700"
                >
                  <FaEdit />
                </button>
                <p className="flex items-center gap-2 text-gray-700">
                  <FaUser className="text-green-500" /> {formData.username}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <FaEnvelope className="text-green-500" /> {formData.email}
                </p>
              </div>
            ) : (
              <form onSubmit={handleInfoSubmit} className="bg-green-50 p-4 rounded-xl flex flex-col gap-4">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nom d’utilisateur"
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring focus:ring-green-300"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring focus:ring-green-300"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading.info}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all flex justify-center items-center gap-2"
                  >
                    <FaCheck /> {loading.info ? "Mise à jour..." : "Sauvegarder"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditInfo(false)}
                    className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-all flex justify-center items-center gap-2"
                  >
                    <FaTimes /> Annuler
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sécurité */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaLock className="text-green-500" /> Sécurité
            </h2>
            {!editPassword ? (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm relative flex items-center gap-2">
                <button
                  onClick={() => setEditPassword(true)}
                  className="absolute top-3 right-3 text-green-500 hover:text-green-700"
                >
                  <FaEdit />
                </button>
                <FaLock className="text-green-500" /> ••••••••
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="bg-green-50 p-4 rounded-xl flex flex-col gap-4">
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Mot de passe actuel"
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring focus:ring-green-300"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Nouveau mot de passe"
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring focus:ring-green-300"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading.password}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all flex justify-center items-center gap-2"
                  >
                    <FaCheck /> {loading.password ? "Mise à jour..." : "Sauvegarder"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPassword(false)}
                    className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition-all flex justify-center items-center gap-2"
                  >
                    <FaTimes /> Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
