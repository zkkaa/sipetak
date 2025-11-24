// File: src/lib/fetchWithToken.ts

export async function fetchWithToken(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    console.log('📤 fetchWithToken:', url);

    // ✅ Dengan credentials: 'include', cookies otomatis dikirim
    const finalOptions: RequestInit = {
        ...options,
        credentials: 'include', // ✅ Kirim cookies otomatis
    };

    try {
        const response = await fetch(url, finalOptions);

        // Jika 401, redirect ke login
        if (response.status === 401) {
            console.error('❌ Unauthorized (401), redirecting to login');
            // Hapus session di context
            window.location.href = '/masuk';
            throw new Error('Session expired');
        }

        return response;

    } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
    }
}