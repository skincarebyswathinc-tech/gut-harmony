import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { getScoreLabel, getScoreColor } from '@/lib/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Leaf, ArrowRight, Crown, Zap, Search, Target,
  TrendingUp, Stethoscope, ShieldCheck, Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const scoreMessages: Record<string, { headline: string; subtext: string }> = {
  excellent: {
    headline: 'Your gut health is strong!',
    subtext: 'Maintain your edge with advanced tracking and personalized optimization strategies.',
  },
  good: {
    headline: 'Your gut health shows promise — with room to grow.',
    subtext: 'Unlock your full report to understand exactly where to focus for maximum improvement.',
  },
  fair: {
    headline: 'Your gut health score indicates moderate imbalance.',
    subtext: 'Upgrade to unlock your full gut health report and 30-day healing protocol.',
  },
  poor: {
    headline: 'Your gut health needs urgent attention.',
    subtext: 'Get your detailed report and personalized healing plan to start recovering today.',
  },
};

const getCategory = (score: number) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
};

const benefits = [
  {
    icon: Search,
    title: 'Identify Root Causes',
    description: 'Discover the hidden lifestyle and dietary triggers behind your gut symptoms.',
  },
  {
    icon: Target,
    title: 'Personalized Healing Strategy',
    description: 'Get a custom 30-day protocol designed around your unique biomarker profile.',
  },
  {
    icon: TrendingUp,
    title: 'Track Gut Improvement',
    description: 'Monitor your progress with daily logging, trend analysis, and weekly AI reports.',
  },
  {
    icon: Stethoscope,
    title: 'Expert Consultation',
    description: 'Share your report with a health practitioner for professional guidance.',
  },
];

const UpgradeOffer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAccess } = useSubscription();
  const [searchParams] = useSearchParams();
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fromAssessment = searchParams.get('from') === 'assessment';

  useEffect(() => {
    if (!user) return;
    supabase
      .from('assessments')
      .select('overall_score')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setScore(data[0].overall_score ?? 0);
        setLoading(false);
      });
  }, [user]);

  const category = score !== null ? getCategory(score) : 'fair';
  const msg = scoreMessages[category];

  const handleGetReport = () => {
    if (canAccess('gut_report')) {
      navigate('/gut-report');
    } else {
      navigate('/pricing');
    }
  };

  const handleGetMembership = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Leaf className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/30 to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-16">
          {/* Score display */}
          {score !== null && (
            <div className="flex flex-col items-center mb-10 animate-fade-in">
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" className="stroke-muted" strokeWidth="6" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    className={score >= 80 ? 'stroke-score-excellent' : score >= 60 ? 'stroke-score-good' : score >= 40 ? 'stroke-score-fair' : 'stroke-score-poor'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 - (score / 100) * 2 * Math.PI * 52}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{score}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </div>
          )}

          {/* Headline */}
          <div className="text-center max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 leading-tight">
              {msg.headline}
            </h1>
            <p className="text-lg text-muted-foreground">
              {msg.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.title}
                className="group border-border hover:border-primary/30 transition-all hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          {/* Premium Report CTA */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/20 overflow-hidden">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-display font-bold text-foreground">Premium Report</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                One-time purchase. Get your full gut health report with biomarker analysis, root cause identification, and a personalized 30-day healing protocol.
              </p>
              <ul className="space-y-2 mb-5">
                {['Full biomarker analysis', 'Condition risk indicators', 'Personalized diet strategy', '30-day healing protocol', 'PDF download'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">$9.99</span>
                  <span className="text-sm text-muted-foreground ml-1">one-time</span>
                </div>
                <Button onClick={handleGetReport} size="lg">
                  <Crown className="h-4 w-4 mr-2" /> Get Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Membership CTA */}
          <Card className="border-primary shadow-xl ring-2 ring-primary/20 overflow-hidden relative">
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Recommended
            </div>
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-display font-bold text-foreground">Gut Transformation</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                Monthly membership. Everything in Premium Report plus daily tracking, progress analytics, weekly AI reports, and trigger detection.
              </p>
              <ul className="space-y-2 mb-5">
                {['Everything in Premium Report', 'Daily gut symptom tracking', 'Progress analytics & trends', 'Weekly AI-powered reports', 'Food trigger detection', 'Expert consultation sharing'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">$19.99</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <Button onClick={handleGetMembership} size="lg">
                  <Zap className="h-4 w-4 mr-2" /> Start Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skip link */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            Continue to free dashboard <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You can upgrade at any time from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeOffer;
