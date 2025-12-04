import React from 'react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
    const getStatusConfig = (status: string) => {
        const statusMap: Record<string, { color: string; bgColor: string; text: string }> = {
            'created': { color: 'text-blue-700', bgColor: 'bg-blue-100', text: 'Created' },
            'admin_review': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', text: 'Admin Review' },
            'packaging': { color: 'text-purple-700', bgColor: 'bg-purple-100', text: 'Packaging' },
            'ready_for_dispatch': { color: 'text-orange-700', bgColor: 'bg-orange-100', text: 'Ready for Dispatch' },
            'dispatched': { color: 'text-green-700', bgColor: 'bg-green-100', text: 'Dispatched' },
            'delivered': { color: 'text-emerald-700', bgColor: 'bg-emerald-100', text: 'Delivered' },
            'pending': { color: 'text-gray-700', bgColor: 'bg-gray-100', text: 'Pending' },
            'completed': { color: 'text-green-700', bgColor: 'bg-green-100', text: 'Completed' },
            'cancelled': { color: 'text-red-700', bgColor: 'bg-red-100', text: 'Cancelled' }
        };

        return statusMap[status] || { color: 'text-gray-700', bgColor: 'bg-gray-100', text: status };
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base'
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full
        ${config.color} ${config.bgColor} ${sizeClasses[size]}
        ${className}
      `}
        >
            {config.text}
        </span>
    );
};

export default StatusBadge;
