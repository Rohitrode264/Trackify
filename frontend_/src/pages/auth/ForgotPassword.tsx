import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Form from '../../components/Form';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            await forgotPassword(email);
            setIsEmailSent(true);
        } catch (error: any) {
            setError(error.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    if (isEmailSent) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Logo size="xl" className="justify-center mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                        <p className="text-gray-600">We've sent a verification code to</p>
                        <p className="text-blue-600 font-medium">{email}</p>
                    </div>

                    <Card>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email sent successfully!</h3>
                            <p className="text-gray-600 mb-6">
                                Please check your email and enter the 6-digit verification code to reset your password.
                            </p>
                            <Button
                                onClick={() => navigate('/verify-otp', { state: { email } })}
                                variant="primary"
                                className="w-full"
                            >
                                Enter verification code
                            </Button>
                            <div className="mt-4">
                                <button
                                    onClick={() => setIsEmailSent(false)}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Didn't receive the email? Try again
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="xl" className="justify-center mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                    <p className="text-gray-600">Enter your email to receive a verification code</p>
                </div>

                <Card>
                    <Form onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={handleChange}
                            error={error}
                            placeholder="Enter your email"
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            loading={isLoading}
                            className="w-full"
                        >
                            Send verification code
                        </Button>
                    </Form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
