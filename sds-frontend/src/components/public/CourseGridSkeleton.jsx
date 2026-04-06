import React from 'react';

const CourseGridSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-zinc-900/40 border border-gray-100 dark:border-white/5 p-8 rounded-2xl shadow-sm overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6 animate-pulse">
                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-white/10 rounded"></div>
                        <div className="h-5 w-20 bg-gray-200 dark:bg-white/10 rounded-sm"></div>
                    </div>

                    <div className="space-y-3 mb-8 animate-pulse">
                        <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-100 dark:bg-white/5 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-100 dark:bg-white/5 rounded"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 pt-6 border-t border-gray-100 dark:border-white/5 animate-pulse">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded justify-self-end"></div>
                        <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded col-span-2 mt-2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseGridSkeleton;
