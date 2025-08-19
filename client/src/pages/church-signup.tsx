import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Church, Mail, Globe, MapPin, User, ArrowRight, Crown, CheckCircle, Users, Shield } from "lucide-react";
import { SubdomainSelector, SubdomainPreview } from "@/components/subdomain/subdomain-selector";

const churchSignupSchema = z.object({
  churchName: z.string().min(2, "Church name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter your church's full address"),
  description: z.string().min(10, "Please provide a brief description of your church"),
  subdomain: z.string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(30, "Subdomain must be less than 30 characters")
    .regex(/^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/, "Invalid subdomain format")
});

type ChurchSignupData = z.infer<typeof churchSignupSchema>;

export default function ChurchSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChurchSignupData>({
    resolver: zodResolver(churchSignupSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      churchName: "",
      contactEmail: "",
      contactPersonName: "",
      website: "",
      address: "",
      description: "",
      subdomain: ""
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: ChurchSignupData) => {
      const response = await fetch("/api/organizations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register church");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Store registration data temporarily for post-login instructions
      sessionStorage.setItem('church_registration_success', JSON.stringify({
        churchName: data.organization.name,
        inviteCode: data.inviteCode,
        contactEmail: data.ownerInfo.email,
        organizationId: data.organization.id
      }));
      
      toast({
        title: "Church registered successfully!",
        description: `${data.organization.name} has been registered. Redirecting you to sign in...`
      });
      
      // Redirect to welcome page instead of auto-login for testing
      setTimeout(() => {
        setLocation("/church-admin-welcome");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ChurchSignupData) => {
    setIsSubmitting(true);
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
                onClick={() => setLocation("/api/login")}
                className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Benefits */}
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-6">
                Set up your church on{" "}
                <span className="text-spiritual-blue">KingdomOps</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Join hundreds of churches using KingdomOps to discover spiritual gifts, coordinate ministries, and build stronger communities.
              </p>
              
              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Complete spiritual gifts assessment platform</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Professional subdomain: yourchurch.kingdomops.app</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Member management and ministry matching</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Comprehensive admin dashboard and analytics</span>
                </div>
              </div>

              {/* Beta Badge */}
              <div className="pt-8 border-t border-gray-200">
                <div className="bg-spiritual-blue/10 border border-spiritual-blue/20 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <span className="bg-spiritual-blue text-white px-3 py-1 rounded-full text-sm font-medium mr-3">BETA</span>
                    <span className="text-spiritual-blue font-medium">Join our beta program</span>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Be among the first churches to experience KingdomOps and help shape the future of church management.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Registration Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-spiritual-blue rounded-full mb-4">
                  <Church className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Register Your Church
                </h2>
                <p className="text-gray-600">
                  Get started with your church management platform
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="churchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium">
                          <Church className="h-4 w-4 mr-2" />
                          Church Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="First Baptist Church of Springfield" 
                            {...field} 
                            data-testid="input-church-name"
                            className="border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
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
                          <FormLabel className="flex items-center text-gray-700 font-medium">
                            <User className="h-4 w-4 mr-2" />
                            Contact Person
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Pastor John Smith" 
                              {...field} 
                              data-testid="input-contact-person"
                              className="border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-gray-700 font-medium">
                            <Mail className="h-4 w-4 mr-2" />
                            Contact Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="pastor@church.org" 
                              {...field} 
                              data-testid="input-contact-email"
                              className="border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SubdomainSelector
                            value={field.value || ''}
                            onChange={field.onChange}
                            error={form.formState.errors.subdomain?.message}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-medium">
                          <MapPin className="h-4 w-4 mr-2" />
                          Church Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 Main Street, Springfield, IL 62701" 
                            {...field} 
                            data-testid="input-address"
                            className="border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
                          />
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
                        <FormLabel className="flex items-center text-gray-700 font-medium">
                          <Globe className="h-4 w-4 mr-2" />
                          Website (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.church.org" 
                            {...field} 
                            data-testid="input-website"
                            className="border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
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
                        <FormLabel className="text-gray-700 font-medium">Church Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your church's mission, size, and community..."
                            className="min-h-[80px] border-gray-200 focus:border-spiritual-blue focus:ring-spiritual-blue"
                            {...field} 
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-spiritual-blue hover:bg-purple-800 text-white py-3 text-lg font-semibold" 
                    disabled={isSubmitting || signupMutation.isPending}
                    data-testid="button-register-church"
                  >
                    {isSubmitting || signupMutation.isPending ? (
                      "Creating Your Church Platform..."
                    ) : (
                      <>
                        Get Started with KingdomOps
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button 
                        type="button"
                        onClick={() => setLocation("/api/login")}
                        className="text-spiritual-blue hover:underline font-medium"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything your church needs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              KingdomOps provides a complete platform for managing your church's spiritual development and operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Spiritual Gifts */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-spiritual-blue" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Spiritual Gifts Assessment</h3>
              <p className="text-gray-600">
                Help members discover their God-given gifts through our comprehensive 60-question assessment covering 12 spiritual gift categories.
              </p>
            </div>

            {/* Member Management */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Member Management</h3>
              <p className="text-gray-600">
                Organize your congregation with detailed member profiles, ministry placements, and comprehensive church directory management.
              </p>
            </div>

            {/* Admin Dashboard */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin Dashboard</h3>
              <p className="text-gray-600">
                Track participation, analyze results, and gain insights into your church's spiritual health with detailed analytics and reporting.
              </p>
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