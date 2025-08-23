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
    <Card className="relative overflow-hidden bg-gradient-to-br from-spiritual-blue/5 via-purple-50 to-warm-gold/10 border-spiritual-blue/20">
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-spiritual-blue">
            Complete Your Profile
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-spiritual-blue">
              {progress.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              {progress.completedSteps.length} of {progress.steps.length} steps
            </div>
          </div>
        </div>
        
        {/* Circular Progress Meter */}
        <div className="flex items-center justify-center my-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="2"
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
                <div className="text-2xl font-bold text-spiritual-blue">
                  {progress.percentage}%
                </div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {progress.steps.map((step) => {
            const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Circle;
            const action = STEP_ACTIONS[step.key as keyof typeof STEP_ACTIONS];
            
            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                  step.completed 
                    ? "bg-green-50 border-green-200 text-green-900" 
                    : "bg-white border-gray-200 hover:border-spiritual-blue/40 hover:bg-spiritual-blue/5 cursor-pointer"
                )}
                onClick={() => handleStepClick(step)}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    step.completed 
                      ? "bg-green-100 text-green-600" 
                      : "bg-spiritual-blue/10 text-spiritual-blue"
                  )}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className={cn(
                      "font-medium",
                      step.completed ? "line-through text-green-700" : "text-gray-900"
                    )}>
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
                    className="bg-spiritual-blue hover:bg-spiritual-blue/90 text-white"
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
        </div>

        {progress.percentage === 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <Crown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">You're all set!</h4>
                <p className="text-sm text-green-700">Welcome to the KingdomOps family.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}