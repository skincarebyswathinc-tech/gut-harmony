import { useSubscription, type Feature } from '@/hooks/useSubscription';
import Paywall from '@/components/Paywall';

interface FeatureGateProps {
  feature: Feature;
  children: React.ReactNode;
}

const FeatureGate = ({ feature, children }: FeatureGateProps) => {
  const { canAccess, loading } = useSubscription();

  if (loading) return null;
  if (!canAccess(feature)) return <Paywall feature={feature} />;

  return <>{children}</>;
};

export default FeatureGate;
