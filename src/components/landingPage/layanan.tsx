"use client";
import React from 'react';
import Image from 'next/image';
import Button from '../common/button';

export default function Layanan() {
    return (
        <section id="layanan" className="py-20 flex justify-center">
            <div className="container mx-auto px-6"> 
                <div className="
                    grid grid-cols-1 md:grid-cols-2 
                    gap-14
                    items-center 
                    bg-white p-6 md:p-20 
                    rounded-xl shadow-xl
                ">

                    <div className="order-2 md:order-1">
                        <Image
                            src="/umkm1.png"
                            alt="Orang-orang melaporkan keluhan menggunakan ponsel"
                            width={500}
                            height={350}
                            className="rounded-lg w-full h-auto" 
                        />
                    </div>
                    
                    <div className="order-1 md:order-2 flex flex-col justify-center py-4 ml-0 md:ml-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 md:mb-20 leading-tight">
                            Pelayanan Keluhan <br />
                            <span className="text-blue-600">Cepat & Tepat</span>
                        </h2>

                        <p className="text-base text-gray-700 mb-6 max-w-lg"> 
                            Laporkan pedagang atau usaha yang melanggar aturan tata ruang (misalnya: menempati trotoar, menutup akses) hanya dalam hitungan menit, tanpa perlu login. Laporan dilengkapi bukti visual dan lokasi akurat.
                        </p>

                        <Button title="Laporkan Segera" className="bg-blue-400 text-white py-2 px-6 hover:bg-blue-500" onClick={() => console.log("Aksi Lapor Diklik")} />
                    </div>
                </div>
            </div>
        </section>
    );
}