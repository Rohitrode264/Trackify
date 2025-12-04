import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../config/BaseUrl.config";

interface Address {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
}

interface Customer {
    _id: string;
    gst:string;
    uniqueId: string;
    name: string;
    email: string;
    phones: string[];
    billing: Address;
    shipping: Address;
}

interface Order {
    _id: string;
    orderId: string;
    status: string;
    items: any[];
    totals: {
        grandTotal: number;
    };
    shippingCharge: number;
    createdAt: string;
}

interface CustomerDetails {
    customer: Customer;
    orderHistory: Order[];
}

export const useCustomerDetails = (customerId: string) => {
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
    const [loading, setLoading]=useState<boolean>(true);
    const [error,setError]=useState<string |null>(null);
    

    useEffect(()=>{
        if(!customerId) return ;

        const fetchCustomerDetails= async ()=>{
            try{
                setLoading(true);
                setError(null);

                const response= await axios.get(`${BaseUrl}/v1/customers/${customerId}`,{
                    headers:{Authorization:localStorage.getItem('auth_token')}
                });
                setCustomerDetails(response.data);
            }
            catch(error:any){
                setError(error.response?.data?.message || "Failed to fetch customer details");
            }
            finally{
                setLoading(false);
            }
        }

        fetchCustomerDetails();
    },[customerId]);

    return {customerDetails,loading,error};
}
