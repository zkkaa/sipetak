"use client";
import React from 'react';
import { Buildings, Handshake, MapTrifold } from '@phosphor-icons/react'; 

// Data Statistik Singkat
const stats = [
    { 
        Icon: Buildings, 
        value: "2500+", 
        label: "UMKM Terdaftar Resmi" 
    },
    { 
        Icon: MapTrifold, 
        value: "150", 
        label: "Lokasi Terverifikasi" 
    },
    { 
        Icon: Handshake, 
        value: "5", 
        label: "Instansi Pemerintah Mitra" 
    }
];

export default function Partner() {
    return (
        <section id="partners-stats" className="py-20 bg-white">
            <div className="container mx-auto px-6 max-w-6xl">
                
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                    SIPETAK dalam Angka
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                            <stat.Icon size={48} weight="duotone" className="text-blue-500 mb-3" />
                            <p className="text-4xl font-extrabold text-gray-900">{stat.value}</p>
                            <p className="text-base text-gray-600 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <hr className="my-10 border-gray-200" />
                
            </div>
        </section>
    );
}