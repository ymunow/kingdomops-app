import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import type { Question } from "@shared/schema";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedValue?: number;
  onAnswerChange: (value: number) => void;
}

const likertOptions = [
  { value: 1, emoji: "😐", label: "Never", description: "Not at all like me" },
  { value: 2, emoji: "🤔", label: "Rarely", description: "Slightly like me" },
  { value: 3, emoji: "🙂", label: "Sometimes", description: "Moderately like me" },
  { value: 4, emoji: "😊", label: "Often", description: "Mostly like me" },
  { value: 5, emoji: "🤗", label: "Always", description: "Very much like me" },
];

export function QuestionCard({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedValue, 
  onAnswerChange 
}: QuestionCardProps) {
  return (
    <Card className="bg-white shadow-lg mb-8">
      <CardContent className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-spiritual-blue/10 text-spiritual-blue px-3 py-1 rounded-full text-sm font-medium">
              Question {questionNumber}
            </span>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="font-display font-semibold text-2xl text-charcoal leading-relaxed mb-6">
            {question.text}
          </h2>

          <div className="space-y-4">
            <p className="text-gray-600 font-medium mb-6">How well does this statement describe you?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {likertOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`p-4 h-auto text-center border-2 transition-all ${
                    selectedValue === option.value
                      ? "border-spiritual-blue bg-spiritual-blue/5"
                      : "border-gray-200 hover:border-spiritual-blue hover:bg-spiritual-blue/5"
                  }`}
                  onClick={() => onAnswerChange(option.value)}
                  data-testid={`likert-option-${option.value}`}
                >
                  <div>
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-semibold text-sm text-charcoal">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
