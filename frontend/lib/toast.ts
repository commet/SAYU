/**
 * Toast 알림 유틸리티
 * react-hot-toast 래퍼로 일관된 스타일 제공
 */

import { toast as hotToast, ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 3000,
  position: 'top-center',
};

export const toast = {
  /**
   * 성공 메시지
   */
  success: (message: string, options?: ToastOptions) =>
    hotToast.success(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: '#10b981',
        color: 'white',
        fontWeight: '500',
        ...options?.style,
      },
      iconTheme: {
        primary: 'white',
        secondary: '#10b981',
      },
    }),

  /**
   * 에러 메시지
   */
  error: (message: string, options?: ToastOptions) =>
    hotToast.error(message, {
      ...defaultOptions,
      duration: 4000, // 에러는 조금 더 길게
      ...options,
      style: {
        background: '#ef4444',
        color: 'white',
        fontWeight: '500',
        ...options?.style,
      },
      iconTheme: {
        primary: 'white',
        secondary: '#ef4444',
      },
    }),

  /**
   * 로딩 메시지
   */
  loading: (message: string, options?: ToastOptions) =>
    hotToast.loading(message, {
      ...defaultOptions,
      duration: Infinity, // 수동으로 dismiss할 때까지
      ...options,
      style: {
        background: '#3b82f6',
        color: 'white',
        fontWeight: '500',
        ...options?.style,
      },
    }),

  /**
   * 일반 정보 메시지
   */
  info: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: '#6b7280',
        color: 'white',
        fontWeight: '500',
        ...options?.style,
      },
      icon: 'ℹ️',
    }),

  /**
   * 경고 메시지
   */
  warning: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...defaultOptions,
      ...options,
      style: {
        background: '#f59e0b',
        color: 'white',
        fontWeight: '500',
        ...options?.style,
      },
      icon: '⚠️',
    }),

  /**
   * 특정 toast 제거
   */
  dismiss: (toastId?: string) => hotToast.dismiss(toastId),

  /**
   * 프로미스 기반 toast (자동으로 로딩 → 성공/실패 전환)
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) =>
    hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...defaultOptions,
        ...options,
        success: {
          style: {
            background: '#10b981',
            color: 'white',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#ef4444',
          },
        },
      }
    ),
};
