import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import authService, { type User, type LoginResponse } from '../services/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<string>;
    resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = authService.getToken();
        const savedUser = authService.getUser();

        if (token && savedUser) {
            setUser(savedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response: LoginResponse = await authService.login(email, password);

            authService.setToken(response.token);
            authService.setUser(response.user);
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const forgotPassword = async (email: string) => {
        try {
            await authService.forgotPassword(email);
        } catch (error) {
            throw error;
        }
    };

    const verifyOTP = async (email: string, otp: string): Promise<string> => {
        try {
            const response = await authService.verifyOTP(email, otp);
            return response.resetToken;
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (resetToken: string, newPassword: string) => {
        try {
            await authService.resetPassword(resetToken, newPassword);
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        forgotPassword,
        verifyOTP,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
