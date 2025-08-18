import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, User, Users, Calendar, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profileCompletionSchema, type ProfileCompletionData } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Force refresh user data on component mount to ensure we have latest data
  React.useEffect(() => {
    console.log("Profile component mounted, refreshing user data");
    queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  }, [queryClient]);

  const form = useForm<ProfileCompletionData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      displayName: user?.displayName || "",
      ageRange: user?.ageRange || undefined,
    },
  });

  // Reset form values when user data changes, but only when not editing
  React.useEffect(() => {
    if (user && !isEditing) {
      console.log("Resetting form with user data:", user);
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: user.displayName || "",
        ageRange: user.ageRange || undefined,
      });
    }
  }, [user, isEditing]); // Remove form from dependencies to prevent reset loops

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileCompletionData) => {
      const response = await apiRequest("POST", "/api/auth/complete-profile", data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      console.log("Profile update successful, updated user:", updatedUser);
      toast({
        title: "Profile updated!",
        description: "Your profile information has been successfully updated.",
      });
      // Clear cache and force fresh fetch
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Then update cache with fresh data
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update failed:", error);
    },
  });

  const onSubmit = (data: ProfileCompletionData) => {
    console.log("Form submitted with data:", data);
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    // Reset form to original values
    form.reset({
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      displayName: (user as any)?.displayName || "",
      ageRange: (user as any)?.ageRange || undefined,
    });
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Edit button clicked - entering edit mode");
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="mr-4"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex-shrink-0 flex items-center">
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">My Profile</h1>
                  {organization?.name && (
                    <p className="text-sm text-gray-600">{organization.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-spiritual-blue/10 p-4 rounded-full">
                  <User className="h-8 w-8 text-spiritual-blue" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display font-bold text-charcoal">
                Profile Information
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Manage your personal information and preferences.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Info Display */}
              <div className="bg-soft-cream p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {(user as any)?.email || "Not available"}
                </p>
                {organization?.name && (
                  <p className="text-sm text-gray-600">
                    <strong>Church:</strong> {organization.name}
                  </p>
                )}
              </div>

              <Form {...form}>
                <form onSubmit={isEditing ? form.handleSubmit(onSubmit) : (e) => e.preventDefault()} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-spiritual-blue" />
                            First Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your first name"
                              {...field}
                              disabled={!isEditing}
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
                          <FormLabel className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-spiritual-blue" />
                            Last Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your last name"
                              {...field}
                              disabled={!isEditing}
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
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-spiritual-blue" />
                          Display Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What would you like to be called?"
                            {...field}
                            disabled={!isEditing}
                            data-testid="input-display-name"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500">
                          This is how your name will appear in the app and results.
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ageRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-spiritual-blue" />
                          Age Range *
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-age-range">
                              <SelectValue placeholder="Select your age range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="18-25">18-25</SelectItem>
                            <SelectItem value="26-35">26-35</SelectItem>
                            <SelectItem value="36-45">36-45</SelectItem>
                            <SelectItem value="46-55">46-55</SelectItem>
                            <SelectItem value="56-65">56-65</SelectItem>
                            <SelectItem value="66+">66+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={handleEditClick}
                        className="bg-spiritual-blue text-white hover:bg-purple-800"
                        data-testid="button-edit-profile"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="submit"
                          disabled={updateMutation.isPending}
                          className="bg-spiritual-blue text-white hover:bg-purple-800"
                          data-testid="button-save-profile"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}