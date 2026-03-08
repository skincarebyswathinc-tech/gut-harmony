import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'free' | 'premium_report' | 'membership';

export interface SubscriptionState {
  plan: PlanType;
  hasPremiumReport: boolean;
  hasMembership: boolean;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  canAccess: (feature: Feature) => boolean;
  refreshSubscription: () => Promise<void>;
}

export type Feature =
  | 'gut_report'
  | 'pdf_download'
  | 'healing_plan'
  | 'daily_tracking'
  | 'progress_analytics'
  | 'weekly_reports'
  | 'trigger_detection'
  | 'ai_explanations'
  | 'full_dashboard';

const FEATURE_ACCESS: Record<Feature, PlanType[]> = {
  gut_report: ['premium_report', 'membership'],
  pdf_download: ['premium_report', 'membership'],
  healing_plan: ['premium_report', 'membership'],
  daily_tracking: ['membership'],
  progress_analytics: ['membership'],
  weekly_reports: ['membership'],
  trigger_detection: ['membership'],
  ai_explanations: ['membership'],
  full_dashboard: ['membership'],
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    hasPremiumReport: false,
    hasMembership: false,
    loading: true,
  });

  const fetchSubscription = async () => {
    if (!user) {
      setState({ plan: 'free', hasPremiumReport: false, hasMembership: false, loading: false });
      return;
    }

    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const subs = data as any[] | null;
      const hasMembership = subs?.some(
        (s) => s.plan_type === 'membership' && s.status === 'active'
      ) ?? false;
      const hasPremiumReport = subs?.some(
        (s) => s.plan_type === 'premium_report' && (s.status === 'active' || s.status === 'completed')
      ) ?? false;

      const plan: PlanType = hasMembership ? 'membership' : hasPremiumReport ? 'premium_report' : 'free';

      setState({ plan, hasPremiumReport, hasMembership, loading: false });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const canAccess = (feature: Feature): boolean => {
    const allowedPlans = FEATURE_ACCESS[feature];
    if (!allowedPlans) return true;
    if (state.hasMembership && allowedPlans.includes('membership')) return true;
    if (state.hasPremiumReport && allowedPlans.includes('premium_report')) return true;
    return false;
  };

  return (
    <SubscriptionContext.Provider value={{ ...state, canAccess, refreshSubscription: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
