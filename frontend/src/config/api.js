export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    ENDPOINTS: {
        LOGIN: '/api/login',
        BALANCE: '/api/users',
        DEPOSIT: '/api/users',
        WITHDRAW: '/api/users'
    }
}; 