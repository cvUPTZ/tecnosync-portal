// hooks/useSubdomainCheck.ts
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubdomainCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  message: string;
  error: string | null;
}

export const useSubdomainCheck = (debounceMs: number = 800) => {
  const [result, setResult] = useState<SubdomainCheckResult>({
    isChecking: false,
    isAvailable: null,
    message: '',
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkSubdomain = useCallback(async (subdomain: string) => {
    // Clear previous timeout and abort previous request
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state for empty or short subdomains
    if (!subdomain || subdomain.length < 3) {
      setResult({
        isChecking: false,
        isAvailable: null,
        message: '',
        error: null,
      });
      return;
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      setResult({
        isChecking: false,
        isAvailable: false,
        message: 'Invalid format: use only lowercase letters, numbers, and hyphens',
        error: 'Invalid format',
      });
      return;
    }

    // Check for reserved subdomains
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'cdn', 'blog', 'shop'];
    if (reservedSubdomains.includes(subdomain)) {
      setResult({
        isChecking: false,
        isAvailable: false,
        message: 'This subdomain is reserved',
        error: 'Reserved subdomain',
      });
      return;
    }

    // Set checking state
    setResult(prev => ({
      ...prev,
      isChecking: true,
      message: 'Checking availability...',
      error: null,
    }));

    // Debounce the actual check
    timeoutRef.current = setTimeout(async () => {
      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        const { data, error } = await supabase
          .from('academies')
          .select('id')
          .eq('subdomain', subdomain)
          .limit(1)
          .abortSignal(abortControllerRef.current.signal);

        // Handle the case where request was aborted
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        if (error) {
          console.error('Subdomain check error:', error);
          setResult({
            isChecking: false,
            isAvailable: false,
            message: 'Error checking availability. Please try again.',
            error: error.message,
          });
          return;
        }

        const isAvailable = !data || data.length === 0;
        setResult({
          isChecking: false,
          isAvailable,
          message: isAvailable 
            ? '✓ Subdomain is available!' 
            : '✗ Subdomain is already taken',
          error: null,
        });

      } catch (error: any) {
        // Don't update state if request was aborted
        if (error.name === 'AbortError') {
          return;
        }

        console.error('Subdomain check error:', error);
        setResult({
          isChecking: false,
          isAvailable: false,
          message: 'Error checking availability. Please try again.',
          error: error.message,
        });
      }
    }, debounceMs);
  }, [debounceMs]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    checkSubdomain,
    result,
    cleanup,
  };
};

// Alternative: Simple function-based approach
export const checkSubdomainAvailability = async (subdomain: string): Promise<{
  isAvailable: boolean;
  message: string;
  error?: string;
}> => {
  try {
    // Validate input
    if (!subdomain || subdomain.length < 3) {
      return {
        isAvailable: false,
        message: 'Subdomain must be at least 3 characters',
      };
    }

    // Format validation
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return {
        isAvailable: false,
        message: 'Invalid format: use only lowercase letters, numbers, and hyphens',
      };
    }

    // Check database
    const { data, error } = await supabase
      .from('academies')
      .select('id')
      .eq('subdomain', subdomain)
      .limit(1);

    if (error) {
      console.error('Subdomain check error:', error);
      return {
        isAvailable: false,
        message: 'Error checking availability',
        error: error.message,
      };
    }

    const isAvailable = !data || data.length === 0;
    return {
      isAvailable,
      message: isAvailable 
        ? 'Subdomain is available!' 
        : 'Subdomain is already taken',
    };
  } catch (error: any) {
    console.error('Subdomain check error:', error);
    return {
      isAvailable: false,
      message: 'Error checking availability',
      error: error.message,
    };
  }
};
