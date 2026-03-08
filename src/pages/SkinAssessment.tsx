import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  skinSections,
  skinQuestions,
  getSkinQuestionsForSection,
  calculateSkinScores,
} from '@/lib/skin-assessment';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

const AUTO_SAVE_KEY = 'skin_assessment_draft';

const SkinAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Load saved draft
  useEffect(() => {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.sectionIdx !== undefined) setCurrentSectionIdx(parsed.sectionIdx);
        if (parsed.questionIdx !== undefined) setCurrentQuestionIdx(parsed.questionIdx);
      } catch { /* ignore */ }
    }
  }, []);

  // Auto-save
  const autoSave = useCallback(() => {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({
      answers, sectionIdx: currentSectionIdx, questionIdx: currentQuestionIdx,
    }));
  }, [answers, currentSectionIdx, currentQuestionIdx]);

  useEffect(() => { autoSave(); }, [autoSave]);

  const section = skinSections[currentSectionIdx];
  const sectionQuestions = getSkinQuestionsForSection(section.id);
  const question = sectionQuestions[currentQuestionIdx];

  const totalQuestions = skinQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const globalProgress = (answeredCount / totalQuestions) * 100;

  const handleSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const canGoNext = answers[question.id] !== undefined;
  const isLastInSection = currentQuestionIdx === sectionQuestions.length - 1;
  const isLastSection = currentSectionIdx === skinSections.length - 1;
  const isVeryLast = isLastSection && isLastInSection;
  const isFirstQuestion = currentSectionIdx === 0 && currentQuestionIdx === 0;

  const transition = (callback: () => void) => {
    setTransitioning(true);
    setTimeout(() => {
      callback();
      setTransitioning(false);
    }, 200);
  };

  const goNext = () => {
    if (!canGoNext) { toast.error('Please select an answer'); return; }
    transition(() => {
      if (isLastInSection && !isLastSection) {
        setCurrentSectionIdx(prev => prev + 1);
        setCurrentQuestionIdx(0);
      } else if (!isLastInSection) {
        setCurrentQuestionIdx(prev => prev + 1);
      }
    });
  };

  const goBack = () => {
    transition(() => {
      if (currentQuestionIdx > 0) {
        setCurrentQuestionIdx(prev => prev - 1);
      } else if (currentSectionIdx > 0) {
        const prevQs = getSkinQuestionsForSection(skinSections[currentSectionIdx - 1].id);
        setCurrentSectionIdx(prev => prev - 1);
        setCurrentQuestionIdx(prevQs.length - 1);
      }
    });
  };

  const handleSubmit = async () => {
    if (!canGoNext || !user) return;
    setSubmitting(true);
    const scores = calculateSkinScores(answers);

    const { error } = await supabase.from('skin_assessments').insert({
      user_id: user.id,
      answers: answers as any,
      scores: scores as any,
      overall_score: scores.overall,
    });

    setSubmitting(false);
    if (error) {
      toast.error('Failed to save assessment');
    } else {
      localStorage.removeItem(AUTO_SAVE_KEY);
      toast.success('Skin assessment complete!');
      navigate('/dashboard');
    }
  };

  // Flat index for display
  let flatIndex = 0;
  for (let s = 0; s < currentSectionIdx; s++) {
    flatIndex += getSkinQuestionsForSection(skinSections[s].id).length;
  }
  flatIndex += currentQuestionIdx;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">Skin Health Analyzer</span>
        </div>
        <span className="text-sm text-muted-foreground">{flatIndex + 1} of {totalQuestions}</span>
      </nav>

      {/* Progress */}
      <div className="max-w-3xl mx-auto w-full px-6 space-y-2">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(globalProgress)}%</span>
          </div>
          <Progress value={globalProgress} className="h-2" />
        </div>

        {/* Section pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 pt-1">
          {skinSections.map((s, idx) => {
            const sQs = getSkinQuestionsForSection(s.id);
            const sAnswered = sQs.filter(q => answers[q.id] !== undefined).length;
            const isComplete = sAnswered === sQs.length;
            const isCurrent = idx === currentSectionIdx;

            return (
              <button
                key={s.id}
                onClick={() => transition(() => { setCurrentSectionIdx(idx); setCurrentQuestionIdx(0); })}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isComplete
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isComplete && <Check className="h-3 w-3" />}
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20 pt-8">
        <div
          className={`w-full max-w-xl transition-all duration-200 ${
            transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
          key={`${section.id}-${currentQuestionIdx}`}
        >
          {currentQuestionIdx === 0 && (
            <div className="mb-6 pb-4 border-b border-border">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Section {currentSectionIdx + 1} of {skinSections.length}
              </span>
              <h2 className="text-xl font-display font-bold text-foreground mt-1">{section.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            </div>
          )}

          {currentQuestionIdx > 0 && (
            <div className="inline-flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">
              {section.title} — Q{currentQuestionIdx + 1}/{sectionQuestions.length}
            </div>
          )}

          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
            {question.question}
          </h3>

          {question.description && (
            <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
          )}

          <div className="space-y-2.5 mt-6">
            {question.options.map((opt, optIdx) => (
              <button
                key={`${opt.label}-${optIdx}`}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === opt.value
                    ? 'border-primary bg-accent'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <span className="text-foreground font-medium text-sm">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Nav */}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={goBack} disabled={isFirstQuestion}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {isVeryLast ? (
              <Button onClick={handleSubmit} disabled={submitting || !canGoNext}>
                {submitting ? 'Saving...' : 'Complete Assessment'}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={goNext} disabled={!canGoNext}>
                {isLastInSection ? 'Next Section' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAssessment;
