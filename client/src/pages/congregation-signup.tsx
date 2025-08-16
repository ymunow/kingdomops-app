import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
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
import { Church, Users, MapPin, Globe, ArrowRight, CheckCircle } from "lucide-react";

const congregationSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56-65", "66+"], {
    required_error: "Please select an age range"
  })
});

type CongregationSignupData = z.infer<typeof congregationSignupSchema>;

interface OrganizationInfo {
  id: string;
  name: string;
  description?: string;
  website?: string;
}

export default function CongregationSignup() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/join/:orgId");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orgId = params?.orgId;

  // Fetch organization info
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["/api/organizations/join-info", orgId],
    queryFn: async () => {
      if (!orgId) throw new Error("No organization ID provided");
      const response = await fetch(`/api/organizations/${orgId}/join-info`);
      if (!response.ok) throw new Error("Church not found");
      return response.json();
    },
    enabled: !!orgId
  });

  const form = useForm<CongregationSignupData>({
    resolver: zodResolver(congregationSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      ageRange: "26-35"
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: CongregationSignupData & { organizationId: string }) => {
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
      toast({
        title: "Welcome to the congregation!",
        description: `You've successfully joined ${organization?.name}. You can now take the spiritual gifts assessment.`
      });
      setLocation("/assessment");
    },
    onError: (error) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CongregationSignupData) => {
    if (!organization?.id) return;
    
    setIsSubmitting(true);
    signupMutation.mutate({
      ...data,
      organizationId: organization.id
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading church information...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Church className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Church Not Found</h1>
          <p className="text-gray-600 mb-6">
            The church you're looking for doesn't exist or the link is invalid.
          </p>
          <Button onClick={() => setLocation("/")} variant="outline">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Church Info Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-spiritual-blue rounded-full mb-4">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join {organization.name}
          </h1>
          <p className="text-gray-600">
            Complete your profile to join this congregation and discover your spiritual gifts
          </p>
        </div>

        {/* Church Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Church className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {organization.name}
                </h3>
                {organization.description && (
                  <p className="text-gray-600 mb-3">{organization.description}</p>
                )}
                {organization.website && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <a 
                      href={organization.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signup Form */}
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
                        <li>• You'll join {organization.name}'s congregation</li>
                        <li>• Take the spiritual gifts assessment (60 questions)</li>
                        <li>• Discover your top 3 spiritual gifts</li>
                        <li>• Get matched with ministry opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-spiritual-blue hover:bg-purple-800" 
                  disabled={isSubmitting || signupMutation.isPending}
                  data-testid="button-join-congregation"
                >
                  {isSubmitting || signupMutation.isPending ? (
                    "Joining..."
                  ) : (
                    <>
                      Join {organization.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <button 
              onClick={() => window.location.href = `mailto:${organization.name.toLowerCase().replace(/\s+/g, '')}@church.org`}
              className="text-spiritual-blue hover:underline font-medium"
            >
              Contact the church
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}