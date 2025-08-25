import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { XCircle, AlertTriangle, Heart } from 'lucide-react';

interface RejectOrganizationModalProps {
  organization: {
    id: string;
    name: string;
    contactEmail?: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function RejectOrganizationModal({ organization, open, onClose }: RejectOrganizationModalProps) {
  const [reason, setReason] = useState('');
  const [waitlist, setWaitlist] = useState(true); // Default to true per spec
  const [noteToApplicant, setNoteToApplicant] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rejectMutation = useMutation({
    mutationFn: async (data: { reason: string; waitlist: boolean; noteToApplicant?: string }) => {
      if (!organization) throw new Error('No organization selected');
      return apiRequest(`/api/admin/orgs/${organization.id}/reject`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      const message = waitlist 
        ? `${organization?.name} has been rejected and added to the waitlist.`
        : `${organization?.name} has been rejected.`;
        
      toast({
        title: 'Organization Rejected',
        description: message,
        variant: 'default',
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs?status=pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs?status=denied'] });
      
      onClose();
      // Reset form
      setReason('');
      setWaitlist(true);
      setNoteToApplicant('');
    },
    onError: (error: any) => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject organization',
        variant: 'destructive',
      });
    },
  });

  const handleReject = () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    rejectMutation.mutate({
      reason: reason.trim(),
      waitlist,
      noteToApplicant: noteToApplicant.trim() || undefined,
    });
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Organization Application
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900">{organization.name}</h3>
            {organization.contactEmail && (
              <p className="text-sm text-red-700 mt-1">{organization.contactEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-red-700">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a clear reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
              data-testid="textarea-rejection-reason"
            />
            <p className="text-xs text-gray-500">
              This reason will be recorded in the system for audit purposes.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="waitlist"
                checked={waitlist}
                onCheckedChange={(checked) => setWaitlist(checked as boolean)}
                data-testid="checkbox-add-to-waitlist"
              />
              <Label htmlFor="waitlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-purple-600" />
                Add to launch waitlist
              </Label>
            </div>
            
            {waitlist && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 ml-6">
                <p className="text-sm text-purple-800 mb-2">
                  This organization will be notified when KingdomOps launches publicly.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="noteToApplicant">
              Optional Note to Applicant
            </Label>
            <Textarea
              id="noteToApplicant"
              placeholder="Optional personal message to include in the rejection email..."
              value={noteToApplicant}
              onChange={(e) => setNoteToApplicant(e.target.value)}
              className="min-h-[60px]"
              data-testid="textarea-applicant-note"
            />
            <p className="text-xs text-gray-500">
              This note will be included in the email sent to the applicant.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">This action cannot be undone.</p>
                <p className="text-xs mt-1">
                  The organization will be notified of the rejection via email.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-rejection"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject}
            disabled={rejectMutation.isPending || !reason.trim()}
            variant="destructive"
            data-testid="button-confirm-rejection"
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}