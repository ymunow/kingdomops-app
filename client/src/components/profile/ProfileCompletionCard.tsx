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
      const response = await apiRequest('POST', `/api/profile/steps/${stepKey}/complete`);
      return response.json();
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
      // For testing purposes, mark all steps as complete when clicked
      console.log(`Navigate to: ${action.route}`);
      markStepMutation.mutate(step.key);
    }
  };

  return (
    <Card className="bg-gray-50 border-gray-200 shadow-sm relative">
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-50">
          <div className="text-center space-y-8 max-w-md mx-auto px-6">
            {/* Confetti emoji */}
            <div className="text-6xl animate-bounce">🎉</div>
            
            {/* Main heading */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">Congratulations!</h2>
              <p className="text-lg text-gray-600">
                You've completed your profile and unlocked the{" "}
                <span className="font-semibold">Connected Member</span> badge.
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gray-900 h-3 rounded-full w-full transition-all duration-1000" />
              </div>
              <p className="text-lg font-semibold text-green-600">100% Complete</p>
            </div>
            
            {/* Connected Member badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-6 py-3 rounded-full">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Connected Member</span>
            </div>
            
            {/* Action button */}
            <Button 
              onClick={() => setShowConfetti(false)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg"
            >
              Discover Serving Opportunities
            </Button>
          </div>
          
          {/* Animated confetti particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: '24px'
                }}
              >
                {['🎊', '✨', '🎉', '⭐'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
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
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 w-[140px]"
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