import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareReportDialogProps {
  assessmentId: string;
}

const ShareReportDialog = ({ assessmentId }: ShareReportDialogProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-report', {
        body: { practitionerEmail: email.trim(), assessmentId },
      });
      if (error) throw error;
      setSent(true);
      toast.success(`Report shared with ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to share report');
    } finally {
      setSending(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail('');
      setSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" /> Share with Expert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share Report with Practitioner</DialogTitle>
          <DialogDescription>
            Enter your practitioner's email address. They'll receive access to view your gut health report.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <p className="text-sm text-foreground font-medium">Report shared successfully!</p>
            <p className="text-xs text-muted-foreground">
              Your practitioner will be able to view your report once they log in.
            </p>
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="practitioner-email">Practitioner's Email</Label>
              <Input
                id="practitioner-email"
                type="email"
                placeholder="doctor@practice.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The practitioner will need a practitioner account to view your report.
              They can sign up at the practitioner registration page.
            </p>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sharing…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Share Report</>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareReportDialog;
