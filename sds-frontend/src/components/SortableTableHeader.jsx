import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * SortableTableHeader - Reusable sortable column header
 * 
 * Provides clear visual feedback about current sort state,
 * making data organization predictable and trustworthy.
 */

const SortableTableHeader = ({
    column,
    label,
    sortColumn,
    sortDirection,
    onSort,
    className = ''
}) => {
    const isActive = sortColumn === column;

    return (
        <th
            onClick={() => onSort(column)}
            className={`
                px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider
                cursor-pointer hover:bg-gray-100 transition-colors select-none
                ${className}
            `}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                <div className="flex flex-col">
                    {isActive ? (
                        sortDirection === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4 text-blue-600" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 text-blue-600" />
                        )
                    ) : (
                        <div className="h-4 w-4 text-gray-600">
                            <ChevronUpIcon className="h-3 w-3" />
                        </div>
                    )}
                </div>
            </div>
        </th>
    );
};

export default SortableTableHeader;

