import React from 'react';

// Section Header
export const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => {
  return (
    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-300">
      {icon}
      {title}
    </h3>
  );
};

// Input Field
export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ label, icon, required, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-2.5">{icon}</div>}
        <input
          {...props}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

// Textarea Field
export const TextareaField: React.FC<{ label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ label, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${props.className || ''}`}
      />
    </div>
  );
};

// Info Display
export const InfoDisplay: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        {icon}
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
};

// Address Display Card
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export const AddressDisplay: React.FC<{ address: Address }> = ({ address }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-gray-900">
        {address.street && `${address.street}, `}
        {address.city && `${address.city}, `}
        {address.state && `${address.state} `}
        {address.pincode && `- ${address.pincode}, `}
        {address.country}
      </p>
    </div>
  );
};

// Error Alert
export const ErrorAlert: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {message}
    </div>
  );
};

// (Address is exported above as a named interface)
