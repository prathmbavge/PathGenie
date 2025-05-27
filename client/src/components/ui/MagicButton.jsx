import React from "react";

const MagicButton = ({ title, icon, position, handleClick, otherClasses }) => {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        className="relative inline-flex h-8 w-42 overflow-hidden rounded-none p-[1px]"
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#facc15_0%,#f97316_50%,#facc15_100%)]" />
        <span
          className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-none bg-slate-950 px-3 text-sm font-medium text-white backdrop-blur-3xl gap-2 ${otherClasses}`}
        >
          {position === "left" && icon}
          {title}
          {position === "right" && icon}
        </span>
      </button>
    </div>
  );
};

export default MagicButton;
