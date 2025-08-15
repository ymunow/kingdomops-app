import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GiftCard } from "@/components/results/gift-card";
import { Crown, Trophy, Mail, Download, MessageCircle, Search, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultGift {
  key: string;
  score: number;
  name: string;
  shortName: string;
  definition: string;
  scripture: string;
  scriptureRef: string;
  ministryOptions: string[];
  whyItMatters: string;
  icon: string;
}

interface ResultData {
  id: string;
  responseId: string;
  ageGroups: string[];
  ministryInterests: string[];
  daysUntilExpiration: number | null;
  isNearExpiration: boolean;
  isVeryNearExpiration: boolean;
  expiresAt: string;
  user?: {
    name: string;
    email?: string;
  } | null;
  gifts: {
    top1: ResultGift;
    top2: ResultGift;
    top3: ResultGift;
  };
}

export default function Results() {
  const { responseId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Results are publicly accessible via shared links
  // No authentication required

  const { data: results, isLoading, error } = useQuery<ResultData>({
    queryKey: ["/api/results", responseId],
    enabled: !!responseId,
    queryFn: async () => {
      const response = await fetch(`/api/results/${responseId}`);
      if (!response.ok) {
        if (response.status === 410) {
          const errorData = await response.json();
          throw new Error(`EXPIRED: ${errorData.message}`);
        }
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });

  const handleEmailResults = async () => {
    try {
      // Since email is sent automatically on submission, show a message
      toast({
        title: "Email sent!",
        description: "Your detailed results have been sent to your email address.",
      });
    } catch (error) {
      toast({
        title: "Email failed",
        description: "Failed to send email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = () => {
    if (results) {
      const userName = results.user?.name || "User";
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Create styled HTML content that matches the results page
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spiritual Gifts Assessment Results - ${userName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      background: linear-gradient(135deg, #eff6ff 0%, #fefce8 100%);
      color: #1e3a8a;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 8px 25px rgba(30, 64, 175, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #eff6ff;
      padding-bottom: 20px;
    }
    .crown {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      color: #1e3a8a;
      font-size: 32px;
      margin: 0;
      font-weight: 700;
    }
    .subtitle {
      color: #2563eb;
      font-size: 18px;
      margin: 8px 0 16px;
    }
    .user-name {
      font-size: 20px;
      color: #f59e0b;
      font-weight: 600;
    }
    .date {
      color: #6b7280;
      font-size: 14px;
    }
    .gifts-section {
      margin: 40px 0;
    }
    .gift-card {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .gift-rank {
      background: #f59e0b;
      color: #1e3a8a;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 16px;
    }
    .gift-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .gift-name {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    .gift-score {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      margin-left: auto;
    }
    .gift-definition {
      margin: 16px 0;
      font-size: 16px;
      line-height: 1.7;
    }
    .gift-scripture {
      background: rgba(255,255,255,0.1);
      padding: 16px;
      border-radius: 8px;
      font-style: italic;
      border-left: 4px solid #f59e0b;
    }
    .additional-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 40px 0;
    }
    .info-card {
      background: #eff6ff;
      padding: 20px;
      border-radius: 12px;
    }
    .info-title {
      font-weight: 600;
      color: #1e3a8a;
      margin-bottom: 12px;
    }
    .info-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .info-tag {
      background: white;
      color: #2563eb;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      border: 1px solid #bfdbfe;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eff6ff;
      color: #6b7280;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="crown">👑</div>
      <h1>Spiritual Gifts Assessment</h1>
      <div class="subtitle">Personal Results Report</div>
      <div class="user-name">${userName}</div>
      <div class="date">Generated on ${currentDate}</div>
    </div>

    <div class="gifts-section">
      <h2 style="color: #1e3a8a; margin-bottom: 24px;">Your Top 3 Spiritual Gifts</h2>
      
      <div class="gift-card">
        <div class="gift-header">
          <span class="gift-rank">1</span>
          <h3 class="gift-name">${results.gifts.top1.name}</h3>
          <div class="gift-score">${results.gifts.top1.score}/25</div>
        </div>
        <div class="gift-definition">${results.gifts.top1.definition}</div>
        <div class="gift-scripture">
          "${results.gifts.top1.scripture}"<br>
          <strong>${results.gifts.top1.scriptureRef}</strong>
        </div>
      </div>

      <div class="gift-card">
        <div class="gift-header">
          <span class="gift-rank">2</span>
          <h3 class="gift-name">${results.gifts.top2.name}</h3>
          <div class="gift-score">${results.gifts.top2.score}/25</div>
        </div>
        <div class="gift-definition">${results.gifts.top2.definition}</div>
        <div class="gift-scripture">
          "${results.gifts.top2.scripture}"<br>
          <strong>${results.gifts.top2.scriptureRef}</strong>
        </div>
      </div>

      <div class="gift-card">
        <div class="gift-header">
          <span class="gift-rank">3</span>
          <h3 class="gift-name">${results.gifts.top3.name}</h3>
          <div class="gift-score">${results.gifts.top3.score}/25</div>
        </div>
        <div class="gift-definition">${results.gifts.top3.definition}</div>
        <div class="gift-scripture">
          "${results.gifts.top3.scripture}"<br>
          <strong>${results.gifts.top3.scriptureRef}</strong>
        </div>
      </div>
    </div>

    <div class="additional-info">
      <div class="info-card">
        <div class="info-title">Age Group Preferences</div>
        <div class="info-items">
          ${results.ageGroups.map(group => `<span class="info-tag">${group}</span>`).join('')}
        </div>
      </div>
      <div class="info-card">
        <div class="info-title">Ministry Interests</div>
        <div class="info-items">
          ${results.ministryInterests.map(interest => `<span class="info-tag">${interest}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Kingdom Impact Training</strong><br>
      Spiritual Gifts Assessment Platform</p>
      <p>Discover your unique calling and serve God's Kingdom with purpose.</p>
      <p style="margin-top: 20px; font-size: 12px;">Powered by <a href="https://www.graymusicmedia.com" target="_blank" style="color: #2563eb; text-decoration: none;">Gray Music Media Group</a></p>
    </div>
  </div>
</body>
</html>
      `.trim();

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spiritual-gifts-results-${userName.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    const isExpiredError = error?.message?.startsWith('EXPIRED:');
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cream">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            {isExpiredError ? (
              <>
                <AlertTriangle className="text-red-500 h-16 w-16 mb-4 mx-auto" />
                <h2 className="text-xl font-semibold mb-4 text-red-600">Results Have Expired</h2>
                <p className="text-gray-600 mb-4">
                  These assessment results are no longer available. Results are kept accessible for 90 days after completion.
                </p>
                <p className="text-gray-600 mb-4">
                  To get new results, you can take the assessment again.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Results Not Found</h2>
                <p className="text-gray-600 mb-4">
                  We couldn't find your assessment results. This might be because:
                </p>
                <ul className="text-gray-600 text-sm text-left mb-4">
                  <li>• The assessment hasn't been completed yet</li>
                  <li>• The results link is invalid</li>
                  <li>• The results have expired</li>
                </ul>
              </>
            )}
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              {isExpiredError ? "Take New Assessment" : "Back to Home"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Header */}
      <header className="bg-gradient-to-br from-spiritual-blue to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Trophy className="text-warm-gold h-16 w-16 mb-4 mx-auto" />
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">Your Spiritual Gift Results</h1>
          {results.user && (
            <div className="text-warm-gold text-2xl font-semibold mb-4">
              {results.user.name}
            </div>
          )}
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Congratulations! Here are your top 3 spiritual gifts and how God has uniquely equipped you to serve His Kingdom.
          </p>
          
          {/* Expiration Warning */}
          {results.isVeryNearExpiration && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-300 mr-2" />
                <span className="font-semibold text-red-300">Urgent: Results Expiring Soon</span>
              </div>
              <p className="text-red-200 text-sm">
                Your results will expire in {results.daysUntilExpiration} days. Download or save them now!
              </p>
            </div>
          )}
          
          {results.isNearExpiration && !results.isVeryNearExpiration && (
            <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="font-semibold text-yellow-300">Results Expiring Soon</span>
              </div>
              <p className="text-yellow-200 text-sm">
                Your results will expire in {results.daysUntilExpiration} days. Consider downloading them for your records.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleEmailResults}
              className="bg-warm-gold text-spiritual-blue hover:bg-yellow-400"
              data-testid="button-email-results"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email My Results
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-spiritual-blue"
              data-testid="button-download-report"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </header>

      {/* Results Content */}
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Additional expiration info */}
          {results.daysUntilExpiration !== null && !results.isNearExpiration && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-semibold text-purple-700">Results Available for {results.daysUntilExpiration} More Days</span>
              </div>
              <p className="text-purple-600 text-sm text-center">
                Your results will be accessible until {new Date(results.expiresAt).toLocaleDateString()}. Save them for your records!
              </p>
            </div>
          )}
          
          <h2 className="font-display font-bold text-3xl text-center text-charcoal mb-12">Your Top 3 Spiritual Gifts</h2>
          
          <div className="space-y-8">
            <GiftCard 
              gift={results.gifts.top1} 
              rank={1} 
              accentColor="warm-gold"
            />
            <GiftCard 
              gift={results.gifts.top2} 
              rank={2} 
              accentColor="spiritual-blue"
            />
            <GiftCard 
              gift={results.gifts.top3} 
              rank={3} 
              accentColor="sage-green"
            />
          </div>

          {/* Preferences Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display font-bold text-3xl text-center text-charcoal mb-12">Your Ministry Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-soft-cream">
                  <CardContent className="p-8">
                    <h3 className="font-display font-semibold text-xl text-charcoal mb-4 flex items-center">
                      <CheckCircle className="text-spiritual-blue mr-3 h-6 w-6" />
                      Preferred Age Groups
                    </h3>
                    <div className="space-y-3">
                      {results.ageGroups.length > 0 ? (
                        results.ageGroups.map((group, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="text-sage-green mr-3 h-4 w-4" />
                            <span>{group}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No age groups selected</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-soft-cream">
                  <CardContent className="p-8">
                    <h3 className="font-display font-semibold text-xl text-charcoal mb-4 flex items-center">
                      <CheckCircle className="text-spiritual-blue mr-3 h-6 w-6" />
                      Ministry Interests
                    </h3>
                    <div className="space-y-3">
                      {results.ministryInterests.length > 0 ? (
                        results.ministryInterests.map((interest, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="text-sage-green mr-3 h-4 w-4" />
                            <span>{interest}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No ministry interests selected</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Next Steps Section */}
          <section className="py-16 bg-gradient-to-br from-spiritual-blue to-purple-900 text-white rounded-2xl">
            <div className="max-w-4xl mx-auto px-8 text-center">
              <h2 className="font-display font-bold text-3xl mb-6">Ready to Step Into Your Calling?</h2>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Your spiritual gifts are meant to be used! Here are some next steps to help you find the perfect 
                ministry fit and start making an impact in God's Kingdom.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="text-warm-gold h-8 w-8 mb-4 mx-auto" />
                    <h3 className="font-semibold text-lg mb-3">Talk to a Leader</h3>
                    <p className="opacity-90 mb-4">Connect with a ministry leader to discuss your results and explore opportunities.</p>
                    <Button 
                      className="bg-warm-gold text-spiritual-blue hover:bg-yellow-400"
                      onClick={() => toast({ title: "Contact Info", description: "Please reach out to your church leadership team." })}
                      data-testid="button-contact-leader"
                    >
                      Contact Us
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <Search className="text-warm-gold h-8 w-8 mb-4 mx-auto" />
                    <h3 className="font-semibold text-lg mb-3">Explore Opportunities</h3>
                    <p className="opacity-90 mb-4">Browse current ministry roles that match your gifts and interests.</p>
                    <Button 
                      className="bg-warm-gold text-spiritual-blue hover:bg-yellow-400"
                      onClick={() => toast({ title: "Ministry Opportunities", description: "Check with your church for current openings." })}
                      data-testid="button-explore-roles"
                    >
                      View Roles
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <Calendar className="text-warm-gold h-8 w-8 mb-4 mx-auto" />
                    <h3 className="font-semibold text-lg mb-3">Join a Team</h3>
                    <p className="opacity-90 mb-4">Start serving on a trial basis to confirm your calling and build experience.</p>
                    <Button 
                      className="bg-warm-gold text-spiritual-blue hover:bg-yellow-400"
                      onClick={() => toast({ title: "Get Started", description: "Contact ministry coordinators to get involved." })}
                      data-testid="button-join-team"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleEmailResults}
                  className="bg-warm-gold text-spiritual-blue px-8 py-4 text-lg hover:bg-yellow-400"
                  data-testid="button-email-complete-report"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Email My Complete Report
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white text-white px-8 py-4 text-lg bg-transparent hover:bg-white hover:text-spiritual-blue"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "My Spiritual Gifts Results",
                        text: `I discovered my spiritual gifts! My top gift is ${results.gifts.top1.name}.`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link copied", description: "Results link copied to clipboard." });
                    }
                  }}
                  data-testid="button-share-results"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Share My Results
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
