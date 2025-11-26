import React, { ReactNode } from 'react';

interface ButtonProps {
    title?: string; 
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
    children?: ReactNode;
    disabled?: boolean; 
}

export default function Button(props: ButtonProps) {
    return (
        <button 
            type={props.type} 
            disabled={props.disabled} 
            className={`w-fit text-sm md:text-base rounded-xl transition-all duration-300 ease-in-out active:scale-95 cursor-pointer ${props.className}`} 
            onClick={props.onClick}
        >
            {props.children || props.title} 
        </button>
    );
}