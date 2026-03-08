import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getScoreLabel, getScoreColor } from '@/lib/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Leaf, Stethoscope, LogOut, User, Loader2, FileText,
  Send, MessageSquare, Clock, Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface SharedReport {
  id: string;
  patient_user_id: string;
  practitioner_email: string;
  status: string;
  shared_at: string;
  viewed_at: string | null;
  assessment: {
    id: string;
    overall_score: number;
    scores: Record<string, number>;
    answers: Record<string, number>;
    completed_at: string;
  } | null;
  patientEmail: string;
  notes: { id: string; note: string; created_at: string }[];
}

const PractitionerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SharedReport | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('practitioner-api?action=list');
      if (error) throw error;
      setReports(data.reports || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedReport || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const { data, error } = await supabase.functions.invoke('practitioner-api?action=add-note', {
        body: { sharedReportId: selectedReport.id, note: newNote.trim() },
      });
      if (error) throw error;
      toast.success('Note added');
      setNewNote('');
      // Refresh
      await fetchReports();
      // Update selected report
      setSelectedReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [{ id: data.note.id, note: newNote.trim(), created_at: new Date().toISOString() }, ...prev.notes],
        };
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const biomarkerLabels: Record<string, string> = {
    gut_integrity: 'Gut Integrity',
    microbiome_diversity: 'Microbiome Diversity',
    digestive_efficiency: 'Digestive Efficiency',
    inflammation_load: 'Inflammation Load',
    food_sensitivity_risk: 'Food Sensitivity',
    gut_brain_balance: 'Gut-Brain Balance',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-border">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <Stethoscope className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-display font-semibold text-foreground">Practitioner Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Loading client reports…</p>
          </div>
        ) : selectedReport ? (
          /* ── Detail View ── */
          <div className="space-y-6">
            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
              ← Back to Client List
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Overview */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Client Report — {selectedReport.patientEmail}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedReport.assessment ? (
                      <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="text-center">
                          <div className="text-5xl font-bold text-foreground">
                            {selectedReport.assessment.overall_score}
                          </div>
                          <span className={`text-sm font-semibold ${getScoreColor(selectedReport.assessment.overall_score ?? 0)}`}>
                            {getScoreLabel(selectedReport.assessment.overall_score ?? 0)}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assessed {new Date(selectedReport.assessment.completed_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Biomarker Scores */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-foreground">Biomarker Scores</h3>
                          {Object.entries(biomarkerLabels).map(([key, label]) => {
                            const score = (selectedReport.assessment?.scores as any)?.[key] ?? 0;
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-foreground">{label}</span>
                                  <span className={`font-semibold ${getScoreColor(score)}`}>{score}/100</span>
                                </div>
                                <Progress value={score} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Assessment data unavailable.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Notes Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Consultation Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a note about this client…"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        maxLength={5000}
                      />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={handleAddNote}
                        disabled={addingNote || !newNote.trim()}
                      >
                        {addingNote ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                        Add Note
                      </Button>
                    </div>

                    {selectedReport.notes.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedReport.notes.map((n) => (
                          <div key={n.id} className="p-3 rounded-lg border border-border bg-accent/30">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{n.note}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No notes yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* ── List View ── */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Client Reports</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review gut health reports shared by your clients
              </p>
            </div>

            {reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reports shared with you yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your clients can share their reports from the Gut Health Report page.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reports.map((r) => (
                  <Card
                    key={r.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setSelectedReport(r)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                            <User className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.patientEmail}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Shared {new Date(r.shared_at).toLocaleDateString()}
                              </span>
                              {r.notes.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {r.notes.length} note{r.notes.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {r.assessment && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground">{r.assessment.overall_score}</div>
                              <span className={`text-xs font-medium ${getScoreColor(r.assessment.overall_score ?? 0)}`}>
                                {getScoreLabel(r.assessment.overall_score ?? 0)}
                              </span>
                            </div>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            r.status === 'viewed'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {r.status === 'viewed' ? (
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Viewed</span>
                            ) : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PractitionerDashboard;
