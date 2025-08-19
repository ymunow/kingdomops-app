import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Search,
  Share2,
  Church
} from "lucide-react";
import { SubdomainLanding } from "@/components/subdomain/subdomain-landing";

export default function SubdomainDemo() {
  const [testSubdomain, setTestSubdomain] = useState('fwc');
  const [showLanding, setShowLanding] = useState(false);

  // Query organization info for the test subdomain
  const { data: orgInfo, isLoading, error } = useQuery({
    queryKey: [`/api/subdomain/${testSubdomain}/info`],
    enabled: !!testSubdomain && testSubdomain.length >= 3,
    retry: false
  });

  const knownSubdomains = [
    { name: 'fwc', org: 'FWC Columbia', description: 'FWC exists to see lives changed' },
    { name: 'thegathering', org: 'The Gathering', description: 'Experience kingdom family and community' },
    { name: 'default', org: 'Default Organization', description: 'Platform default organization' }
  ];

  const testSubdomainUrl = (subdomain: string) => {
    return `https://${subdomain}.kingdomops.org`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      {/* Header */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-charcoal flex items-center justify-center">
              <Globe className="h-8 w-8 mr-3" />
              Subdomain System Demo
            </h1>
            <p className="text-gray-600 mt-2">Professional church web addresses replacing join codes</p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Live Subdomain Tester */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-spiritual-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <Search className="h-5 w-5 mr-2 text-spiritual-blue" />
              Live Subdomain Tester
            </CardTitle>
            <CardDescription className="text-charcoal/70">
              Test any subdomain to see if it exists and view organization information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Input
                placeholder="Enter subdomain (e.g., fwc)"
                value={testSubdomain}
                onChange={(e) => setTestSubdomain(e.target.value)}
                className="max-w-xs"
              />
              <div className="flex items-center text-sm text-warm-gold font-medium">
                .kingdomops.org
              </div>
            </div>

            {testSubdomain && (
              <div className="p-4 bg-gray-50 rounded-lg">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-spiritual-blue mr-2"></div>
                    <span>Checking {testSubdomain}...</span>
                  </div>
                ) : orgInfo ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-warm-gold mr-2" />
                      <span className="font-medium text-charcoal">Subdomain exists!</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-spiritual-blue/20">
                      <h4 className="font-semibold text-charcoal">{(orgInfo as any)?.name || 'Unknown Organization'}</h4>
                      <p className="text-sm text-charcoal/70 mt-1">{(orgInfo as any)?.description || 'No description available'}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm font-mono bg-spiritual-blue/10 text-spiritual-blue px-2 py-1 rounded">
                          {testSubdomain}.kingdomops.org
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-warm-gold/30 text-warm-gold hover:bg-warm-gold hover:text-white"
                            onClick={() => setShowLanding(true)}
                          >
                            Preview Landing
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-spiritual-blue to-warm-gold hover:from-spiritual-blue/90 hover:to-warm-gold/90 text-white"
                            onClick={() => window.open(testSubdomainUrl(testSubdomain), '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-warm-gold mr-2" />
                    <span className="text-charcoal">Subdomain not found - available for registration</span>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Known Active Subdomains */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-warm-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <Church className="h-5 w-5 mr-2 text-warm-gold" />
              Active Church Subdomains
            </CardTitle>
            <CardDescription className="text-charcoal/70">
              Churches currently using the subdomain system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {knownSubdomains.map((church) => (
                <div key={church.name} className="p-4 border border-spiritual-blue/20 rounded-lg hover:shadow-md hover:border-spiritual-blue/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-charcoal">{church.org}</h4>
                    <Badge variant="secondary" className="bg-warm-gold/20 text-warm-gold border-warm-gold/30">Active</Badge>
                  </div>
                  <p className="text-sm text-charcoal/70 mb-3">{church.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs font-mono bg-spiritual-blue/10 text-spiritual-blue px-2 py-1 rounded">
                      {church.name}.kingdomops.org
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-warm-gold/30 text-warm-gold hover:bg-warm-gold hover:text-white"
                        onClick={() => {
                          setTestSubdomain(church.name);
                          setShowLanding(true);
                        }}
                      >
                        Preview
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-spiritual-blue to-warm-gold hover:from-spiritual-blue/90 hover:to-warm-gold/90 text-white"
                        onClick={() => window.open(testSubdomainUrl(church.name), '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Comparison */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-warm-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <Share2 className="h-5 w-5 mr-2 text-warm-gold" />
              Subdomain Benefits vs Join Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-warm-gold/80 mb-3">❌ Old: Join Codes</h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li>• Difficult to remember: "ABC123XYZ"</li>
                  <li>• Not professional or branded</li>
                  <li>• Hard to share verbally</li>
                  <li>• Requires extra steps to join</li>
                  <li>• No direct link to assessments</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-warm-gold mb-3">✅ New: Subdomains</h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li>• Professional: "fwc.kingdomops.org"</li>
                  <li>• Easy to remember and share</li>
                  <li>• Direct links to all features</li>
                  <li>• Church-branded experience</li>
                  <li>• Works great on business cards</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-spiritual-blue/20">
          <CardHeader>
            <CardTitle className="text-charcoal">System Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-spiritual-blue">For Churches</h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li>• Professional web presence</li>
                  <li>• Custom landing pages</li>
                  <li>• Direct assessment links</li>
                  <li>• Easy member registration</li>
                  <li>• Subdomain management tools</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-warm-gold">For Members</h4>
                <ul className="space-y-2 text-sm text-charcoal/70">
                  <li>• Intuitive church-specific URLs</li>
                  <li>• Seamless assessment experience</li>
                  <li>• Church-branded interface</li>
                  <li>• Easy sharing with friends</li>
                  <li>• Mobile-friendly access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Landing Page Preview Modal */}
      {showLanding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Landing Page Preview: {testSubdomain}.kingdomops.org</h3>
              <Button variant="ghost" onClick={() => setShowLanding(false)}>
                ✕
              </Button>
            </div>
            <div className="p-6">
              <SubdomainLanding subdomain={testSubdomain} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}