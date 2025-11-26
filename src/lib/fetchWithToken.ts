export async function fetchWithToken(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    console.log('📤 fetchWithToken:', url);

    const finalOptions: RequestInit = {
        ...options,
        credentials: 'include', 
    };

    try {
        const response = await fetch(url, finalOptions);
        if (response.status === 401) {
            console.error('❌ Unauthorized (401), redirecting to login');
            window.location.href = '/masuk';
            throw new Error('Session expired');
        }

        return response;

    } catch (error) {
        console.error('❌ Fetch error:', error);
        throw error;
    }
}