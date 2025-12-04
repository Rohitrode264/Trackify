import axios from 'axios';
import { BaseUrl } from '../config/BaseUrl.config';
import authService from './auth';

export interface Customer {
    _id: string;
    uniqueId: string;
    name: string;
    gst?: string;
    billing: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    shipping: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    sameAsBilling: boolean;
    phones: string[];
    email?: string;
    remarks?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productName: string;
    qty: number;
    unit?: string;
    rate?: number;
    amount?: number;
    isGstApplicable: boolean;
    gstPercent?: number;
    gstAmount?: number;
    formulation?: string;
    formulationAddedBy?: string;
    formulationAddedAt?: string;
    formulationVisible?: boolean;
    images?: string[];
}

export interface Order {
    _id: string;
    orderId: string;
    customer: Customer;
    createdBy: string;
    items: OrderItem[];
    shippingCharge?: number;
    showFormulationToPackaging?: boolean;
    modeOfDispatch?: string;
    status: 'created' | 'admin_review' | 'packaging' | 'ready_for_dispatch' | 'dispatched' | 'delivered';
    audit: Array<{
        user: string;
        action: string;
        at: string;
    }>;
    packagedBy?: string;
    packedImages?: string[];
    dispatchDetails?: {
        courierName?: string;
        lrNumber?: string;
        trackingNumber?: string;
        trackingUrl?: string;
        dispatchDate?: string;
        dispatchedBy?: string;
    };
    totals: {
        subTotal: number;
        totalGst: number;
        shippingTax?: number;
        grandTotal: number;
    };
    createdAt: string;
    updatedAt: string;
}

