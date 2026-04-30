import React from 'react';
import Skeleton from './Skeleton';

const DashboardSkeleton = () => {
    return (
        <div className="p-10 min-h-screen">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <Skeleton w="w-48" h="8" className="mb-2" />
                    <Skeleton w="w-64" h="4" />
                </div>
                <div className="flex gap-4">
                    <Skeleton w="w-20" h="5" />
                    <Skeleton w="w-20" h="5" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <Skeleton w="w-20" h="3" className="mb-4" />
                        <Skeleton w="w-24" h="8" className="mb-3" />
                        <Skeleton w="w-32" h="3" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
                {/* Chart Skeleton */}
                <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <Skeleton w="w-32" h="6" className="mb-2" />
                            <Skeleton w="w-48" h="3" />
                        </div>
                        <Skeleton w="w-24" h="4" />
                    </div>
                    <Skeleton w="full" h="64" />
                </div>

                {/* Balance Skeleton */}
                <div className="bg-slate-900 rounded-2xl p-8 shadow-md flex flex-col justify-between">
                    <div>
                        <Skeleton w="w-24" h="3" className="mb-4 bg-slate-800" />
                        <Skeleton w="w-48" h="10" className="bg-slate-800" />
                    </div>
                    <div className="mt-8">
                        <Skeleton w="full" h="12" className="bg-slate-800" />
                    </div>
                </div>
            </div>

            {/* Activity Skeleton */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton w="w-40" h="6" />
                    <Skeleton w="w-16" h="4" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-4">
                                <Skeleton w="w-10" h="10" className="rounded-full" />
                                <div>
                                    <Skeleton w="w-48" h="4" className="mb-2" />
                                    <Skeleton w="w-32" h="3" />
                                </div>
                            </div>
                            <Skeleton w="w-24" h="4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
