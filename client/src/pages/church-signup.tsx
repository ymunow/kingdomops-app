import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Church, Mail, Globe, MapPin, User, ArrowRight, Sparkles, CheckCircle, Users, Shield, Star, Heart, Phone } from "lucide-react";

const betaApplicationSchema = z.object({
  churchName: z.string().min(2, "Church name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter your church's full address"),
  description: z.string().min(10, "Please provide a brief description of your church"),
  memberCount: z.string().min(1, "Please select your church size"),
  currentSoftware: z.string().optional().or(z.literal("")),
  specificNeeds: z.string().min(10, "Please share your specific needs and goals")
});

type BetaApplicationData = z.infer<typeof betaApplicationSchema>;

export default function ChurchSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BetaApplicationData>({
    resolver: zodResolver(betaApplicationSchema),
    mode: "onChange",
    defaultValues: {
      churchName: "",
      contactEmail: "",
      contactPersonName: "",
      contactPhone: "",
      website: "",
      address: "",
      description: "",
      memberCount: "",
      currentSoftware: "",
      specificNeeds: ""
    }
  });

  const onSubmit = (data: BetaApplicationData) => {
    setIsSubmitting(true);
    
    // Simulate form submission delay for better UX
    setTimeout(() => {
      toast({
        title: "Application Submitted Successfully! 🎉",
        description: "We'll review your application and get back to you within 48 hours with next steps."
      });
      
      setIsSubmitting(false);
      
      // Reset form after successful submission
      form.reset();
      
      // Redirect to thank you or home page
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <Sparkles className="text-spiritual-blue h-8 w-8 mr-3" />
              <h1 className="font-display font-bold text-xl text-charcoal">KingdomOps</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setLocation("/features")}>Features</Button>
              <Button variant="ghost" onClick={() => setLocation("/pricing")}>Pricing</Button>
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-spiritual-blue hover:text-purple-700"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-spiritual-blue/5 via-purple-50/50 to-warm-gold/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-3xl mb-8 shadow-xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 text-spiritual-blue px-6 py-2 rounded-full text-sm font-bold mb-6">
              <Star className="h-4 w-4" />
              <span>EXCLUSIVE INNER CIRCLE BETA</span>
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-6">
              Join the Kingdom{" "}
              <span className="bg-gradient-to-r from-spiritual-blue via-purple-600 to-purple-700 bg-clip-text text-transparent">
                Revolution
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              Be among the first churches to experience the future of spiritual gifts discovery, 
              member engagement, and Kingdom-focused ministry placement.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mb-12">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-600" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span>Built by Church Leaders</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                <span>Beta Access Included</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left side - Benefits */}
            <div className="space-y-8">
              <Card className="bg-white/60 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-spiritual-blue/10 to-purple-700/10 pb-6">
                  <CardTitle className="text-2xl text-center text-gray-800">
                    🎯 What You'll Get as a Founding Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-spiritual-blue/20 to-purple-700/20 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-spiritual-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Biblical Spiritual Gifts Assessment</h3>
                      <p className="text-gray-600">60-question assessment covering 12 gift categories with detailed results and ministry recommendations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-warm-gold/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Globe className="h-6 w-6 text-warm-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Professional Church Domain</h3>
                      <p className="text-gray-600">Get yourchurch.kingdomops.app - a professional web presence for your congregation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Smart Ministry Matching</h3>
                      <p className="text-gray-600">AI-powered system that matches members with ministry opportunities based on their gifts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Church Analytics Dashboard</h3>
                      <p className="text-gray-600">Comprehensive insights into spiritual health, engagement, and Kingdom impact metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Founding Member Benefits */}
              <div className="bg-gradient-to-br from-spiritual-blue/5 to-purple-700/5 border-2 border-spiritual-blue/20 rounded-3xl p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-2xl mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Exclusive Founding Member Perks</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-spiritual-blue mr-3 flex-shrink-0" />
                    <span>Lifetime access to Inner Circle pricing (never increases)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-spiritual-blue mr-3 flex-shrink-0" />
                    <span>Direct input on feature development and roadmap</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-spiritual-blue mr-3 flex-shrink-0" />
                    <span>Priority customer support and training sessions</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-spiritual-blue mr-3 flex-shrink-0" />
                    <span>Early access to all new features and updates</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Application Form */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden sticky top-24">
              <CardHeader className="bg-gradient-to-r from-spiritual-blue/10 to-purple-700/10 pb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-2xl mb-4">
                    <Church className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Apply for Beta Access
                  </CardTitle>
                  <p className="text-gray-600 text-lg">
                    Join the exclusive Inner Circle founding members
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="churchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-semibold text-lg">
                            <Church className="h-5 w-5 mr-2" />
                            Church Name *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="First Baptist Church of Springfield" 
                              {...field} 
                              className="h-12 text-lg border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPersonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-gray-700 font-semibold">
                              <User className="h-4 w-4 mr-2" />
                              Contact Person *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Pastor John Smith" 
                                {...field} 
                                className="h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-gray-700 font-semibold">
                              <Phone className="h-4 w-4 mr-2" />
                              Phone Number *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(555) 123-4567" 
                                {...field} 
                                className="h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-semibold">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact Email *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="pastor@church.org" 
                              {...field} 
                              className="h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="memberCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-gray-700 font-semibold">
                              <Users className="h-4 w-4 mr-2" />
                              Church Size *
                            </FormLabel>
                            <FormControl>
                              <select 
                                {...field} 
                                className="w-full h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl px-3 bg-white"
                              >
                                <option value="">Select size</option>
                                <option value="1-50">1-50 members</option>
                                <option value="51-150">51-150 members</option>
                                <option value="151-300">151-300 members</option>
                                <option value="301-500">301-500 members</option>
                                <option value="500+">500+ members</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-gray-700 font-semibold">
                              <Globe className="h-4 w-4 mr-2" />
                              Website
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://www.church.org" 
                                {...field} 
                                className="h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-semibold">
                            <MapPin className="h-4 w-4 mr-2" />
                            Church Address *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123 Main Street, Springfield, IL 62701" 
                              {...field} 
                              className="h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentSoftware"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">
                            Current Church Management Software (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Planning Center, ChurchTrac, etc." 
                              {...field} 
                              className="h-11 border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Church Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your church's mission, community, and vision..."
                              className="min-h-[100px] border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specificNeeds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Specific Needs & Goals *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What challenges are you facing? What features would be most valuable to your church?"
                              className="min-h-[100px] border-2 border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-purple-700 hover:to-spiritual-blue text-white py-4 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting Application...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Apply for Inner Circle Access</span>
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </div>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-600">
                        Questions? Email us at{" "}
                        <a href="mailto:hello@kingdomops.app" className="text-spiritual-blue hover:underline font-semibold">
                          hello@kingdomops.app
                        </a>
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Join Forward-Thinking Church Leaders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-4xl font-bold text-spiritual-blue mb-2">500+</div>
              <p className="text-gray-600">Churches expressing interest</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">12</div>
              <p className="text-gray-600">Spiritual gift categories</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-warm-gold mb-2">60</div>
              <p className="text-gray-600">Assessment questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-warm-gold mr-3" />
              <h3 className="text-2xl font-bold">KingdomOps</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering churches to discover, deploy, and develop spiritual gifts for Kingdom impact.
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