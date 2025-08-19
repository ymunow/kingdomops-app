import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { ViewAsSwitcher } from "@/components/admin/view-as-switcher";
import { Crown, Users, BellRing, Gift, Shield, Church, Calendar, MessageSquare, Settings, Heart, BookOpen, ChevronDown, ChevronUp, Menu, X, User, LogOut, Star, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, signOutMutation } = useAuth();
  const isAuthenticated = !!user;
  const { organization } = useOrganization();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {/* Logo */}
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  {isAuthenticated && organization?.name ? organization.name : "KingdomOps"}
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-charcoal hidden xl:block" data-testid="text-username">
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
                  <Button variant="ghost" onClick={() => setLocation("/features")}>Features</Button>
                  <Button variant="ghost" onClick={() => setLocation("/pricing")}>Pricing</Button>
                  <Button variant="ghost">Contact</Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/church-signup")}
                    data-testid="button-church-signup"
                    className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                  >
                    <Church className="mr-2 h-4 w-4" />
                    Apply for Beta
                  </Button>
                  <Button 
                    className="bg-spiritual-blue text-white hover:bg-purple-800" 
                    onClick={handleLogin}
                    data-testid="button-signin"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="mobile-menu-button"
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 bg-white">
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* Enhanced User Profile Section */}
                    <div className="px-4 py-4 bg-gradient-to-r from-spiritual-blue/10 to-purple-100 rounded-xl mx-2 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-spiritual-blue rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-charcoal" data-testid="mobile-username">
                            {(user as any)?.firstName && (user as any)?.lastName 
                              ? `${(user as any).firstName} ${(user as any).lastName}`
                              : (user as any)?.displayName || (user as any)?.email || "User"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(user as any)?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                             (user as any)?.role === 'ORG_ADMIN' ? 'Church Admin' :
                             (user as any)?.role === 'ORG_LEADER' ? 'Church Leader' :
                             (user as any)?.role === 'GROUP_LEADER' ? 'Group Leader' :
                             'Member'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Main Navigation Items */}
                    <div className="space-y-2 mb-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-3 h-auto text-left hover:bg-spiritual-blue/10" 
                        onClick={() => {
                          setLocation("/dashboard");
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-dashboard"
                      >
                        <BarChart3 className="h-5 w-5 mr-3 text-spiritual-blue" />
                        <div>
                          <p className="font-medium">Dashboard</p>
                          <p className="text-xs text-gray-500">Your church overview</p>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-3 h-auto text-left hover:bg-blue-50" 
                        onClick={() => {
                          setLocation("/events");
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-events"
                      >
                        <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <p className="font-medium">Events</p>
                          <p className="text-xs text-gray-500">Church gatherings</p>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-3 h-auto text-left hover:bg-green-50" 
                        onClick={() => {
                          setLocation("/connect");
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-connect"
                      >
                        <Users className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <p className="font-medium">Serve</p>
                          <p className="text-xs text-gray-500">Ministry opportunities</p>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-3 h-auto text-left hover:bg-purple-50" 
                        onClick={() => {
                          setLocation("/gifts");
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-gifts"
                      >
                        <Gift className="h-5 w-5 mr-3 text-purple-600" />
                        <div>
                          <p className="font-medium">Spiritual Gifts</p>
                          <p className="text-xs text-gray-500">Your assessment results</p>
                        </div>
                      </Button>
                    </div>
                    
                    {/* Admin Section */}
                    {(user as any)?.role && ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"].includes((user as any).role) && (
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">Administration</p>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start py-3 h-auto text-left hover:bg-amber-50" 
                          onClick={() => {
                            setLocation("/admin-dashboard");
                            setIsMobileMenuOpen(false);
                          }}
                          data-testid="mobile-admin"
                        >
                          <Crown className="h-5 w-5 mr-3 text-amber-600" />
                          <div>
                            <p className="font-medium">Admin Dashboard</p>
                            <p className="text-xs text-gray-500">Church management</p>
                          </div>
                        </Button>
                        
                        {/* View As Switcher */}
                        <div className="px-2 mt-3">
                          <ViewAsSwitcher user={user} />
                        </div>
                      </div>
                    )}
                    
                    {/* Account Actions */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start py-3 h-auto text-left hover:bg-gray-50" 
                        onClick={() => {
                          setLocation("/profile");
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-profile"
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">Profile Settings</p>
                          <p className="text-xs text-gray-500">Manage your account</p>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start py-3 h-auto text-left border-red-200 text-red-600 hover:bg-red-50" 
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-logout"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <div>
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-red-500">Leave KingdomOps</p>
                        </div>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => {
                        setLocation("/features");
                        setIsMobileMenuOpen(false);
                      }}
                      data-testid="mobile-features"
                    >
                      Features
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => {
                        setLocation("/pricing");
                        setIsMobileMenuOpen(false);
                      }}
                      data-testid="mobile-pricing"
                    >
                      Pricing
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-testid="mobile-contact"
                    >
                      Contact
                    </Button>
                    
                    <div className="px-2 pt-2 border-t border-gray-100 space-y-3">
                      <Button 
                        variant="outline"
                        className="w-full border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                        onClick={() => {
                          setLocation("/church-signup");
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-church-signup"
                      >
                        <Church className="mr-2 h-4 w-4" />
                        Apply for Beta
                      </Button>
                      <Button 
                        className="w-full bg-spiritual-blue text-white hover:bg-purple-800" 
                        onClick={() => {
                          handleLogin();
                          setIsMobileMenuOpen(false);
                        }}
                        data-testid="mobile-signin"
                      >
                        Sign In
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-8 md:pt-16 pb-16 md:pb-32 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Main content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <span className="bg-spiritual-blue text-white px-3 py-1 rounded-full text-sm font-medium">BETA</span>
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight">
                The operating system for{" "}
                <span className="text-spiritual-blue">your church</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A suite of tools to help churches with communication, organization, and discipleship.
              </p>
              <Button
                onClick={() => setLocation("/church-signup")}
                className="bg-spiritual-blue text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-purple-800 transition-colors w-full sm:w-auto"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
            
            {/* Right side - Assessment card */}
            <div className="bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-2xl p-6 sm:p-8 text-white mt-8 lg:mt-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center lg:text-left">
                Discover Your Spiritual Gifts
              </h2>
              <p className="text-purple-100 mb-6 text-center lg:text-left">
                Uncover how God has uniquely equipped you through our comprehensive assessment.
              </p>
              <Button
                onClick={isAuthenticated ? startAssessment : () => setLocation("/join")}
                className="bg-warm-gold text-spiritual-blue px-6 py-3 font-semibold hover:bg-yellow-400 transition-colors w-full sm:w-auto"
                data-testid="button-start-assessment"
              >
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* One Platform Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            One platform for your ministry
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-12 sm:mb-16 max-w-3xl mx-auto">
            Streamline your church's operations with an integrated set of powerful tools.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 sm:gap-8">
            {/* Spiritual Gifts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:border-spiritual-blue/30 group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-spiritual-blue/20 transition-shadow duration-300">
                <Crown className="h-6 w-6 text-spiritual-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Spiritual Gifts</h3>
              <p className="text-gray-600 text-sm">
                Discover and develop member spiritual gifts through comprehensive assessments
              </p>
            </div>

            {/* Communications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:border-warm-gold/30 group">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-warm-gold/20 transition-shadow duration-300">
                <MessageSquare className="h-6 w-6 text-warm-gold" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Communications</h3>
              <p className="text-gray-600 text-sm">
                Streamline church communications with messaging, meetings, and announcements
              </p>
            </div>

            {/* Events */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:border-blue-600/30 group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-blue-600/20 transition-shadow duration-300">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Events</h3>
              <p className="text-gray-600 text-sm">
                Organize church events with powerful planning tools and member coordination
              </p>
            </div>

            {/* Admin Tools */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:border-green-600/30 group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-green-600/20 transition-shadow duration-300">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Tools</h3>
              <p className="text-gray-600 text-sm">
                Manage church operations with member directories and administrative tools
              </p>
            </div>

            {/* Online Community */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:border-purple-600/30 group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-purple-600/20 transition-shadow duration-300">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Online Community</h3>
              <p className="text-gray-600 text-sm">
                Foster member connections through groups, discussions, and community engagement
              </p>
            </div>

            {/* Discipleship LMS */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:border-indigo-600/30 group">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-indigo-600/20 transition-shadow duration-300">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discipleship LMS</h3>
              <p className="text-gray-600 text-sm">
                Create, host, and deliver custom discipleship and ministry training courses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why KingdomOps Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Why KingdomOps?
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-3xl mx-auto">
            Equip your church with the resources it needs to better communicate, organize and disciple its members - all from a single platform.
          </p>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-spiritual-blue" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Built by Ministry Leaders
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            KingdomOps was built by ministry leaders who understand the challenges of communication, discipleship, and administration. Our mission is to equip churches with the tools they need to thrive.
          </p>
          <div className="border-t border-gray-300 w-16 mx-auto mb-6"></div>
          <blockquote className="text-lg text-spiritual-blue italic mb-2">
            "Let all things be done decently and in order."
          </blockquote>
          <p className="text-sm text-gray-500">1 Corinthians 14:40</p>
        </div>
      </section>

      {/* KingdomOps Inner Circle Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-100 to-purple-200 text-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-spiritual-blue" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            The KingdomOps Inner Circle
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
            KingdomOps is currently being piloted by churches across the United States. Inner Circle members are pioneers investing early to shape the tools that will disciple, equip, and connect churches worldwide. Limited spots are available. Apply today to secure your church's place and lifetime pricing when KingdomOps fully launches, including all future upgrades and add-ons.
          </p>
          <Button
            onClick={() => setLocation("/church-signup")}
            className="bg-spiritual-blue text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-purple-800 transition-colors w-full sm:w-auto"
            data-testid="button-apply-beta"
          >
            Apply for Beta Access
          </Button>
        </div>
      </section>

      {/* Vision & Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Our Vision & Impact
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Our vision is to see churches more connected, leaders better equipped, and members discipled with tools designed for Kingdom impact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-spiritual-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Connected</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-spiritual-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Equipped</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-spiritual-blue/10 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-spiritual-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Discipled</h3>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "How do churches join the beta?",
                answer: "Apply to join the KingdomOps Inner Circle, our exclusive beta program for early churches."
              },
              {
                question: "What do Inner Circle members receive?",
                answer: "Early access to all features, direct input into development, priority support, and a locked-in lifetime subscription price once KingdomOps fully launches — covering all future upgrades and add-ons."
              },
              {
                question: "Why is there an application process?",
                answer: "We're keeping the Inner Circle small and focused so we can work closely with each church to shape KingdomOps together."
              },
              {
                question: "What happens after beta?",
                answer: "Your church transitions seamlessly into a full subscription plan while keeping the same locked-in lifetime price secured during beta."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stay Up to Date Section */}
      <section className="py-20 bg-gradient-to-br from-spiritual-blue to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay up to date</h2>
          <p className="text-lg text-purple-100 mb-8">
            Get the latest updates about KingdomOps delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-warm-gold text-base"
            />
            <Button
              className="bg-warm-gold text-spiritual-blue px-6 py-3 font-semibold hover:bg-yellow-400 transition-colors whitespace-nowrap text-base"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-warm-gold mr-3" />
              <h3 className="text-2xl font-bold">KingdomOps</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Equip your church with the resources it needs to better communicate, organize and disciple its members for Kingdom impact.
            </p>
            <p className="text-gray-500 text-sm">
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