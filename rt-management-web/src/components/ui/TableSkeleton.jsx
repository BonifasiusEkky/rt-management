import React from 'react';
import Skeleton from './Skeleton';

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-100">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-8 py-5">
                                <Skeleton w="w-20" h="3" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: cols }).map((_, colIndex) => (
                                <td key={colIndex} className="px-8 py-5">
                                    <Skeleton w={colIndex === 0 ? "w-48" : "w-24"} h="4" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;
