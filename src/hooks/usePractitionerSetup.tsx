import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * On login, if there's pending practitioner data in localStorage,
 * call the register-practitioner edge function to complete setup.
 */
const usePractitionerSetup = () => {
  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;

    const pending = localStorage.getItem('pending_practitioner');
    if (!pending) return;

    hasRun.current = true;

    const complete = async () => {
      try {
        const details = JSON.parse(pending);
        const { error } = await supabase.functions.invoke('register-practitioner', {
          body: details,
        });
        if (!error) {
          localStorage.removeItem('pending_practitioner');
        }
      } catch {
        // Silently fail — will retry next login
      }
    };

    complete();
  }, [user]);
};

export default usePractitionerSetup;
