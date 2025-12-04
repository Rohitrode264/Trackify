import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    error?: string;
    disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
    length = 6,
    onComplete,
    error,
    disabled = false
}) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Move to next input
        if (element.value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if all fields are filled
        if (newOtp.every(digit => digit !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);
        const pastedArray = pastedData.split('');
        const newOtp = [...otp];

        pastedArray.forEach((char, index) => {
            if (index < length && !isNaN(Number(char))) {
                newOtp[index] = char;
            }
        });

        setOtp(newOtp);
        if (pastedArray.length === length) {
            onComplete(pastedData);
        }
    };

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={`
              w-12 h-12 text-center text-xl font-semibold
              border-2 rounded-xl transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            `}
                    />
                ))}
            </div>
            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}
        </div>
    );
};

export default OTPInput;
