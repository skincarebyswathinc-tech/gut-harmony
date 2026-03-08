import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Crown, Zap, ArrowLeft } from 'lucide-react';
import type { Feature } from '@/hooks/useSubscription';

const featureLabels: Record<Feature, { title: string; description: string; requiredPlan: 'report' | 'membership' }> = {
  gut_report: { title: 'Full Gut Health Report', description: 'Get a comprehensive analysis of your gut health with biomarker scores and risk indicators.', requiredPlan: 'report' },
  pdf_download: { title: 'PDF Download', description: 'Download your complete gut health report as a professional PDF document.', requiredPlan: 'report' },
  healing_plan: { title: 'Personalized Healing Plan', description: 'Receive a customized 30-day gut healing protocol tailored to your results.', requiredPlan: 'report' },
  daily_tracking: { title: 'Daily Gut Tracking', description: 'Log your daily symptoms, meals, and lifestyle factors for continuous monitoring.', requiredPlan: 'membership' },
  progress_analytics: { title: 'Progress Analytics', description: 'Track your gut health improvements over time with detailed charts and trends.', requiredPlan: 'membership' },
  weekly_reports: { title: 'Weekly Gut Reports', description: 'Receive AI-powered weekly summaries of your gut health patterns.', requiredPlan: 'membership' },
  trigger_detection: { title: 'Trigger Detection', description: 'Identify food and lifestyle triggers that impact your gut health.', requiredPlan: 'membership' },
  ai_explanations: { title: 'AI Gut Health Insights', description: 'Get personalized AI-powered explanations about your gut health data.', requiredPlan: 'membership' },
  full_dashboard: { title: 'Full Dashboard', description: 'Access your complete gut health dashboard with all insights and analytics.', requiredPlan: 'membership' },
};

interface PaywallProps {
  feature: Feature;
  onBack?: () => void;
}

const Paywall = ({ feature, onBack }: PaywallProps) => {
  const navigate = useNavigate();
  const info = featureLabels[feature];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={onBack ?? (() => navigate('/dashboard'))}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>

        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-accent p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {info.title}
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {info.description}
            </p>
          </div>

          <CardContent className="p-6 space-y-4">
            {info.requiredPlan === 'report' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <Crown className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Premium Report</h3>
                    <p className="text-xs text-muted-foreground">One-time purchase • Full gut report + PDF</p>
                  </div>
                  <span className="text-lg font-bold text-foreground">$9.99</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate('/pricing')}>
                  <Crown className="h-4 w-4 mr-2" /> Unlock Premium Report
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <Zap className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Gut Transformation Membership</h3>
                    <p className="text-xs text-muted-foreground">Monthly subscription • Full platform access</p>
                  </div>
                  <span className="text-lg font-bold text-foreground">$19.99<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate('/pricing')}>
                  <Zap className="h-4 w-4 mr-2" /> Start Membership
                </Button>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              <button onClick={() => navigate('/pricing')} className="underline hover:text-foreground transition-colors">
                View all plans
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Paywall;
