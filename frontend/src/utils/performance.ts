import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from 'react';

// Debounce hook
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastRunRef.current = Date.now();
            callback(...args);
          },
          delay - (now - lastRunRef.current)
        );
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

// Lazy loading hook for images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = new Image();
            image.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            image.onerror = () => {
              setIsError(true);
            };
            image.src = src;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return { imgRef, imageSrc, isLoaded, isError };
}

// Memoized search/filter function
export function useFilteredData<T>(
  data: T[],
  searchTerm: string,
  filterFn: (item: T, term: string) => boolean
) {
  return useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter(item => filterFn(item, searchTerm.toLowerCase()));
  }, [data, searchTerm, filterFn]);
}

// Virtual scrolling hook (basic implementation)
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 measurements
    const measurements = this.metrics.get(name)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getMetrics(name: string) {
    const measurements = this.metrics.get(name) || [];
    if (measurements.length === 0) return null;

    const avg =
      measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    this.metrics.forEach((_, name) => {
      result[name] = this.getMetrics(name);
    });
    return result;
  }
}

// Bundle size optimization
export const LazyComponent = {
  // Lazy load components with error boundaries
  create: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(async () => {
      try {
        return await importFn();
      } catch (error) {
        console.error('Component lazy loading failed:', error);
        throw error;
      }
    });
  },
};

// Web Workers utility
export class WebWorkerManager {
  private workers: Map<string, Worker> = new Map();

  createWorker(name: string, script: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }

    const blob = new Blob([script], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    this.workers.set(name, worker);

    return worker;
  }

  terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  terminateAll(): void {
    this.workers.forEach((worker, name) => {
      worker.terminate();
    });
    this.workers.clear();
  }
}

// Memory management
export function useMemoryCleanup(dependencies: any[]): void {
  const previousDeps = useRef(dependencies);

  useEffect(() => {
    // Check if dependencies changed
    const depsChanged = dependencies.some(
      (dep, index) => dep !== previousDeps.current[index]
    );

    if (depsChanged) {
      // Cleanup can be performed here
      previousDeps.current = dependencies;
    }

    return () => {
      // Cleanup on unmount
    };
  }, [dependencies]);
}

// Image optimization utilities
export const ImageOptimizer = {
  // Create responsive image srcSet
  createSrcSet: (baseUrl: string, sizes: number[]) => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },

  // Calculate optimal image size
  getOptimalSize: (containerWidth: number, devicePixelRatio = 1) => {
    const targetWidth = containerWidth * devicePixelRatio;
    const standardSizes = [320, 640, 768, 1024, 1280, 1600];
    return standardSizes.find(size => size >= targetWidth) || 1600;
  },

  // Preload critical images
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },
};

// Export performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
