// src/components/Board.jsx
import Square from "./Square";

export default function Board({ squares, onPlay, winningLine = [] }) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900 rounded-2xl shadow-xl">
      {squares.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => onPlay(idx)}
          isWinning={winningLine.includes(idx)}
        />
      ))}
    </div>
  );
}