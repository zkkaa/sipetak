// File: components/common/button.tsx

import React, { ReactNode } from 'react';

// 💡 Tambahkan disabled?: boolean
interface ButtonProps {
    title?: string; // Menjadi opsional jika menggunakan children
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
    children?: ReactNode;
    disabled?: boolean; // <--- SOLUSI: TAMBAHKAN PROPERTI INI
}

export default function Button(props: ButtonProps) {
    return (
        <button 
            type={props.type} 
            // 💡 Gunakan prop disabled
            disabled={props.disabled} 
            className={`w-fit text-sm md:text-base rounded-xl transition-all duration-300 ease-in-out active:scale-95 cursor-pointer ${props.className}`} 
            onClick={props.onClick}
        >
            {props.children || props.title} 
        </button>
    );
}