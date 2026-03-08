import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, ArrowLeft, Check, Crown, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free' as const,
    name: 'Free Plan',
    price: '$0',
    period: '',
    description: 'Get started with your gut health journey',
    icon: Star,
    features: [
      'Basic gut health score',
      'Limited dashboard insights',
      'Assessment every 30 days',
      'Basic recommendations',
    ],
    excluded: [
      'Full gut health report',
      'PDF download',
      'Daily gut tracking',
      'Progress analytics',
      'Weekly reports',
    ],
    cta: 'Current Plan',
    variant: 'outline' as const,
  },
  {
    id: 'premium_report' as const,
    name: 'Premium Report',
    price: '$9.99',
    period: 'one-time',
    description: 'Comprehensive gut health analysis',
    icon: Crown,
    features: [
      'Everything in Free',
      'Full gut health report',
      'PDF download',
      'Biomarker deep-dive',
      'Condition risk indicators',
      'Personalized diet strategy',
      '30-day healing protocol',
      'Lifestyle optimization plan',
    ],
    excluded: [
      'Daily gut tracking',
      'Progress analytics',
      'Weekly reports',
    ],
    cta: 'Get Premium Report',
    variant: 'default' as const,
  },
  {
    id: 'membership' as const,
    name: 'Gut Transformation',
    price: '$19.99',
    period: '/month',
    description: 'Complete gut health platform',
    icon: Zap,
    popular: true,
    features: [
      'Everything in Premium Report',
      'Daily gut symptom tracking',
      'Progress analytics & trends',
      'Weekly AI-powered reports',
      'Food trigger detection',
      'AI gut health explanations',
      'Priority support',
    ],
    excluded: [],
    cta: 'Start Membership',
    variant: 'default' as const,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { plan: currentPlan, loading } = useSubscription();

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') return;
    // Stripe not yet connected — show toast
    toast.info('Payment system coming soon! This feature will be available shortly.');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">Pricing</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Choose Your Gut Health Plan
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Start free, unlock deep insights with a one-time report, or transform your gut health with a full membership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrentPlan = currentPlan === p.id || (currentPlan === 'membership' && p.id !== 'membership');
            const Icon = p.icon;

            return (
              <Card
                key={p.id}
                className={`relative flex flex-col ${
                  p.popular
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mx-auto mb-3">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl font-display">{p.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-muted-foreground ml-1">{p.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                    {p.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                        <Check className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {loading ? (
                    <Button disabled className="w-full">Loading…</Button>
                  ) : p.id === 'free' ? (
                    <Button variant="outline" className="w-full" disabled={currentPlan === 'free'}>
                      {currentPlan === 'free' ? '✓ Current Plan' : 'Downgrade'}
                    </Button>
                  ) : isCurrentPlan && currentPlan === p.id ? (
                    <Button variant="outline" className="w-full" disabled>
                      ✓ Active
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={p.popular ? 'default' : 'default'}
                      onClick={() => handleSelectPlan(p.id)}
                    >
                      {p.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            All plans include our core gut health assessment. Cancel membership anytime.
            <br />
            Prices in USD. Premium Report is a one-time purchase with lifetime access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
