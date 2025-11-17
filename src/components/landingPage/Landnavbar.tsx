"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import Button from "../common/button";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import {
    sidebarVariants,
    backgroundVariants,
    navVariants,
    itemVariants,
    MenuToggle
} from "../common/hamburger";

export default function LandNavbar() {
    const router = useRouter();
    // Gunakan state tunggal untuk mengontrol sidebar
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [activeLink, setActiveLink] = useState(''); // State untuk melacak link aktif/yang dihover

    const goLogin = () => {
        setIsMenuOpen(false);
        router.push("/masuk");
    };
    const goDaftar = () => {
        setIsMenuOpen(false);
        router.push("/daftar");
    };

    const navLinks = [
        // Menggunakan slug sebagai identifikasi unik untuk active/hover state
        { name: "Mengapa kami?", slug: "mengapa", href: "#LandingQuots" }, 
        { name: "Tentang", slug: "tentang", href: "#LandHome" },
        { name: "Fitur", slug: "fitur", href: "#LandFitur" },
        { name: "Layanan", slug: "layanan", href: "#Layanan" },
    ];

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isMenuOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isMenuOpen]);

    // 💡 Efek Samping: Hapus logika isActive yang duplikat

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 md:px-10 lg:px-20 z-50 transition-colors duration-300">

            {/* Logo Kiri */}
            <div className="text-xl font-bold text-gray-800 z-50">
                SIPETAK
            </div>

            {/* 💡 REVISI 1: NAVLINKS DI TENGAH */}
            <div className="hidden md:flex items-center justify-center flex-1 h-full px-12"> 
                <div className="flex text-sm font-medium items-center gap-8"> {/* Gap ditingkatkan */}
                    {navLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            // 💡 REVISI 2: Efek Active/Hover dengan Garis Animasi (Framer Motion CSS Style)
                            className="relative px-2 py-2 text-gray-700 hover:text-blue-500 transition-all duration-300 ease-out"
                            onMouseEnter={() => setActiveLink(link.slug)}
                            onMouseLeave={() => setActiveLink('')}
                            // Anda bisa mengatur link aktif berdasarkan scroll position di useEffect lain
                        >
                            {link.name}
                            
                            {/* Garis Underline Animasi (Menggunakan Framer Motion CSS Philosophy) */}
                            <motion.span
                                // Gunakan motion.span untuk transisi yang lebih halus (perlu impor motion di sini)
                                layoutId="underline"
                                className="absolute left-0 bottom-0 w-full h-[3px] bg-blue-500 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: activeLink === link.slug ? 1 : 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ originX: 0.5 }}
                            />
                        </a>
                    ))}
                </div>
            </div>

            {/* Tombol Kanan */}
            <div className="hidden md:flex items-center gap-4 z-50">
                <Button
                    onClick={goLogin}
                    // Menghilangkan children prop yang tidak terdefinisi
                    className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-200 transition"
                >
                    Masuk
                </Button>
                <Button
                    onClick={goDaftar}
                    className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition"
                >
                    Daftar
                </Button>
            </div>

            {/* Hamburger Mobile */}
            <div className="md:hidden z-50">
                <MenuToggle toggle={() => setIsMenuOpen(!isMenuOpen)} isOpen={isMenuOpen} />
            </div>

            {/* Sidebar Mobile (Framer Motion) */}
            <motion.div
                ref={sidebarRef}
                initial={false}
                animate={isMenuOpen ? "open" : "closed"}
                // @ts-expect-error Framer Motion variant conflict
                variants={sidebarVariants} 
                className={twMerge(
                    "fixed top-0 right-0 h-screen w-screen z-40 pointer-events-none bg-transparent md:hidden overflow-hidden"
                )}
            >
                {/* Overlay Blur (Menggantikan overlay lama isActive) */}
                {isMenuOpen && (
                    <div
                        className="absolute inset-0 z-40 md:hidden bg-black/30 backdrop-blur-sm transition-opacity duration-500"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
                
                <motion.div
                    className="absolute top-0 right-0 h-full w-[80vw] max-w-xs bg-white shadow-2xl pointer-events-auto z-50 p-6 pt-20"
                    variants={backgroundVariants} 
                >
                    <motion.ul
                        variants={navVariants}
                        className="flex flex-col items-start gap-8 text-xl font-light text-gray-800"
                    >
                        {navLinks.map((link, index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants} 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full"
                                onClick={() => setIsMenuOpen(false)} 
                            >
                                <a href={link.href} className="font-semibold w-full block border-b border-gray-100 pb-2">
                                    {link.name}
                                </a>
                            </motion.li>
                        ))}
                    </motion.ul>

                    <div className="flex flex-col gap-4 w-full mt-10">
                        <Button
                            onClick={goLogin}
                            className="w-full bg-gray-100 text-gray-800 py-3 text-base font-medium hover:bg-gray-200 transition"
                        >
                            Masuk
                        </Button>
                        <Button
                            onClick={goDaftar}
                            className="w-full bg-blue-500 text-white py-3 text-base font-medium hover:bg-blue-600 transition"
                        >
                            Daftar
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </nav>
    );
}