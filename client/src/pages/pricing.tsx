import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle, Sparkles, Clock, Users, Shield, ArrowRight, Rocket, TrendingUp, Star, AlertCircle } from "lucide-react";

export default function Pricing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">KingdomOps</h1>
                <p className="text-sm text-gray-600">Church Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setLocation("/")}>Back to Home</Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/church-signup")}
                className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
              >
                Apply for Beta
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            KingdomOps Inner Circle
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join our exclusive beta program and help shape the future of church management technology
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
            <span className="bg-warm-gold text-spiritual-blue px-4 py-2 rounded-full text-lg font-bold">Apply for Inner Circle Access</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Inner Circle Pricing
          </h2>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-spiritual-blue mb-2">$99</div>
              <div className="text-gray-600 text-lg">/month</div>
              <div className="bg-warm-gold/10 text-warm-gold px-3 py-1 rounded-full text-sm font-medium mt-4">
                Beta Pricing
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Lock in lifetime pricing when we launch publicly in Q3 2026
            </div>
          </div>
        </div>
      </section>

      {/* Beta Program Details */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Join the Inner Circle?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe technology should serve the Kingdom, not the other way around. That's why KingdomOps was built by ministry leaders who understand the real challenges churches face in communication, discipleship, and administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-spiritual-blue/20 hover:border-spiritual-blue/40 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-spiritual-blue" />
                </div>
                <CardTitle className="text-xl text-gray-900">Early Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Be among the first to experience KingdomOps and influence feature development with direct feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-warm-gold/30 hover:border-warm-gold/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-warm-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-warm-gold" />
                </div>
                <CardTitle className="text-xl text-gray-900">Lifetime Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Lock in exclusive lifetime pricing that includes all future updates, features, and add-ons.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Direct Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Work directly with our team to customize KingdomOps for your church's unique needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-lg text-gray-600">
              The complete KingdomOps platform, available now in beta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Spiritual gifts assessment & ministry matching</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Core member management (basic profiles + invitations)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Church onboarding tools</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Administrative dashboard (basic analytics)</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Professional church subdomain (yourchurch.kingdomops.app)</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Multi-role user management system</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Priority support & feature requests</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-spiritual-blue" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Your Journey with KingdomOps
          </h2>
          
          {/* Timeline with Progress Flow */}
          <div className="relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-spiritual-blue via-warm-gold to-green-500 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="bg-white rounded-xl shadow-lg border-2 border-spiritual-blue/20 p-6 relative">
                <div className="w-16 h-16 bg-spiritual-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-spiritual-blue mb-2">Inner Circle Launch</h3>
                <p className="text-sm text-gray-500 mb-4">Now – Q1 2026</p>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Core features released</li>
                  <li>• Church onboarding & assessments</li>
                  <li>• Member management basics</li>
                  <li>• Administrative dashboard</li>
                  <li>• Professional church subdomain</li>
                </ul>
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-warm-gold" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border-2 border-warm-gold/30 p-6 relative">
                <div className="w-16 h-16 bg-warm-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-warm-gold mb-2">Growth & Expansion</h3>
                <p className="text-sm text-gray-500 mb-4">Q2 2026</p>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Advanced communication tools</li>
                  <li>• Online Community (groups, discussions)</li>
                  <li>• Event planning & coordination</li>
                  <li>• Multi-role user management</li>
                  <li>• Integrations</li>
                </ul>
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border-2 border-green-500/30 p-6 relative">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-green-600 mb-2">Public Launch</h3>
                <p className="text-sm text-gray-500 mb-4">Q3 2026</p>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Locked lifetime pricing for Inner Circle</li>
                  <li>• Email integration & automation</li>
                  <li>• Advanced analytics & reporting</li>
                  <li>• Priority support & feature requests</li>
                  <li>• Custom Discipleship & Ministry LMS</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Limited Spots Badge */}
          <div className="inline-flex items-center bg-warm-gold/20 border border-warm-gold/30 rounded-full px-4 py-2 mb-6">
            <AlertCircle className="h-4 w-4 text-warm-gold mr-2" />
            <span className="text-warm-gold font-medium text-sm">Limited to first 50 churches</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Inner Circle?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Apply today to secure your church's place in the future of church management — with lifetime pricing locked in when we launch.
          </p>
          <Button
            onClick={() => setLocation("/church-signup")}
            size="lg"
            className="bg-white text-spiritual-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            data-testid="button-apply-inner-circle"
          >
            Apply for Inner Circle Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}