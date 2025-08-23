import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Camera, User, BookOpen, Heart, Users, Crown, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface ProfileProgress {
  percentage: number;
  completedSteps: string[];
  steps: Array<{
    key: string;
    label: string;
    completed: boolean;
    weight: number;
    order: number;
  }>;
}

const STEP_ICONS = {
  profile_photo: Camera,
  basic_info: User,
  gifts_assessment: BookOpen,
  life_verse: Heart,
  join_group: Users,
};

const STEP_ACTIONS = {
  profile_photo: {
    label: "Upload Photo",
    route: "/profile"
  },
  basic_info: {
    label: "Complete Info", 
    route: "/profile"
  },
  gifts_assessment: {
    label: "Take Assessment",
    route: "/assessment"
  },
  life_verse: {
    label: "Add Verse",
    route: "/profile/life-verse"
  },
  join_group: {
    label: "Browse Groups",
    route: "/connect/groups"
  }
};

export function ProfileCompletionCard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: progress, isLoading } = useQuery<ProfileProgress>({
    queryKey: ['/api/profile/progress'],
  });

  const markStepMutation = useMutation({
    mutationFn: async (stepKey: string) => {
      return apiRequest(`/api/profile/steps/${stepKey}/complete`, 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Step completed!",
        description: data.message || "Step completed successfully!",
      });
      
      // Show confetti if reached 100%
      if (data.progress?.percentage === 100) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/profile/progress'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Don't render if no progress data or already at 100%
  if (isLoading || !progress || progress.percentage === 100) {
    return null;
  }

  const handleStepClick = (step: any) => {
    if (step.completed) return;
    
    const action = STEP_ACTIONS[step.key as keyof typeof STEP_ACTIONS];
    if (action?.route) {
      // For now, just navigate to the route (implement navigation logic)
      console.log(`Navigate to: ${action.route}`);
      
      // For demonstration, mark some steps as complete
      if (step.key === 'basic_info' || step.key === 'profile_photo') {
        markStepMutation.mutate(step.key);
      }
    }
  };

  return (
    <Card className="bg-gray-50 border-gray-200 shadow-sm">
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-spiritual-blue/10 to-warm-gold/10 backdrop-blur-sm z-10">
          <div className="text-center space-y-4 animate-pulse">
            <div className="flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-warm-gold animate-bounce" />
              <Crown className="h-8 w-8 text-spiritual-blue -ml-2" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-spiritual-blue">You're all set!</h3>
              <p className="text-lg text-gray-700">Welcome to the KingdomOps family!</p>
              <Badge className="bg-warm-gold text-spiritual-blue font-semibold px-4 py-1">
                Connected Member
              </Badge>
            </div>
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {progress.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              {progress.completedSteps.length} of {progress.steps.length} steps
            </div>
          </div>
        </div>
        
        {/* Circular Progress Indicator */}
        <div className="flex items-center justify-center my-8">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="3"
                strokeDasharray={`${progress.percentage}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#250A34" />
                  <stop offset="100%" stopColor="#EEBC4C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-spiritual-blue">
                  {progress.percentage}%
                </div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {progress.steps.map((step) => {
          const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Circle;
          const action = STEP_ACTIONS[step.key as keyof typeof STEP_ACTIONS];
          
          return (
            <div
              key={step.key}
              className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {step.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {step.weight}% of your profile
                  </div>
                </div>
              </div>
              
              {!step.completed && action && (
                <Button 
                  size="sm" 
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStepClick(step);
                  }}
                >
                  {action.label}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}