import React from 'react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    className?: string;
}

const DataTable = <T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    emptyMessage = 'No data available',
    onRowClick,
    className = ''
}: DataTableProps<T>) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }
    //@ts-ignore
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''
                                        }`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick?.(item)}
                                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                    }`}
                            >
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(() => {
                                            const value = typeof column.key === 'string'
                                                ? (column.key.split('.').reduce((obj, key) => (obj as any)?.[key], item) as any)
                                                : (item[column.key as keyof T] as any);
                                            return column.render
                                                ? column.render(value, item)
                                                : (value as React.ReactNode);
                                        })()}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
