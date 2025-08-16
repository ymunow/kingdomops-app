import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Lightbulb } from "lucide-react";

interface Gift {
  key: string;
  score: number;
  name: string;
  shortName: string;
  definition: string;
  scripture: string;
  scriptureRef: string;
  ministryOptions: string[];
  whyItMatters: string;
  icon: string;
}

interface GiftCardProps {
  gift: Gift;
  rank: 1 | 2 | 3;
  accentColor: "warm-gold" | "spiritual-blue" | "sage-green";
}

const accentColorClasses = {
  "warm-gold": {
    border: "border-l-8 border-warm-gold",
    badge: "bg-warm-gold text-white",
    icon: "bg-warm-gold/10 text-warm-gold",
    number: "bg-warm-gold text-white",
  },
  "spiritual-blue": {
    border: "border-l-8 border-spiritual-blue",
    badge: "bg-spiritual-blue text-white",
    icon: "bg-spiritual-blue/10 text-spiritual-blue",
    number: "bg-spiritual-blue text-white",
  },
  "sage-green": {
    border: "border-l-8 border-sage-green",
    badge: "bg-sage-green text-white",
    icon: "bg-sage-green/10 text-sage-green",
    number: "bg-sage-green text-white",
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "users-cog": Lightbulb, // Using available Lucide icons as substitutes
  "book-open": BookOpen,
  "lightbulb": Lightbulb,
  "eye": Lightbulb,
  "hands-helping": Lightbulb,
  "shield-alt": Lightbulb,
  "mountain": Lightbulb,
  "bullhorn": Lightbulb,
  "rocket": Lightbulb,
  "home": Lightbulb,
  "heart": Lightbulb,
  "gift": Lightbulb,
};

// Maximum possible scores for each gift based on number of questions
const GIFT_MAX_SCORES: Record<string, number> = {
  "LEADERSHIP_ORG": 35,
  "TEACHING": 30,
  "WISDOM_INSIGHT": 20,
  "PROPHETIC_DISCERNMENT": 30,
  "EXHORTATION": 25,
  "SHEPHERDING": 20,
  "FAITH": 25,
  "EVANGELISM": 20,
  "APOSTLESHIP": 25,
  "SERVICE_HOSPITALITY": 30,
  "MERCY": 20,
  "GIVING": 20,
};

export function GiftCard({ gift, rank, accentColor }: GiftCardProps) {
  const colors = accentColorClasses[accentColor];
  const IconComponent = iconMap[gift.icon] || Lightbulb;
  const maxScore = GIFT_MAX_SCORES[gift.key] || 25; // Fallback to 25 if gift key not found
  const scorePercentage = Math.round((gift.score / maxScore) * 100);

  return (
    <Card className={`bg-white shadow-lg ${colors.border}`} data-testid={`gift-card-${rank}`}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className={`${colors.icon} rounded-full w-16 h-16 flex items-center justify-center mr-4`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Badge className={`${colors.number} px-3 py-1 rounded-full text-sm font-bold mr-3`}>
                  #{rank}
                </Badge>
                <h3 className="font-display font-bold text-2xl text-charcoal" data-testid={`gift-name-${rank}`}>
                  {gift.name}
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`${colors.badge} font-semibold px-2 py-1 rounded text-sm`} data-testid={`gift-score-${rank}`}>
                  Score: {gift.score}/{maxScore} ({scorePercentage}%)
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-lg text-charcoal mb-3 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-spiritual-blue" />
              Biblical Foundation
            </h4>
            <blockquote className="bg-spiritual-blue/5 border-l-4 border-spiritual-blue p-4 rounded-r-lg mb-4">
              <p className="italic text-charcoal leading-relaxed" data-testid={`gift-scripture-${rank}`}>
                "{gift.scripture}"
              </p>
              <cite className="text-sm text-spiritual-blue font-semibold block mt-2">
                - {gift.scriptureRef}
              </cite>
            </blockquote>
            
            <h4 className="font-semibold text-lg text-charcoal mb-3">What This Means</h4>
            <p className="text-gray-600 leading-relaxed" data-testid={`gift-definition-${rank}`}>
              {gift.definition}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-charcoal mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-sage-green" />
              How You Might Serve
            </h4>
            <ul className="space-y-2 mb-6" data-testid={`gift-ministry-options-${rank}`}>
              {gift.ministryOptions.map((option, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <CheckCircle className="text-sage-green mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{option}</span>
                </li>
              ))}
            </ul>
            
            <h4 className="font-semibold text-lg text-charcoal mb-3 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-warm-gold" />
              Why It Matters
            </h4>
            <p className="text-gray-600 leading-relaxed" data-testid={`gift-why-matters-${rank}`}>
              {gift.whyItMatters}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
