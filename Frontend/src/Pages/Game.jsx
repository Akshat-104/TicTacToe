import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Board from "../components/Board";

const socket = io("http://localhost:3000");

const lines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function calculateWinner(squares) {
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function Game({ playerName, opponentName, symbol }) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [currentTurn, setCurrentTurn] = useState("X");
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  useEffect(() => {
    // Tell server this player joined
    socket.emit("join", playerName);

    // Resume existing game if server says so
    socket.on("resumeGame", async ({ gameId }) => {
      console.log("Resuming game:", gameId);

      try {
        const res = await fetch(`http://localhost:3000/api/games/${gameId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT if used
          },
        });
        const game = await res.json();

        if (Array.isArray(game.moves)) {
          const restoredSquares = Array(9).fill(null);
          game.moves.forEach(move => {
            restoredSquares[move.idx] = move.symbol;
          });
          setSquares(restoredSquares);

          const result = calculateWinner(restoredSquares);
          if (result) setWinner(result.player);
          else if (restoredSquares.every(Boolean)) setIsDraw(true);

          setCurrentTurn(
            game.moves.length > 0 ? game.moves[game.moves.length - 1].nextTurn : "X"
          );
        }
      } catch (err) {
        console.error("Error restoring game:", err);
      }
    });

    socket.on("move", ({ idx, symbol, nextTurn }) => {
      setSquares((prev) => {
        const next = [...prev];
        next[idx] = symbol;

        const result = calculateWinner(next);
        if (result) {
          setWinner(result.player);
        } else if (next.every(Boolean)) {
          setIsDraw(true);
        }

        return next;
      });

      setCurrentTurn(nextTurn);
    });

    socket.on("reset", () => {
      setSquares(Array(9).fill(null));
      setWinner(null);
      setIsDraw(false);
      setCurrentTurn("X");
      setOpponentDisconnected(false);
    });

    socket.on("opponentDisconnected", () => {
      setOpponentDisconnected(true);
    });

    return () => {
      socket.off("resumeGame");
      socket.off("move");
      socket.off("reset");
      socket.off("opponentDisconnected");
    };
  }, [playerName]);

  function handlePlay(idx) {
    if (squares[idx] || winner || isDraw) return;
    if (symbol !== currentTurn) return;

    // Update locally for immediate feedback
    const next = [...squares];
    next[idx] = symbol;
    setSquares(next);

    const result = calculateWinner(next);
    if (result) {
      setWinner(result.player);
      socket.emit("gameOver", { winner: result.player });
    } else if (next.every(Boolean)) {
      setIsDraw(true);
      socket.emit("gameOver", { winner: null });
    }

    const nextTurn = symbol === "X" ? "O" : "X";
    setCurrentTurn(nextTurn);

    // Emit move so opponent updates
    socket.emit("move", { idx, symbol, nextTurn });
  }

  function reset() {
    setSquares(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    setCurrentTurn("X");
    setOpponentDisconnected(false);
    socket.emit("reset");
  }

  const status = opponentDisconnected
    ? "Opponent disconnected!"
    : winner
    ? `Winner: ${winner}`
    : isDraw
    ? "It's a draw!"
    : `Current turn: ${currentTurn} | Your symbol: ${symbol}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center text-white gap-6">
      <h1 className="text-2xl font-bold">Tic Tac Toe</h1>
      <p className="text-lg">{playerName} ({symbol}) vs {opponentName}</p>
      <Board
        squares={squares}
        onPlay={handlePlay}
        winningLine={calculateWinner(squares)?.line ?? []}
      />
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg">{status}</p>
        <button
          onClick={reset}
          disabled={!winner && !isDraw && !opponentDisconnected}
          className={[
            "px-4 py-2 rounded-lg transition",
            winner || isDraw || opponentDisconnected
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-slate-500 text-gray-300 cursor-not-allowed"
          ].join(" ")}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}