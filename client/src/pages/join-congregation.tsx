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
import { Church, Users, Key, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const joinCongregationSchema = z.object({
  inviteCode: z.string()
    .min(3, "Church invite code is required")
    .max(20, "Invalid church code format")
    .transform(str => str.toUpperCase()),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56-65", "66+"], {
    required_error: "Please select an age range"
  })
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
  const [currentStep, setCurrentStep] = useState<'invite' | 'details'>('invite');

  const form = useForm<JoinCongregationData>({
    resolver: zodResolver(joinCongregationSchema),
    defaultValues: {
      inviteCode: "",
      firstName: "",
      lastName: "",
      email: "",
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
      toast({
        title: "Welcome to the congregation!",
        description: `You've successfully joined ${organization?.name}. Please sign in to start your spiritual gifts assessment.`
      });
      // Redirect to login for authentication
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-spiritual-blue rounded-full mb-4">
              <Church className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Your Church
            </h1>
            <p className="text-gray-600">
              Enter your church's invite code to get started
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center flex items-center justify-center">
                <Key className="h-5 w-5 mr-2" />
                Church Invite Code
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                            className="text-center text-lg font-mono tracking-wider"
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
                              className="w-full bg-spiritual-blue hover:bg-purple-800"
                              data-testid="button-continue-to-details"
                            >
                              Continue to Registration
                              <ArrowRight className="ml-2 h-4 w-4" />
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

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have a church code?{" "}
              <button 
                onClick={() => setLocation("/")}
                className="text-spiritual-blue hover:underline font-medium"
              >
                Contact your church leadership
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: User Details Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Church Info Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-spiritual-blue rounded-full mb-4">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join {organization?.name}
          </h1>
          <p className="text-gray-600">
            Complete your profile to join this congregation and discover your spiritual gifts
          </p>
        </div>

        {/* Church Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
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

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">What happens next?</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• You'll join {organization?.name}'s congregation</li>
                        <li>• Sign in and take the spiritual gifts assessment</li>
                        <li>• Discover your top 3 spiritual gifts</li>
                        <li>• Get matched with ministry opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('invite')}
                    className="flex-1"
                    data-testid="button-back-to-invite"
                  >
                    ← Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-spiritual-blue hover:bg-purple-800" 
                    disabled={isSubmitting || signupMutation.isPending}
                    data-testid="button-join-congregation"
                  >
                    {isSubmitting || signupMutation.isPending ? (
                      "Joining..."
                    ) : (
                      <>
                        Join {organization?.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <button 
              onClick={() => setLocation("/")}
              className="text-spiritual-blue hover:underline font-medium"
            >
              Contact your church leadership
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}