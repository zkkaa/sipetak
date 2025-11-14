"use client";
import React from 'react';
import { MapPin, Star, ShieldCheck, IconProps } from '@phosphor-icons/react';

function FiturCard(props: { Icon: React.ComponentType<IconProps>, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center text-center p-4">
            <div className="
                w-20 h-20 
                bg-white 
                rounded-2xl 
                shadow-xl 
                flex items-center justify-center
                mb-6
            ">
                <props.Icon size={36} weight="regular" className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {props.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {props.description}
            </p>
        </div>
    );
}

export default function LandingFitur() {
    
    const features = [
        {
            Icon: MapPin,
            title: "Penataan Lokasi",
            description: "mengelola dan mempublikasikan titik lokasi UMKM resmi melalui peta interaktif.",
        },
        {
            Icon: Star,
            title: "Sertifikasi UMKM",
            description: "memperoleh sertifikat digital sebagai bukti izin usaha.",
        },
        {
            Icon: ShieldCheck,
            title: "Layanan Pengaduan",
            description: "Warga melapor pelanggaran lokasi dengan foto dan koordinat secara real-time.",
        },
    ];

    return (
        <section id="features" className="py-20 bg-gray-100 flex flex-col items-center">            
            <div className="
                w-fit 
                flex items-center space-x-3  
                px-6 py-2 
                bg-white 
                text-black 
                text-base font-medium 
                rounded-full 
                shadow-lg 
                mb-16
            ">
                <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                <span>Fitur</span>
            </div>

            {/* Tata Letak 3 Kolom untuk Kartu Fitur */}
            <div className="container mx-auto px-6">
                <div className="
                    grid 
                    grid-cols-1 
                    md:grid-cols-3 
                    gap-8 
                    divide-y divide-gray-200 
                    md:divide-y-0 md:divide-x
                ">
                    {features.map((feature, index) => (
                        <FiturCard 
                            key={index}
                            Icon={feature.Icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
            
        </section>
    );
}