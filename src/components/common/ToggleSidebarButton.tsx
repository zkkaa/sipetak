import React from 'react';
import { CaretDoubleLeft, CaretDoubleRight } from '@phosphor-icons/react';

interface ToggleSidebarButtonProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export default function ToggleSidebarButton({ isCollapsed, toggleCollapse }: ToggleSidebarButtonProps) {
    return (
        <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            className={`
                absolute top-16 right-0 transform -translate-y-1/2 translate-x-1/2 
                p-1.5 rounded-full bg-blue-600 text-white shadow-lg 
                hover:bg-blue-700 transition duration-150 z-40
                hidden md:block cursor-pointer
            `}
        >
            {isCollapsed ? (
                <CaretDoubleRight size={18} weight="bold" />
            ) : (
                <CaretDoubleLeft size={18} weight="bold" />
            )}
        </button>
    );
}