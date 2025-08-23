import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Crown, User, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { profileCompletionSchema, type ProfileCompletionData } from "@shared/schema";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  userEmail?: string;
}

export default function ProfileCompletionModal({ isOpen, userEmail }: ProfileCompletionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileCompletionData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      ageRange: undefined,
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: ProfileCompletionData) => {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile completed!",
        description: "Welcome! You can now take your spiritual gifts assessment.",
      });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile completion failed:", error);
    },
  });

  const onSubmit = (data: ProfileCompletionData) => {
    completeMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-spiritual-blue/10 p-4 rounded-full">
              <Crown className="h-8 w-8 text-spiritual-blue" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-display font-bold text-charcoal">
            Complete Your Profile
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Complete your profile to unlock your serving matches and community connections.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {userEmail && (
              <div className="bg-soft-cream p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-spiritual-blue text-white hover:bg-purple-800"
              disabled={completeMutation.isPending}
              data-testid="button-complete-profile"
            >
              {completeMutation.isPending ? "Completing..." : "Complete Profile & Continue"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            * Required fields - all information helps us provide you with the most accurate assessment results.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}