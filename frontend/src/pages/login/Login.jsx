import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";
import { API_BASE } from "../../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // for redirecting after login

  // ✅ Function to send login data to backend
  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
      const res = await axios.post(`${API_BASE}/api/user/login`, {
        email,
        password,
      });

      console.log("Server response:", res.data);
      alert("Login successful!");

      // Optionally, save user data or token
      // localStorage.setItem("user", JSON.stringify(res.data.data));

      // Redirect to homepage or dashboard
      navigate("/"); 
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        // Server responded with an error (wrong credentials, etc.)
        alert("Error: " + err.response.data.message);
      } else if (err.request) {
        // Request made but no response
        alert("No response from server");
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="login">
      <span className="loginTitle">Login</span>
      <form className="loginForm" onSubmit={handleLogin}>
        <label>Email</label>
        <input
          className="loginInput"
          type="text"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          className="loginInput"
          type="password"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="loginButton" type="submit">
          Login
        </button>
      </form>
      <Link to="/register">
      
        <button className="loginRegisterButton">Register</button>
      </Link>
    </div>
  );
}
