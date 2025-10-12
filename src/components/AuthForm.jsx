// src/components/AuthForm.js
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // backend URL

export default function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const res = await axios.post(`${API_URL}/register`, formData);
        localStorage.setItem("token", res.data.token);
        onLogin(res.data.user);
        setMessage("Registered successfully!");
      } else {
        const res = await axios.post(`${API_URL}/login`, {
          identifier: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", res.data.token);
        onLogin(res.data.user);
        setMessage("Logged in successfully!");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Avatar URL (optional)"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <p style={{ marginTop: "10px" }}>
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
      {message && <p>{message}</p>}
    </div>
  );
}
