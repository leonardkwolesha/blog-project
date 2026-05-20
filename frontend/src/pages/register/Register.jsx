import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./register.css";
import { API_BASE } from "../../config/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Function to send data using axios
  const handleRegister = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
      const res = await axios.post(`${API_BASE}/api/user/register`, {
        username,
        email,
        password,
      });

      console.log("Server response:", res.data);
      alert("User registered successfully!");
    } catch (err) {
      console.error(err);
      if (err.response) {
        // Server responded with a status other than 2xx
        alert("Error: " + err.response.data.message);
      } else {
        // Network or other error
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="register">
      <span className="registerTitle">Register</span>
      <form className="registerForm" onSubmit={handleRegister}>
        <label>Username</label>
        <input
          className="registerInput"
          type="text"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Email</label>
        <input
          className="registerInput"
          type="text"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          className="registerInput"
          type="password"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="registerButton" type="submit">
          Register
        </button>
      </form>

       <Link to="/write">
        <button className="registerLoginButton">Login</button>
      </Link>
    </div>
  );
}
