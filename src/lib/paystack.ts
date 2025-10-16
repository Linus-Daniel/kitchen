interface PaystackConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  callback: (response: any) => void;
  onClose: () => void;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

interface PaystackResponse {
  status: string;
  reference: string;
  trans: string;
  transaction: string;
  message: string;
  redirecturl: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export class PaystackService {
  private publicKey: string;
  private secretKey: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  // Load Paystack script dynamically
  private loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  }

  async initializePayment(config: {
    amount: number;
    email: string;
    orderId: string;
    customerName?: string;
    customerPhone?: string;
    onSuccess: (response: PaystackResponse) => void;
    onCancel: () => void;
  }) {
    try {
      await this.loadPaystackScript();

      const paystackConfig: PaystackConfig = {
        public_key: this.publicKey,
        tx_ref: `order_${config.orderId}_${Date.now()}`,
        amount: Math.round(config.amount * 100), // Convert to kobo (smallest currency unit)
        currency: 'NGN',
        customer: {
          email: config.email,
          phone_number: config.customerPhone,
          name: config.customerName,
        },
        callback: (response: any) => {
          if (response.status === 'success') {
            config.onSuccess(response);
          }
        },
        onClose: () => {
          config.onCancel();
        },
        customizations: {
          title: 'KitchenMode Payment',
          description: `Payment for order #${config.orderId}`,
          logo: '/logo.png',
        },
      };

      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  // Server-side payment verification
  async verifyPaymentServer(reference: string): Promise<any> {
    try {
      const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Paystack verification failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  // Client-side payment verification
  static async verifyPayment(reference: string): Promise<any> {
    const response = await fetch('/api/payment/verify-paystack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return response.json();
  }

  // Initialize payment transaction
  async initializeTransaction(data: {
    email: string;
    amount: number;
    orderId: string;
    callback_url?: string;
    metadata?: any;
  }): Promise<any> {
    try {
      const initUrl = 'https://api.paystack.co/transaction/initialize';
      const response = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          amount: Math.round(data.amount * 100), // Convert to kobo
          reference: `order_${data.orderId}_${Date.now()}`,
          callback_url: data.callback_url,
          metadata: {
            orderId: data.orderId,
            ...data.metadata,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Paystack initialization failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Paystack transaction initialization error:', error);
      throw error;
    }
  }

  // Convert amount to display format
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  }

  // Generate transaction reference
  static generateReference(orderId: string): string {
    return `order_${orderId}_${Date.now()}`;
  }
}

export const paystackService = new PaystackService();