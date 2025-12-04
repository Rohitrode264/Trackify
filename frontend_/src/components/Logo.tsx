import React from 'react';
import { Boxes } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'full' | 'icon' | 'text';
    className?: string;
}

const Logo: React.FC<LogoProps> = ({
    size = 'md',
    variant = 'full',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl'
    };

    const iconSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-12 h-12'
    };

    // ✅ Replaced SVG with Lucide Boxes icon
    const Icon = () => (
        <div
            className={`
                ${iconSizes[size]} 
                bg-linear-to-br from-blue-600 to-blue-800 
                rounded-lg flex items-center justify-center 
                shadow-md hover:shadow-lg transition-shadow 
            `}
        >
            <Boxes className="w-3/4 h-3/4 text-white" strokeWidth={1.5} />
        </div>
    );

    const Text = () => (
        <div className="flex flex-col leading-tight">
            <span
                className={`
                    ${sizeClasses[size]} 
                    font-bold bg-linear-to-r from-blue-600 to-blue-800 
                    bg-clip-text text-transparent tracking-tight
                `}
            >
                Trackify
            </span>
            <span className="text-xs text-gray-500 -mt-0.5">by Citspray</span>
        </div>
    );

    if (variant === 'icon') return <Icon />;
    if (variant === 'text') return <Text />;

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <Icon />
            <Text />
        </div>
    );
};

export default Logo;
