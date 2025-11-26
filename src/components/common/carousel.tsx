import type { MouseEvent, TouchEvent } from "react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface CarouselItem {
    id: number;
    image: string;
    alt?: string;
}

interface CarouselFeaturedProps extends React.HTMLAttributes<HTMLDivElement> {
    items: CarouselItem[]; 
    autoScrollDelay?: number;
    className?: string;
}

export default function CarouselFeatured({
    items,
    autoScrollDelay = 5,
    className = "",
    ...props
}: CarouselFeaturedProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const length = items.length;

    useEffect(() => {
        if (!autoScrollDelay || length <= 1) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setActiveIndex(prev => prev === length - 1 ? 0 : prev + 1);
        }, autoScrollDelay * 500);
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

    return (
        <div className={`w-full ${className}`} {...props}>
            <div
                className="w-full aspect-video min-h-[280px] relative select-none rounded-xl overflow-hidden shadow-lg cursor-grab"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onDragStart={e => e.preventDefault()}
                style={{ userSelect: "none" }}
            >
                {length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500 text-lg">Tidak ada gambar.</span>
                    </div>
                ) : (
                    items.map((item, index) => {
                        const isCurrent = index === activeIndex;

                        return (
                            <div
                                key={item.id}
                                className="absolute inset-0 transform transition-opacity duration-700"
                                style={{ 
                                    opacity: isCurrent ? 1 : 0, 
                                    pointerEvents: isCurrent ? 'auto' : 'none' 
                                }}
                            >
                                <Image 
                                    src={item.image} 
                                    alt={item.alt || `Slide ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Indikator Dots */}
            {length > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                idx === activeIndex 
                                    ? 'w-8 bg-blue-600' 
                                    : 'w-2 bg-gray-400 hover:bg-gray-500'
                            }`}
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