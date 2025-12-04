import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  color?: "blue" | "green" | "red";
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  color = "blue",
  className = "",
  ...props
}) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 focus:ring-blue-500 accent-blue-600",
    green: "text-green-600 focus:ring-green-500 accent-green-600",
    red: "text-red-600 focus:ring-red-500 accent-red-600",
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer select-none">
      <input
        type="checkbox"
        {...props}
        className={`w-5 h-5 rounded-md border-gray-300 focus:ring-2 transition-all duration-200 ${colorMap[color]} ${className}`}
      />
      {label && <span className="text-gray-800 text-sm">{label}</span>}
    </label>
  );
};

export default Checkbox;
