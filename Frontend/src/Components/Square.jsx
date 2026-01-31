export default function Square({ value, onClick, isWinning }) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center justify-center",
        "h-24 w-24 sm:h-28 sm:w-28",
        "text-4xl font-bold",
        "rounded-xl",
        "bg-slate-800 text-white",
        "shadow-[inset_2px_2px_6px_rgba(255,255,255,0.1),inset_-2px_-2px_6px_rgba(0,0,0,0.6)]",
        "hover:shadow-[0_4px_8px_rgba(0,0,0,0.4)]",
        "active:scale-95 transition-transform duration-150",
        isWinning ? "bg-amber-500 text-black" : ""
      ].join(" ")}
    >
      {value}
    </button>
  );
}