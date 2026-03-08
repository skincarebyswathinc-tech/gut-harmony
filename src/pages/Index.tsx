import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight, Shield, Activity, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-xl font-display font-semibold text-foreground">Gut Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={() => navigate('/signup')}>Get Started</Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 md:py-32 max-w-4xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Activity className="h-4 w-4" />
          Science-backed gut health analysis
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
          Understand your gut,<br />transform your health
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Take a comprehensive assessment to uncover insights about your inflammation levels, 
          digestion quality, and microbiome diversity — all in under 5 minutes.
        </p>
        <Button size="lg" className="text-base px-8" onClick={() => navigate(user ? '/assessment' : '/signup')}>
          Start Your Assessment <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'Inflammation Score',
              desc: 'Identify hidden inflammation triggers affecting your energy and comfort.',
            },
            {
              icon: Activity,
              title: 'Digestion Analysis',
              desc: 'Evaluate your digestive efficiency and pinpoint areas for improvement.',
            },
            {
              icon: BarChart3,
              title: 'Microbiome Insights',
              desc: 'Assess your gut microbiome diversity based on diet and lifestyle factors.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent mb-4">
                <f.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 Gut Intelligence Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
