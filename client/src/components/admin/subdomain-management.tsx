import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  Share2,
  Settings,
  Eye,
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SubdomainSelector } from "@/components/subdomain/subdomain-selector";
import type { Organization } from "@shared/schema";

interface SubdomainManagementProps {
  organization: Organization;
}

export function SubdomainManagement({ organization }: SubdomainManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newSubdomain, setNewSubdomain] = useState(organization.subdomain || '');

  // Update subdomain mutation
  const updateSubdomainMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const response = await apiRequest("PATCH", `/api/organizations/${organization.id}`, {
        subdomain
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subdomain updated successfully",
        description: "Your church's web address has been updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update subdomain",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (newSubdomain !== organization.subdomain) {
      updateSubdomainMutation.mutate(newSubdomain);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewSubdomain(organization.subdomain || '');
    setIsEditing(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const openSubdomainSite = () => {
    const url = `https://${organization.subdomain}.kingdomops.app`;
    window.open(url, '_blank');
  };

  const shareUrls = {
    direct: `https://${organization.subdomain}.kingdomops.app`,
    assessment: `https://${organization.subdomain}.kingdomops.app/assessment`,
    join: `https://${organization.subdomain}.kingdomops.app/join`
  };

  return (
    <div className="space-y-6">
      {/* Current Subdomain Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Church Web Address
          </CardTitle>
          <CardDescription>
            Your church's unique web address for easy sharing and professional branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="font-mono text-lg bg-gray-100 px-3 py-2 rounded-md">
                    {organization.subdomain}.kingdomops.app
                  </div>
                  <Badge variant="secondary" className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareUrls.direct)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openSubdomainSite}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit-subdomain"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <SubdomainSelector
                value={newSubdomain}
                onChange={setNewSubdomain}
                disabled={updateSubdomainMutation.isPending}
              />
              <div className="flex items-center justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={updateSubdomainMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateSubdomainMutation.isPending || !newSubdomain}
                  data-testid="button-save-subdomain"
                >
                  {updateSubdomainMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Share Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Quick Share Links
          </CardTitle>
          <CardDescription>
            Common links to share with your church members and community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Church Page */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Church Landing Page</p>
                <p className="text-xs text-gray-600 font-mono">{shareUrls.direct}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareUrls.direct)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(shareUrls.direct, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Assessment Link */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Direct Assessment Link</p>
                <p className="text-xs text-gray-600 font-mono">{shareUrls.assessment}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareUrls.assessment)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(shareUrls.assessment, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Join Link */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Member Registration</p>
                <p className="text-xs text-gray-600 font-mono">{shareUrls.join}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shareUrls.join)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(shareUrls.join, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Sharing Your Church's Web Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-spiritual-blue rounded-full mt-2"></div>
              <p>Include your web address on church bulletins, announcements, and websites</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-spiritual-blue rounded-full mt-2"></div>
              <p>Share the direct assessment link to encourage member participation</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-spiritual-blue rounded-full mt-2"></div>
              <p>Use the member registration link for new member onboarding</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-spiritual-blue rounded-full mt-2"></div>
              <p>Your subdomain creates a professional impression and is easy to remember</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}