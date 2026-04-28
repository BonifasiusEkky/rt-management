import { create } from 'zustand';
import client from '../api/client';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await client.post('/auth/login', { email, password });
            const { token, user } = response.data.data;
            
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await client.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    fetchUser: async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await client.get('/auth/me');
            set({ user: response.data.data, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;
