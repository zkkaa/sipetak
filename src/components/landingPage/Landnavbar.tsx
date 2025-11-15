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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const goLogin = () => {
        setIsMenuOpen(false);
        router.push("/masuk");
    };
    const goDaftar = () => {
        setIsMenuOpen(false);
        router.push("/daftar");
    };

    const navLinks = [
        { name: "Mengapa kami?", href: "#hero" },
        { name: "Tentang", href: "#about" },
        { name: "Fitur", href: "#features" },
        { name: "Layanan", href: "#complaint-cta" },
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

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 md:px-10 lg:px-20 z-50 transition-colors duration-300">

            <div className="text-xl font-bold text-gray-800">
                SIPETAK
            </div>

            <div className="hidden md:flex items-center gap-10">
                <div className="flex text-sm font-medium items-center gap-6">
                    {navLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            className="text-gray-700 hover:text-blue-500 transition duration-150"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={goLogin}
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
            </div>

            <div className="md:hidden z-50">
                <MenuToggle toggle={() => setIsMenuOpen(!isMenuOpen)} isOpen={isMenuOpen} />
            </div>

            <motion.div
                ref={sidebarRef}
                initial={false}
                animate={isMenuOpen ? "open" : "closed"}
                // eslint-disable-next-line 
                // @ts-ignore
                variants={sidebarVariants} 
                className={twMerge(
                    "fixed top-0 right-0 h-screen w-screen z-40 pointer-events-none bg-transparent md:hidden overflow-hidden"
                )}
            >
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

            {isActive && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    style={{ pointerEvents: "auto" }}
                >
                    <div
                        className="absolute right-[20vw] w-screen pointer-events-auto h-full z-40 inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500"
                        onClick={() => setIsActive(false)}
                    />
                </div>
            )}
        </nav>
    );
}