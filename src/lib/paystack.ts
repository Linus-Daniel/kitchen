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
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
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
      // Initialize transaction via internal API
      const initResponse = await this.initializePaymentAPI({
        email: config.email,
        amount: config.amount,
        orderId: config.orderId,
        callback_url: `${window.location.origin}/payment/success`,
        metadata: {
          customerName: config.customerName,
          customerPhone: config.customerPhone,
        }
      });

      if (!initResponse.success || !initResponse.data?.authorization_url) {
        throw new Error('Failed to initialize payment');
      }

      // Get the reference from the response
      const reference = initResponse.data.reference;
      
      // Open checkout URL in new tab
      const checkoutUrl = initResponse.data.authorization_url;
      this.openPaymentTab(checkoutUrl, reference, config.onSuccess, config.onCancel);

    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  private openPaymentTab(
    checkoutUrl: string, 
    reference: string,
    onSuccess: (response: PaystackResponse) => void,
    onCancel: () => void
  ): void {
    // Store callbacks and reference in sessionStorage for retrieval after redirect
    sessionStorage.setItem('paystack_payment_data', JSON.stringify({
      reference,
      timestamp: Date.now()
    }));

    // Store callbacks in a global object (will be available when user returns)
    (window as any).paystackCallbacks = {
      onSuccess,
      onCancel
    };

    // Open checkout URL in new tab
    window.open(checkoutUrl, '_blank');

    // Listen for storage events (when user completes payment in other tab)
    const storageListener = (event: StorageEvent) => {
      if (event.key === 'paystack_payment_result') {
        const result = JSON.parse(event.newValue || '{}');
        
        if (result.reference === reference) {
          window.removeEventListener('storage', storageListener);
          sessionStorage.removeItem('paystack_payment_result');
          sessionStorage.removeItem('paystack_payment_data');
          
          if (result.success) {
            onSuccess({
              status: 'success',
              reference: result.reference,
              trans: result.transaction_id,
              transaction: result.transaction_id,
              message: 'Payment successful',
              redirecturl: ''
            });
          } else {
            onCancel();
          }
        }
      }
    };

    window.addEventListener('storage', storageListener);

    // Cleanup listener after 10 minutes if no response
    setTimeout(() => {
      window.removeEventListener('storage', storageListener);
    }, 10 * 60 * 1000);
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

  // Initialize payment via internal API
  async initializePaymentAPI(data: {
    email: string;
    amount: number;
    orderId: string;
    callback_url?: string;
    metadata?: any;
  }): Promise<any> {
    try {
      const response = await fetch('/api/payment/initialize-paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: data.email,
          amount: data.amount,
          orderId: data.orderId,
          callback_url: data.callback_url,
          metadata: data.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment initialization failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Initialize payment transaction (legacy - direct Paystack API)
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