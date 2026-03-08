import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  Leaf, ArrowLeft, Check, ChevronRight, ChevronLeft,
  Flame, Droplets, Brain, Moon, Dumbbell, Smile,
} from 'lucide-react';

/* ── Steps ───────────────────────────────────────────── */
const steps = [
  { id: 'digestive', label: 'Digestive', icon: Flame },
  { id: 'stool', label: 'Stool', icon: Droplets },
  { id: 'lifestyle', label: 'Lifestyle', icon: Moon },
  { id: 'mood', label: 'Energy & Mood', icon: Smile },
];

/* ── Severity Picker (0-5 dots) ──────────────────────── */
function SeverityPicker({ value, onChange, labels }: {
  value: number; onChange: (v: number) => void;
  labels?: string[];
}) {
  const defaultLabels = ['None', '1', '2', '3', '4', '5'];
  const l = labels ?? defaultLabels;
  return (
    <div className="flex gap-1.5">
      {l.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`flex-1 h-10 rounded-lg text-xs font-medium transition-all border ${
            i === value
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary/40'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── Bristol Stool Picker ────────────────────────────── */
const bristolTypes = [
  { type: 1, desc: 'Hard lumps' },
  { type: 2, desc: 'Lumpy sausage' },
  { type: 3, desc: 'Cracked sausage' },
  { type: 4, desc: 'Smooth snake' },
  { type: 5, desc: 'Soft blobs' },
  { type: 6, desc: 'Mushy' },
  { type: 7, desc: 'Liquid' },
];

function BristolPicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {bristolTypes.map((b) => (
        <button
          key={b.type}
          type="button"
          onClick={() => onChange(b.type)}
          className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all border ${
            value === b.type
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary/40'
          }`}
        >
          <span className="font-bold text-sm">{b.type}</span>
          <span className="hidden sm:block leading-tight mt-0.5">{b.desc}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Number Stepper ──────────────────────────────────── */
function NumberStepper({ value, onChange, min, max, step = 1, unit }: {
  value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="h-10 w-10 rounded-lg border border-border bg-card text-foreground flex items-center justify-center font-bold hover:bg-accent"
      >−</button>
      <span className="text-lg font-semibold text-foreground min-w-[3rem] text-center">
        {value}{unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="h-10 w-10 rounded-lg border border-border bg-card text-foreground flex items-center justify-center font-bold hover:bg-accent"
      >+</button>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────── */
interface LogData {
  bloating: number;
  gas: number;
  acid_reflux: number;
  abdominal_discomfort: number;
  stool_type: number | null;
  stool_frequency: number;
  incomplete_evacuation: boolean;
  mucus_present: boolean;
  sleep_hours: number;
  stress_level: number;
  water_intake: number;
  exercise_minutes: number;
  energy_level: number;
  mood: number;
}

const defaultLog: LogData = {
  bloating: 0, gas: 0, acid_reflux: 0, abdominal_discomfort: 0,
  stool_type: null, stool_frequency: 1, incomplete_evacuation: false, mucus_present: false,
  sleep_hours: 7, stress_level: 0, water_intake: 8, exercise_minutes: 0,
  energy_level: 3, mood: 3,
};

const DailyGutLog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<LogData>({ ...defaultLog });
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Load today's log if exists
  useEffect(() => {
    if (!user) return;
    supabase
      .from('daily_gut_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id);
          setLog({
            bloating: data.bloating, gas: data.gas, acid_reflux: data.acid_reflux,
            abdominal_discomfort: data.abdominal_discomfort, stool_type: data.stool_type,
            stool_frequency: data.stool_frequency ?? 1, incomplete_evacuation: data.incomplete_evacuation ?? false,
            mucus_present: data.mucus_present ?? false, sleep_hours: Number(data.sleep_hours ?? 7),
            stress_level: data.stress_level, water_intake: data.water_intake ?? 8,
            exercise_minutes: data.exercise_minutes ?? 0, energy_level: data.energy_level, mood: data.mood,
          });
        }
      });
  }, [user, today]);

  const set = <K extends keyof LogData>(key: K, val: LogData[K]) =>
    setLog((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...log, user_id: user.id, log_date: today };

    let error;
    if (existingId) {
      ({ error } = await supabase.from('daily_gut_logs').update(payload).eq('id', existingId));
    } else {
      ({ error } = await supabase.from('daily_gut_logs').insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Error saving log', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Log saved!', description: 'Your daily gut log has been recorded.' });
      navigate('/dashboard');
    }
  };

  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground">Daily Gut Log</span>
          </div>
          <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-1.5 mb-1">
          {steps.map((s, i) => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`} />
          ))}
        </div>
        <div className="flex justify-between mb-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  i === step ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pb-28">
        {step === 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" /> Digestive Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {([
                ['bloating', 'Bloating'],
                ['gas', 'Gas'],
                ['acid_reflux', 'Acid Reflux'],
                ['abdominal_discomfort', 'Abdominal Discomfort'],
              ] as [keyof LogData, string][]).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm">{label}</Label>
                  <SeverityPicker
                    value={log[key] as number}
                    onChange={(v) => set(key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" /> Stool Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Bristol Stool Type</Label>
                <BristolPicker value={log.stool_type} onChange={(v) => set('stool_type', v)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Frequency (times today)</Label>
                <NumberStepper value={log.stool_frequency} onChange={(v) => set('stool_frequency', v)} min={0} max={10} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Incomplete evacuation feeling</Label>
                <Switch checked={log.incomplete_evacuation} onCheckedChange={(v) => set('incomplete_evacuation', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Mucus present</Label>
                <Switch checked={log.mucus_present} onCheckedChange={(v) => set('mucus_present', v)} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" /> Lifestyle Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Sleep (hours)</Label>
                <NumberStepper value={log.sleep_hours} onChange={(v) => set('sleep_hours', v)} min={0} max={14} step={0.5} unit="h" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Stress Level</Label>
                <SeverityPicker value={log.stress_level} onChange={(v) => set('stress_level', v)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Water Intake (glasses)</Label>
                <NumberStepper value={log.water_intake} onChange={(v) => set('water_intake', v)} min={0} max={20} unit="gl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Exercise (minutes)</Label>
                <NumberStepper value={log.exercise_minutes} onChange={(v) => set('exercise_minutes', v)} min={0} max={180} step={5} unit="min" />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Smile className="h-5 w-5 text-primary" /> Energy & Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm">Energy Level</Label>
                <SeverityPicker
                  value={log.energy_level}
                  onChange={(v) => set('energy_level', v)}
                  labels={['😴', '1', '2', '3', '4', '⚡']}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Mood</Label>
                <SeverityPicker
                  value={log.mood}
                  onChange={(v) => set('mood', v)}
                  labels={['😞', '1', '2', '3', '4', '😊']}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {isLastStep ? (
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Check className="h-4 w-4 mr-1" /> {saving ? 'Saving…' : 'Save Log'}
            </Button>
          ) : (
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyGutLog;
