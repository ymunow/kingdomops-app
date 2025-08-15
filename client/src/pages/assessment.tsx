import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { QuestionCard } from "@/components/assessment/question-card";
import type { Question, AssessmentState } from "@shared/schema";

interface StartAssessmentResponse {
  id: string;
  userId: string;
  versionId: string;
  startedAt: string;
}

const ageGroupOptions = [
  "Children (0-12)",
  "Youth (13-17)", 
  "Young Adults (18-35)",
  "Adults (36-55)",
  "Seniors (56+)",
  "All Ages"
];

const ministryInterestOptions = [
  "Small Group Leadership",
  "Event Planning",
  "Discipleship & Mentoring",
  "Creative Arts",
  "Music & Worship",
  "Children's Ministry",
  "Youth Ministry",
  "Outreach & Evangelism",
  "Pastoral Care",
  "Administration",
  "Missions",
  "Community Service"
];

export default function Assessment() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = questions, 1 = age groups, 2 = ministry interests, 3 = review
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [ministryInterests, setMinistryInterests] = useState<string[]>([]);
  const [responseId, setResponseId] = useState<string>("");

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("assessment_progress");
    if (saved) {
      try {
        const state: AssessmentState = JSON.parse(saved);
        setCurrentStep(state.currentStep);
        setCurrentQuestionIndex(0); // Reset to beginning of questions
        setAnswers(state.answers);
        setAgeGroups(state.ageGroups);
        setMinistryInterests(state.ministryInterests);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Save progress
  const saveProgress = () => {
    const state: AssessmentState = {
      currentStep,
      answers,
      ageGroups,
      ministryInterests,
    };
    localStorage.setItem("assessment_progress", JSON.stringify(state));
    toast({ title: "Progress saved", description: "Your answers have been saved locally." });
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to take the assessment.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, authLoading, setLocation, toast]);

  // Fetch questions
  const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/assessment/questions"],
    enabled: !!user,
  });

  // Start assessment mutation
  const startAssessmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
    onSuccess: (data: StartAssessmentResponse) => {
      setResponseId(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start assessment",
        variant: "destructive",
      });
    },
  });

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async () => {
      if (!responseId) {
        throw new Error("No response ID available");
      }
      const response = await fetch(`/api/assessment/${responseId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          ageGroups,
          ministryInterests,
        }),
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      localStorage.removeItem("assessment_progress");
      toast({
        title: "Assessment submitted!",
        description: "Your results are being processed. Check your email for a detailed report.",
      });
      setLocation(`/results/${responseId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    },
  });

  // Start assessment on mount
  useEffect(() => {
    if (user && !responseId) {
      startAssessmentMutation.mutate();
    }
  }, [user]);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (questions) {
        setCurrentQuestionIndex(questions.length - 1);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitAssessmentMutation.mutate();
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const totalAnswered = Object.keys(answers).length;
  const questionsProgress = questions ? (totalAnswered / questions.length) * 100 : 0;
  const overallProgress = currentStep === 0 
    ? questionsProgress * 0.7 
    : 70 + (currentStep - 1) * 10 + (currentStep === 3 ? 20 : 0);

  if (authLoading || questionsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cream">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Assessment Unavailable</h2>
            <p className="text-gray-600 mb-4">
              We're unable to load the assessment questions right now. Please try again later.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-6 w-6 mr-2" />
              <h1 className="font-display font-bold text-2xl text-charcoal">Spiritual Gifts Assessment</h1>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep === 0 ? (
                <span data-testid="text-question-progress">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              ) : (
                <span data-testid="text-step-progress">
                  Step {currentStep + 1} of 4
                </span>
              )}
            </div>
          </div>
          
          <Progress value={overallProgress} className="h-3 mb-4" data-testid="progress-overall" />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span className={currentStep === 0 ? "font-medium text-spiritual-blue" : ""}>
              Assessment Questions
            </span>
            <span className={currentStep === 1 ? "font-medium text-spiritual-blue" : ""}>
              Age Groups & Interests
            </span>
            <span className={currentStep === 2 ? "font-medium text-spiritual-blue" : ""}>
              Ministry Interests
            </span>
            <span className={currentStep === 3 ? "font-medium text-spiritual-blue" : ""}>
              Review & Submit
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-12 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {currentStep === 0 && currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedValue={answers[currentQuestion.id]}
              onAnswerChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          )}

          {currentStep === 1 && (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="font-display font-semibold text-2xl text-charcoal mb-4">
                    Age Group Preferences
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Which age groups do you feel called to serve? (Select all that apply)
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ageGroupOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${option}`}
                          checked={ageGroups.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAgeGroups([...ageGroups, option]);
                            } else {
                              setAgeGroups(ageGroups.filter(ag => ag !== option));
                            }
                          }}
                          data-testid={`checkbox-age-${option}`}
                        />
                        <label 
                          htmlFor={`age-${option}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="font-display font-semibold text-2xl text-charcoal mb-4">
                    Ministry Interests
                  </h2>
                  <p className="text-gray-600 mb-6">
                    What areas of ministry interest you most? (Select all that apply)
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ministryInterestOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ministry-${option}`}
                          checked={ministryInterests.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMinistryInterests([...ministryInterests, option]);
                            } else {
                              setMinistryInterests(ministryInterests.filter(mi => mi !== option));
                            }
                          }}
                          data-testid={`checkbox-ministry-${option}`}
                        />
                        <label 
                          htmlFor={`ministry-${option}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="font-display font-semibold text-2xl text-charcoal mb-4">
                    Review & Submit
                  </h2>
                  <p className="text-gray-600">
                    Please review your responses before submitting your assessment.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-charcoal mb-2">Assessment Responses</h3>
                    <p className="text-gray-600">
                      Questions answered: {totalAnswered} of {questions?.length || 0}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg text-charcoal mb-2">Age Group Preferences</h3>
                    <p className="text-gray-600">
                      {ageGroups.length > 0 ? ageGroups.join(", ") : "None selected"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg text-charcoal mb-2">Ministry Interests</h3>
                    <p className="text-gray-600">
                      {ministryInterests.length > 0 ? ministryInterests.join(", ") : "None selected"}
                    </p>
                  </div>
                  
                  {totalAnswered < (questions?.length || 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ You haven't answered all questions. You can still submit, but for the most accurate results, 
                        consider going back to complete all questions.
                      </p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitAssessmentMutation.isPending}
                      className="bg-spiritual-blue hover:bg-purple-800 px-8 py-3"
                      data-testid="button-submit-assessment"
                    >
                      {submitAssessmentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Assessment"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? previousQuestion : previousStep}
              disabled={currentStep === 0 && currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={saveProgress}
                data-testid="button-save-progress"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Progress
              </Button>
              
              {currentStep < 3 && (
                <Button
                  onClick={currentStep === 0 ? nextQuestion : nextStep}
                  disabled={false} // Allow progression for testing
                  className="bg-spiritual-blue hover:bg-purple-800"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Dots for Questions */}
          {currentStep === 0 && (
            <div className="flex justify-center mt-8 space-x-2 flex-wrap">
              {questions?.slice(0, Math.min(20, questions?.length || 0)).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentQuestionIndex 
                      ? "bg-spiritual-blue" 
                      : answers[questions[index]?.id] 
                        ? "bg-sage-green" 
                        : "bg-gray-300 hover:bg-spiritual-blue"
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                  data-testid={`dot-question-${index}`}
                />
              ))}
              {(questions?.length || 0) > 20 && (
                <span className="text-gray-400 text-sm">...</span>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
