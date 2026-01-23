'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    searchable?: boolean;
    className?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    error,
    disabled = false,
    searchable = false,
    className = ''
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    useEffect(() => {
        if (isOpen && searchable) {
            inputRef.current?.focus();
        }
    }, [isOpen, searchable]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    relative flex items-center justify-between w-full
                    px-4 py-2.5 rounded-xl border cursor-pointer
                    transition-all duration-200
                    ${error 
                        ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                        : 'border-gray-200 bg-white hover:border-gray-300 focus:ring-gray-200'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                    focus:outline-none focus:ring-2
                `}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selectedOption?.icon && (
                        <span className="text-gray-400">{selectedOption.icon}</span>
                    )}
                    <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
                        {selectedOption?.label || placeholder}
                    </span>
                </div>
                <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`} 
                />
            </div>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
                    {searchable && (
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {search && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearch('');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                                    >
                                        <X className="h-3 w-3 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    disabled={option.disabled}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2.5
                                        text-left transition-colors
                                        ${option.value === value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
                                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {option.icon && (
                                        <span className="text-gray-400">{option.icon}</span>
                                    )}
                                    <span className="flex-1">{option.label}</span>
                                    {option.value === value && (
                                        <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}

// Multi-Select Component
interface MultiSelectProps {
    options: SelectOption[];
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    label?: string;
}

export function MultiSelect({
    options,
    values,
    onChange,
    placeholder = 'Select options',
    label
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter(opt => values.includes(opt.value));

    const toggleOption = (optionValue: string) => {
        if (values.includes(optionValue)) {
            onChange(values.filter(v => v !== optionValue));
        } else {
            onChange([...values, optionValue]);
        }
    };

    const removeOption = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation();
        onChange(values.filter(v => v !== optionValue));
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 cursor-pointer min-h-[46px]"
            >
                {selectedOptions.length === 0 ? (
                    <span className="text-gray-400 text-sm py-1">{placeholder}</span>
                ) : (
                    selectedOptions.map((option) => (
                        <span
                            key={option.value}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                        >
                            {option.label}
                            <button
                                onClick={(e) => removeOption(e, option.value)}
                                className="p-0.5 hover:bg-blue-200 rounded"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto animate-fadeIn">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-2.5 text-left
                                hover:bg-gray-50 transition-colors
                                ${values.includes(option.value) ? 'bg-blue-50' : ''}
                            `}
                        >
                            <div className={`
                                w-4 h-4 rounded border flex items-center justify-center
                                ${values.includes(option.value) 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'border-gray-300'
                                }
                            `}>
                                {values.includes(option.value) && (
                                    <Check className="h-3 w-3 text-white" />
                                )}
                            </div>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
