import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Heart, 
  Users, 
  Settings, 
  BarChart3, 
  Globe, 
  MessageCircle, 
  Calendar, 
  UserCheck, 
  Mail, 
  TrendingUp, 
  HeadphonesIcon,
  DollarSign,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Crown,
  Church
} from "lucide-react";

export default function FeaturesPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation("/")}>
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">KingdomOps</h1>
                <p className="text-sm text-gray-600">Church Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setLocation("/features")}>Features</Button>
              <Button variant="ghost" onClick={() => setLocation("/pricing")}>Pricing</Button>
              <Button variant="ghost">Contact</Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/church-signup")}
                className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                data-testid="button-church-signup"
              >
                <Church className="mr-2 h-4 w-4" />
                Apply for Beta
              </Button>
              <Button 
                className="bg-spiritual-blue text-white hover:bg-purple-800" 
                onClick={() => setLocation("/auth")}
                data-testid="button-signin"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Features Built for the Church
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            KingdomOps equips your church with the tools it needs to disciple, organize, and connect your members — all in one platform.
          </p>
        </div>
      </section>

      {/* Phase 1: Core Tools */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>Beta Available Now</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Core Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Essential foundation tools to organize, connect, and understand your church family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Keep your church connected with easy profiles, roles, and invitations that make organization simple.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Settings className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Church Onboarding Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Quickly set up your church on KingdomOps with guided onboarding that ensures a smooth launch for your leaders and members.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Administrative Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Get clarity with basic analytics and a clean dashboard designed to give leaders insight at a glance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Professional Church Subdomain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  A branded, secure subdomain for your church (yourchurch.kingdomops.app) creates a professional online home for your members.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Phase 2: Building Connections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              <span>Coming Soon</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Building Connections
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
                <CardTitle className="text-xl text-gray-900">Visitor Tracking & Follow-Up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Never lose track of visitors with automated follow-up systems and personalized welcome processes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Check-In & Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Streamline Sunday mornings with digital check-in systems and comprehensive attendance tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Online Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Foster discipleship beyond Sunday with groups, discussions, and member connection tools.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Event Registration & Calendars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Manage events seamlessly with integrated calendars, registration, and automated reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group md:col-span-2 lg:col-span-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Volunteer Scheduling & Serving Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Connect members to serving opportunities and streamline volunteer coordination across ministries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Phase 3: Growth & Equipping */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Future Vision</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Growth & Equipping
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
                  <CardTitle className="text-xl text-gray-900">Advanced Financial Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Comprehensive giving platform with online donations, campaigns, text-to-give, and detailed financial reporting.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Expanded Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Deep insights into discipleship progress, member engagement, ministry effectiveness, and church growth patterns.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <HeadphonesIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Priority Support & Feature Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Inner Circle churches receive dedicated support and direct influence in shaping future development.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            One Platform for Your Ministry
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            From spiritual growth to communication and community, KingdomOps brings everything your church needs into one place.
          </p>
          <Button
            onClick={() => setLocation("/church-signup")}
            className="bg-warm-gold text-spiritual-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 transition-colors inline-flex items-center space-x-2"
            data-testid="button-apply-access"
          >
            <span>Apply for Inner Circle Access</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}