import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-semibold text-foreground">Gut Intelligence</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground">Reset password</h1>
          <p className="text-muted-foreground mt-2">We'll send you a link to reset your password</p>
        </div>

        {sent ? (
          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <p className="text-foreground mb-4">Check your email for a password reset link.</p>
            <Link to="/login" className="text-primary hover:underline text-sm">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded-lg border border-border">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remember your password? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
