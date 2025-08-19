import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle, Sparkles, Clock, Users, Shield, ArrowRight } from "lucide-react";

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
            <span className="bg-warm-gold text-spiritual-blue px-4 py-2 rounded-full text-lg font-bold">BETA PROGRAM</span>
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
              We believe technology should serve the Kingdom, not the other way around. That's why KingdomOps was built by ministry leaders who understand the real challenges churches face in communication, discipleship, and administration. It's $99 each month.
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
                <span className="text-gray-700">Member management & communication tools</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Event planning & coordination system</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Administrative dashboard & analytics</span>
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
                <span className="text-gray-700">Email integration & automated communications</span>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-spiritual-blue" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Beta Program Timeline
          </h2>
          <div className="bg-spiritual-blue/5 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="font-semibold text-spiritual-blue mb-2">Phase 1: Now - Q1 2026</h3>
                <p className="text-gray-600 text-sm">Core features, church onboarding, and member assessment tools</p>
              </div>
              <div>
                <h3 className="font-semibold text-spiritual-blue mb-2">Phase 2: Q2 2026</h3>
                <p className="text-gray-600 text-sm">Advanced communication tools, event management, and integrations</p>
              </div>
              <div>
                <h3 className="font-semibold text-spiritual-blue mb-2">Phase 3: Q3 2026</h3>
                <p className="text-gray-600 text-sm">Public launch with full platform and lifetime pricing activated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Inner Circle?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Limited spots available. Apply today to secure your church's place in the future of church management.
          </p>
          <Button
            onClick={() => setLocation("/church-signup")}
            size="lg"
            className="bg-white text-spiritual-blue hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            data-testid="button-apply-inner-circle"
          >
            Apply for Inner Circle Access
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-purple-200 mt-4 text-sm">
            $99/month • Lifetime pricing guaranteed
          </p>
        </div>
      </section>
    </div>
  );
}