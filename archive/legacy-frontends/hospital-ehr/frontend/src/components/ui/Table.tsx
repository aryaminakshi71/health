'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (key: string) => void;
    pageSize?: number;
    currentPage?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
}

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    loading = false,
    emptyMessage = 'No data available',
    onRowClick,
    actions,
    sortBy,
    sortOrder,
    onSort,
    pageSize = 10,
    currentPage = 1,
    totalItems,
    onPageChange
}: DataTableProps<T>) {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map(keyExtractor)));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectRow = (key: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(key)) {
            newSelected.delete(key);
        } else {
            newSelected.add(key);
        }
        setSelectedRows(newSelected);
        setSelectAll(newSelected.size === data.length);
    };

    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 0;

    if (loading) {
        return (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <div className="h-6 w-48 bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-slate-700/50 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr>
                            {actions && (
                                <th className="px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="rounded border-slate-600 bg-slate-700"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                                        column.sortable ? 'cursor-pointer hover:text-white' : ''
                                    }`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && onSort?.(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {sortBy === column.key && (
                                            <span className="text-blue-400">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 2 : 1)} className="px-4 py-12 text-center">
                                    <p className="text-slate-400">{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => {
                                const key = keyExtractor(item);
                                return (
                                    <tr
                                        key={key}
                                        className={`hover:bg-slate-700/50 transition-colors ${
                                            selectedRows.has(key) ? 'bg-blue-500/5' : ''
                                        } ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {actions && (
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(key)}
                                                    onChange={() => handleSelectRow(key)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="rounded border-slate-600 bg-slate-700"
                                                />
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-4 py-3">
                                                {column.render
                                                    ? column.render(item)
                                                    : (item as any)[column.key]}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="relative group">
                                                    <button className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-slate-700 rounded-lg shadow-xl border border-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        <div className="py-1">
                                                            {actions(item)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
                    <p className="text-sm text-slate-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems ?? 0)} of {totalItems ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
