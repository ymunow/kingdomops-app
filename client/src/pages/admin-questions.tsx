import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Users, 
  ArrowLeft,
  Shield,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  PlayCircle,
  Settings,
  Eye,
  Search
} from "lucide-react";
import { AdminNavigationBar } from "@/components/admin/admin-navigation-bar";
import { apiRequest } from "@/lib/queryClient";

interface AssessmentVersion {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
}

interface Question {
  id: string;
  versionId: string;
  text: string;
  giftKey: string;
  orderIndex: number;
  isActive: boolean;
}

const GIFT_KEYS = [
  { value: "LEADERSHIP_ORG", label: "Leadership" },
  { value: "TEACHING", label: "Teaching" },
  { value: "WISDOM_INSIGHT", label: "Wisdom & Insight" },
  { value: "PROPHETIC_DISCERNMENT", label: "Prophetic Discernment" },
  { value: "EXHORTATION", label: "Exhortation" },
  { value: "SHEPHERDING", label: "Shepherding" },
  { value: "FAITH", label: "Faith" },
  { value: "EVANGELISM", label: "Evangelism" },
  { value: "APOSTLESHIP", label: "Apostleship" },
  { value: "SERVICE_HOSPITALITY", label: "Service & Hospitality" },
  { value: "MERCY", label: "Mercy" },
  { value: "GIVING", label: "Giving" }
];

