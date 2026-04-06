import { useState, useMemo } from 'react';

/**
 * useTableSort - Custom hook for sortable tables
 * 
 * Provides clear visual feedback about data organization,
 * building trust through predictable, user-controlled sorting.
 */

export const useTableSort = (data, initialColumn = null, initialDirection = 'asc') => {
    const [sortColumn, setSortColumn] = useState(initialColumn);
    const [sortDirection, setSortDirection] = useState(initialDirection);

    const handleSort = (column) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // New column, default to ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortColumn || !data) return data;

        return [...data].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle null/undefined
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Handle dates
            if (sortColumn.includes('fecha') || sortColumn.includes('date')) {
                const dateA = new Date(aVal);
                const dateB = new Date(bVal);
                return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            }

            // Handle strings (case-insensitive)
            const strA = String(aVal).toLowerCase();
            const strB = String(bVal).toLowerCase();

            if (sortDirection === 'asc') {
                return strA.localeCompare(strB);
            } else {
                return strB.localeCompare(strA);
            }
        });
    }, [data, sortColumn, sortDirection]);

    const resetSort = () => {
        setSortColumn(null);
        setSortDirection('asc');
    };

    return {
        sortedData,
        sortColumn,
        sortDirection,
        handleSort,
        resetSort
    };
};

export default useTableSort;
