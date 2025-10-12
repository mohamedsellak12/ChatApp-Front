import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../utils/socket";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);

  const login = async (identifier, password) => {
    const { data } = await axios.post("http://localhost:5000/api/auth/login", {
      identifier,
      password,
    });
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    socket.auth = { token: data.token };
    socket.connect();
  };

  const register = async (formData) => {
    const { data } = await axios.post("http://localhost:5000/api/auth/register", formData);
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    socket.auth = { token: data.token };
    socket.connect();
  };

  const logout = async () => {
    if (user?.token) {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    }
    socket.disconnect();
    setUser(null);
    toast.success("loged out")
    localStorage.removeItem("user");
  };

  // reconnect if user already logged
  useEffect(() => {
    if (user?.token) {
      socket.auth = { token: user.token };
      socket.connect();
    }
  }, [user]);

  const value = { user, setUser, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
