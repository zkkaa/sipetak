// File: components/common/button.tsx

import React from 'react'; // Pastikan React diimpor

// 💡 PERBAIKAN: Tambahkan 'children' ke props dan definisikan tipenya (React.ReactNode)
export default function Button(props: { 
    onClick?: () => void; 
    className?: string; 
    type?: "button" | "submit" | "reset";
    children?: React.ReactNode; // <--- TAMBAHAN INI PENTING
}) {
    // Teks yang ditampilkan akan menjadi children, jadi kita bisa menghapus {props.title} 
    // jika kita menggunakan children sebagai konten utama.

    return (
        <button 
            type={props.type} 
            className={`w-fit text-sm md:text-base rounded-xl transition-all duration-300 ease-in-out active:scale-95 cursor-pointer ${props.className}`} 
            onClick={props.onClick}
        >
            {/* 💡 RENDER CHILDREN sebagai konten tombol */}
            {props.children} 
        </button>
    );
}