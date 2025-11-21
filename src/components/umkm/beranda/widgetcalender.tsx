'use client';

import React, { useState, useEffect } from 'react';
import { TrendUp } from '@phosphor-icons/react';
import Link from 'next/link';

// ===== FEATURED STATS WIDGET =====
export function FeaturedStatsWidget() {
    const widgets = [
        {
            id: 1,
            title: "Penghasilan Hari Ini",
            value: "$2,890",
            subtitle: "Dari 3 lokasi aktif",
            icon: <TrendUp size={28} />,
            bgGradient: "from-purple-400 to-purple-600",
            textColor: "text-purple-50",
            borderColor: "border-purple-300"
        },
        {
            id: 2,
            title: "Demografis Kunjungan",
            value: "20",
            subtitle: "Rata-rata per hari",
            icon: "📊",
            bgColor: "bg-yellow-400",
            textColor: "text-gray-900",
            borderColor: "border-yellow-300"
        },
        {
            id: 3,
            title: "Promosi Terbaru",
            value: "20% OFF",
            subtitle: "Gunakan: NEWBIE20",
            icon: "🎉",
            bgGradient: "from-teal-500 to-teal-700",
            textColor: "text-white",
            borderColor: "border-teal-300"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-fit">
            {/* Top-left - Large */}
            <Link
                href="#"
                className={`sm:col-span-1 lg:col-span-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${widgets[0].bgGradient} ${widgets[0].textColor} group relative overflow-hidden`}
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl opacity-80">{widgets[0].icon}</div>
                    </div>
                    <h3 className="text-sm opacity-90 mb-2">{widgets[0].title}</h3>
                    <p className="text-3xl font-bold mb-1">{widgets[0].value}</p>
                    <p className="text-xs opacity-75">{widgets[0].subtitle}</p>
                </div>
            </Link>

            {/* Top-right - Medium */}
            <Link
                href="#"
                className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-${widgets[1].bgColor} ${widgets[1].textColor} group relative overflow-hidden`}
            >
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mb-8"></div>
                <div className="relative z-10">
                    <h3 className="text-sm font-medium mb-3 opacity-85">{widgets[1].title}</h3>
                    <p className="text-4xl font-bold mb-1">{widgets[1].value}</p>
                    <p className="text-xs opacity-70">{widgets[1].subtitle}</p>
                </div>
            </Link>

            {/* Bottom - Full Width */}
            <Link
                href="#"
                className={`sm:col-span-2 lg:col-span-3 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r ${widgets[2].bgGradient} ${widgets[2].textColor} group relative overflow-hidden`}
            >
                <div className="absolute -right-16 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium opacity-90 mb-2">{widgets[2].title}</h3>
                        <p className="text-2xl font-bold">{widgets[2].value}</p>
                        <p className="text-xs opacity-75 mt-1">{widgets[2].subtitle}</p>
                    </div>
                    <div className="text-6xl opacity-50 group-hover:opacity-60 transition-opacity">{widgets[2].icon}</div>
                </div>
            </Link>
        </div>
    );
}

// ===== SIMPLE CALENDAR (READ-ONLY & REAL-TIME) =====
export function SimpleCalendar() {
    const [currentDate, setCurrentDate] = useState<Date | null>(null);

    useEffect(() => {
        // Set date after mount untuk avoid hydration mismatch
        setCurrentDate(new Date());
    }, []);

    if (!currentDate) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="h-80 flex items-center justify-center text-gray-400">Loading...</div>
            </div>
        );
    }

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const todayDate = new Date();
    
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
    const yearName = currentDate.getFullYear();
    const dayName = currentDate.toLocaleString('id-ID', { weekday: 'long' });
    const todayFormatted = todayDate.getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const isToday = (day: number | null) => {
        return day === todayDate.getDate() && 
               currentDate.getMonth() === todayDate.getMonth() && 
               currentDate.getFullYear() === todayDate.getFullYear();
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                <p className="text-sm opacity-90 mb-1">Hari Ini</p>
                <h3 className="text-2xl font-bold mb-1">{todayFormatted} {monthName}</h3>
                <p className="text-sm opacity-80 capitalize">{dayName}</p>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                <div className="text-center mb-4">
                    <p className="text-gray-600 text-sm font-medium">{monthName} {yearName}</p>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, idx) => (
                        <div
                            key={idx}
                            className={`
                                aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200
                                ${day === null
                                    ? 'text-gray-200'
                                    : isToday(day)
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md scale-105'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }
                            `}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    Hari ini ditandai dengan biru
                </p>
            </div>
        </div>
    );
}