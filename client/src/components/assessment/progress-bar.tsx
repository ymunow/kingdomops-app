import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  currentQuestion?: number;
  totalQuestions?: number;
  className?: string;
}

const stepLabels = [
  "Assessment Questions",
  "Age Groups",
  "Ministry Interests", 
  "Review & Submit"
];

export function ProgressBar({ 
  currentStep, 
  totalSteps, 
  currentQuestion, 
  totalQuestions,
  className = ""
}: ProgressBarProps) {
  // Calculate overall progress
  let overallProgress = 0;
  
  if (currentStep === 0 && totalQuestions && currentQuestion) {
    // During questions phase, progress is based on answered questions
    const questionProgress = (currentQuestion / totalQuestions) * 100;
    overallProgress = questionProgress * 0.7; // Questions are 70% of total progress
  } else if (currentStep > 0) {
    // After questions, each step is worth 10%
    overallProgress = 70 + (currentStep - 1) * 10 + (currentStep === 3 ? 20 : 0);
  }

  return (
    <div className={`w-full ${className}`}>
      <Progress 
        value={overallProgress} 
        className="h-3 mb-4" 
        data-testid="progress-assessment"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        {stepLabels.map((label, index) => (
          <span 
            key={index}
            className={index === currentStep ? "font-medium text-spiritual-blue" : ""}
            data-testid={`step-label-${index}`}
          >
            {label}
          </span>
        ))}
      </div>
      
      {currentStep === 0 && totalQuestions && currentQuestion && (
        <div className="mt-2 text-center text-sm text-gray-600">
          <span data-testid="question-counter">
            Question {currentQuestion} of {totalQuestions}
          </span>
        </div>
      )}
    </div>
  );
}
