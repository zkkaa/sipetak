// File: src/context/UserContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
    phone: string | null;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                console.log('⏳ UserContext: Memuat user dari server...');

                // Panggil endpoint untuk baca token dari server-side
                const response = await fetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include', // ✅ Penting: kirim cookies otomatis
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ User dimuat:', data.user.email);
                    setUser(data.user);
                } else {
                    console.log('⚠️ Tidak ada session aktif');
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ Error loading user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};