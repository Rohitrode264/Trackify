import { BaseUrl } from '../config/BaseUrl.config';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'telecaller' | 'packaging' | 'dispatch';
    department?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface AuthError {
    message: string;
    status?: number;
}

class AuthService {
    private baseUrl = `${BaseUrl}/auth`;

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await fetch(`${this.baseUrl}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send OTP');
        }

        return response.json();
    }

    async verifyOTP(email: string, otp: string): Promise<{ message: string; resetToken: string }> {
        const response = await fetch(`${this.baseUrl}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid OTP');
        }

        return response.json();
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
        const response = await fetch(`${this.baseUrl}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resetToken, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }

        return response.json();
    }

    // Token management
    setToken(token: string): void {
        localStorage.setItem('auth_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    removeToken(): void {
        localStorage.removeItem('auth_token');
    }

    // User management
    setUser(user: User): void {
        localStorage.setItem('auth_user', JSON.stringify(user));
    }

    getUser(): User | null {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    }

    removeUser(): void {
        localStorage.removeItem('auth_user');
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Logout
    logout(): void {
        this.removeToken();
        this.removeUser();
    }
}

export default new AuthService();
