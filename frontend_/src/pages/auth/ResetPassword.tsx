import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Form from '../../components/Form';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ResetPassword: React.FC = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [email, setEmail] = useState('');

    const { resetPassword } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.resetToken && location.state?.email) {
            setResetToken(location.state.resetToken);
            setEmail(location.state.email);
        } else {
            navigate('/forgot-password');
        }
    }, [location.state, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await resetPassword(resetToken, formData.password);
            navigate('/login', {
                state: {
                    message: 'Password reset successfully! Please sign in with your new password.'
                }
            });
        } catch (error: any) {
            setErrors({ general: error.message || 'Failed to reset password' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Logo size="xl" className="justify-center mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
                    <p className="text-gray-600">Enter your new password for</p>
                    <p className="text-blue-600 font-medium">{email}</p>
                </div>

                <Card>
                    <Form onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        <Input
                            label="New password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Enter your new password"
                            required
                        />

                        <Input
                            label="Confirm new password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="Confirm your new password"
                            required
                        />

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                variant="primary"
                                loading={isLoading}
                                className="w-full"
                            >
                                Reset password
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                Back to sign in
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
