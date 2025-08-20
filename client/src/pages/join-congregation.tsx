import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Church, Users, Key, ArrowRight, CheckCircle, AlertCircle, Crown } from "lucide-react";

const joinCongregationSchema = z.object({
  inviteCode: z.string()
    .min(3, "Church invite code is required")
    .max(20, "Invalid church code format")
    .transform(str => str.toUpperCase()),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56-65", "66+"], {
    required_error: "Please select an age range"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type JoinCongregationData = z.infer<typeof joinCongregationSchema>;

interface OrganizationInfo {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
}

export default function JoinCongregation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'invite' | 'details' | 'success'>('invite');

  const form = useForm<JoinCongregationData>({
    resolver: zodResolver(joinCongregationSchema),
    defaultValues: {
      inviteCode: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      ageRange: "26-35"
    }
  });

  const inviteCode = form.watch("inviteCode");

  // Fetch organization info when invite code is entered
  const { data: organization, isLoading: orgLoading, error: orgError } = useQuery({
    queryKey: ["/api/organizations/invite", inviteCode],
    queryFn: async () => {
      if (!inviteCode || inviteCode.length < 3) return null;
      const response = await fetch(`/api/organizations/invite/${inviteCode}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Church code not found. Please check the code and try again.");
        }
        throw new Error("Failed to lookup church");
      }
      return response.json();
    },
    enabled: Boolean(inviteCode && inviteCode.length >= 3),
    retry: false
  });

  const signupMutation = useMutation({
    mutationFn: async (data: JoinCongregationData) => {
      const response = await fetch("/api/congregation/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join church");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      setCurrentStep('success');
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: JoinCongregationData) => {
    if (!organization?.id) return;
    
    setIsSubmitting(true);
    signupMutation.mutate(data);
  };

  const handleInviteCodeContinue = () => {
    if (organization) {
      setCurrentStep('details');
    }
  };

  if (currentStep === 'invite') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    KingdomOps
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => setLocation("/features")}>Features</Button>
                <Button variant="ghost" onClick={() => setLocation("/pricing")}>Pricing</Button>
                <Button 
                  onClick={() => setLocation("/church-signup")}
                  className="bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-purple-700 hover:to-spiritual-blue text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Apply for Beta
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center p-4 pt-16">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-2xl mb-6 shadow-lg">
                <Church className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-spiritual-blue to-purple-700 bg-clip-text text-transparent mb-3">
                Join Your Church
              </h1>
              <p className="text-gray-600 text-lg">
                Enter your church's invite code to connect with your congregation
              </p>
            </div>

            <Card className="bg-white/70 backdrop-blur-md shadow-2xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-spiritual-blue/10 to-purple-700/10 border-b border-purple-200/30">
                <CardTitle className="text-2xl text-center flex items-center justify-center text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-warm-gold/20 to-yellow-300/20 rounded-full mr-3">
                    <Key className="h-6 w-6 text-warm-gold" />
                  </div>
                  Church Invite Code
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="inviteCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., FBC2024" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase());
                              }}
                              className="text-center text-2xl font-mono tracking-widest bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 focus:border-spiritual-blue rounded-xl h-16 shadow-inner"
                              data-testid="input-invite-code"
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-sm text-gray-600">
                            Get this code from your church leadership
                          </div>
                        </FormItem>
                      )}
                    />

                    {inviteCode && inviteCode.length >= 3 && (
                      <div className="mt-4">
                        {orgLoading && (
                          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-blue-800">Looking up church...</span>
                          </div>
                        )}

                        {orgError && (
                          <div className="flex items-center p-4 bg-red-50 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-800 text-sm">{orgError.message}</span>
                          </div>
                        )}

                        {organization && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center mb-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">Church Found!</span>
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {organization.name}
                              </h3>
                              {organization.description && (
                                <p className="text-gray-600 text-sm mb-3">
                                  {organization.description}
                                </p>
                              )}
                              <Button 
                                type="button"
                                onClick={handleInviteCodeContinue}
                                className="w-full bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-purple-700 hover:to-spiritual-blue text-white shadow-lg hover:shadow-xl transition-all duration-300 h-14 text-lg rounded-xl"
                                data-testid="button-continue-to-details"
                              >
                                Continue to Registration
                                <ArrowRight className="ml-3 h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="text-center mt-6 space-y-3">
              <p className="text-sm text-gray-600">
                Don't have a church code?{" "}
                <button 
                  onClick={() => setLocation("/church-signup")}
                  className="text-spiritual-blue hover:underline font-medium"
                >
                  Apply for Inner Circle beta
                </button>
              </p>
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                <p>You can also visit your church's direct link:</p>
                <p className="font-medium">yourchurch.kingdomops.org</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success Page
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    KingdomOps
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center p-4 pt-16">
          <div className="w-full max-w-2xl text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-8 shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-6">
              Welcome to {organization?.name}!
            </h1>
            
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-green-200/50 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                  <Church className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Created Successfully!</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200/50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500 rounded-full mt-1">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a4 4 0 005.66 0L21 11M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 mb-2">Check Your Email</p>
                    <p className="text-gray-700 text-sm">
                      We've sent a confirmation link to your email address. Please click the link to verify your account before signing in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">What's Next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-spiritual-blue to-purple-700 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Verify your email address</p>
                      <p className="text-gray-600 text-sm">Click the confirmation link we just sent you</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-spiritual-blue to-purple-700 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sign in and take your spiritual gifts assessment</p>
                      <p className="text-gray-600 text-sm">Discover your God-given gifts and connect with ministry opportunities</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-spiritual-blue to-purple-700 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Get matched with serving opportunities</p>
                      <p className="text-gray-600 text-sm">Connect with ministries that align with your gifts and interests</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-purple-700 hover:to-spiritual-blue text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg rounded-xl w-full md:w-auto"
                data-testid="button-go-to-signin"
              >
                Go to Sign In
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              
              <div className="text-gray-600 text-sm">
                <p>Didn't receive the email? Check your spam folder or </p>
                <button className="text-spiritual-blue hover:underline font-medium">
                  contact your church administrator
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: User Details Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  KingdomOps
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setLocation("/features")}>Features</Button>
              <Button variant="ghost" onClick={() => setLocation("/pricing")}>Pricing</Button>
              <Button 
                onClick={() => setLocation("/church-signup")}
                className="bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-purple-700 hover:to-spiritual-blue text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Apply for Beta
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4 pt-12">
        <div className="w-full max-w-2xl">
          {/* Church Info Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-spiritual-blue to-purple-700 rounded-2xl mb-6 shadow-lg">
              <Church className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-spiritual-blue to-purple-700 bg-clip-text text-transparent mb-3">
              Join {organization?.name}
            </h1>
            <p className="text-gray-600 text-lg">
              Complete your profile to connect with your congregation and discover your spiritual gifts
            </p>
          </div>

          {/* Church Details Card */}
          <Card className="mb-8 bg-white/70 backdrop-blur-md shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sage-green/10 to-green-500/10 border-b border-green-200/30">
              <CardTitle className="text-xl flex items-center justify-center text-gray-800">
                <div className="p-2 bg-gradient-to-r from-sage-green/20 to-green-400/20 rounded-full mr-3">
                  <CheckCircle className="h-6 w-6 text-sage-green" />
                </div>
                Church Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {organization?.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Key className="h-4 w-4 mr-1" />
                    Church Code: <span className="font-mono ml-1">{organization?.inviteCode}</span>
                  </div>
                  {organization?.description && (
                    <p className="text-gray-600">{organization.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Details Form */}
          <Card className="bg-white/70 backdrop-blur-md shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-spiritual-blue/10 to-purple-700/10 border-b border-purple-200/30">
              <CardTitle className="text-2xl flex items-center justify-center text-gray-800">
                <div className="p-2 bg-gradient-to-r from-spiritual-blue/20 to-purple-700/20 rounded-full mr-3">
                  <Users className="h-6 w-6 text-spiritual-blue" />
                </div>
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John" 
                              {...field} 
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Smith" 
                              {...field} 
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john.smith@email.com" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a secure password" 
                              {...field} 
                              data-testid="input-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your password" 
                              {...field} 
                              data-testid="input-confirm-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="ageRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-age-range">
                              <SelectValue placeholder="Select your age range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="18-25">18-25 years old</SelectItem>
                            <SelectItem value="26-35">26-35 years old</SelectItem>
                            <SelectItem value="36-45">36-45 years old</SelectItem>
                            <SelectItem value="46-55">46-55 years old</SelectItem>
                            <SelectItem value="56-65">56-65 years old</SelectItem>
                            <SelectItem value="66+">66+ years old</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-gradient-to-r from-spiritual-blue/10 to-purple-700/10 p-6 rounded-xl border border-purple-200/30">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gradient-to-r from-spiritual-blue/20 to-purple-700/20 rounded-full">
                        <CheckCircle className="h-5 w-5 text-spiritual-blue" />
                      </div>
                      <div className="text-gray-800">
                        <p className="font-semibold mb-3 text-lg">What happens next?</p>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-spiritual-blue rounded-full mr-3"></div>
                            You'll join {organization?.name}'s congregation
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-spiritual-blue rounded-full mr-3"></div>
                            Sign in and take the spiritual gifts assessment
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-spiritual-blue rounded-full mr-3"></div>
                            Discover your top 3 spiritual gifts
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-spiritual-blue rounded-full mr-3"></div>
                            Get matched with ministry opportunities
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('invite')}
                      className="flex-1 h-12 text-lg border-2 border-gray-300 hover:border-spiritual-blue rounded-xl"
                      data-testid="button-back-to-invite"
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-purple-700 hover:to-spiritual-blue text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg rounded-xl" 
                      disabled={isSubmitting || signupMutation.isPending}
                      data-testid="button-join-congregation"
                    >
                      {isSubmitting || signupMutation.isPending ? (
                        "Joining..."
                      ) : (
                        <>
                          Join {organization?.name}
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Need help?{" "}
              <button 
                onClick={() => setLocation("/")}
                className="text-spiritual-blue hover:underline font-medium transition-colors duration-200"
              >
                Return to homepage
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}