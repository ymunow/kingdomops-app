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
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  Zap
} from "lucide-react";

export default function FeaturesPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-spiritual-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">KingdomOps</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-spiritual-blue"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/pricing")}
                className="text-gray-600 hover:text-spiritual-blue"
              >
                Pricing
              </Button>
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

      {/* Core Features Available Now */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>Available Now</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Core Tools for Today
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Start building stronger connections and better organization in your church today with these foundational tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-green-200 transition-shadow duration-300">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Spiritual Gifts Assessment & Ministry Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Discover and develop the unique gifts God has placed in your members. Our spiritual gifts assessment helps leaders place people where they can serve with joy and impact.
                </p>
              </CardContent>
            </Card>

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

            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group md:col-span-2 lg:col-span-1">
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

      {/* Coming Soon Phase 2 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              <span>Coming Soon - Phase 2</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enhanced Connection & Communication
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Phase 2 focuses on deepening relationships and streamlining communication across your church community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Online Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Foster discipleship and connection beyond Sunday with groups, discussions, and online community tools designed to bring people together throughout the week.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Advanced Communication Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Reach your church instantly with announcements, messaging, and ministry-wide communication tools that cut through the noise.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Event Planning & Coordination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Simplify church events with built-in planning, scheduling, and coordination tools that keep everyone aligned.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-blue-200 transition-shadow duration-300">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Multi-Role User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Empower leaders at every level with customizable permissions and access tailored to their role in the church.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Vision Phase 3 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Future Vision - Phase 3 Launch</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              A Complete Ministry Ecosystem
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Phase 3 completes the vision with advanced automation, deep insights, and comprehensive discipleship tools.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Featured: Custom Discipleship & Ministry LMS */}
            <Card className="border-2 border-purple-300 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group bg-gradient-to-br from-purple-50/50 to-white">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                  <BookOpen className="h-10 w-10 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Custom Discipleship & Ministry LMS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center max-w-4xl mx-auto text-lg">
                  Go beyond administration into discipleship. With our built-in learning management system, your church can create, host, and deliver its own discipleship and ministry training courses to equip leaders and grow members.
                </p>
              </CardContent>
            </Card>

            {/* Supporting Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <Mail className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Email Integration & Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Send automated reminders, follow-ups, and newsletters to keep members engaged without adding to your workload.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-purple-200 transition-shadow duration-300">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Advanced Analytics & Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    Get deeper insights into discipleship, engagement, and ministry growth with advanced reporting tools.
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
                    Inner Circle churches receive priority support and influence in shaping future development.
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