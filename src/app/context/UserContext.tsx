// File: src/app/context/UserContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as jose from 'jose';

// --- INTERFACES ---
interface User {
    id: number;
    email: string;
    nama: string; // Harus sesuai dengan skema DB
    role: 'Admin' | 'UMKM';
    phone: string | null;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- PROVIDER ---
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserFromToken = async () => {
            // Kita tidak bisa langsung mengakses cookie di sini karena ini Client Component (harus pakai document.cookie)
            if (typeof window === 'undefined') {
                setLoading(false);
                return;
            }

            // Dapatkan token dari document.cookie
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('sipetak_token='))
                ?.split('=')[1];
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Verifikasi menggunakan JOSE (Secret harus tersedia di client)
                const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'sipetakkosong1');
                const { payload } = await jose.jwtVerify(token, secret);
                
                // Assert dan simpan data user dari payload
                const loadedUser: User = {
                    id: payload.userId as number,
                    email: payload.email as string,
                    role: payload.role as 'Admin' | 'UMKM',
                    nama: payload.nama as string,
                    phone: payload.phone as string || null,
                };
                
                setUser(loadedUser);
                
            } catch (error) {
                console.error("❌ Token verification failed or expired:", error);
                // Hapus cookie yang rusak
                document.cookie = 'sipetak_token=; Max-Age=0; path=/';
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromToken();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// --- HOOK ---
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};