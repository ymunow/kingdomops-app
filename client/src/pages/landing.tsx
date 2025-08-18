import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { ViewAsSwitcher } from "@/components/admin/view-as-switcher";
import { Crown, Users, BellRing, Gift, Shield, Church, Calendar, MessageSquare, Settings } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, signOutMutation } = useAuth();
  const isAuthenticated = !!user;
  const { organization } = useOrganization();

  const handleLogin = () => {
    setLocation("/auth");
  };

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  const startAssessment = () => {
    setLocation("/assessment");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  {isAuthenticated && organization?.name ? organization.name : "KingdomOps"}
                </h1>
                {isAuthenticated && organization?.name && (
                  <p className="text-sm text-gray-600">Church Management Platform</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-charcoal hidden md:block" data-testid="text-username">
                    {(user as any)?.displayName || (user as any)?.email || "User"}
                  </span>
                  <Button variant="outline" onClick={() => setLocation("/profile")} data-testid="button-my-profile">
                    Features
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/my-results")} data-testid="button-my-results">
                    Pricing
                  </Button>
                  {(user as any)?.role && ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"].includes((user as any).role) && (
                    <Button variant="outline" onClick={() => setLocation("/admin-dashboard")} data-testid="button-admin">
                      Contact
                    </Button>
                  )}
                  <ViewAsSwitcher user={user} />
                  <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost">Features</Button>
                  <Button variant="ghost">Pricing</Button>
                  <Button variant="ghost">Contact</Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/church-signup")}
                    data-testid="button-church-signup"
                    className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                  >
                    <Church className="mr-2 h-4 w-4" />
                    For Churches
                  </Button>
                  <Button 
                    className="bg-spiritual-blue text-white hover:bg-purple-800" 
                    onClick={handleLogin}
                    data-testid="button-signin"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Main content */}
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6">
                The operating system for{" "}
                <span className="text-spiritual-blue">your church</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                A suite of tools to help churches with communication, organization, and discipleship.
              </p>
              <Button
                onClick={() => setLocation("/church-signup")}
                className="bg-spiritual-blue text-white px-8 py-4 text-lg font-semibold hover:bg-purple-800 transition-colors"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
            
            {/* Right side - Assessment card */}
            <div className="bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">
                Discover Your Spiritual Gifts
              </h2>
              <p className="text-purple-100 mb-6">
                Uncover how God has uniquely equipped you through our comprehensive assessment.
              </p>
              <Button
                onClick={isAuthenticated ? startAssessment : () => setLocation("/join")}
                className="bg-warm-gold text-spiritual-blue px-6 py-3 font-semibold hover:bg-yellow-400 transition-colors"
                data-testid="button-start-assessment"
              >
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* One Platform Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            One platform for your ministry
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Streamline your church's operations with an integrated set of powerful tools.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Spiritual Gifts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-spiritual-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spiritual Gifts</h3>
              <p className="text-gray-600 text-sm">
                Discover and develop member spiritual gifts through comprehensive assessments
              </p>
            </div>

            {/* Communications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-warm-gold" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communications</h3>
              <p className="text-gray-600 text-sm">
                Streamline church communications with messaging, meetings, and announcements
              </p>
            </div>

            {/* Events */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
              <p className="text-gray-600 text-sm">
                Organize church events with powerful planning tools and member coordination
              </p>
            </div>

            {/* Admin Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Tools</h3>
              <p className="text-gray-600 text-sm">
                Manage church operations with member directories and administrative tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why KingdomOps Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why KingdomOps?
              </h2>
              <p className="text-lg text-purple-100 mb-8">
                Equip your church with the resources it needs to better communicate, organize and disciple its members - all from a single platform.
              </p>
              
              {/* Church Logos */}
              <div className="flex items-center space-x-8 opacity-80">
                <div className="text-white font-semibold">🏛️ FairHaven</div>
                <div className="text-white font-semibold">🏛️ RJCC</div>
                <div className="text-white font-semibold">🏛️ HOPE</div>
                <div className="text-white font-semibold">🏛️ ALLEGRO</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Stay up to date</h3>
              <p className="text-purple-100 mb-6">
                Get the latest updates about KingdomOps delivered to your inbox.
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-warm-gold"
                />
                <Button
                  className="bg-warm-gold text-spiritual-blue px-6 py-3 font-semibold hover:bg-yellow-400 transition-colors"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              Powered by{" "}
              <a 
                href="https://www.graymusicmedia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-warm-gold hover:text-yellow-400 transition-colors"
              >
                Gray Music Media Group
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}