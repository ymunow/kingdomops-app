import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Clock, BarChart3, Users, Eye, HandHeart, Shield, Mountain, BellRing, Rocket, Home, Heart, Gift, BookOpen, Play } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const startAssessment = () => {
    if (isAuthenticated) {
      setLocation("/assessment");
    } else {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <h1 className="font-display font-bold text-xl text-charcoal">Kingdom Impact Training</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-charcoal" data-testid="text-username">
                    {(user as any)?.email || "User"}
                  </span>
                  <Button variant="outline" onClick={() => setLocation("/my-results")} data-testid="button-my-results">
                    My Results
                  </Button>
                  {(user as any)?.role === "ADMIN" && (
                    <Button variant="outline" onClick={() => setLocation("/admin")} data-testid="button-admin">
                      Admin
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-spiritual-blue text-white hover:bg-blue-700" 
                  onClick={handleLogin}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden" style={{
        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3')`
      }}>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-block p-4 bg-warm-gold/20 rounded-full mb-6">
              <Crown className="h-12 w-12 text-warm-gold" />
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              Discover Your{" "}
              <span className="text-warm-gold">Spiritual Gifts</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Uncover how God has uniquely equipped you to serve His Kingdom through our comprehensive 60-question assessment designed to reveal your top spiritual gifts and ministry fit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={startAssessment}
                className="bg-warm-gold text-spiritual-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 transition-colors"
                data-testid="button-start-assessment"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Assessment
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 text-lg bg-transparent hover:bg-white hover:text-spiritual-blue transition-colors"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <Clock className="h-12 w-12 text-warm-gold mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-white mb-2">15-20 Minutes</h3>
              <p className="text-white/80 text-sm">Complete assessment at your own pace</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <BarChart3 className="h-12 w-12 text-warm-gold mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-white mb-2">Detailed Results</h3>
              <p className="text-white/80 text-sm">Discover your top 3 spiritual gifts with scripture</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <Users className="h-12 w-12 text-warm-gold mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-white mb-2">Ministry Fit</h3>
              <p className="text-white/80 text-sm">Find where you can serve most effectively</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our assessment is designed to help you discover how God has uniquely gifted you for Kingdom service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-spiritual-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-spiritual-blue" />
              </div>
              <h3 className="font-display font-semibold text-xl text-charcoal mb-4">Take the Assessment</h3>
              <p className="text-gray-600 leading-relaxed">
                Answer 60 carefully crafted questions about your interests, abilities, and calling. Each question helps reveal your spiritual gift profile.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-warm-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-warm-gold" />
              </div>
              <h3 className="font-display font-semibold text-xl text-charcoal mb-4">Discover Your Gifts</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive your personalized results showing your top 3 spiritual gifts with detailed descriptions, scripture references, and practical applications.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-sage-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-sage-green" />
              </div>
              <h3 className="font-display font-semibold text-xl text-charcoal mb-4">Find Your Ministry</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized ministry recommendations based on your gifts, age group preferences, and interests to serve where you'll make the greatest impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Gifts Categories */}
      <section className="py-24 bg-soft-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-6">
              12 Spiritual Gifts Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our assessment evaluates your calling across these biblical spiritual gifts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Users className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Leadership</h3>
              </div>
              <p className="text-gray-600 text-sm">Organizing and directing people toward Kingdom goals</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <BookOpen className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Teaching</h3>
              </div>
              <p className="text-gray-600 text-sm">Explaining biblical truths in understandable ways</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Eye className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Wisdom</h3>
              </div>
              <p className="text-gray-600 text-sm">Providing insight and godly perspective</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Eye className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Prophetic</h3>
              </div>
              <p className="text-gray-600 text-sm">Discerning spiritual truth and God's will</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <HandHeart className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Exhortation</h3>
              </div>
              <p className="text-gray-600 text-sm">Encouraging and motivating others forward</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Shield className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Shepherding</h3>
              </div>
              <p className="text-gray-600 text-sm">Caring for and guiding spiritual growth</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Mountain className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Faith</h3>
              </div>
              <p className="text-gray-600 text-sm">Trusting God for the impossible</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <BellRing className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Evangelism</h3>
              </div>
              <p className="text-gray-600 text-sm">Sharing the Gospel effectively with others</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Rocket className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Apostleship</h3>
              </div>
              <p className="text-gray-600 text-sm">Starting new ministries and church planting</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Home className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Hospitality</h3>
              </div>
              <p className="text-gray-600 text-sm">Serving others with warmth and practical care</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Heart className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Mercy</h3>
              </div>
              <p className="text-gray-600 text-sm">Showing compassion to those who suffer</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <Gift className="h-6 w-6 text-spiritual-blue mr-3" />
                <h3 className="font-semibold text-charcoal">Giving</h3>
              </div>
              <p className="text-gray-600 text-sm">Contributing resources generously for Kingdom work</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}