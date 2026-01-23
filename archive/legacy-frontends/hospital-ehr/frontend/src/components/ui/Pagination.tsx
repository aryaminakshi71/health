'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    className = ''
}: PaginationProps) {
    // Don't render if only one page
    if (totalPages <= 1) return null;

    // Calculate page range to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        
        // Always show first page
        pages.push(1);
        
        // Left side
        if (currentPage > 2 + siblingCount) {
            pages.push('ellipsis');
        }
        
        const leftBound = Math.max(2, currentPage - siblingCount);
        const rightBound = Math.min(totalPages - 1, currentPage + siblingCount);
        
        for (let i = leftBound; i <= rightBound; i++) {
            pages.push(i);
        }
        
        // Right side
        if (currentPage < totalPages - 1 - siblingCount) {
            pages.push('ellipsis');
        }
        
        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }
        
        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex items-center justify-center gap-1 ${className}`}>
            {/* Previous button */}
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-2 text-slate-500"
                            >
                                ...
                            </span>
                        );
                    }
                    
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}

// Simple page info component
interface PageInfoProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    className?: string;
}

export function PageInfo({
    currentPage,
    pageSize,
    totalItems,
    className = ''
}: PageInfoProps) {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <p className={`text-sm text-slate-400 ${className}`}>
            Showing {start}-{end} of {totalItems}
        </p>
    );
}
