import React from 'react';
import { InputField } from './Fields';
import type { Address } from './Fields';

interface AddressFormProps {
  prefix: 'billing' | 'shipping';
  address: Address;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ prefix, address, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <InputField
          label="Street"
          name={`${prefix}.street`}
          value={address.street || ''}
          onChange={onChange}
          placeholder="Enter street address"
        />
      </div>

      <InputField
        label="City"
        name={`${prefix}.city`}
        value={address.city || ''}
        onChange={onChange}
        placeholder="City"
      />

      <InputField
        label="State"
        name={`${prefix}.state`}
        value={address.state || ''}
        onChange={onChange}
        placeholder="State"
      />

      <InputField
        label="Pincode"
        name={`${prefix}.pincode`}
        value={address.pincode || ''}
        onChange={onChange}
        placeholder="Pincode"
      />

      <InputField
        label="Country"
        name={`${prefix}.country`}
        value={address.country || ''}
        onChange={onChange}
        placeholder="Country"
      />
    </div>
  );
};

export default AddressForm;
