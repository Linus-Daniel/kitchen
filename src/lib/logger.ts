import { config } from './config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
  userId?: string;
  requestId?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = config.isProduction() ? LogLevel.INFO : LogLevel.DEBUG;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    const userId = entry.userId ? `[User:${entry.userId}]` : '';
    const requestId = entry.requestId ? `[Req:${entry.requestId}]` : '';
    
    return `${timestamp} [${level}]${context}${userId}${requestId} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context,
    };

    const formattedMessage = this.formatMessage(entry);

    // Console output with appropriate method
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data);
        break;
    }

    // In production, send to external logging service
    if (config.isProduction()) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Implement integration with logging services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - DataDog for application monitoring
    // - CloudWatch for AWS deployments
    
    // Example for Sentry integration:
    // if (entry.level === LogLevel.ERROR) {
    //   Sentry.captureException(new Error(entry.message), {
    //     extra: entry.data,
    //     tags: {
    //       context: entry.context,
    //       userId: entry.userId,
    //     },
    //   });
    // }
  }

  public error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  public warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  public info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  public debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  // Specialized logging methods
  public apiRequest(method: string, url: string, userId?: string, data?: any): void {
    this.info(`${method} ${url}`, data, `API:${userId || 'anonymous'}`);
  }

  public apiResponse(method: string, url: string, status: number, duration: number): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `${method} ${url} - ${status} (${duration}ms)`, undefined, 'API');
  }

  public authEvent(event: string, userId?: string, data?: any): void {
    this.info(`Auth: ${event}`, data, `AUTH:${userId || 'anonymous'}`);
  }

  public paymentEvent(event: string, orderId: string, amount?: number, data?: any): void {
    this.info(`Payment: ${event}`, { orderId, amount, ...data }, 'PAYMENT');
  }

  public securityEvent(event: string, details?: any): void {
    this.warn(`Security: ${event}`, details, 'SECURITY');
  }

  public performance(operation: string, duration: number, context?: string): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation} took ${duration}ms`, undefined, context || 'PERF');
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Performance measurement helper
export function measure<T>(operation: string, fn: () => T, context?: string): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    logger.performance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Failed: ${operation} (${duration}ms)`, error, context);
    throw error;
  }
}

// Async performance measurement helper
export async function measureAsync<T>(
  operation: string, 
  fn: () => Promise<T>, 
  context?: string
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.performance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Failed: ${operation} (${duration}ms)`, error, context);
    throw error;
  }
}

export default logger;