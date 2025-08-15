import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParticipantData {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  response: {
    startedAt: string;
    submittedAt: string | null;
  };
  topGift: string;
  ageGroups: string[];
  ministryInterests: string[];
  scores: Record<string, number>;
}

const giftColors: Record<string, string> = {
  Leadership: "bg-spiritual-blue/10 text-spiritual-blue",
  Teaching: "bg-warm-gold/10 text-warm-gold",
  Wisdom: "bg-purple-500/10 text-purple-500",
  Prophetic: "bg-indigo-500/10 text-indigo-500",
  Exhortation: "bg-pink-500/10 text-pink-500",
  Shepherding: "bg-teal-500/10 text-teal-500",
  Faith: "bg-orange-500/10 text-orange-500",
  Evangelism: "bg-red-500/10 text-red-500",
  Apostleship: "bg-cyan-500/10 text-cyan-500",
  Service: "bg-sage-green/10 text-sage-green",
  Mercy: "bg-rose-500/10 text-rose-500",
  Giving: "bg-yellow-500/10 text-yellow-500",
};

export function ParticipantsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [giftFilter, setGiftFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: participants, isLoading, error } = useQuery<ParticipantData[]>({
    queryKey: ["/api/admin/responses"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleEmailParticipant = (participant: ParticipantData) => {
    toast({
      title: "Email feature",
      description: `Email functionality for ${participant.user.email} would be implemented here.`,
    });
  };

  const handleViewDetails = (participant: ParticipantData) => {
    toast({
      title: "View details",
      description: "Detailed view functionality would open here.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load participant data. Please try again later.</p>
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No assessments yet</p>
          <p className="text-sm">Participant responses will appear here once assessments are completed.</p>
        </div>
      </div>
    );
  }

  // Filter participants based on search and filters
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch = !searchTerm || 
      participant.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGift = giftFilter === "all" || participant.topGift === giftFilter;
    
    const matchesAge = ageFilter === "all" || 
      participant.ageGroups.some(age => age.toLowerCase().includes(ageFilter.toLowerCase()));
    
    return matchesSearch && matchesGift && matchesAge;
  });

  // Get unique values for filters
  const uniqueGifts = Array.from(new Set(participants.map(p => p.topGift)));
  const uniqueAgeGroups = Array.from(new Set(participants.flatMap(p => p.ageGroups)));

  return (
    <div>
      {/* Filters */}
      <div className="p-6 border-b border-gray-200 bg-soft-cream">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-participants"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={giftFilter} onValueChange={setGiftFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-gift-filter">
                <SelectValue placeholder="All Gifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gifts</SelectItem>
                {uniqueGifts.map(gift => (
                  <SelectItem key={gift} value={gift}>{gift}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-age-filter">
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                {uniqueAgeGroups.map(age => (
                  <SelectItem key={age} value={age}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/api/admin/export'}
              data-testid="button-export-filtered"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-sm text-charcoal">Participant</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-charcoal">Top Gift</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-charcoal">Age Groups</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-charcoal">Completed</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredParticipants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-50" data-testid={`row-participant-${participant.id}`}>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-charcoal" data-testid={`text-name-${participant.id}`}>
                      {participant.user.name || "Anonymous User"}
                    </div>
                    <div className="text-gray-600 text-sm" data-testid={`text-email-${participant.id}`}>
                      {participant.user.email}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <Badge 
                    className={`${giftColors[participant.topGift] || "bg-gray-100 text-gray-800"} border-0`}
                    data-testid={`badge-gift-${participant.id}`}
                  >
                    {participant.topGift}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-600 text-sm" data-testid={`text-age-groups-${participant.id}`}>
                    {participant.ageGroups.length > 0 
                      ? participant.ageGroups.slice(0, 2).join(", ") + (participant.ageGroups.length > 2 ? "..." : "")
                      : "None specified"
                    }
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-gray-600 text-sm" data-testid={`text-completed-${participant.id}`}>
                    {participant.response.submittedAt 
                      ? new Date(participant.response.submittedAt).toLocaleDateString()
                      : "In progress"
                    }
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(participant)}
                      data-testid={`button-view-${participant.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmailParticipant(participant)}
                      data-testid={`button-email-${participant.id}`}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-sm text-gray-500" data-testid="text-results-count">
          Showing {filteredParticipants.length} of {participants.length} participants
        </div>
        {filteredParticipants.length !== participants.length && (
          <div className="text-sm text-gray-500">
            Filtered results - <button 
              onClick={() => {
                setSearchTerm("");
                setGiftFilter("all");
                setAgeFilter("all");
              }}
              className="text-spiritual-blue hover:underline"
              data-testid="button-clear-filters"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
