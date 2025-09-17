const API_BASE_URL = process.env.NEXT_PUBLIC_CUPONES_SERVICE_URL || 'http://localhost:3004';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  used_count: number;
}

export interface CreateCouponData {
  code: string;
  discount: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
}

export interface CouponStats {
  total_coupons: number;
  active_coupons: number;
  expired_coupons: number;
  total_usage: number;
}

class CouponsAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api/coupons${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  async createCoupon(data: CreateCouponData): Promise<Coupon> {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.coupon;
  }

  async getCoupons(filters?: { active?: boolean; limit?: number }): Promise<Coupon[]> {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', filters.active.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request(query);
    return response.coupons;
  }

  async getCouponById(id: string): Promise<Coupon> {
    const response = await this.request(`/${id}`);
    return response.coupon;
  }

  async updateCoupon(id: string, data: Partial<CreateCouponData>): Promise<Coupon> {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; coupon?: Coupon; message: string }> {
    const response = await this.request(`/validate/${code}`);
    return response;
  }

  async applyCoupon(code: string): Promise<{ success: boolean; coupon?: Coupon; discount: number; message: string }> {
    const response = await this.request(`/apply/${code}`, {
      method: 'POST',
    });
    return response;
  }

  async getCouponStats(): Promise<CouponStats> {
    const response = await this.request('/stats');
    return response.stats;
  }
}

export const couponsAPI = new CouponsAPI();