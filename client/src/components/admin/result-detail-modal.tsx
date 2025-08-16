import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BarChart } from "@/components/ui/charts";
import { apiRequest } from "@/lib/queryClient";
import {
  Award,
  Calendar,
  Users,
  Heart,
  FileText,
  CheckCircle,
  Clock,
  Target,
  UserCheck
} from "lucide-react";

interface ResultDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
}

interface DetailedResult {
  id: string;
  responseId: string;
  submittedAt: string;
  scoresJson: Record<string, number>;
  top1GiftKey: string;
  top2GiftKey: string;
  top3GiftKey: string;
  ageGroups: string[];
  ministryInterests: string[];
  adminNotes?: string;
  followUpDate?: string;
  placementStatus?: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  gifts: {
    top1: { key: string; score: number; name: string; definition: string };
    top2: { key: string; score: number; name: string; definition: string };
    top3: { key: string; score: number; name: string; definition: string };
  };
}

const GIFT_NAMES: Record<string, string> = {
  LEADERSHIP_ORG: "Leadership",
  TEACHING: "Teaching",
  WISDOM_INSIGHT: "Wisdom & Insight",
  PROPHETIC_DISCERNMENT: "Prophetic Discernment",
  EXHORTATION: "Exhortation",
  SHEPHERDING: "Shepherding",
  FAITH: "Faith",
  EVANGELISM: "Evangelism",
  APOSTLESHIP: "Apostleship",
  SERVICE_HOSPITALITY: "Service & Hospitality",
  MERCY: "Mercy",
  GIVING: "Giving"
};

const MINISTRY_SUGGESTIONS: Record<string, string[]> = {
  LEADERSHIP_ORG: [
    "Small Group Leadership",
    "Ministry Team Coordination",
    "Event Planning & Management",
    "Volunteer Coordination",
    "Board/Committee Leadership"
  ],
  TEACHING: [
    "Sunday School Teaching",
    "Bible Study Leadership",
    "Youth/Children's Ministry",
    "Adult Education Programs",
    "Discipleship Mentoring"
  ],
  WISDOM_INSIGHT: [
    "Counseling Ministry",
    "Decision-Making Support",
    "Strategic Planning Team",
    "Conflict Resolution",
    "Life Coaching"
  ],
  PROPHETIC_DISCERNMENT: [
    "Prayer Ministry",
    "Spiritual Direction",
    "Intercessory Prayer",
    "Discernment Team",
    "Prophetic Worship"
  ],
  EXHORTATION: [
    "Encouragement Ministry",
    "Motivational Speaking",
    "Life Coaching",
    "Accountability Groups",
    "Recovery Ministry"
  ],
  SHEPHERDING: [
    "Pastoral Care",
    "Small Group Ministry",
    "Newcomer Integration",
    "Care Team Ministry",
    "Hospital/Home Visitation"
  ],
  FAITH: [
    "Prayer Ministry",
    "Missions Support",
    "Faith-Building Testimonies",
    "Venture Leadership",
    "Crisis Response Team"
  ],
  EVANGELISM: [
    "Outreach Ministry",
    "Community Events",
    "Missions Team",
    "Seeker Services",
    "Relationship Building"
  ],
  APOSTLESHIP: [
    "Church Planting",
    "Mission Leadership",
    "New Ministry Development",
    "Cross-Cultural Ministry",
    "Pioneering Initiatives"
  ],
  SERVICE_HOSPITALITY: [
    "Hospitality Team",
    "Facilities Management",
    "Kitchen Ministry",
    "Greeting & Ushering",
    "Event Setup/Cleanup"
  ],
  MERCY: [
    "Compassion Ministry",
    "Community Service",
    "Crisis Support",
    "Bereavement Care",
    "Social Justice Advocacy"
  ],
  GIVING: [
    "Stewardship Ministry",
    "Fundraising Coordination",
    "Resource Management",
    "Benevolence Committee",
    "Capital Campaign Support"
  ]
};

export default function ResultDetailModal({ isOpen, onClose, resultId }: ResultDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [placementStatus, setPlacementStatus] = useState("");

  const { data: result, isLoading } = useQuery({
    queryKey: ["/api/admin/results/detail", resultId],
    queryFn: async () => {
      const response = await fetch(`/api/results/${resultId}`);
      if (!response.ok) throw new Error("Failed to fetch result details");
      return response.json();
    },
    enabled: isOpen && !!resultId
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (data: { notes: string; followUpDate?: string; placementStatus?: string }) => {
      const response = await fetch(`/api/admin/results/${resultId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update notes");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notes updated",
        description: "Result notes have been saved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results/detail", resultId] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update notes. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveNotes = () => {
    updateNotesMutation.mutate({
      notes,
      followUpDate: followUpDate || undefined,
      placementStatus: placementStatus || undefined
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!result) {
    return (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Result not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Prepare chart data
  const chartData = Object.entries(result.scoresJson)
    .map(([key, score]) => ({
      label: GIFT_NAMES[key] || key,
      value: score as number,
      color: [result.top1GiftKey, result.top2GiftKey, result.top3GiftKey].includes(key) 
        ? 'bg-spiritual-blue' 
        : 'bg-gray-400'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-spiritual-blue" />
            Assessment Results - {result.user.firstName || result.user.email}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Participant Info & Top Gifts */}
          <div className="space-y-6">
            {/* Participant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-4 w-4 mr-2" />
                  Participant Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Name</Label>
                  <p className="font-medium">
                    {result.user.firstName && result.user.lastName
                      ? `${result.user.firstName} ${result.user.lastName}`
                      : result.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="text-sm text-gray-600">{result.user.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Completed</Label>
                  <p className="text-sm">{new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
                {result.ageGroups?.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500">Age Groups</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.ageGroups.map((group: string) => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.ministryInterests?.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500">Ministry Interests</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.ministryInterests.map((interest: string) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top 3 Gifts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Award className="h-4 w-4 mr-2" />
                  Top 3 Spiritual Gifts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-spiritual-blue/10 rounded-lg">
                    <div>
                      <div className="font-semibold text-spiritual-blue">1. {result.gifts.top1.name}</div>
                      <div className="text-sm text-gray-600">{result.gifts.top1.definition}</div>
                    </div>
                    <div className="text-lg font-bold text-spiritual-blue">{result.gifts.top1.score}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{result.gifts.top2.name}</div>
                      <div className="text-sm text-gray-600">{result.gifts.top2.definition}</div>
                    </div>
                    <div className="text-lg font-bold">{result.gifts.top2.score}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{result.gifts.top3.name}</div>
                      <div className="text-sm text-gray-600">{result.gifts.top3.definition}</div>
                    </div>
                    <div className="text-lg font-bold">{result.gifts.top3.score}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Scores Chart */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="h-4 w-4 mr-2" />
                  All Gift Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={chartData} height={300} showValues={true} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ministry Suggestions & Admin Notes */}
          <div className="space-y-6">
            {/* Ministry Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Ministry Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MINISTRY_SUGGESTIONS[result.top1GiftKey]?.slice(0, 5).map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes & Follow-up */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-4 w-4 mr-2" />
                  Admin Notes & Follow-up
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this participant..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="placementStatus">Placement Status</Label>
                  <select
                    id="placementStatus"
                    value={placementStatus}
                    onChange={(e) => setPlacementStatus(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select status...</option>
                    <option value="not_contacted">Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_discussion">In Discussion</option>
                    <option value="placed">Placed in Ministry</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <Button 
                  onClick={handleSaveNotes}
                  disabled={updateNotesMutation.isPending}
                  className="w-full"
                >
                  {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}