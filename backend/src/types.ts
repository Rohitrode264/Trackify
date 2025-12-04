// types.ts (shared)
export type Role = 'admin' | 'telecaller' | 'packaging' | 'dispatch';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  full?: string; // convenience
}
