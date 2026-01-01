import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { NextRequest } from 'next/server';

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'spyberpolymath-api' },
  transports: [
    // Error log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // Combined log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // Security log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
}

// Request logging middleware
export const logRequest = (req: NextRequest, userId?: string, additionalData?: any) => {
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   req.headers.get('x-real-ip') ||
                   req.headers.get('x-client-ip') ||
                   'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';
  const method = req.method;
  const url = req.url;

  logger.http('API Request', {
    method,
    url,
    ip: clientIP,
    userAgent,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

// Security event logging
export const logSecurityEvent = (event: string, details: any, req?: NextRequest) => {
  const clientIP = req ? (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  ) : 'unknown';

  logger.warn('Security Event', {
    event,
    ip: clientIP,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Error logging
export const logError = (error: Error, context?: any, req?: NextRequest) => {
  const clientIP = req ? (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  ) : 'unknown';

  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    ip: clientIP,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Authentication logging
export const logAuthEvent = (event: string, userId: string, details?: any, req?: NextRequest) => {
  const clientIP = req ? (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  ) : 'unknown';

  logger.info('Authentication Event', {
    event,
    userId,
    ip: clientIP,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Payment logging
export const logPaymentEvent = (event: string, paymentId: string, amount: number, currency: string, details?: any) => {
  logger.info('Payment Event', {
    event,
    paymentId,
    amount,
    currency,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Admin action logging
export const logAdminAction = (action: string, adminId: string, targetId?: string, details?: any, req?: NextRequest) => {
  const clientIP = req ? (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  ) : 'unknown';

  logger.info('Admin Action', {
    action,
    adminId,
    targetId,
    ip: clientIP,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export default logger;