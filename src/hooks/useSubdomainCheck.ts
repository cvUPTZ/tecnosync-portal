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

  const checkSubdomain = useCallback(
    async (subdomain: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();

      if (!subdomain || subdomain.length < 3) {
        setResult({ isChecking: false, isAvailable: null, message: '', error: null });
        return;
      }

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

      setResult((prev) => ({
        ...prev,
        isChecking: true,
        message: 'Checking availability...',
        error: null,
      }));

      timeoutRef.current = setTimeout(async () => {
        try {
          abortControllerRef.current = new AbortController();
          const { data, error } = await supabase
            .from('academies')
            .select('id')
            .eq('subdomain', subdomain)
            .limit(1)
            .abortSignal(abortControllerRef.current.signal);

          if (abortControllerRef.current.signal.aborted) return;

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
            message: isAvailable ? '✓ Subdomain is available!' : '✗ Subdomain is already taken',
            error: null,
          });
        } catch (error: any) {
          if (error.name === 'AbortError') return;
          console.error('Subdomain check error:', error);
          setResult({
            isChecking: false,
            isAvailable: false,
            message: 'Error checking availability. Please try again.',
            error: error.message,
          });
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  return { checkSubdomain, result, cleanup };
};
