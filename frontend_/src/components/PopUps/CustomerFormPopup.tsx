import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, FileText, Building2, Save, Loader2, X } from 'lucide-react';
import Button from '../../components/Button';
import axios from 'axios';
import { Modal, ModalHeader, ModalFooter } from './Modal';
import { SectionHeader, InputField, TextareaField, ErrorAlert } from './Fields';
import { AddressForm } from './AddressForm';
import { BaseUrl } from '../../config/BaseUrl.config';

// ============= TYPES =============
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface Customer {
  _id?: string;
  name: string;
  gst?: string;
  billing: Address;
  shipping: Address;
  sameAsBilling: boolean;
  phones: string[];
  email?: string;
  remarks?: string;
  uniqueId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer?: Customer;
  mode: 'add' | 'edit' | 'view';
}

// Add/Edit Customer Popup
export const CustomerFormPopup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
  mode
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Customer>({
    name: '',
    gst: '',
    billing: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    shipping: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    sameAsBilling: false,
    phones: [''],
    email: '',
    remarks: ''
  });

  useEffect(() => {
    if (customer && mode !== 'add') {
      setFormData(customer);
    }
  }, [customer, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Customer] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (name === 'sameAsBilling' && checked) {
      setFormData(prev => ({
        ...prev,
        shipping: { ...prev.billing }
      }));
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const addPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const removePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'add'
        ? `${BaseUrl}/v1/customers`
        : `${BaseUrl}/v1/customers/${customer?._id}`;

      const method = mode === 'add' ? 'post' : 'put';

      await axios[method](url, formData,{
        headers:{Authorization:localStorage.getItem('auth_token') || '' }
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={mode === 'add' ? 'Add New Customer' : 'Edit Customer'}
        icon={<User className="w-5 h-5 text-blue-600" />}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
        <div className="p-6 space-y-6">
          {error && <ErrorAlert message={error} />}

          {/* Basic Information */}
          <div className="space-y-4 " >
            <SectionHeader icon={<User className="w-5 h-5 text-blue-600" />} title="Basic Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <InputField
                label="Customer Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter customer name"
              />

              <InputField
                label="GST Number"
                name="gst"
                value={formData.gst || ''}
                onChange={handleChange}
                placeholder="Enter GST number"
              />

              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="space-y-4">
            <SectionHeader icon={<Phone className="w-5 h-5 text-blue-600" />} title="Phone Numbers" />

            {formData.phones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    label=""
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    icon={<Phone className="w-5 h-5 text-gray-400" />}
                    placeholder="Enter phone number"
                  />
                </div>
                {formData.phones.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    onClick={() => removePhone(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addPhone}>
              + Add Phone Number
            </Button>
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <SectionHeader icon={<MapPin className="w-5 h-5 text-blue-600" />} title="Billing Address" />
            <AddressForm prefix="billing" address={formData.billing} onChange={handleChange} />
          </div>

          {/* Same as Billing Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sameAsBilling"
              name="sameAsBilling"
              checked={formData.sameAsBilling}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sameAsBilling" className="text-sm font-medium text-gray-700">
              Shipping address same as billing address
            </label>
          </div>

          {/* Shipping Address */}
          {!formData.sameAsBilling && (
            <div className="space-y-4">
              <SectionHeader icon={<Building2 className="w-5 h-5 text-blue-600" />} title="Shipping Address" />
              <AddressForm prefix="shipping" address={formData.shipping} onChange={handleChange} />
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-4">
            <SectionHeader icon={<FileText className="w-5 h-5 text-blue-600" />} title="Additional Information" />
            <TextareaField
              label="Remarks"
              name="remarks"
              value={formData.remarks || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Enter any additional notes..."
            />
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {mode === 'add' ? 'Add Customer' : 'Save Changes'}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CustomerFormPopup;
