import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { sections, ScoreResult, getScoreLabel, getScoreColor, getRecommendations } from '@/lib/assessment';
import { Button } from '@/components/ui/button';
import {
  Leaf, User, LogOut, ArrowRight, Shield, Activity,
  Stethoscope, ClipboardList, Sun, Apple, Flame, Brain, HeartPulse,
} from 'lucide-react';

const compositeScoresMeta: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'gut_integrity', label: 'Gut Integrity', icon: Shield },
  { key: 'microbiome_diversity', label: 'Microbiome Diversity', icon: Activity },
  { key: 'digestive_efficiency', label: 'Digestive Efficiency', icon: Stethoscope },
  { key: 'inflammation_load', label: 'Inflammation Load', icon: Flame },
  { key: 'food_sensitivity_risk', label: 'Food Sensitivity', icon: Apple },
  { key: 'gut_brain_balance', label: 'Gut-Brain Balance', icon: Brain },
];

const ScoreRing = ({ score, label, icon: Icon }: { score: number; label: string; icon: React.ElementType }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  const scoreLabel = getScoreLabel(score);

  const getStrokeColor = (s: number) => {
    if (s >= 80) return 'stroke-score-excellent';
    if (s >= 60) return 'stroke-score-good';
    if (s >= 40) return 'stroke-score-fair';
    return 'stroke-score-poor';
  };

  return (
    <div className="flex flex-col items-center bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="relative w-20 h-20 md:w-24 md:h-24 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            className={getStrokeColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg md:text-xl font-bold text-foreground">{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs md:text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className={`text-xs font-medium ${getScoreColor(score)}`}>{scoreLabel}</span>
    </div>
  );
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setScores(data[0].scores as unknown as ScoreResult);
        }
        setLoading(false);
      });
  }, [user]);

  const recommendations = scores ? getRecommendations(scores) : [];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
            <User className="h-4 w-4 mr-1" /> Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading your results...</div>
        ) : scores ? (
          <>
            {/* Overall */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Your Gut Health Score
              </h1>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-accent mt-4">
                <span className="text-4xl font-bold text-primary">{scores.overall}</span>
              </div>
              <p className={`mt-3 font-medium ${getScoreColor(scores.overall)}`}>
                {getScoreLabel(scores.overall)}
              </p>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-10">
              {sections.map((s) => {
                const Icon = iconMap[s.icon] || Activity;
                const sectionScore = (scores as any)[s.id] as number;
                return (
                  <ScoreRing
                    key={s.id}
                    score={sectionScore ?? 0}
                    label={sectionDisplayNames[s.id] || s.title}
                    icon={Icon}
                  />
                );
              })}
            </div>

            {/* Recommendations */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                Personalized Recommendations
              </h2>
              <ul className="space-y-3">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <Button onClick={() => navigate('/assessment')}>
                Retake Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">No assessment yet</h2>
            <p className="text-muted-foreground mb-6">
              Complete your first gut health assessment to see your scores and recommendations.
            </p>
            <Button onClick={() => navigate('/assessment')}>
              Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