class ApiService {
    private baseUrl = BaseUrl;

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<{ success: boolean; data?: T; message?: string }> {
        const token = authService.getToken();
        const method = options.method || 'GET';

        try {
            let response;
            const config: any = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            };

            if (method === 'GET') {
                response = await axios.get(`${this.baseUrl}${endpoint}`, config);
            } else if (method === 'POST') {
                response = await axios.post(`${this.baseUrl}${endpoint}`, options.body, config);
            } else if (method === 'PUT') {
                response = await axios.put(`${this.baseUrl}${endpoint}`, options.body, config);
            } else if (method === 'PATCH') {
                response = await axios.patch(`${this.baseUrl}${endpoint}`, options.body, config);
            } else {
                response = await axios.request({
                    url: `${this.baseUrl}${endpoint}`,
                    method: method as any,
                    headers: config.headers,
                    data: options.body,
                });
            }

            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    // Customer APIs
    async getCustomers(params?: {
        q?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Customer[]; pagination: any }> {
        const queryParams = new URLSearchParams();
        if (params?.q) queryParams.append('q', params.q);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const token=localStorage.getItem('auth_token');
        const response = await axios.get(`${this.baseUrl}/v1/orders?limit=5`,
            {
                headers:{Authorization:token}
            }
        );
        console.log(response.data);
        return response.data!;
    }

    async getCustomer(id: string): Promise<{ customer: Customer; orderHistory: Order[] }> {
        const token = authService.getToken();
        try {
            const response = await axios.get(`${this.baseUrl}/v1/customers/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }

    async createCustomer(customerData: Partial<Customer>): Promise<{ customer: Customer }> {
        const response = await this.request<{ customer: Customer }>('/v1/customers', {
            method: 'POST',
            body: JSON.stringify(customerData),
        });
        return response.data!;
    }

    async updateCustomer(id: string, customerData: Partial<Customer>): Promise<{ customer: Customer }> {
        const response = await this.request<{ customer: Customer }>(`/v1/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(customerData),
        });
        return response.data!;
    }

    // Order APIs
    async getOrders(params?: {
        from?: string;
        to?: string;
        status?: string;
        telecaller?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Order[]; pagination: any }> {
        const queryParams = new URLSearchParams();
        if (params?.from) queryParams.append('from', params.from);
        if (params?.to) queryParams.append('to', params.to);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.telecaller) queryParams.append('telecaller', params.telecaller);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await axios.get(`${this.baseUrl}/v1/orders?${queryParams.toString()}`,{
            headers:{
                Authorization:localStorage.getItem("auth_token")
            }
        })
        return response.data!;
    }

    async getOrder(id: string): Promise<Order> {
        const response = await this.request<Order>(`/v1/orders/${id}`);
        return response.data!;
    }

    async createOrder(orderData: {
        customer: string;
        items: OrderItem[];
        shippingCharge?: number;
        isOrderGstApplicable?: boolean;
    }): Promise<{ data: Order }> {
        console.log(orderData);
        const response = await axios.post(`${this.baseUrl}/v1/orders`, 
            orderData,
    {
        headers:{
            Authorization:localStorage.getItem('auth_token')
        }
    });
        return response.data!;
    }

    async updateOrder(id: string, orderData: Partial<Order>): Promise<{ data: Order }> {
        const response = await this.request<{ data: Order }>(`/v1/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(orderData),
        });
        return response.data!;
    }

    async assignFormulation(
        orderId: string,
        itemIndex: number,
        formulation: string,
        formulationVisible: boolean,
        showFormulationToPackaging?: boolean
    ): Promise<{ data: Order; message?: string }> {
        const token = authService.getToken();
        const body: any = { itemIndex, formulation, formulationVisible };
        if (showFormulationToPackaging !== undefined) {
            body.showFormulationToPackaging = showFormulationToPackaging;
        }
        try {
            const response = await axios.post(
                `${this.baseUrl}/v1/orders/${orderId}/assign-formulation`,
                body,
                {
                    headers: {
                        Authorization:localStorage.getItem('auth_token')
                    },
                }
            );
            // Backend returns { message, order }, so we need to wrap it
            return { data: response.data.order || response.data, message: response.data.message };
        } catch (error: any) {
            throw error;
        }
    }

    async updateOrderStatus(orderId: string, status: string) {
        const response = await axios.patch(`${this.baseUrl}/v1/orders/${orderId}/status`,
            {status},
            {
                headers:{
                    Authorization:localStorage.getItem('auth_token')
                }
            }
        )
        return response.data!;
    }

    // Packaging APIs
    async getPackagingOrders(): Promise<{ data: Order[] }> {
        const response = await this.request<{ data: Order[] }>('/v1/packaging');
        return response.data!;
    }

    async getPackagingOrder(id: string): Promise<{ data: Order }> {
        const response = await this.request<{ data: Order }>(`/v1/packaging/${id}`);
        return response.data!;
    }

    async packOrder(orderId: string, images: File[]): Promise<{ data: Order }> {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        const token = authService.getToken();
        const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}/pack`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to pack order');
        }

        return response.json();
    }

    // Dispatch APIs
    async getDispatchOrders(): Promise<{ data: Order[] }> {
        const response = await this.request<{ data: Order[] }>('/v1/dispatch');
        return response.data!;
    }

    async dispatchOrder(
        orderId: string,
        dispatchData: {
            courierName: string;
            lrNumber: string;
            trackingNumber: string;
            trackingUrl?: string;
        }
    ): Promise<{ data: Order }> {
        const response = await this.request<{ data: Order }>(`/v1/dispatch/${orderId}/dispatch`, {
            method: 'POST',
            body: JSON.stringify(dispatchData),
        });
        return response.data!;
    }

    async updateDispatchStatus(orderId: string, status: string): Promise<{ data: Order }> {
        const response = await this.request<{ data: Order }>(`/v1/dispatch/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        return response.data!;
    }

    // Admin APIs
    async getAdminOrders(params?: {
        status?: string;
        telecaller?: string;
        startDate?: string;
        endDate?: string;
        limit?:number;
    }): Promise<{ data: Order[] }> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.telecaller) queryParams.append('telecaller', params.telecaller);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const response = await this.request<{ data: Order[] }>(
            `/admin/orders?${queryParams.toString()}`
        );
        return response.data!;
    }

    async getManifest(orderId: string): Promise<{ message: string }> {
        const response = await this.request<{ message: string }>(`/v1/orders/${orderId}/manifest`);
        return response.data!;
    }
}

export default new ApiService();
