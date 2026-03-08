import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            age: data.age?.toString() || '',
            gender: data.gender || '',
            height_cm: data.height_cm?.toString() || '',
            weight_kg: data.weight_kg?.toString() || '',
            activity_level: data.activity_level || '',
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
        weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
        activity_level: profile.activity_level || null,
      })
      .eq('user_id', user.id);

    setLoading(false);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-lg font-display font-semibold text-foreground">Your Profile</span>
        </div>

        <div className="space-y-5 bg-card p-8 rounded-lg border border-border">
          <div className="space-y-2">
            <Label>Age</Label>
            <Input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} placeholder="e.g. 30" />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={profile.gender} onValueChange={(v) => setProfile({ ...profile, gender: v })}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={profile.height_cm} onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })} placeholder="170" />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={profile.weight_kg} onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })} placeholder="70" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select value={profile.activity_level} onValueChange={(v) => setProfile({ ...profile, activity_level: v })}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="lightly_active">Lightly Active</SelectItem>
                <SelectItem value="moderately_active">Moderately Active</SelectItem>
                <SelectItem value="very_active">Very Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
