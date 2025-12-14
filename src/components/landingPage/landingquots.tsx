import React from 'react';

export default function LandingQuots() {
    return (
        <section id="LandingQuots" className="py-20 md:py-32 bg-gray-50">
            <div className="container mx-auto px-6 max-w-4xl flex flex-col justify-center items-center text-center gap-8 md:gap-10">
                <h1 className="text-3xl md:text-4xl font-bold leading-snug text-gray-900">
                    Ayo wujudkan kota tertib dan ramah <br className="hidden md:inline"/> bersama SIPETAK
                </h1>
                <p className="text-base md:text-lg italic text-gray-600 max-w-3xl">
                    SIPETAK membantu saya mengelola usaha dengan mudah dan legal. Proses perizinan yang transparan membuat saya merasa aman dan percaya diri dalam menjalankan bisnis saya.
                </p>
                <span className="w-20 h-1 bg-blue-500 rounded-full"></span>
            </div>
        </section>
    );
}