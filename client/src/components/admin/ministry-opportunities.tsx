import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/use-organization";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Edit,
  Users,
  Target,
  Calendar,
  MapPin,
  UserPlus,
  CheckCircle
} from "lucide-react";

interface MinistryOpportunity {
  id: string;
  title: string;
  description: string;
  department: string;
  requiredGifts: string[];
  preferredGifts: string[];
  timeCommitment: string;
  location: string;
  capacity: number;
  currentCount: number;
  leadContact: string;
  status: string;
  createdAt: string;
}

interface PlacementCandidate {
  id: string;
  userId: string;
  opportunityId: string;
  status: string;
  invitedAt: string;
  respondedAt?: string;
  placedAt?: string;
  notes?: string;
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  topGifts: string[];
}

const GIFT_OPTIONS = [
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

const DEPARTMENTS = [
  "Worship & Music",
  "Children's Ministry",
  "Youth Ministry",
  "Small Groups",
  "Outreach & Missions",
  "Care & Compassion",
  "Administration",
  "Facilities & Operations",
  "Teaching & Discipleship",
  "Prayer Ministry",
  "Creative Arts",
  "Other"
];

interface OpportunityFormProps {
  opportunity?: MinistryOpportunity;
  onClose: () => void;
  onSuccess: () => void;
}

function OpportunityForm({ opportunity, onClose, onSuccess }: OpportunityFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: opportunity?.title || "",
    description: opportunity?.description || "",
    department: opportunity?.department || "",
    requiredGifts: opportunity?.requiredGifts || [],
    preferredGifts: opportunity?.preferredGifts || [],
    timeCommitment: opportunity?.timeCommitment || "",
    location: opportunity?.location || "",
    capacity: opportunity?.capacity || 1,
    leadContact: opportunity?.leadContact || "",
    status: opportunity?.status || "OPEN"
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = opportunity 
        ? `/api/admin/ministry-opportunities/${opportunity.id}`
        : "/api/admin/ministry-opportunities";
      const method = opportunity ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to save opportunity");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: opportunity ? "Opportunity updated" : "Opportunity created",
        description: "Ministry opportunity has been saved successfully"
      });
      onSuccess();
      onClose();
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to save opportunity. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleGiftToggle = (giftKey: string, type: 'required' | 'preferred') => {
    const field = type === 'required' ? 'requiredGifts' : 'preferredGifts';
    const currentGifts = formData[field];
    
    if (currentGifts.includes(giftKey)) {
      setFormData({
        ...formData,
        [field]: currentGifts.filter(g => g !== giftKey)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentGifts, giftKey]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Opportunity Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div>
          <Label htmlFor="timeCommitment">Time Commitment</Label>
          <Input
            id="timeCommitment"
            placeholder="e.g., 2 hours/week"
            value={formData.timeCommitment}
            onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Main Campus, Room 101"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="leadContact">Lead Contact</Label>
          <Input
            id="leadContact"
            placeholder="Contact person for this opportunity"
            value={formData.leadContact}
            onChange={(e) => setFormData({ ...formData, leadContact: e.target.value })}
          />
        </div>
      </div>

      {/* Required Gifts */}
      <div>
        <Label>Required Spiritual Gifts</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {GIFT_OPTIONS.map((gift) => (
            <div key={gift.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`required-${gift.value}`}
                checked={formData.requiredGifts.includes(gift.value)}
                onChange={() => handleGiftToggle(gift.value, 'required')}
                className="rounded"
              />
              <Label htmlFor={`required-${gift.value}`} className="text-sm">
                {gift.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Gifts */}
      <div>
        <Label>Preferred Spiritual Gifts (Nice to Have)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {GIFT_OPTIONS.map((gift) => (
            <div key={gift.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`preferred-${gift.value}`}
                checked={formData.preferredGifts.includes(gift.value)}
                onChange={() => handleGiftToggle(gift.value, 'preferred')}
                className="rounded"
              />
              <Label htmlFor={`preferred-${gift.value}`} className="text-sm">
                {gift.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="status"
          checked={formData.status === "OPEN"}
          onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "OPEN" : "CLOSED" })}
          className="rounded"
        />
        <Label htmlFor="status">Active (accepting new volunteers)</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Saving..." : opportunity ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function MinistryOpportunities() {
  const { toast } = useToast();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<MinistryOpportunity | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["/api/admin/ministry-opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/admin/ministry-opportunities");
      if (!response.ok) throw new Error("Failed to fetch opportunities");
      return response.json();
    }
  });

  const { data: candidates } = useQuery({
    queryKey: ["/api/admin/placement-candidates", selectedOpportunity],
    queryFn: async () => {
      if (!selectedOpportunity) return [];
      const response = await fetch(`/api/admin/placement-candidates?opportunityId=${selectedOpportunity}`);
      if (!response.ok) throw new Error("Failed to fetch candidates");
      return response.json();
    },
    enabled: !!selectedOpportunity
  });

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/ministry-opportunities"] });
  };

  const handleEdit = (opportunity: MinistryOpportunity) => {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOpportunity(null);
  };

  const giftName = (key: string) => {
    return GIFT_OPTIONS.find(g => g.value === key)?.label || key;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spiritual-blue mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading ministry opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {organization?.name ? `${organization.name} Ministry Opportunities` : "Ministry Opportunities"}
          </h3>
          <p className="text-sm text-gray-600">
            {organization?.name ? `Manage volunteer opportunities and track placements for ${organization.name}` : "Manage volunteer opportunities and track placements"}
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-spiritual-blue text-white hover:bg-purple-800">
              <Plus className="h-4 w-4 mr-2" />
              New Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOpportunity ? "Edit" : "Create"} Ministry Opportunity
              </DialogTitle>
            </DialogHeader>
            <OpportunityForm
              opportunity={editingOpportunity || undefined}
              onClose={handleCloseForm}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities?.map((opportunity: MinistryOpportunity) => (
          <Card key={opportunity.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{opportunity.department}</p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(opportunity)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 line-clamp-2">{opportunity.description}</p>
              
              {/* Status and Capacity */}
              <div className="flex items-center justify-between">
                <Badge variant={opportunity.status === "OPEN" ? "default" : "secondary"}>
                  {opportunity.status === "OPEN" ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-3 w-3 mr-1" />
                  {opportunity.currentCount || 0}/{opportunity.capacity}
                </div>
              </div>

              {/* Required Gifts */}
              {opportunity.requiredGifts?.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500">Required Gifts</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {opportunity.requiredGifts.slice(0, 3).map((gift) => (
                      <Badge key={gift} variant="outline" className="text-xs">
                        {giftName(gift)}
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

              {/* Details */}
              <div className="space-y-2 text-xs text-gray-600">
                {opportunity.timeCommitment && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {opportunity.timeCommitment}
                  </div>
                )}
                {opportunity.location && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {opportunity.location}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setSelectedOpportunity(
                  selectedOpportunity === opportunity.id ? null : opportunity.id
                )}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                {selectedOpportunity === opportunity.id ? "Hide" : "View"} Candidates
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidates for Selected Opportunity */}
      {selectedOpportunity && candidates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Placement Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No candidates found for this opportunity</p>
                <p className="text-xs">Matching algorithm will suggest candidates based on spiritual gifts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate: PlacementCandidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">
                            {candidate.user.firstName && candidate.user.lastName
                              ? `${candidate.user.firstName} ${candidate.user.lastName}`
                              : candidate.user.email}
                          </p>
                          <p className="text-sm text-gray-600">{candidate.user.email}</p>
                        </div>
                        <div className="flex space-x-1">
                          {candidate.topGifts?.slice(0, 2).map((gift) => (
                            <Badge key={gift} className="text-xs bg-spiritual-blue text-white">
                              {giftName(gift)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={candidate.status === 'placed' ? 'default' : 'outline'}>
                        {candidate.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          Invite
                        </Button>
                        {candidate.status === 'invited' && (
                          <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Place
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}