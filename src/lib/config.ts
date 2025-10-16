interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    url: string;
  };
  database: {
    url: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  paystack: {
    publicKey: string;
    secretKey: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    return {
      app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'KitchenMode',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development',
        url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      },
      database: {
        url: process.env.MONGODB_URI || '',
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || '',
        jwtExpiresIn: process.env.JWT_EXPIRES_TIME || '7d',
      },
      paystack: {
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        secretKey: process.env.PAYSTACK_SECRET_KEY || '',
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      },
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: parseInt(process.env.SMTP_PORT || '587'),
        smtpUser: process.env.SMTP_USER || '',
        smtpPass: process.env.SMTP_PASS || '',
      },
    };
  }

  private validateConfig(): void {
    const requiredFields = [
      'database.url',
      'auth.jwtSecret',
      'paystack.publicKey',
      'paystack.secretKey',
      'cloudinary.cloudName',
      'cloudinary.apiKey',
      'cloudinary.apiSecret',
    ];

    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      const value = this.getNestedValue(this.config, field);
      if (!value) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const error = `Missing required environment variables: ${missingFields.join(', ')}`;
      if (this.config.app.environment === 'production') {
        throw new Error(error);
      } else {
        console.warn(error);
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  public get<T = any>(path: string): T {
    return this.getNestedValue(this.config, path);
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  public isStaging(): boolean {
    return this.config.app.environment === 'staging';
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();

// Export specific configurations for convenience
export const appConfig = config.get('app');
export const databaseConfig = config.get('database');
export const authConfig = config.get('auth');
export const paystackConfig = config.get('paystack');
export const cloudinaryConfig = config.get('cloudinary');
export const emailConfig = config.get('email');

// Environment helpers
export const isDev = config.isDevelopment();
export const isProd = config.isProduction();
export const isStaging = config.isStaging();

export default config;