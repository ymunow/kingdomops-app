import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle, Clock, Users, Shield, ArrowRight, Rocket, TrendingUp, Star, AlertCircle, Church, Zap, Settings, BarChart3, Globe, UserCheck, MessageCircle, Calendar, Heart, BookOpen, DollarSign } from "lucide-react";

export default function Pricing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <h1 className="font-display font-bold text-xl text-charcoal">KingdomOps</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setLocation("/features")}>Features</Button>
              <Button variant="ghost" onClick={() => setLocation("/pricing")}>Pricing</Button>
              <Button variant="ghost">Contact</Button>
              <Button 
                onClick={() => setLocation("/church-signup")}
                className="bg-spiritual-blue text-white hover:bg-purple-800"
                data-testid="button-church-signup"
              >
                <Church className="mr-2 h-4 w-4" />
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            KingdomOps Inner Circle
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-2xl mx-auto px-4">
            Join our exclusive beta program and help shape the future of church management technology
          </p>
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 inline-block cursor-pointer hover:bg-white/20 transition-colors"
            onClick={() => setLocation("/church-signup")}
          >
            <span className="bg-warm-gold text-spiritual-blue px-6 sm:px-4 py-3 sm:py-2 rounded-full text-base sm:text-lg font-bold whitespace-nowrap">Apply Now</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pricing Tiers
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Choose the plan that fits your church size and ministry needs
            </p>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Small Churches */}
            <Card className="border-2 border-spiritual-blue/20 hover:border-spiritual-blue/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-spiritual-blue/10 to-purple-200/20 rounded-bl-full"></div>
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-xl text-gray-900 mb-2">Small Churches</CardTitle>
                <p className="text-sm text-gray-600 mb-4">(&lt;100 members)</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-spiritual-blue">$197</span>
                  <span className="text-gray-600 text-lg ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm mb-4">Perfect for church plants and smaller congregations</p>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Full access to KingdomOps features</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Includes onboarding + training</li>
                  <li className="flex items-center"><Crown className="h-4 w-4 text-spiritual-blue mr-2" />Inner Circle Guarantee: Your rate is locked for life</li>
                </ul>
              </CardContent>
            </Card>

            {/* Medium Churches */}
            <Card className="border-2 border-warm-gold/30 hover:border-warm-gold/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-warm-gold/10 to-yellow-200/20 rounded-bl-full"></div>
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-xl text-gray-900 mb-2">Medium Churches</CardTitle>
                <p className="text-sm text-gray-600 mb-4">(100–250 members)</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-warm-gold">$297</span>
                  <span className="text-gray-600 text-lg ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm mb-4">Designed for growing congregations</p>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Includes expanded features + analytics</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Full staff and volunteer onboarding support</li>
                  <li className="flex items-center"><Crown className="h-4 w-4 text-spiritual-blue mr-2" />Inner Circle Guarantee: Your rate is locked for life</li>
                </ul>
              </CardContent>
            </Card>

            {/* Large Churches */}
            <Card className="border-2 border-purple-300 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-purple-300/30 rounded-bl-full"></div>
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-xl text-gray-900 mb-2">Large Churches</CardTitle>
                <p className="text-sm text-gray-600 mb-4">(251–500 members)</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-purple-600">$497</span>
                  <span className="text-gray-600 text-lg ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm mb-4">Built for established and multi-ministry congregations</p>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Includes advanced support and deeper insights</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Volunteer and multi-team coordination tools</li>
                  <li className="flex items-center"><Crown className="h-4 w-4 text-spiritual-blue mr-2" />Inner Circle Guarantee: Your rate is locked for life</li>
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Churches */}
            <Card className="border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-200/20 to-gray-300/30 rounded-bl-full"></div>
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-xl text-gray-900 mb-2">Enterprise Churches</CardTitle>
                <p className="text-sm text-gray-600 mb-4">(500+ members)</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-2xl font-bold text-gray-700">Custom Pricing</span>
                </div>
                <p className="text-sm text-gray-600">(starting at $997/month)</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm mb-4">Tailored for large and multi-site ministries</p>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Advanced integrations and premium support</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Dedicated account management</li>
                  <li className="flex items-center"><Crown className="h-4 w-4 text-spiritual-blue mr-2" />Inner Circle Guarantee: Locked tier pricing when you join</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Fee Notice */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-warm-gold/20 p-6 max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-warm-gold/10 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-warm-gold" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">One-Time Onboarding Fee</h3>
            <p className="text-gray-600 text-center">
              A <span className="font-semibold text-warm-gold">$500 onboarding fee</span> applies to all tiers. This covers setup, training, and a smooth launch for your church.
            </p>
          </div>


          {/* Beta Timeline */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Beta Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Applications Open</h4>
                <p className="text-green-600 font-medium">Now</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Beta Launch</h4>
                <p className="text-blue-600 font-medium">October/November 2025</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Public Expansion</h4>
                <p className="text-purple-600 font-medium">2026</p>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-2 border-spiritual-blue/20 hover:border-spiritual-blue/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-spiritual-blue/20 transition-shadow duration-300">
                  <Crown className="h-8 w-8 text-spiritual-blue" />
                </div>
                <CardTitle className="text-xl text-gray-900">Early Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Be among the first to experience KingdomOps and influence feature development with direct feedback.
                </p>
              </CardContent>
            </Card>

            {/* Highlighted Inner Circle Guarantee */}
            <Card className="border-3 border-warm-gold hover:border-warm-gold/80 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group bg-gradient-to-br from-warm-gold/5 to-yellow-50/30 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-warm-gold to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  MOST IMPORTANT
                </div>
              </div>
              <CardHeader className="text-center pt-6">
                <div className="w-18 h-18 bg-warm-gold/15 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-warm-gold/30 transition-shadow duration-300">
                  <Crown className="h-9 w-9 text-warm-gold" />
                </div>
                <CardTitle className="text-xl text-gray-900 font-bold">Inner Circle Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center font-medium">
                  Lock in your church's tier pricing for life. Even if prices rise in the future, your church will always pay the rate you joined at. If your membership grows into a new size category, you'll simply move into that tier at its locked rate.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-400/20 transition-shadow duration-300">
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
          
          {/* Inner Circle Bonus - Narrower centered box */}
          <div className="max-w-md mx-auto mb-8">
            <Card className="border-2 border-warm-gold hover:border-warm-gold/80 transition-all duration-300 transform hover:scale-102 hover:shadow-xl group bg-gradient-to-br from-warm-gold/5 to-yellow-100/30">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-warm-gold/15 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-warm-gold/20 transition-shadow duration-300">
                  <Star className="h-8 w-8 text-warm-gold" />
                </div>
                <CardTitle className="text-xl text-gray-900 font-semibold">Inner Circle Bonus</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-700 text-lg leading-relaxed mb-3">
                  🎁 Bonus: 1-Year Subscription to <span className="font-bold text-warm-gold bg-warm-gold/10 px-2 py-1 rounded">The KingdomOps Brief</span>
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Your quarterly update on ministry innovation, AI, and church technology.
                </p>
                <div className="inline-block">
                  <span className="bg-gradient-to-r from-warm-gold to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Normally $97/year — included free when you join the Inner Circle.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button 
              onClick={() => setLocation("/church-signup")}
              className="bg-gradient-to-r from-spiritual-blue to-purple-700 text-white hover:from-purple-800 hover:to-spiritual-blue px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              data-testid="button-join-inner-circle"
            >
              <Crown className="mr-3 h-6 w-6" />
              Apply for Inner Circle Beta
            </Button>
            <p className="text-gray-600 text-sm mt-3">
              Join the founding members shaping the future of church technology
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>Beta Available Now</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Core Tools (Phase 1)
            </h2>
            <p className="text-lg text-gray-600">
              Essential foundation tools to organize, connect, and understand your church family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Keep your church connected with easy profiles, roles, and invitations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Settings className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Church Onboarding Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Guided onboarding for smooth launch with your leaders and members.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Administrative Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Clear analytics and insights designed for leaders at a glance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Professional Subdomain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Branded subdomain (yourchurch.kingdomops.org) for your members.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Phase 2: Building Connections */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              <span>Coming Soon</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Building Connections (Phase 2)
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced tools to track, engage, and connect with your members through every step of their journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Visitor Tracking & Follow-Up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Automated follow-up systems and personalized welcome processes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Check-In & Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Digital check-in systems and comprehensive attendance tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Online Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Foster discipleship with groups, discussions, and connection tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Event Registration & Calendars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Integrated calendars, registration, and automated reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Volunteer Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  Connect members to serving opportunities and coordinate volunteers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Phase 3: Growth & Equipping */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Crown className="h-4 w-4" />
              <span>Future Vision</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Growth & Equipping (Phase 3)
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The ultimate ministry toolkit with discipleship courses, financial management, and deep insights to grow your church's impact.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Featured: Custom Discipleship & Ministry LMS */}
            <Card className="border-2 border-purple-300 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-purple-50/50 to-white">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                  <BookOpen className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Custom Discipleship & Ministry Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center max-w-4xl mx-auto text-lg">
                  Transform how your church disciples with a built-in learning management system. Create, host, and deliver custom courses to equip leaders and grow members in their faith journey.
                </p>
              </CardContent>
            </Card>

            {/* Supporting Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Financial Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center text-sm">
                    Complete stewardship tools for donations, budgets, and reporting.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center text-sm">
                    Deep insights into growth patterns, engagement, and impact.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Multi-Site Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center text-sm">
                    Coordinate multiple locations with centralized oversight.
                  </p>
                </CardContent>
              </Card>
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
              <div className="bg-white rounded-xl shadow-lg border-2 border-spiritual-blue/20 p-6 relative transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-spiritual-blue/40 group">
                <div className="w-16 h-16 bg-spiritual-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-spiritual-blue/30 transition-shadow duration-300">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-spiritual-blue mb-2">📅 Beta Timeline</h3>
                <p className="text-sm text-gray-500 mb-4">Applications Open: Now</p>
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
              
              <div className="bg-white rounded-xl shadow-lg border-2 border-warm-gold/30 p-6 relative transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-warm-gold/60 group">
                <div className="w-16 h-16 bg-warm-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-warm-gold/30 transition-shadow duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-warm-gold mb-2">Growth & Expansion</h3>
                <p className="text-sm text-gray-500 mb-4">2026 (advanced tools, courses, analytics)</p>
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
              
              <div className="bg-white rounded-xl shadow-lg border-2 border-green-500/30 p-6 relative transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-green-500/60 group">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-green-500/30 transition-shadow duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-green-600 mb-2">Public Expansion</h3>
                <p className="text-sm text-gray-500 mb-4">2026</p>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li>• Inner Circle tier pricing locked in for life</li>
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
            <span className="text-warm-gold font-medium text-sm">Founding Inner Circle benefits available during Beta enrollment</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Inner Circle?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-2xl mx-auto px-4">
            Apply today to secure your church's place in the future of church management — with Inner Circle tier pricing locked in for life.
          </p>
          <Button
            onClick={() => setLocation("/church-signup")}
            size="lg"
            className="bg-white text-spiritual-blue hover:bg-gray-100 px-6 sm:px-8 py-4 sm:py-4 text-lg sm:text-lg font-semibold shadow-xl"
            data-testid="button-apply-inner-circle"
          >
            <span className="hidden sm:inline">Apply for Inner Circle Access</span>
            <span className="sm:hidden">Apply Now</span>
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}