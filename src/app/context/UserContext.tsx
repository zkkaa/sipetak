// File: src/app/context/UserContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as jose from 'jose';

interface User {
    id: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
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
        const loadUserFromToken = async () => {
            try {
                console.log('🔄 UserContext: Starting to load user...');
                
                if (typeof window === 'undefined') {
                    console.log('⚠️ UserContext: Server-side, skipping');
                    setLoading(false);
                    return;
                }

                // ✅ Retry mechanism - tunggu cookie tersedia
                let attempts = 0;
                const maxAttempts = 3;
                let token: string | undefined;

                while (attempts < maxAttempts && !token) {
                    const cookieString = document.cookie;
                    console.log(`🍪 Attempt ${attempts + 1}: Checking cookies...`);
                    
                    token = cookieString
                        .split('; ')
                        .find(row => row.startsWith('sipetak_token='))
                        ?.split('=')[1];
                    
                    if (!token) {
                        attempts++;
                        if (attempts < maxAttempts) {
                            // Tunggu 100ms sebelum retry
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                }
                
                if (!token) {
                    console.log('❌ UserContext: No token found after retries');
                    setUser(null);
                    setLoading(false);
                    return;
                }

                console.log('✅ UserContext: Token found!');

                // Verify token
                const secret = new TextEncoder().encode(
                    process.env.NEXT_PUBLIC_JWT_SECRET || 'sipetakkosong1'
                );
                
                const { payload } = await jose.jwtVerify(token, secret);
                
                console.log('✅ UserContext: Token verified successfully');

                const loadedUser: User = {
                    id: payload.userId as number,
                    email: payload.email as string,
                    role: payload.role as 'Admin' | 'UMKM',
                    nama: (payload.nama as string) || 'Pengguna Sipetak'
                };
                
                setUser(loadedUser);
                console.log('✅ UserContext: User loaded:', loadedUser);

            } catch (error) {
                console.error("❌ UserContext: Error loading user:", error);
                setUser(null);
            } finally {
                setLoading(false);
                console.log('✅ UserContext: Loading complete');
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

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};