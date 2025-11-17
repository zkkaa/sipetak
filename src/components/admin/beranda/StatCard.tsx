import React from 'react';
// import { Package } from '@phosphor-icons/react'; // Contoh icon

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between transition-shadow duration-300 hover:shadow-md">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-2 rounded-full ${classes}`}>
                {icon}
            </div>
        </div>
    );
}