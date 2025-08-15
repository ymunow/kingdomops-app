import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { toast } = useToast();
  const { user, login, signup, logout, isLoginLoading, isSignupLoading } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await signup(formData);
        toast({ title: "Success", description: "Account created successfully!" });
      } else {
        await login({ email: formData.email, password: formData.password });
        toast({ title: "Success", description: "Signed in successfully!" });
      }
      setShowAuthDialog(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    }
  };

  const startAssessment = () => {
    if (user) {
      setLocation("/assessment");
    } else {
      setIsSignup(true);
      setShowAuthDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <h1 className="font-display font-bold text-xl text-charcoal">Kingdom Impact Training</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-charcoal" data-testid="text-username">
                    {user?.name || user?.email}
                  </span>
                  {user?.role === "ADMIN" && (
                    <Button variant="outline" onClick={() => setLocation("/admin")} data-testid="button-admin">
                      Admin
                    </Button>
                  )}
                  <Button variant="outline" onClick={logout} data-testid="button-logout">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-spiritual-blue text-white hover:bg-blue-700" data-testid="button-signin">
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{isSignup ? "Create Account" : "Sign In"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAuth} className="space-y-4">
                      {isSignup && (
                        <div>
                          <Label htmlFor="name">Name (optional)</Label>
                          <Input
                            id="name"
                            data-testid="input-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          data-testid="input-email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          data-testid="input-password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          type="submit" 
                          disabled={isLoginLoading || isSignupLoading}
                          data-testid="button-submit"
                        >
                          {isSignup 
                            ? (isSignupLoading ? "Creating Account..." : "Create Account")
                            : (isLoginLoading ? "Signing In..." : "Sign In")
                          }
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsSignup(!isSignup)}
                          data-testid="button-toggle-auth"
                        >
                          {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-spiritual-blue to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"}}></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="text-6xl text-warm-gold mb-6">🙏</div>
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl mb-6 leading-tight">
            Discover Your 
            <span className="text-warm-gold"> Spiritual Gifts</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Uncover how God has uniquely equipped you to serve His Kingdom through our comprehensive 
            60-question assessment designed to reveal your top spiritual gifts and ministry fit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              className="bg-warm-gold text-spiritual-blue px-8 py-4 text-lg hover:bg-yellow-400 transform hover:scale-105"
              onClick={startAssessment}
              data-testid="button-start-assessment"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Assessment
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Clock className="text-warm-gold h-8 w-8 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">15-20 Minutes</h3>
                <p className="opacity-90">Complete assessment at your own pace</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <BarChart3 className="text-warm-gold h-8 w-8 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Detailed Results</h3>
                <p className="opacity-90">Discover your top 3 spiritual gifts with scripture</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="text-warm-gold h-8 w-8 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Ministry Fit</h3>
                <p className="opacity-90">Find where you can serve most effectively</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our assessment is designed to help you discover how God has uniquely gifted you for Kingdom service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-spiritual-blue/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-spiritual-blue h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-4">Take the Assessment</h3>
              <p className="text-gray-600 leading-relaxed">
                Answer 60 carefully crafted questions about your interests, abilities, and calling. 
                Each question helps reveal your spiritual gift profile.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-warm-gold/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Eye className="text-warm-gold h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-4">Discover Your Gifts</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive your personalized results showing your top 3 spiritual gifts with detailed 
                descriptions, scripture references, and practical applications.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-sage-green/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Heart className="text-sage-green h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-4">Find Your Ministry</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized ministry recommendations based on your gifts, age group preferences, 
                and interests to serve where you'll make the greatest impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Gifts Preview */}
      <section className="py-20 bg-gradient-to-r from-soft-cream to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-charcoal mb-4">
              12 Spiritual Gifts Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our assessment evaluates your calling across these biblical spiritual gifts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {spiritualGifts.map((gift, index) => (
              <Card key={index} className="bg-white hover:shadow-md transition-shadow border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <gift.icon className="text-spiritual-blue h-6 w-6 mr-3" />
                    <h3 className="font-semibold text-lg">{gift.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{gift.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
