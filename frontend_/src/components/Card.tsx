import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
    shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'lg',
    shadow = 'lg'
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    const shadowClasses = {
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl'
    };

    return (
        <div
            className={`
        bg-white rounded-2xl border border-gray-100 
        ${paddingClasses[padding]} 
        ${shadowClasses[shadow]}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
