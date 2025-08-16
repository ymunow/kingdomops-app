import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, MetricCard } from "@/components/ui/charts";
import ResultDetailModal from "@/components/admin/result-detail-modal";
import MinistryOpportunities from "@/components/admin/ministry-opportunities";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Award, 
  Search, 
  Filter, 
  Download,
  BarChart3,
  UserCheck,
  Clock,
  Target,
  Eye,
  Mail,
  FileText
} from "lucide-react";

interface DashboardMetrics {
  totalCompletions: number;
  completionsLast30Days: number;
  averageTimeMinutes: number;
  dropOffRate: number;
  topGiftDistribution: Record<string, number>;
  ageGroupDistribution: Record<string, number>;
  weeklyCompletions: { week: string; count: number }[];
}

interface UserResult {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  ageRange?: string;
  latestResult?: {
    id: string;
    top1GiftKey: string;
    top2GiftKey: string;
    top3GiftKey: string;
    submittedAt: string;
    ministryInterests: string[];
  };
  totalAssessments: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGift, setFilterGift] = useState<string>("all-gifts");
  const [filterAgeRange, setFilterAgeRange] = useState<string>("all-ages");
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/metrics"],
    enabled: !!user
  });

  // Fetch organization users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/users", filterGift, filterAgeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterGift && filterGift !== "all-gifts") params.append("giftKey", filterGift);
      if (filterAgeRange && filterAgeRange !== "all-ages") params.append("ageRange", filterAgeRange);
      
      const response = await fetch(`/api/admin/dashboard/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: !!user
  });

  // Fetch assessment results
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/results", filterGift],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterGift && filterGift !== "all-gifts") params.append("giftKey", filterGift);
      
      const response = await fetch(`/api/admin/dashboard/results?${params}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
    enabled: !!user
  });

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/admin/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assessment-results.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Assessment data has been downloaded as CSV"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewResult = (responseId: string) => {
    setSelectedResultId(responseId);
    setIsResultModalOpen(true);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setSelectedResultId("");
  };

  const filteredUsers = users?.filter((user: UserResult) => {
    const searchMatch = !searchTerm || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  }) || [];

  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-soft-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-charcoal">
                Church Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your church's spiritual gifts assessments
              </p>
            </div>
            <Button 
              onClick={handleExportData}
              className="bg-spiritual-blue text-white hover:bg-purple-800"
              data-testid="button-export-data"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="people" data-testid="tab-people">People</TabsTrigger>
            <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
            <TabsTrigger value="ministry" data-testid="tab-ministry">Ministry</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Completions"
                value={(metrics as any)?.totalCompletions || 0}
                subtitle="All-time assessments"
                icon={<UserCheck className="h-5 w-5" />}
                trend={{
                  value: (metrics as any)?.completionsLast30Days || 0,
                  label: "this month",
                  isPositive: true
                }}
              />
              <MetricCard
                title="Average Time"
                value={`${(metrics as any)?.averageTimeMinutes || 0}m`}
                subtitle="Completion time"
                icon={<Clock className="h-5 w-5" />}
              />
              <MetricCard
                title="Completion Rate"
                value={`${Math.round((1 - ((metrics as any)?.dropOffRate || 0)) * 100)}%`}
                subtitle="People who finish"
                icon={<Target className="h-5 w-5" />}
              />
              <MetricCard
                title="This Month"
                value={(metrics as any)?.completionsLast30Days || 0}
                subtitle="New assessments"
                icon={<TrendingUp className="h-5 w-5" />}
              />
            </div>

            {/* Enhanced Gift Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-spiritual-blue" />
                    Top Spiritual Gifts Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(metrics as any)?.topGiftDistribution ? (
                    <BarChart
                      data={Object.entries((metrics as any).topGiftDistribution)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 8)
                        .map(([gift, count]) => ({
                          label: gift.replace(/_/g, " "),
                          value: count as number,
                          color: "bg-spiritual-blue"
                        }))}
                      height={300}
                      showValues={true}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
                    Age Group Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(metrics as any)?.ageGroupDistribution ? (
                    <BarChart
                      data={Object.entries((metrics as any).ageGroupDistribution)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([ageGroup, count]) => ({
                          label: ageGroup,
                          value: count as number,
                          color: "bg-warm-gold"
                        }))}
                      height={300}
                      showValues={true}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
              <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-ages">All Ages</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46-55">46-55</SelectItem>
                  <SelectItem value="56-65">56-65</SelectItem>
                  <SelectItem value="66+">66+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGift} onValueChange={setFilterGift}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Top Gift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-gifts">All Gifts</SelectItem>
                  <SelectItem value="LEADERSHIP_ORG">Leadership</SelectItem>
                  <SelectItem value="TEACHING">Teaching</SelectItem>
                  <SelectItem value="WISDOM_INSIGHT">Wisdom</SelectItem>
                  <SelectItem value="PROPHETIC_DISCERNMENT">Prophetic</SelectItem>
                  <SelectItem value="EXHORTATION">Exhortation</SelectItem>
                  <SelectItem value="SHEPHERDING">Shepherding</SelectItem>
                  <SelectItem value="FAITH">Faith</SelectItem>
                  <SelectItem value="EVANGELISM">Evangelism</SelectItem>
                  <SelectItem value="APOSTLESHIP">Apostleship</SelectItem>
                  <SelectItem value="SERVICE_HOSPITALITY">Service</SelectItem>
                  <SelectItem value="MERCY">Mercy</SelectItem>
                  <SelectItem value="GIVING">Giving</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* People Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
                  People ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spiritual-blue mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading people...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Name</th>
                          <th className="text-left p-2 font-medium">Email</th>
                          <th className="text-left p-2 font-medium">Age Range</th>
                          <th className="text-left p-2 font-medium">Top Gifts</th>
                          <th className="text-left p-2 font-medium">Last Assessment</th>
                          <th className="text-left p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user: UserResult) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.email.split('@')[0]
                              }
                            </td>
                            <td className="p-2 text-sm text-gray-600">{user.email}</td>
                            <td className="p-2">
                              {user.ageRange && (
                                <Badge variant="outline">{user.ageRange}</Badge>
                              )}
                            </td>
                            <td className="p-2">
                              {user.latestResult && (
                                <div className="flex flex-wrap gap-1">
                                  <Badge className="text-xs bg-spiritual-blue text-white">
                                    {user.latestResult.top1GiftKey.replace(/_/g, " ")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {user.latestResult.top2GiftKey.replace(/_/g, " ")}
                                  </Badge>
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-sm">
                              {user.latestResult ? (
                                <div>
                                  {new Date(user.latestResult.submittedAt).toLocaleDateString()}
                                  <div className="text-xs text-gray-500">
                                    {user.totalAssessments} total
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">No assessments</span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                {user.latestResult && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewResult(user.latestResult!.id)}
                                    data-testid={`button-view-result-${user.id}`}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Result
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.location.href = `mailto:${user.email}`}
                                  data-testid={`button-email-${user.id}`}
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-spiritual-blue" />
                  Assessment Results Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spiritual-blue mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading results...</p>
                  </div>
                ) : results && results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-spiritual-blue/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-spiritual-blue">{results.length}</div>
                        <div className="text-sm text-gray-600">Total Results</div>
                      </div>
                      <div className="bg-warm-gold/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-warm-gold">
                          {Math.round(results.filter((r: any) => r.completedAt).length / results.length * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                      <div className="bg-sage-green/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-sage-green">
                          {new Date().getMonth() + 1}
                        </div>
                        <div className="text-sm text-gray-600">This Month</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Click "View Result" in the People tab to see detailed individual results</p>
                      <Button 
                        onClick={() => setActiveTab("people")}
                        className="bg-spiritual-blue text-white hover:bg-purple-800"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Individual Results
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assessment results found</p>
                    <p className="text-sm">Results will appear here once people complete assessments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ministry Tab */}
          <TabsContent value="ministry" className="space-y-6">
            <MinistryOpportunities />
          </TabsContent>
        </Tabs>
      </div>

      {/* Result Detail Modal */}
      <ResultDetailModal
        isOpen={isResultModalOpen}
        onClose={handleCloseResultModal}
        resultId={selectedResultId}
      />
    </div>
  );
}