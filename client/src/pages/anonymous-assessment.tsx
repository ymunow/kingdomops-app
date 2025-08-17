import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, ArrowLeft, ArrowRight, Save, Mail } from "lucide-react";
import { QuestionCard } from "@/components/assessment/question-card";
import type { Question } from "@shared/schema";

interface StartAnonymousAssessmentResponse {
  id: string;
  versionId: string;
  startedAt: string;
}

interface AnonymousAssessmentState {
  currentStep: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  ageGroups: string[];
  ministryInterests: string[];
  email: string;
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

export default function AnonymousAssessment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = questions, 1 = age groups, 2 = ministry interests, 3 = email, 4 = review
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [ministryInterests, setMinistryInterests] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [responseId, setResponseId] = useState<string>("");

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("anonymous_assessment_progress");
    if (saved) {
      try {
        const state: AnonymousAssessmentState = JSON.parse(saved);
        setCurrentStep(state.currentStep);
        setCurrentQuestionIndex(0);
        setAnswers(state.answers);
        setAgeGroups(state.ageGroups);
        setMinistryInterests(state.ministryInterests);
        setEmail(state.email);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Save progress whenever state changes
  useEffect(() => {
    const state: AnonymousAssessmentState = {
      currentStep,
      currentQuestionIndex,
      answers,
      ageGroups,
      ministryInterests,
      email
    };
    localStorage.setItem("anonymous_assessment_progress", JSON.stringify(state));
  }, [currentStep, currentQuestionIndex, answers, ageGroups, ministryInterests, email]);

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/assessment/questions"],
  });

  // Start anonymous assessment (just get questions for now)
  const startAssessmentMutation = useMutation({
    mutationFn: async () => {
      // For now, just return a temporary ID to start the assessment
      return {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        versionId: "temp-version",
        startedAt: new Date().toISOString()
      } as StartAnonymousAssessmentResponse;
    },
    onSuccess: (data) => {
      setResponseId(data.id);
      toast({
        title: "Assessment Started",
        description: "You can now begin answering questions.",
      });
    },
    onError: (error) => {
      console.error("Start assessment error:", error);
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit anonymous assessment - for now just show results
  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: {
      answers: Record<string, number>;
      ageGroups: string[];
      ministryInterests: string[];
      email: string;
    }) => {
      // For now, just simulate processing and return to login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      return { success: true };
    },
    onSuccess: (data) => {
      // Clear saved progress
      localStorage.removeItem("anonymous_assessment_progress");
      
      toast({
        title: "Assessment Complete!",
        description: "To view your results and save them permanently, please create an account or sign in.",
      });
      
      // Show modal or redirect to login with saved assessment data
      localStorage.setItem("completed_anonymous_assessment", JSON.stringify({
        answers,
        ageGroups,
        ministryInterests,
        email,
        completedAt: new Date().toISOString()
      }));
      
      // Redirect to join page
      setLocation("/join");
    },
    onError: (error) => {
      console.error("Submit assessment error:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start assessment on first load
  useEffect(() => {
    if (!responseId && !startAssessmentMutation.isPending) {
      startAssessmentMutation.mutate();
    }
  }, [responseId, startAssessmentMutation]);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleAgeGroupToggle = (group: string) => {
    setAgeGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const handleMinistryInterestToggle = (interest: string) => {
    setMinistryInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep(1); // Move to age groups
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep === 1) {
      setCurrentQuestionIndex(questions.length - 1);
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitAssessmentMutation.mutate({
      answers,
      ageGroups,
      ministryInterests,
      email
    });
  };

  const totalSteps = 5; // questions, age groups, ministry interests, email, review
  const currentProgress = currentStep === 0 
    ? (currentQuestionIndex + 1) / questions.length * 25
    : 25 + (currentStep - 1) * 18.75;

  if (questionsLoading || startAssessmentMutation.isPending) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No assessment questions available.</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  Spiritual Gifts Assessment
                </h1>
                <p className="text-sm text-gray-600">
                  No account required • Results available for 90 days
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-back-home">
              Return Home
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStep === 0 && `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              {currentStep === 1 && "Age Groups"}
              {currentStep === 2 && "Ministry Interests"}
              {currentStep === 3 && "Email (Optional)"}
              {currentStep === 4 && "Review & Submit"}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(currentProgress)}% Complete
            </span>
          </div>
          <Progress value={currentProgress} className="w-full" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Questions Step */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <QuestionCard
              question={questions[currentQuestionIndex]}
              value={answers[questions[currentQuestionIndex].id] || 1}
              onChange={(value) => handleAnswerChange(questions[currentQuestionIndex].id, value)}
            />
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                data-testid="button-prev-question"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!answers[questions[currentQuestionIndex].id]}
                data-testid="button-next-question"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Age Groups Step */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Age Groups You'd Like to Serve</h2>
              <p className="text-gray-600 mb-6">
                Select all age groups you feel called to serve or would enjoy working with.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ageGroupOptions.map((group) => (
                  <div key={group} className="flex items-center space-x-2">
                    <Checkbox
                      id={group}
                      checked={ageGroups.includes(group)}
                      onCheckedChange={() => handleAgeGroupToggle(group)}
                      data-testid={`checkbox-age-${group.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    />
                    <Label htmlFor={group} className="cursor-pointer">
                      {group}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep} data-testid="button-next-step">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ministry Interests Step */}
        {currentStep === 2 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ministry Areas of Interest</h2>
              <p className="text-gray-600 mb-6">
                Select areas of ministry that interest you or where you'd like to serve.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ministryInterestOptions.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={ministryInterests.includes(interest)}
                      onCheckedChange={() => handleMinistryInterestToggle(interest)}
                      data-testid={`checkbox-ministry-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    />
                    <Label htmlFor={interest} className="cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep} data-testid="button-next-step">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Step */}
        {currentStep === 3 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Email Results (Optional)</h2>
              <p className="text-gray-600 mb-6">
                Enter your email address if you'd like to receive your detailed results. 
                This is optional - you can still view your results after completion.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="flex-1"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  We'll only use your email to send your assessment results. No spam or marketing emails.
                </p>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep} data-testid="button-next-step">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Step */}
        {currentStep === 4 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="font-medium text-gray-900">Questions Answered</h3>
                  <p className="text-gray-600">{Object.keys(answers).length} of {questions.length} questions</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Age Groups</h3>
                  <p className="text-gray-600">
                    {ageGroups.length > 0 ? ageGroups.join(", ") : "None selected"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Ministry Interests</h3>
                  <p className="text-gray-600">
                    {ministryInterests.length > 0 ? ministryInterests.join(", ") : "None selected"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">
                    {email || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep} data-testid="button-prev-step">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitAssessmentMutation.isPending || Object.keys(answers).length !== questions.length}
                  data-testid="button-submit-assessment"
                >
                  {submitAssessmentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Assessment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}