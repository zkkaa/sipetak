import type { MouseEvent, TouchEvent } from "react";
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react"; // Untuk ikon di pesan carousel
import Image from "next/image"; // Menggunakan Image Next.js untuk asset statis

interface CarouselItem {
    id: number;
    title: string;
    message: string;
    status: 'success' | 'warning' | 'info';
    image?: string; // Opsional jika ingin gambar di carousel
}

interface CarouselFeaturedProps extends React.HTMLAttributes<HTMLDivElement> {
    // 💡 Mengubah images: string[] menjadi items: CarouselItem[]
    items: CarouselItem[]; 
    autoScrollDelay?: number;
    className?: string;
}

export default function CarouselFeatured({
    items,
    autoScrollDelay = 5, // Default 5 detik
    className = "",
    ...props
}: CarouselFeaturedProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    // ... (Logika Drag & AutoScroll dipertahankan) ...

    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const length = items.length;

    useEffect(() => {
        if (!autoScrollDelay || length <= 1) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setActiveIndex(prev => prev === length - 1 ? 0 : prev + 1);
        }, autoScrollDelay * 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoScrollDelay, length]);

    const resetAutoScroll = () => {
        if (!autoScrollDelay) return;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                setActiveIndex(prev => prev === length - 1 ? 0 : prev + 1);
            }, autoScrollDelay * 1000);
        }
    };

    const goToPrev = () => {
        setActiveIndex(prev => (prev === 0 ? length - 1 : prev - 1));
        resetAutoScroll();
    };

    const goToNext = () => {
        setActiveIndex(prev => (prev === length - 1 ? 0 : prev + 1));
        resetAutoScroll();
    };

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        setTouchStartX(e.touches[0].clientX);
        setIsDragging(true);
    };

    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (touchStartX === null) {
            setIsDragging(false);
            return;
        }
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (diff > 50) goToNext();
        else if (diff < -50) goToPrev();
        setTouchStartX(null);
        setIsDragging(false);
        resetAutoScroll();
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        setDragStartX(e.clientX);
        setIsDragging(true);
    };

    const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        if (dragStartX === null) {
            setIsDragging(false);
            return;
        }
        const dragEndX = e.clientX;
        const diff = dragStartX - dragEndX;
        if (diff > 50) goToNext();
        else if (diff < -50) goToPrev();
        setDragStartX(null);
        setIsDragging(false);
        resetAutoScroll();
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setDragStartX(null);
    };
    
    // Tentukan warna berdasarkan status
    const getStatusColors = (status: CarouselItem['status']) => {
        switch (status) {
            case 'success':
                return { 
                    bg: 'bg-green-500', 
                    gradient: 'bg-gradient-to-r from-green-500 to-green-400',
                    text: 'text-green-700'
                };
            case 'warning':
                return { 
                    bg: 'bg-yellow-500', 
                    gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
                    text: 'text-yellow-700'
                };
            case 'info':
            default:
                return { 
                    bg: 'bg-blue-500', 
                    gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
                    text: 'text-blue-700'
                };
        }
    }


    // 💡 REVISI: Ukuran dan Penempatan
    return (
        // Hapus w-96 h-80. Ganti dengan w-full dan aspect-video untuk ukuran responsif
        <div className={`w-full ${className}`} {...props}>
            <div
                // Container utama: gunakan aspect ratio untuk tinggi responsif
                className="w-full aspect-video min-h-48 bg-gray-200 relative select-none rounded-xl overflow-hidden shadow-lg"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onDragStart={e => e.preventDefault()}
                style={{ userSelect: "none" }}
            >
                {length === 0 ? (
                    <span className="text-gray-500 text-lg absolute inset-0 flex items-center justify-center">Tidak ada pesan penting.</span>
                ) : (
                    items.map((item, index) => {
                        const colors = getStatusColors(item.status);
                        const isCurrent = index === activeIndex;

                        return (
                            <div
                                key={item.id}
                                className={`absolute inset-0 p-6 flex flex-col justify-between transform transition-opacity duration-500 ${colors.gradient} text-white`}
                                style={{ opacity: isCurrent ? 1 : 0, pointerEvents: isCurrent ? 'auto' : 'none' }}
                            >
                                <div className="flex justify-between items-start">
                                    {/* Judul dan Status */}
                                    <div className="max-w-xs">
                                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-sm opacity-90">{item.message}</p>
                                    </div>
                                    
                                    {/* Placeholder Gambar (Jika ada) */}
                                    {item.image && (
                                        <Image src={item.image} alt={item.title} width={500} height={500} className="rounded-lg opacity-80 w-full h-full" priority/>
                                    )}
                                </div>

                                {/* Tombol Aksi atau Baca Selengkapnya */}
                                <button className="self-start flex items-center gap-2 p-2 rounded-full bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition">
                                    Baca Selengkapnya
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Indikator Titik Bawah */}
            {length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {items.map((_, idx) => (
                        <button
                            key={idx} // Menggunakan idx karena item.id mungkin bukan string/number tunggal
                            className={`w-3 h-3 rounded-full transition-colors duration-200 ${idx === activeIndex ? getStatusColors(items[idx].status).bg : "bg-gray-400"}`}
                            onClick={() => {
                                setActiveIndex(idx);
                                resetAutoScroll();
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                            type="button"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}