import React from 'react';
import { X, User, Mail, Phone, MapPin, FileText, Building2 } from 'lucide-react';
import Button from '../../components/Button';
import { Modal } from './Modal';
import { SectionHeader, InfoDisplay, AddressDisplay } from './Fields';

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
  customer?: Customer;
}

export const ViewCustomerPopup: React.FC<PopupProps> = ({ isOpen, onClose, customer }) => {
  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
            {customer.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{customer.name}</h2>
            <p className="text-sm text-gray-500">{customer.uniqueId}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          type="button"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <SectionHeader icon={<User className="w-5 h-5 text-blue-600" />} title="Basic Information" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoDisplay
              label="Email"
              value={customer.email || '-'}
              icon={<Mail className="w-4 h-4 text-gray-400" />}
            />

            <InfoDisplay
              label="GST Number"
              value={customer.gst || '-'}
              icon={<FileText className="w-4 h-4 text-gray-400" />}
            />
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="space-y-4">
          <SectionHeader icon={<Phone className="w-5 h-5 text-blue-600" />} title="Phone Numbers" />

          <div className="space-y-2">
            {customer.phones?.map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{phone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <SectionHeader icon={<MapPin className="w-5 h-5 text-blue-600" />} title="Billing Address" />
          <AddressDisplay address={customer.billing} />
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <SectionHeader icon={<Building2 className="w-5 h-5 text-blue-600" />} title="Shipping Address" />

          {customer.sameAsBilling ? (
            <p className="text-gray-500 italic">Same as billing address</p>
          ) : (
            <AddressDisplay address={customer.shipping} />
          )}
        </div>

        {/* Remarks */}
        {customer.remarks && (
          <div className="space-y-4">
            <SectionHeader icon={<FileText className="w-5 h-5 text-blue-600" />} title="Remarks" />
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900">{customer.remarks}</p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <InfoDisplay
            label="Created At"
            value={customer.createdAt
              ? new Date(customer.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '-'}
          />

          <InfoDisplay
            label="Last Updated"
            value={customer.updatedAt
              ? new Date(customer.updatedAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '-'}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ViewCustomerPopup;
