import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { CheckCircle2, XCircle, Clock, MapPin, Mail, Phone, Globe, FileText, Building, User, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  pastorName: string;
  pastorEmail: string;
  pastorPhone: string;
  churchName: string;
  churchWebsite: string | null;
  churchAddress: string;
  churchSize: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  answers: Record<string, string>;
  attachments: Record<string, string>;
  reviewedById: string | null;
  reviewedAt: Date | null;
  decisionNotes: string | null;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function ApplicationReview() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [, setLocation] = useLocation();
  const [decisionNotes, setDecisionNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery<Application>({
    queryKey: ['/api/applications', applicationId],
    enabled: !!applicationId,
  });

  const approveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/applications/${applicationId}/approve`, "POST", { decisionNotes }),
    onSuccess: () => {
      toast({ title: "Application approved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setLocation('/admin');
    },
    onError: () => {
      toast({ title: "Failed to approve application", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => apiRequest(`/api/applications/${applicationId}/reject`, "POST", { decisionNotes }),
    onSuccess: () => {
      toast({ title: "Application rejected" });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setLocation('/admin');
    },
    onError: () => {
      toast({ title: "Failed to reject application", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-6">The application you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/admin')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const statusBadgeVariant = {
    PENDING: "default",
    UNDER_REVIEW: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  } as const;

  const statusIcon = {
    PENDING: Clock,
    UNDER_REVIEW: Clock,
    APPROVED: CheckCircle2,
    REJECTED: XCircle,
  };

  const StatusIcon = statusIcon[application.status];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <Badge variant={statusBadgeVariant[application.status]} className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            {application.status.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-gray-600">
          Review the application details below and decide whether to approve or reject this church's request to join KingdomOps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pastor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-spiritual-blue" />
              Pastor Information
            </CardTitle>
            <CardDescription>Contact details for the church pastor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{application.pastorName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-gray-900">{application.pastorEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              <p className="text-gray-900">{application.pastorPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Church Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-spiritual-blue" />
              Church Information
            </CardTitle>
            <CardDescription>Details about the church organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Church Name</label>
              <p className="text-gray-900 font-semibold">{application.churchName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <p className="text-gray-900">{application.churchAddress}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Church Size</label>
              <p className="text-gray-900">{application.churchSize}</p>
            </div>
            {application.churchWebsite && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Website
                </label>
                <a 
                  href={application.churchWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-spiritual-blue hover:underline"
                >
                  {application.churchWebsite}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Questions */}
        {Object.keys(application.answers).length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-spiritual-blue" />
                Application Responses
              </CardTitle>
              <CardDescription>Responses to application questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(application.answers).map(([question, answer]) => (
                  <div key={question} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <label className="text-sm font-medium text-gray-700 block mb-2">{question}</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-spiritual-blue" />
              Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Submitted</label>
                <p className="text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
              {application.reviewedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Reviewed</label>
                  <p className="text-gray-900">{new Date(application.reviewedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            {application.decisionNotes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Previous Decision Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md mt-1">{application.decisionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decision Section */}
        {application.status === 'PENDING' || application.status === 'UNDER_REVIEW' ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-spiritual-blue" />
                Review Decision
              </CardTitle>
              <CardDescription>Add notes and approve or reject this application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Decision Notes (Optional)
                  </label>
                  <Textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Add any notes about your decision..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate()}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This application has already been {application.status.toLowerCase()}.
                {application.decisionNotes && (
                  <span className="block mt-2 font-medium">Decision Notes: {application.decisionNotes}</span>
                )}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => setLocation('/admin')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}