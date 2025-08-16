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
import { Church, Mail, Globe, MapPin, User, ArrowRight } from "lucide-react";

const churchSignupSchema = z.object({
  churchName: z.string().min(2, "Church name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter your church's full address"),
  description: z.string().min(10, "Please provide a brief description of your church"),
  subdomain: z.string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(20, "Subdomain must be less than 20 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens")
    .optional()
});

type ChurchSignupData = z.infer<typeof churchSignupSchema>;

export default function ChurchSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChurchSignupData>({
    resolver: zodResolver(churchSignupSchema),
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
      toast({
        title: "Church registered successfully!",
        description: `Welcome ${data.organization.name}! Please sign in with your account to access the admin dashboard.`
      });
      // Redirect to login so they can authenticate with their account
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000); // Wait 2 seconds to show the success message
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-spiritual-blue rounded-full mb-4">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register Your Church
          </h1>
          <p className="text-gray-600">
            Set up your church's spiritual gifts assessment platform
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">Church Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="churchName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center">
                          <Church className="h-4 w-4 mr-2" />
                          Church Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="First Baptist Church of Springfield" 
                            {...field} 
                            data-testid="input-church-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPersonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Contact Person
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Pastor John Smith" 
                            {...field} 
                            data-testid="input-contact-person"
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
                        <FormLabel className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="pastor@church.org" 
                            {...field} 
                            data-testid="input-contact-email"
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
                        <FormLabel className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Website (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.church.org" 
                            {...field} 
                            data-testid="input-website"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Church Identifier (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="fwc-columbia" 
                            {...field} 
                            data-testid="input-subdomain"
                          />
                        </FormControl>
                        <div className="text-xs text-gray-600 mt-1">
                          A unique identifier for your church (for organization purposes only)
                        </div>
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
                      <FormLabel className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Church Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main Street, Springfield, IL 62701" 
                          {...field} 
                          data-testid="input-address"
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
                      <FormLabel>Church Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your church's mission, size, and community..."
                          className="min-h-[100px]"
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
                  className="w-full bg-spiritual-blue hover:bg-purple-800" 
                  disabled={isSubmitting || signupMutation.isPending}
                  data-testid="button-register-church"
                >
                  {isSubmitting || signupMutation.isPending ? (
                    "Registering..."
                  ) : (
                    <>
                      Register Church
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
            Already have a church account?{" "}
            <button 
              onClick={() => setLocation("/api/login")}
              className="text-spiritual-blue hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}