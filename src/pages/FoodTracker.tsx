import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { computeCorrelations, formatInsight, type Correlation } from '@/lib/food-correlations';
import {
  ArrowLeft, Leaf, Plus, Trash2, UtensilsCrossed,
  TrendingUp, AlertTriangle, X,
} from 'lucide-react';

/* ── Categories ──────────────────────────────────────── */
const foodCategories = [
  { id: 'high_sugar', label: 'High Sugar', emoji: '🍬' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'gluten', label: 'Gluten', emoji: '🍞' },
  { id: 'processed', label: 'Processed', emoji: '🫙' },
  { id: 'fried', label: 'Fried', emoji: '🍟' },
  { id: 'fermented', label: 'Fermented', emoji: '🥒' },
  { id: 'high_fiber', label: 'High Fiber', emoji: '🥦' },
  { id: 'custom', label: 'Other', emoji: '🍽️' },
];

const symptomFields = [
  { key: 'bloating', label: 'Bloating' },
  { key: 'gas', label: 'Gas' },
  { key: 'reflux', label: 'Reflux' },
  { key: 'fatigue', label: 'Fatigue' },
] as const;

/* ── Severity dots ───────────────────────────────────── */
function MiniSeverity({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`h-8 w-8 rounded-md text-xs font-medium border transition-all ${
            i === value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary/40'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

/* ── Types ────────────────────────────────────────────── */
interface FoodEntry {
  food_name: string;
  food_category: string;
  bloating: number;
  gas: number;
  reflux: number;
  fatigue: number;
}

interface SavedEntry extends FoodEntry {
  id: string;
  logged_at: string;
}

const emptyEntry: FoodEntry = {
  food_name: '', food_category: '', bloating: 0, gas: 0, reflux: 0, fatigue: 0,
};

/* ── Main ─────────────────────────────────────────────── */
const FoodTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<FoodEntry>({ ...emptyEntry });
  const [todayLogs, setTodayLogs] = useState<SavedEntry[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    // today's logs
    const { data: todayData } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .order('logged_at', { ascending: false });

    if (todayData) setTodayLogs(todayData as unknown as SavedEntry[]);

    // all logs for correlations
    const { data: allData } = await supabase
      .from('food_logs')
      .select('food_category, bloating, gas, reflux, fatigue')
      .eq('user_id', user.id);

    if (allData) {
      setCorrelations(computeCorrelations(allData as unknown as FoodEntry[]));
    }
  };

  const handleSave = async () => {
    if (!user || !entry.food_category) return;
    setSaving(true);

    const { error } = await supabase.from('food_logs').insert({
      user_id: user.id,
      log_date: today,
      food_name: entry.food_name || getCategoryLabel(entry.food_category),
      food_category: entry.food_category,
      bloating: entry.bloating,
      gas: entry.gas,
      reflux: entry.reflux,
      fatigue: entry.fatigue,
    });

    setSaving(false);
    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Food logged!' });
      setEntry({ ...emptyEntry });
      setShowForm(false);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('food_logs').delete().eq('id', id);
    loadData();
  };

  const getCategoryLabel = (id: string) =>
    foodCategories.find((c) => c.id === id)?.label ?? id;
  const getCategoryEmoji = (id: string) =>
    foodCategories.find((c) => c.id === id)?.emoji ?? '🍽️';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">Food Tracker</span>
          </div>
          <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Quick add button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" /> Log Food
          </Button>
        )}

        {/* Entry form */}
        {showForm && (
          <Card className="border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Log a Food</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category grid */}
              <div>
                <Label className="text-sm mb-2 block">Category</Label>
                <div className="grid grid-cols-4 gap-2">
                  {foodCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEntry((p) => ({ ...p, food_category: c.id }))}
                      className={`flex flex-col items-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        entry.food_category === c.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      <span className="text-lg mb-0.5">{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food name */}
              <div className="space-y-1.5">
                <Label className="text-sm">Food name (optional)</Label>
                <Input
                  placeholder="e.g. Greek yogurt, Pizza..."
                  value={entry.food_name}
                  onChange={(e) => setEntry((p) => ({ ...p, food_name: e.target.value }))}
                />
              </div>

              {/* Symptoms after meal */}
              <div>
                <Label className="text-sm mb-2 block">Symptoms after eating (0 = none, 3 = severe)</Label>
                <div className="space-y-3">
                  {symptomFields.map((sf) => (
                    <div key={sf.key} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{sf.label}</span>
                      <MiniSeverity
                        value={entry[sf.key]}
                        onChange={(v) => setEntry((p) => ({ ...p, [sf.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={!entry.food_category || saving}
                className="w-full"
              >
                {saving ? 'Saving…' : 'Save Entry'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Today's log */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Today's Foods</CardTitle>
          </CardHeader>
          <CardContent>
            {todayLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No foods logged yet today.</p>
            ) : (
              <div className="space-y-2">
                {todayLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryEmoji(log.food_category)}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {log.food_name || getCategoryLabel(log.food_category)}
                        </p>
                        <div className="flex gap-1.5 mt-0.5">
                          {symptomFields.map((sf) => {
                            const val = log[sf.key];
                            if (val === 0) return null;
                            return (
                              <Badge key={sf.key} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {sf.label} {val}/3
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(log.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Correlations / Insights */}
        {correlations.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Food Trigger Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {correlations.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-3 rounded-lg border ${
                    c.direction === 'higher'
                      ? 'bg-destructive/5 border-destructive/20'
                      : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  {c.direction === 'higher' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  )}
                  <p className="text-sm text-foreground">{formatInsight(c)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FoodTracker;
