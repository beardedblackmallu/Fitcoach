import React from "react";

interface AvatarProps {
  initials: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const sizeMap = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({ initials, color = "bg-stone-500", size = "md", online }: AvatarProps) {
  return (
    <div className="relative inline-block">
      <div
        className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold tracking-wide shrink-0`}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      )}
    </div>
  );
}
