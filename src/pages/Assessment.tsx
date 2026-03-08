import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { assessmentQuestions, calculateScores } from '@/lib/assessment';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Leaf, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Assessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = assessmentQuestions[currentStep];
  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100;
  const categoryLabels: Record<string, string> = {
    inflammation: 'Inflammation',
    digestion: 'Digestion',
    microbiome: 'Microbiome',
    lifestyle: 'Lifestyle',
  };

  const handleSelect = (value: number) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (answers[question.id] === undefined) {
      toast.error('Please select an answer');
      return;
    }
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (answers[question.id] === undefined) {
      toast.error('Please select an answer');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    const scores = calculateScores(answers);

    const { error } = await supabase.from('assessments').insert({
      user_id: user.id,
      answers: answers as any,
      scores: scores as any,
      overall_score: scores.overall,
    });

    setSubmitting(false);
    if (error) {
      toast.error('Failed to save assessment');
    } else {
      toast.success('Assessment complete!');
      navigate('/dashboard');
    }
  };

  const isLast = currentStep === assessmentQuestions.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">Assessment</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} of {assessmentQuestions.length}
        </span>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6">
        <Progress value={progress} className="h-2 mb-8" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-xl animate-fade-in" key={currentStep}>
          <div className="inline-flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">
            {categoryLabels[question.category]}
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === opt.value
                    ? 'border-primary bg-accent'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <span className="text-foreground font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-10">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {isLast ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Complete Assessment'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
