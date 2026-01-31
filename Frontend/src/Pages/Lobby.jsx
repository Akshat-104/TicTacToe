import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Lobby({ setOpponentName, setSymbol, playerName, handleLogout }) {
  const [status, setStatus] = useState("Waiting to search...");
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for waiting event
    socket.on("waiting", () => {
      setStatus("Waiting for another player to join...");
    });

    // Listen for startGame event
    socket.on("startGame", ({ opponent, symbol }) => {
      setOpponentName(opponent);
      setSymbol(symbol);

      // Persist opponent info
      localStorage.setItem("opponentName", opponent);
      localStorage.setItem("symbol", symbol);

      navigate("/game");
    });

    // Listen for opponent disconnect before game starts
    socket.on("opponentDisconnected", () => {
      setStatus("Opponent disconnected. Please search again.");
    });

    // Cleanup listeners when component unmounts
    return () => {
      socket.off("waiting");
      socket.off("startGame");
      socket.off("opponentDisconnected");
    };
  }, [navigate, setOpponentName, setSymbol]);

  function handleSearchOpponent() {
    setStatus("Searching for opponent...");
    socket.emit("join", playerName);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] p-8 border border-slate-700">
        <h1 className="text-3xl font-extrabold text-center text-amber-400 mb-6 tracking-wide">
          Lobby
        </h1>
        <p className="text-center text-slate-300 mb-4">
          Welcome, <span className="text-blue-400 font-semibold">{playerName}</span>
        </p>
        <button
          onClick={handleSearchOpponent}
          className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 hover:shadow-[0_0_10px_rgba(245,158,11,0.8)] transition"
        >
          Search Opponent
        </button>
        <p className="mt-6 text-center text-slate-400 italic">{status}</p>
        <div className="flex justify-center">
          <button
            onClick={() => handleLogout(navigate)}
            className="mt-4 px-6 py-2 bg-red-500 rounded-lg hover:bg-blue-500 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}