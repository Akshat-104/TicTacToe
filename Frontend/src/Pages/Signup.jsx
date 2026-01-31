import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSignup() {
    if (!name.trim() || !password.trim()) {
      alert("Please enter a username and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! Please login.");
        navigate("/login");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] p-8 border border-slate-700">
        <h1 className="text-3xl font-extrabold text-center text-red-400 mb-6 tracking-wide">
          Signup to Join
        </h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded-lg bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-inner"
          placeholder="Choose a username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 rounded-lg bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-red-400 focus:outline-none shadow-inner"
          placeholder="Choose a password"
        />
        <button
          onClick={handleSignup}
          className="cursor-pointer w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 hover:shadow-[0_0_10px_rgba(239,68,68,0.8)] transition"
        >
          Signup
        </button>
        <p className="mt-4 text-center text-slate-300">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}