import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}) => {
  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variants: Record<string, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-400",
    outline:
      "border border-gray-300 text-gray-800 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400",
    success:
      "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm hover:shadow-md",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm hover:shadow-md",
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