export default function AdminQuestions() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateVersionDialogOpen, setIsCreateVersionDialogOpen] = useState(false);
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [newVersionTitle, setNewVersionTitle] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionGiftKey, setNewQuestionGiftKey] = useState("");

  const { data: versions, isLoading: versionsLoading } = useQuery<AssessmentVersion[]>({
    queryKey: ['/api/super-admin/assessment-versions'],
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ['/api/super-admin/questions'],
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: versionQuestions } = useQuery<Question[]>({
    queryKey: ['/api/super-admin/questions', selectedVersionId],
    enabled: !!selectedVersionId && user?.role === 'SUPER_ADMIN',
  });

  const createVersionMutation = useMutation({
    mutationFn: async (data: { title: string; isActive?: boolean }) => {
      return apiRequest('POST', '/api/super-admin/assessment-versions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/assessment-versions'] });
      toast({ title: "Success", description: "Assessment version created successfully" });
      setIsCreateVersionDialogOpen(false);
      setNewVersionTitle("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment version",
        variant: "destructive",
      });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: { versionId: string; text: string; giftKey: string; orderIndex: number }) => {
      return apiRequest('POST', '/api/super-admin/questions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/questions'] });
      toast({ title: "Success", description: "Question created successfully" });
      setIsCreateQuestionDialogOpen(false);
      setNewQuestionText("");
      setNewQuestionGiftKey("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Question> }) => {
      return apiRequest('PUT', `/api/super-admin/questions/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/questions'] });
      toast({ title: "Success", description: "Question updated successfully" });
      setEditingQuestion(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    },
  });

  const deactivateQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/super-admin/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/questions'] });
      toast({ title: "Success", description: "Question deactivated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate question",
        variant: "destructive",
      });
    },
  });

  const activateVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return apiRequest('POST', `/api/super-admin/assessment-versions/${versionId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/assessment-versions'] });
      toast({ title: "Success", description: "Assessment version activated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate assessment version",
        variant: "destructive",
      });
    },
  });

  if (isLoading || versionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading question bank...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-600">Super Admin access required</p>
          <Button onClick={() => setLocation('/')} className="mt-4">Return Home</Button>
        </div>
      </div>
    );
  }

  const activeVersion = versions?.find(v => v.isActive);
  const filteredQuestions = questions?.filter(q => 
    q.isActive && 
    (q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
     GIFT_KEYS.find(g => g.value === q.giftKey)?.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getNextOrderIndex = (versionId: string) => {
    const versionQs = questions?.filter(q => q.versionId === versionId) || [];
    return Math.max(0, ...versionQs.map(q => q.orderIndex)) + 1;
  };

  const handleCreateQuestion = () => {
    if (!newQuestionText || !newQuestionGiftKey || !selectedVersionId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate({
      versionId: selectedVersionId,
      text: newQuestionText,
      giftKey: newQuestionGiftKey,
      orderIndex: getNextOrderIndex(selectedVersionId),
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    updateQuestionMutation.mutate({
      id: editingQuestion.id,
      updates: {
        text: editingQuestion.text,
        giftKey: editingQuestion.giftKey,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        <AdminNavigationBar className="mb-6" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-spiritual-blue mb-2">Question Bank Management</h1>
            <p className="text-gray-600">Manage assessment questions and versions</p>
          </div>
          <Button
            onClick={() => setLocation('/admin-platform')}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Platform
          </Button>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border">
            <TabsTrigger value="questions" className="data-[state=active]:bg-spiritual-blue data-[state=active]:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="versions" className="data-[state=active]:bg-spiritual-blue data-[state=active]:text-white">
              <Settings className="mr-2 h-4 w-4" />
              Versions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {/* Question Management Controls */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-spiritual-blue">Question Management</CardTitle>
                <CardDescription>
                  Create and manage assessment questions across all versions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Questions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by question text or gift..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-questions"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isCreateQuestionDialogOpen} onOpenChange={setIsCreateQuestionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-spiritual-blue hover:bg-spiritual-blue/90 text-white"
                          data-testid="button-create-question"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Question</DialogTitle>
                          <DialogDescription>
                            Add a new question to the assessment question bank
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="version-select">Assessment Version</Label>
                            <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a version" />
                              </SelectTrigger>
                              <SelectContent>
                                {versions?.map((version) => (
                                  <SelectItem key={version.id} value={version.id}>
                                    {version.title} {version.isActive && "(Active)"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="question-text">Question Text</Label>
                            <Textarea
                              id="question-text"
                              placeholder="Enter the question text..."
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              rows={3}
                              data-testid="textarea-question-text"
                            />
                          </div>
                          <div>
                            <Label htmlFor="gift-key">Spiritual Gift</Label>
                            <Select value={newQuestionGiftKey} onValueChange={setNewQuestionGiftKey}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a spiritual gift" />
                              </SelectTrigger>
                              <SelectContent>
                                {GIFT_KEYS.map((gift) => (
                                  <SelectItem key={gift.value} value={gift.value}>
                                    {gift.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleCreateQuestion}
                            disabled={createQuestionMutation.isPending}
                            className="bg-spiritual-blue hover:bg-spiritual-blue/90"
                            data-testid="button-create-question-submit"
                          >
                            {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-spiritual-blue">Questions</CardTitle>
                <CardDescription>
                  {filteredQuestions?.length || 0} questions found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions?.map((question) => {
                      const version = versions?.find(v => v.id === question.versionId);
                      const gift = GIFT_KEYS.find(g => g.value === question.giftKey);
                      
                      return (
                        <div
                          key={question.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          data-testid={`question-card-${question.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2">{question.text}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline">{gift?.label}</Badge>
                                <span>•</span>
                                <span>{version?.title}</span>
                                <span>•</span>
                                <span>Order: {question.orderIndex}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingQuestion(question)}
                                data-testid={`button-edit-question-${question.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deactivateQuestionMutation.mutate(question.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-question-${question.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {filteredQuestions?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No questions found matching your search.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            {/* Version Management Controls */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-spiritual-blue">Assessment Versions</CardTitle>
                <CardDescription>
                  Manage assessment versions and set the active version for participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-600">
                      Active Version: <strong>{activeVersion?.title || "None"}</strong>
                    </p>
                  </div>
                  <Dialog open={isCreateVersionDialogOpen} onOpenChange={setIsCreateVersionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-spiritual-blue hover:bg-spiritual-blue/90 text-white"
                        data-testid="button-create-version"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Version
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Assessment Version</DialogTitle>
                        <DialogDescription>
                          Create a new version of the assessment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="version-title">Version Title</Label>
                          <Input
                            id="version-title"
                            placeholder="e.g., K.I.T. Gifts & Ministry Fit v2"
                            value={newVersionTitle}
                            onChange={(e) => setNewVersionTitle(e.target.value)}
                            data-testid="input-version-title"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => createVersionMutation.mutate({ title: newVersionTitle })}
                          disabled={createVersionMutation.isPending || !newVersionTitle}
                          className="bg-spiritual-blue hover:bg-spiritual-blue/90"
                          data-testid="button-create-version-submit"
                        >
                          {createVersionMutation.isPending ? "Creating..." : "Create Version"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {versions?.map((version) => {
                    const questionCount = questions?.filter(q => q.versionId === version.id && q.isActive).length || 0;
                    
                    return (
                      <div
                        key={version.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        data-testid={`version-card-${version.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{version.title}</h3>
                              {version.isActive && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{questionCount} questions</span>
                              <span>•</span>
                              <span>Created {new Date(version.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVersionId(version.id)}
                              data-testid={`button-view-questions-${version.id}`}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View Questions
                            </Button>
                            {!version.isActive && (
                              <Button
                                onClick={() => activateVersionMutation.mutate(version.id)}
                                disabled={activateVersionMutation.isPending}
                                size="sm"
                                className="bg-spiritual-blue hover:bg-spiritual-blue/90 text-white"
                                data-testid={`button-activate-version-${version.id}`}
                              >
                                <PlayCircle className="mr-1 h-4 w-4" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Update the question text and spiritual gift assignment
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-question-text">Question Text</Label>
                  <Textarea
                    id="edit-question-text"
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                    rows={3}
                    data-testid="textarea-edit-question-text"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gift-key">Spiritual Gift</Label>
                  <Select
                    value={editingQuestion.giftKey}
                    onValueChange={(value) => setEditingQuestion({ ...editingQuestion, giftKey: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GIFT_KEYS.map((gift) => (
                        <SelectItem key={gift.value} value={gift.value}>
                          {gift.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleUpdateQuestion}
                disabled={updateQuestionMutation.isPending}
                className="bg-spiritual-blue hover:bg-spiritual-blue/90"
                data-testid="button-update-question-submit"
              >
                {updateQuestionMutation.isPending ? "Updating..." : "Update Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}