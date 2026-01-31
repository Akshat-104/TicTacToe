import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Lobby from "./Pages/Lobby";
import Game from "./Pages/Game";

export default function App() {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("playerName") || "";
  });
  const [opponentName, setOpponentName] = useState(() => localStorage.getItem("opponentName") || "");
  const [symbol, setSymbol] = useState(() => localStorage.getItem("symbol") || "");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  function handleLogout(navigate) {
    setPlayerName("");
    setOpponentName("");
    setSymbol("");
    setToken("");
    localStorage.removeItem("playerName");
    localStorage.removeItem("opponentName");
    localStorage.removeItem("symbol");
    localStorage.removeItem("token"); // 👈 clear JWT
    navigate("/login");
  }

  const isAuthenticated = playerName && token; // 👈 require both

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={<Login setPlayerName={setPlayerName} setToken={setToken} />}
        />
        <Route
          path="/lobby"
          element={
            isAuthenticated ? (
              <Lobby
                setOpponentName={setOpponentName}
                setSymbol={setSymbol}
                playerName={playerName}
                handleLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/game"
          element={
            isAuthenticated ? (
              <Game
                playerName={playerName}
                opponentName={opponentName}
                symbol={symbol}
                handleLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}