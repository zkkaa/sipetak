"use client";
import { useRouter } from "next/navigation";
import Button from "./common/button";

export default function Navbar() {
    const router = useRouter();
    const goLogin = () => router.push("/login");

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-background/70 backdrop-blur-md border-b border-black/[0.08] dark:border-white/[0.145] flex items-center justify-between px-8 sm:px-20 z-50">
            <div className="text-lg font-semibold pointer-events-none">
                SIPETAK
            </div>
            <div className="flex text-sm font-medium items-center gap-6">
                <p className="pointer-events-none">Mengapa kami?</p>
                <a className="" href="#home">Tentang</a>
                <a className="" href="#about">Fitur</a>
                <a className="" href="#contact"> Layanan</a>
            </div>
            <div className="flex items-center gap-4">
                <Button title="Masuk" onClick={goLogin} className="bg-foreground px-4 py-2 text-sm font-medium" />
                <Button title="Daftar" className="bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500" />
            </div>
        </nav>
    );
}