import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Clock, BarChart3, Users, CheckCircle, Play, BookOpen, Eye, HandHeart, Shield, Mountain, BellRing, Rocket, Home, Heart, Gift } from "lucide-react";

const spiritualGifts = [
  { name: "Leadership", icon: Users, description: "Organizing and directing people toward Kingdom goals" },
  { name: "Teaching", icon: BookOpen, description: "Explaining biblical truths in understandable ways" },
  { name: "Wisdom", icon: Eye, description: "Providing insight and godly perspective" },
  { name: "Prophetic", icon: Eye, description: "Discerning spiritual truth and God's will" },
  { name: "Exhortation", icon: HandHeart, description: "Encouraging and motivating others forward" },
  { name: "Shepherding", icon: Shield, description: "Caring for and guiding spiritual growth" },
  { name: "Faith", icon: Mountain, description: "Trusting God for the impossible" },
  { name: "Evangelism", icon: BellRing, description: "Sharing the Gospel effectively with others" },
  { name: "Apostleship", icon: Rocket, description: "Starting new ministries and church planting" },
  { name: "Hospitality", icon: Home, description: "Serving others with warmth and practical care" },
  { name: "Mercy", icon: Heart, description: "Showing compassion to those who suffer" },
  { name: "Giving", icon: Gift, description: "Contributing resources generously for Kingdom work" },
];

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
    <div className="min-h-screen bg-soft-cream">
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
                    {user?.email || "User"}
                  </span>
                  {user?.role === "ADMIN" && (
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
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-spiritual-blue via-blue-700 to-blue-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 animate-fade-in">
              Discover Your{" "}
              <span className="text-warm-gold">Spiritual Gifts</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 animate-fade-in">
              Take our comprehensive assessment to uncover how God has uniquely equipped you to serve His Kingdom and make an eternal impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
              <Button
                onClick={startAssessment}
                className="bg-warm-gold text-spiritual-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 shadow-warm-lg"
                data-testid="button-start-assessment"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Your Assessment
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-spiritual-blue"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-6">
              Why Take This Assessment?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our scientifically-designed assessment helps you understand your unique spiritual gifts and how to use them effectively in ministry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-spiritual-lg transition-all duration-300 animate-scale-in">
              <CardContent className="pt-6">
                <Clock className="text-spiritual-blue h-16 w-16 mb-6 mx-auto" />
                <h3 className="font-display font-semibold text-xl text-charcoal mb-4">Quick & Comprehensive</h3>
                <p className="text-gray-600">
                  Complete assessment in 15-20 minutes with 60 carefully crafted questions covering all major spiritual gifts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-warm-lg transition-all duration-300 animate-scale-in">
              <CardContent className="pt-6">
                <BarChart3 className="text-warm-gold h-16 w-16 mb-6 mx-auto" />
                <h3 className="font-display font-semibold text-xl text-charcoal mb-4">Detailed Results</h3>
                <p className="text-gray-600">
                  Get your top 3 spiritual gifts with detailed explanations, biblical foundations, and ministry recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-sage-lg transition-all duration-300 animate-scale-in">
              <CardContent className="pt-6">
                <CheckCircle className="text-sage-green h-16 w-16 mb-6 mx-auto" />
                <h3 className="font-display font-semibold text-xl text-charcoal mb-4">Actionable Insights</h3>
                <p className="text-gray-600">
                  Receive practical ministry suggestions and next steps to begin using your gifts for Kingdom impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Spiritual Gifts Grid */}
      <section className="py-24 bg-soft-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-6">
              The 12 Spiritual Gifts We Assess
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Based on Romans 12, 1 Corinthians 12, Ephesians 4, and 1 Peter 4, we evaluate these biblically-based spiritual gifts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spiritualGifts.map((gift, index) => {
              const IconComponent = gift.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-spiritual transition-all duration-300 animate-fade-in">
                  <CardContent className="pt-0">
                    <div className="flex items-start space-x-4">
                      <div className="bg-spiritual-blue/10 p-3 rounded-full flex-shrink-0">
                        <IconComponent className="text-spiritual-blue h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg text-charcoal mb-2">{gift.name}</h3>
                        <p className="text-gray-600 text-sm">{gift.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-spiritual-blue to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Ready to Discover Your Calling?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join thousands who have discovered their spiritual gifts and found their place in God's Kingdom. Your unique calling awaits.
          </p>
          <Button
            onClick={startAssessment}
            className="bg-warm-gold text-spiritual-blue px-12 py-6 text-xl font-semibold hover:bg-yellow-400 shadow-warm-lg"
            data-testid="button-cta-assessment"
          >
            <Play className="mr-3 h-6 w-6" />
            Take the Assessment Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
              <Crown className="text-warm-gold h-8 w-8 mr-3" />
              <h3 className="font-display font-bold text-xl">Kingdom Impact Training</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering believers to discover and deploy their spiritual gifts for Kingdom impact.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Kingdom Impact Training. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}