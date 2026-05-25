import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MiniBoard({ moves }) {
  const squares = Array(9).fill(null);
  if (Array.isArray(moves)) {
    moves.forEach((move) => {
      squares[move.idx] = move.symbol;
    });
  }

  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-700 rounded-md">
      {squares.map((val, idx) => (
        <div
          key={idx}
          className="h-8 w-8 flex items-center justify-center bg-slate-800 text-xs font-bold rounded-sm"
        >
          <span className={val === "X" ? "text-blue-400" : "text-red-400"}>
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function History({ playerName, handleLogout }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("http://localhost:3000/api/games", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Sort games by date descending (newest first)
          setGames(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
          console.error("Failed to fetch games");
        }
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl p-4 sm:p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400">Game History</h1>
          <button
            onClick={() => navigate("/lobby")}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
          >
            Back to Lobby
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-400">Loading games...</p>
        ) : games.length === 0 ? (
          <p className="text-center text-slate-400">No games played yet.</p>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <MiniBoard moves={game.moves} />
                  <div>
                    <p className="text-xs text-slate-400">
                      {new Date(game.createdAt).toLocaleString()}
                    </p>
                    <p className="font-semibold text-base">
                      Room: {game.roomId.split("-")[0]}...
                    </p>
                    <p className={`text-xs ${game.status === "finished" ? "text-green-400" : "text-amber-400"}`}>
                      {game.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                
                <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-700 pt-2 sm:pt-0">
                  <p className="text-xs text-slate-400 font-medium">Winner</p>
                  <p className={`text-xl font-bold ${game.winner === "X" ? "text-blue-400" : game.winner === "O" ? "text-red-400" : "text-slate-300"}`}>
                    {game.winner || (game.status === "finished" ? "Draw" : "In Progress")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
