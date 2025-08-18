import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Plus, 
  Users, 
  Clock, 
  Mail, 
  Award, 
  Target,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { MinistryOpportunity, PlacementMatch } from "@shared/schema";

const GIFT_OPTIONS = [
  { value: "LEADERSHIP_ORG", label: "Leadership & Organization" },
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

const ABILITY_OPTIONS = [
  { value: "ARTS_LEAD_WORSHIP", label: "Worship Leading" },
  { value: "ARTS_MUSIC_OTHER", label: "Music" },
  { value: "ARTS_SOUND_TECH", label: "Sound Technology" },
  { value: "SKILL_CHILD_CARE", label: "Child Care" },
  { value: "SKILL_TEACHING", label: "Teaching" },
  { value: "SKILL_COUNSELING", label: "Counseling" },
  { value: "SKILL_EVENT_COORDINATION", label: "Event Coordination" },
  { value: "SKILL_FINANCIAL", label: "Financial Management" },
  { value: "SKILL_MARKETING_COMM", label: "Marketing & Communication" },
  { value: "SKILL_PROJECT_MANAGEMENT", label: "Project Management" },
  { value: "SKILL_TECH_COMPUTERS", label: "Technology & Computers" },
  { value: "SKILL_PEOPLE", label: "People Skills" }
];

export default function LeaderOpportunities() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MinistryOpportunity | null>(null);
  const [showMatches, setShowMatches] = useState<string | null>(null);

  // Fetch ministry opportunities for this organization
  const { data: opportunities, isLoading } = useQuery<MinistryOpportunity[]>({
    queryKey: ['/api/ministry-opportunities', organization?.id],
    enabled: !!organization?.id,
  });

  // Fetch potential matches for an opportunity
  const { data: matches } = useQuery<PlacementMatch[]>({
    queryKey: ['/api/ministry-opportunities', showMatches, 'matches'],
    enabled: !!showMatches,
  });

  // Create opportunity mutation
  const createOpportunityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/ministry-opportunities', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ministry-opportunities'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Ministry opportunity created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="mr-4"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <Target className="text-green-600 h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    Ministry Opportunities
                  </h1>
                  <p className="text-sm text-gray-600">Create and manage serving opportunities</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Award className="mr-1 h-3 w-3" />
                Church Leader
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display font-bold text-3xl text-charcoal">
                {organization?.name || "Your Church"} - Ministry Opportunities
              </h1>
              <p className="text-gray-600 mt-2">
                Create serving opportunities and find the perfect matches based on spiritual gifts
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <CreateOpportunityForm 
                  onSubmit={(data) => createOpportunityMutation.mutate(data)}
                  isLoading={createOpportunityMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {opportunities?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Positions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {opportunities?.filter(o => o.status === 'OPEN').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <UserPlus className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Placements</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Match Rate</p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Opportunities</h2>
            
            {opportunities && opportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map((opportunity) => (
                  <OpportunityCard 
                    key={opportunity.id}
                    opportunity={opportunity}
                    onViewMatches={(id) => setShowMatches(id)}
                    onEdit={(opp) => setSelectedOpportunity(opp)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first ministry opportunity to start connecting members with their calling.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Opportunity
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Matches Modal */}
          {showMatches && (
            <MatchesModal 
              opportunityId={showMatches}
              matches={matches || []}
              onClose={() => setShowMatches(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function CreateOpportunityForm({ onSubmit, isLoading }: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const { organization } = useOrganization();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredGifts: [] as string[],
    preferredGifts: [] as string[],
    requiredAbilities: [] as string[],
    preferredAbilities: [] as string[],
    capacity: 1,
    timeCommitment: "",
    contactPerson: "",
    contactEmail: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      organizationId: organization?.id,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create Ministry Opportunity</DialogTitle>
        <DialogDescription>
          Create a new serving opportunity that will be visible churchwide with smart member recommendations.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="title">Opportunity Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Children's Ministry Volunteer"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the role, responsibilities, and impact..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacity">Number of Positions</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <Label htmlFor="timeCommitment">Time Commitment</Label>
            <Input
              id="timeCommitment"
              value={formData.timeCommitment}
              onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
              placeholder="e.g., 2 hours/week"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Ministry leader name"
            />
          </div>
          
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="contact@church.org"
            />
          </div>
        </div>

        <div>
          <Label>Required Spiritual Gifts (Members must have these)</Label>
          <p className="text-sm text-gray-600 mb-2">Select gifts that are essential for this role</p>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {GIFT_OPTIONS.map((gift) => (
              <label key={gift.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.requiredGifts.includes(gift.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        requiredGifts: [...formData.requiredGifts, gift.value]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        requiredGifts: formData.requiredGifts.filter(g => g !== gift.value)
                      });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{gift.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferred Natural Abilities (Nice to have)</Label>
          <p className="text-sm text-gray-600 mb-2">Select abilities that would be helpful</p>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {ABILITY_OPTIONS.map((ability) => (
              <label key={ability.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.preferredAbilities.includes(ability.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        preferredAbilities: [...formData.preferredAbilities, ability.value]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        preferredAbilities: formData.preferredAbilities.filter(a => a !== ability.value)
                      });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{ability.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Opportunity"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function OpportunityCard({ 
  opportunity, 
  onViewMatches, 
  onEdit 
}: { 
  opportunity: MinistryOpportunity;
  onViewMatches: (id: string) => void;
  onEdit: (opportunity: MinistryOpportunity) => void;
}) {
  const statusColor: Record<string, string> = {
    OPEN: "bg-green-100 text-green-800",
    FILLED: "bg-blue-100 text-blue-800", 
    CLOSED: "bg-gray-100 text-gray-800"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
            <CardDescription className="mt-2">
              {opportunity.description}
            </CardDescription>
          </div>
          <Badge className={statusColor[opportunity.status] || statusColor.OPEN}>
            {opportunity.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {opportunity.currentCount || 0} / {opportunity.capacity} filled
          </div>
          
          {opportunity.timeCommitment && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {opportunity.timeCommitment}
            </div>
          )}
          
          {opportunity.contactEmail && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {opportunity.contactPerson || opportunity.contactEmail}
            </div>
          )}

          {opportunity.requiredGifts && opportunity.requiredGifts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Required Gifts:</p>
              <div className="flex flex-wrap gap-1">
                {opportunity.requiredGifts.slice(0, 3).map((gift) => (
                  <Badge key={gift} variant="outline" className="text-xs">
                    {GIFT_OPTIONS.find(g => g.value === gift)?.label || gift}
                  </Badge>
                ))}
                {opportunity.requiredGifts.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{opportunity.requiredGifts.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewMatches(opportunity.id)}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Matches
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(opportunity)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchesModal({ 
  opportunityId, 
  matches, 
  onClose 
}: { 
  opportunityId: string;
  matches: PlacementMatch[];
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Recommended Matches</DialogTitle>
          <DialogDescription>
            Members who match the spiritual gifts and abilities for this opportunity
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {matches && matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {match.user.firstName} {match.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{match.user.email}</p>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Match Score:</span>
                          <Badge className="bg-green-100 text-green-800">
                            {match.matchScore}%
                          </Badge>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-600">Reasons:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {match.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Invite
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No matches found for this opportunity.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}