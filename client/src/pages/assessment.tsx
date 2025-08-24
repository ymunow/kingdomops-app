import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { QuestionCard } from "@/components/assessment/question-card";
import NaturalAbilitiesStep from "@/components/assessment/natural-abilities-step";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
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
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollDirection = useScrollDirection();
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = questions, 1 = natural abilities, 2 = age groups, 3 = ministry interests, 4 = review
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [ministryInterests, setMinistryInterests] = useState<string[]>([]);
  const [naturalAbilities, setNaturalAbilities] = useState<string[]>([]);
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
        setNaturalAbilities(state.naturalAbilities || []);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Auto-save progress (silent)
  const autoSaveProgress = () => {
    const state: AssessmentState = {
      currentStep,
      answers,
      ageGroups,
      ministryInterests,
      naturalAbilities,
    };
    localStorage.setItem("assessment_progress", JSON.stringify(state));
  };

  // Manual save progress (with notification)
  const saveProgress = () => {
    autoSaveProgress();
    toast({ title: "Progress saved", description: "Your answers have been saved locally." });
  };

  // Auto-save whenever answers, step, or other data changes
  useEffect(() => {
    autoSaveProgress();
  }, [currentStep, answers, ageGroups, ministryInterests, naturalAbilities]);

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
      const response = await apiRequest("POST", "/api/assessment/start");
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
      const response = await apiRequest("POST", `/api/assessment/${responseId}/submit`, {
        answers,
        ageGroups,
        ministryInterests,
        naturalAbilities,
      });
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
    if (currentStep < 4) {
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
    ? questionsProgress * 0.5 
    : 50 + (currentStep * 10) + (currentStep === 4 ? 10 : 0);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-spiritual-blue to-blue-600 p-3 rounded-xl shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl text-charcoal bg-gradient-to-r from-charcoal to-gray-700 bg-clip-text text-transparent">
                  Spiritual Gifts Assessment
                </h1>
                <p className="text-base text-gray-600 mt-2 font-medium">
                  {organization?.name ? `Discover your spiritual gifts within ${organization.name}` : "KingdomOps"}
                </p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">
                {currentStep === 0 ? (
                  <span data-testid="text-question-progress" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-spiritual-blue rounded-full animate-pulse"></div>
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  </span>
                ) : (
                  <span data-testid="text-step-progress" className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-spiritual-blue rounded-full animate-pulse"></div>
                    <span>Step {currentStep + 1} of 5</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <Progress value={overallProgress} className="h-4 rounded-full bg-gray-100 shadow-inner" data-testid="progress-overall" />
              <div className="absolute inset-0 bg-gradient-to-r from-spiritual-blue/20 to-blue-500/20 rounded-full" style={{ width: `${overallProgress}%` }}></div>
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {[
                { step: 0, label: "Questions", icon: "📝", color: "from-purple-500 to-purple-600" },
                { step: 1, label: "Natural Abilities", icon: "✨", color: "from-blue-500 to-blue-600" },
                { step: 2, label: "Age Groups", icon: "👥", color: "from-green-500 to-green-600" },
                { step: 3, label: "Ministry Interests", icon: "⛪", color: "from-orange-500 to-orange-600" },
                { step: 4, label: "Review & Submit", icon: "📋", color: "from-red-500 to-red-600" }
              ].map(({ step, label, icon, color }) => (
                <div key={step} className={`text-center p-3 rounded-xl transition-all duration-300 transform ${
                  currentStep === step 
                    ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105 border-2 border-white` 
                    : currentStep > step 
                      ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md scale-100"
                      : "bg-white/60 backdrop-blur-sm text-gray-500 border border-gray-200 hover:bg-white/80"
                }`}>
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-xs font-medium leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-12 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
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
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
              <CardContent className="p-10">
                <NaturalAbilitiesStep
                  selectedAbilities={naturalAbilities}
                  onAbilitiesChange={setNaturalAbilities}
                  onNext={nextStep}
                  onBack={previousStep}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
              <CardContent className="p-10">
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 p-2 rounded-lg">
                      <span className="text-white text-lg">👥</span>
                    </div>
                    <h2 className="font-display font-bold text-3xl text-charcoal">
                      Age Group Preferences
                    </h2>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Which age groups do you feel called to serve? Select all that resonate with your heart for ministry.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ageGroupOptions.map((option) => (
                      <div key={option} className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        ageGroups.includes(option) 
                          ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]"
                          : "border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-50/50"
                      }`} onClick={() => {
                        if (ageGroups.includes(option)) {
                          setAgeGroups(ageGroups.filter(ag => ag !== option));
                        } else {
                          setAgeGroups([...ageGroups, option]);
                        }
                      }}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`age-${option}`}
                            checked={ageGroups.includes(option)}
                            onCheckedChange={() => {}} // Handled by parent div click
                            data-testid={`checkbox-age-${option}`}
                            className="pointer-events-none"
                          />
                          <label 
                            htmlFor={`age-${option}`} 
                            className="text-base font-medium text-charcoal cursor-pointer flex-1"
                          >
                            {option}
                          </label>
                          {ageGroups.includes(option) && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2"></div>
              <CardContent className="p-10">
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-lg">
                      <span className="text-white text-lg">⛪</span>
                    </div>
                    <h2 className="font-display font-bold text-3xl text-charcoal">
                      Ministry Interests
                    </h2>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    What areas of ministry spark your passion? Select all the ministries where you feel God's calling.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ministryInterestOptions.map((option) => (
                      <div key={option} className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        ministryInterests.includes(option) 
                          ? "border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]"
                          : "border-gray-200 bg-white/50 hover:border-orange-300 hover:bg-orange-50/50"
                      }`} onClick={() => {
                        if (ministryInterests.includes(option)) {
                          setMinistryInterests(ministryInterests.filter(mi => mi !== option));
                        } else {
                          setMinistryInterests([...ministryInterests, option]);
                        }
                      }}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`ministry-${option}`}
                            checked={ministryInterests.includes(option)}
                            onCheckedChange={() => {}} // Handled by parent div click
                            data-testid={`checkbox-ministry-${option}`}
                            className="pointer-events-none"
                          />
                          <label 
                            htmlFor={`ministry-${option}`} 
                            className="text-base font-medium text-charcoal cursor-pointer flex-1"
                          >
                            {option}
                          </label>
                          {ministryInterests.includes(option) && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 h-2"></div>
              <CardContent className="p-10">
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="bg-gradient-to-br from-red-400 to-red-600 p-3 rounded-xl">
                      <span className="text-white text-2xl">📋</span>
                    </div>
                    <h2 className="font-display font-bold text-4xl text-charcoal">
                      Review & Submit
                    </h2>
                  </div>
                  <p className="text-gray-600 text-lg">
                    You're almost done! Please review your responses before discovering your spiritual gifts.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <span className="text-white text-sm">📝</span>
                      </div>
                      <h3 className="font-bold text-xl text-charcoal">Assessment Questions</h3>
                    </div>
                    <p className="text-gray-700 text-lg">
                      <span className="font-semibold text-purple-600">{totalAnswered}</span> of <span className="font-semibold">{questions?.length || 0}</span> questions completed
                    </p>
                    <div className="w-full bg-white rounded-full h-2 mt-3">
                      <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(totalAnswered / (questions?.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <span className="text-white text-sm">✨</span>
                      </div>
                      <h3 className="font-bold text-xl text-charcoal">Natural Abilities</h3>
                    </div>
                    <p className="text-gray-700 text-lg">
                      <span className="font-semibold text-blue-600">{naturalAbilities.length}</span> abilities selected
                    </p>
                    {naturalAbilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {naturalAbilities.slice(0, 3).map((ability, idx) => (
                          <span key={idx} className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {ability.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                        {naturalAbilities.length > 3 && (
                          <span className="bg-blue-300 text-blue-800 text-xs px-2 py-1 rounded-full">
                            +{naturalAbilities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <span className="text-white text-sm">👥</span>
                      </div>
                      <h3 className="font-bold text-xl text-charcoal">Age Groups</h3>
                    </div>
                    <p className="text-gray-700">
                      {ageGroups.length > 0 ? (
                        <span className="text-sm">{ageGroups.join(", ")}</span>
                      ) : (
                        <span className="text-gray-500 italic">None selected</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <span className="text-white text-sm">⛪</span>
                      </div>
                      <h3 className="font-bold text-xl text-charcoal">Ministry Interests</h3>
                    </div>
                    <p className="text-gray-700">
                      {ministryInterests.length > 0 ? (
                        <span className="text-sm">{ministryInterests.join(", ")}</span>
                      ) : (
                        <span className="text-gray-500 italic">None selected</span>
                      )}
                    </p>
                  </div>
                </div>
                
                {totalAnswered < (questions?.length || 0) && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-xl p-6 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-400 p-2 rounded-lg">
                        <span className="text-white text-lg">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-800">Incomplete Assessment</h4>
                        <p className="text-amber-700 text-sm">
                          You haven't answered all questions. You can still submit, but for the most accurate results, 
                          consider going back to complete all questions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitAssessmentMutation.isPending}
                    className="bg-gradient-to-r from-spiritual-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    data-testid="button-submit-assessment"
                  >
                    {submitAssessmentMutation.isPending ? (
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Discovering Your Gifts...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">✨</span>
                        <span>Discover My Spiritual Gifts</span>
                      </div>
                    )}
                  </Button>
                  <p className="text-gray-500 text-sm mt-4">
                    Your results will be emailed to you and saved for 90 days
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className="flex justify-between items-center mt-12">
              <Button
                variant="outline"
                onClick={currentStep === 0 ? previousQuestion : previousStep}
                disabled={currentStep === 0 && currentQuestionIndex === 0}
                className="bg-white/70 backdrop-blur-sm hover:bg-white border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                data-testid="button-previous"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentStep === 0 ? "Previous" : "Back"}
              </Button>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={saveProgress}
                  disabled={Object.keys(answers).length === 0}
                  className="bg-gradient-to-r from-warm-gold/20 to-yellow-200/30 hover:from-warm-gold/30 hover:to-yellow-300/40 text-warm-gold border-warm-gold/50 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  data-testid="button-save-progress"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Progress
                </Button>
                
                <Button
                  onClick={currentStep === 0 ? nextQuestion : nextStep}
                  disabled={currentStep === 0 && (!currentQuestion?.id || !answers[currentQuestion.id])}
                  className="bg-gradient-to-r from-spiritual-blue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  data-testid="button-next"
                >
                  {currentStep === 0 ? "Next" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

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
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        isVisible={scrollDirection !== 'down'} 
      />
    </div>
  );
}
