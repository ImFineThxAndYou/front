// 간단한 로거 유틸리티
export const logger = {
  log: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.warn(...args),
  info: (...args: any[]) => console.info(...args),
  debug: (...args: any[]) => console.debug(...args),
  
  // 토스트 관련 로깅
  toast: {
    log: (...args: any[]) => console.log('🍞', ...args),
    error: (...args: any[]) => console.error('🍞', ...args),
    warn: (...args: any[]) => console.warn('🍞', ...args),
  }
};

export default logger;
