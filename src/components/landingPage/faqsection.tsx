"use client";
import React, { useState } from 'react';

import { CaretDown, QuestionMark } from '@phosphor-icons/react'; 

const FAQItem = (props: { question: string; answer: string; isOpen: boolean; toggleItem: () => void }) => {
    return (
        <div className="border border-gray-200 rounded-lg shadow-sm px-3 ">
            <button
                className="flex justify-between items-center w-full py-4 text-left font-semibold text-gray-800 hover:text-blue-600 transition duration-200"
                onClick={props.toggleItem}
            >
                <span>{props.question}</span>
                <CaretDown 
                    size={20} 
                    className={`transform transition-transform duration-300 ${props.isOpen ? 'rotate-180 text-blue-600' : 'rotate-0'}`} 
                />
            </button>
            
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${props.isOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0'}`}
            >
                <p className="text-gray-600 pb-4 text-sm md:text-base">{props.answer}</p>
            </div>
        </div>
    );
};

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqData = [
        {
            question: "Apa itu SIPETAK dan siapa penggunanya?",
            answer: "SIPETAK adalah Sistem Penataan Tempat Usaha Kita. Sistem ini digunakan oleh Pemerintah (untuk penataan ruang), Pelaku UMKM (untuk perizinan lokasi), dan Masyarakat (untuk pelaporan pelanggaran).",
        },
        {
            question: "Apakah proses perizinan lokasi UMKM melalui SIPETAK dikenakan biaya?",
            answer: "Tidak. Proses penentuan dan perizinan lokasi usaha melalui SIPETAK bersifat gratis dan transparan, bertujuan untuk mendukung legalitas dan ketertiban UMKM.",
        },
        {
            question: "Bagaimana cara kerja pelaporan pelanggaran lokasi oleh masyarakat?",
            answer: "Masyarakat dapat melaporkan pelanggaran (misalnya, menempati trotoar) tanpa perlu login. Laporan hanya memerlukan bukti foto, deskripsi, dan lokasi (koordinat) yang akurat dan akan ditindaklanjuti secara real-time.",
        },
        {
            question: "Apakah data lokasi UMKM yang terdaftar dijamin kerahasiaannya?",
            answer: "Ya. SIPETAK menjamin kerahasiaan data pribadi. Data yang dipublikasikan hanya sebatas titik lokasi resmi dan informasi umum yang diperlukan untuk penataan ruang kota.",
        },
    ];

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 flex justify-center">
            <div className="container mx-auto px-6 max-w-4xl">
                
                <div className="flex items-center mb-10 text-blue-600">
                    <QuestionMark size={32} weight="bold" className="mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Paling Sering Ditanya</h2>
                </div>
                
                <div className="bg-white p-4 md:p-6 flex flex-col gap-4 md:gap-6 rounded-lg ">
                    {faqData.map((item, index) => (
                        <FAQItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            isOpen={openIndex === index}
                            toggleItem={() => toggleItem(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}