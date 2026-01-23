'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchInputProps {
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounce?: number;
    showFilter?: boolean;
    onFilterClick?: () => void;
    filterActive?: boolean;
}

export function SearchInput({
    value = '',
    onChange,
    onSearch,
    placeholder = 'Search...',
    className = '',
    debounce = 300,
    showFilter = false,
    onFilterClick,
    filterActive = false
}: SearchInputProps) {
    const [inputValue, setInputValue] = useState(value);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        
        if (onChange) {
            onChange(newValue);
        }
        
        // Debounced search
        if (onSearch) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                onSearch(newValue);
            }, debounce);
        }
    };

    const handleClear = () => {
        setInputValue('');
        if (onChange) {
            onChange('');
        }
        if (onSearch) {
            onSearch('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onSearch) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            onSearch(inputValue);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               text-white placeholder-slate-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-all"
                />
                {inputValue && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {showFilter && (
                <button
                    onClick={onFilterClick}
                    className={`p-2 rounded-lg border transition-colors ${
                        filterActive
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                >
                    <Filter className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

// Filter dropdown component
interface FilterDropdownProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function FilterDropdown({
    options,
    value,
    onChange,
    placeholder = 'All'
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 transition-colors"
            >
                <span className="text-sm">{selectedOption?.label || placeholder}</span>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-700 rounded-lg shadow-xl border border-slate-600 overflow-hidden z-50 animate-fadeIn">
                    <button
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-600 transition-colors ${
                            value === '' ? 'text-blue-400' : 'text-white'
                        }`}
                    >
                        {placeholder}
                    </button>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-600 transition-colors ${
                                value === option.value ? 'text-blue-400' : 'text-white'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
