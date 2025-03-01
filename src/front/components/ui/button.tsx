

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "outline" | "solid";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = "solid", className }) => {
  const baseStyle = "px-4 py-2 rounded-md text-white font-semibold focus:outline-none";

  const variantStyle = variant === "outline"
    ? "border-2 border-white bg-transparent hover:bg-white hover:text-black"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
