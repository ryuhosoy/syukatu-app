import './App.css';
import { useContext } from "react";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthContext } from "./state/AuthContext";
import axios from 'axios';

function App() {
  const { user } = useContext(AuthContext);

  const keepServerAlive = () => {
    axios.get("https://syukatu-app.vercel.app")
      .catch((err) => {
        console.error("Keep-alive request failed:", err);
      });
  };

  setInterval(keepServerAlive, 60000);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
