import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ApproveOrganizationModalProps {
  organization: {
    id: string;
    name: string;
    contactEmail?: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function ApproveOrganizationModal({ organization, open, onClose }: ApproveOrganizationModalProps) {
  const [makeOwnerUserId, setMakeOwnerUserId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (data: { makeOwnerUserId?: string }) => {
      if (!organization) throw new Error('No organization selected');
      return apiRequest(`/api/admin/orgs/${organization.id}/approve`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      toast({
        title: 'Organization Approved',
        description: `${organization?.name} has been approved successfully.`,
        variant: 'default',
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs?status=pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs?status=approved'] });
      
      onClose();
      setMakeOwnerUserId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve organization',
        variant: 'destructive',
      });
    },
  });

  const handleApprove = () => {
    approveMutation.mutate({
      makeOwnerUserId: makeOwnerUserId.trim() || undefined,
    });
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Approve Organization
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900">{organization.name}</h3>
            {organization.contactEmail && (
              <p className="text-sm text-green-700 mt-1">{organization.contactEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="makeOwnerUserId">
              Make Organization Owner (Optional)
            </Label>
            <Input
              id="makeOwnerUserId"
              placeholder="User ID to make organization owner"
              value={makeOwnerUserId}
              onChange={(e) => setMakeOwnerUserId(e.target.value)}
              data-testid="input-make-owner-user-id"
            />
            <p className="text-xs text-gray-500">
              If provided, this user will be granted organization owner privileges.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Next Steps After Approval:</p>
                <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                  <li>Organization status will change to "Approved"</li>
                  <li>Approval email will be sent to the contact</li>
                  <li>They can proceed with onboarding setup</li>
                  <li>Organization becomes "Active" after first login</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-approval"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-confirm-approval"
          >
            {approveMutation.isPending ? 'Approving...' : 'Approve Organization'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}