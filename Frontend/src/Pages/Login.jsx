import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setPlayerName }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlayerName(name);
        localStorage.setItem("playerName", name); // store only safe info
        localStorage.setItem("token", data.token); // 👈 store JWT
        navigate("/lobby");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] p-8 border border-slate-700">
        <h1 className="text-3xl font-extrabold text-center text-blue-400 mb-6 tracking-wide">
          Login to Play
        </h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-inner"
          placeholder="Enter your username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-lg bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-inner"
          placeholder="Enter password"
        />
        <button
          onClick={handleLogin}
          className="cursor-pointer w-full py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 hover:shadow-[0_0_10px_rgba(59,130,246,0.8)] transition"
        >
          Login
        </button>
        <p className="mt-4 text-center text-slate-300">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-red-400 font-semibold cursor-pointer hover:underline"
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
}