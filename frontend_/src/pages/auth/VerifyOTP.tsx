import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import OTPInput from '../../components/OTPInput';
import Button from '../../components/Button';

const VerifyOTP: React.FC = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [email, setEmail] = useState('');

    const { verifyOTP } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/forgot-password');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOTPComplete = async (otpValue: string) => {
        setError('');

        if (otpValue.length === 6) {
            setIsLoading(true);
            try {
                const resetToken = await verifyOTP(email, otpValue);
                navigate('/reset-password', { state: { resetToken, email } });
            } catch (error: any) {
                setError(error.message || 'Invalid verification code');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        try {
            await verifyOTP(email, ''); // This will trigger resend
            setTimeLeft(600);
            setError('');
        } catch (error: any) {
            setError(error.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="xl" className="justify-center mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h1>
                    <p className="text-gray-600">We sent a 6-digit code to</p>
                    <p className="text-blue-600 font-medium">{email}</p>
                </div>

                <Card>
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <OTPInput
                            length={6}
                            onComplete={handleOTPComplete}
                            error={error}
                            disabled={isLoading}
                        />

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Code expires in{' '}
                                <span className={`font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </p>

                            {timeLeft === 0 && (
                                <Button
                                    onClick={handleResend}
                                    variant="outline"
                                    loading={isLoading}
                                    className="w-full"
                                >
                                    Resend code
                                </Button>
                            )}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                ← Back to email
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default VerifyOTP;
