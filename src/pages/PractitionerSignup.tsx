import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const PractitionerSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!practiceName.trim()) {
      toast.error('Practice name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;

      // Store practitioner details to be completed after email verification
      localStorage.setItem('pending_practitioner', JSON.stringify({
        practiceName,
        specialization,
        licenseNumber,
      }));

      toast.success('Check your email to confirm your account. Once verified, log in to access your practitioner dashboard.');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-display font-bold text-foreground">Practitioner Signup</h1>
          </div>
          <p className="text-muted-foreground mt-2">Register as a health professional to review client reports</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@practice.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice Name</Label>
            <Input id="practiceName" value={practiceName} onChange={(e) => setPracticeName(e.target.value)} placeholder="e.g., Gut Health Clinic" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Gastroenterology, Naturopathy" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License / Credential Number</Label>
            <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Practitioner Account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Not a practitioner? <Link to="/signup" className="text-primary hover:underline">Sign up as a user</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PractitionerSignup;
