/**
 * Bulletproof scoring service with comprehensive error handling and validation
 */
import { type GiftKey } from "@shared/schema";

export interface ScoreInput {
  questionId: string;
  giftKey: GiftKey;
  value: number;
}

export interface ScoreResult {
  totals: Record<GiftKey, number>;
  top3: [GiftKey, GiftKey, GiftKey];
  isValid: boolean;
  errors: string[];
}

// Valid gift keys to prevent scoring errors
const VALID_GIFT_KEYS: GiftKey[] = [
  "LEADERSHIP_ORG",
  "TEACHING",
  "WISDOM_INSIGHT", 
  "PROPHETIC_DISCERNMENT",
  "EXHORTATION",
  "SHEPHERDING",
  "FAITH",
  "EVANGELISM",
  "APOSTLESHIP",
  "SERVICE_HOSPITALITY",
  "MERCY",
  "GIVING"
];

// Minimum valid score range (1-5 Likert scale)
const MIN_SCORE = 1;
const MAX_SCORE = 5;

/**
 * Validates score input data
 */
function validateScoreInput(scores: ScoreInput[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(scores)) {
    errors.push("Score input must be an array");
    return { isValid: false, errors };
  }
  
  if (scores.length === 0) {
    errors.push("No scores provided");
    return { isValid: false, errors };
  }
  
  // Check each score entry
  scores.forEach((score, index) => {
    if (!score || typeof score !== 'object') {
      errors.push(`Invalid score object at index ${index}`);
      return;
    }
    
    // Validate gift key
    if (!score.giftKey || !VALID_GIFT_KEYS.includes(score.giftKey)) {
      errors.push(`Invalid gift key "${score.giftKey}" at index ${index}`);
    }
    
    // Validate score value
    if (typeof score.value !== 'number' || isNaN(score.value)) {
      errors.push(`Invalid score value at index ${index}: must be a number`);
    } else if (score.value < MIN_SCORE || score.value > MAX_SCORE) {
      errors.push(`Score value ${score.value} out of range (${MIN_SCORE}-${MAX_SCORE}) at index ${index}`);
    }
    
    // Validate question ID
    if (!score.questionId || typeof score.questionId !== 'string') {
      errors.push(`Invalid question ID at index ${index}`);
    }
  });
  
  // Check for minimum questions per gift (should have at least 3 questions per gift)
  const giftCounts = scores.reduce((acc, score) => {
    if (score.giftKey) {
      acc[score.giftKey] = (acc[score.giftKey] || 0) + 1;
    }
    return acc;
  }, {} as Record<GiftKey, number>);
  
  VALID_GIFT_KEYS.forEach(gift => {
    const count = giftCounts[gift] || 0;
    if (count < 3) {
      errors.push(`Insufficient questions for ${gift}: ${count} (minimum 3 required)`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Calculates gift scores with error handling and validation
 */
export function scoreGifts(scores: ScoreInput[]): ScoreResult {
  // Initialize result with defaults
  const result: ScoreResult = {
    totals: {} as Record<GiftKey, number>,
    top3: ["LEADERSHIP_ORG", "TEACHING", "WISDOM_INSIGHT"],
    isValid: false,
    errors: []
  };
  
  try {
    // Validate input
    const validation = validateScoreInput(scores);
    if (!validation.isValid) {
      result.errors = validation.errors;
      return result;
    }
    
    // Initialize totals for all gifts
    VALID_GIFT_KEYS.forEach(gift => {
      result.totals[gift] = 0;
    });
    
    // Calculate totals with safety checks
    scores.forEach(score => {
      if (score.giftKey && VALID_GIFT_KEYS.includes(score.giftKey)) {
        // Clamp score to valid range as additional safety
        const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score.value));
        result.totals[score.giftKey] += clampedValue;
      }
    });
    
    // Sort gifts by score and get top 3
    const sortedGifts = VALID_GIFT_KEYS
      .map(gift => ({ gift, score: result.totals[gift] }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.gift);
    
    // Ensure we have at least 3 gifts (fallback to defaults if needed)
    if (sortedGifts.length >= 3) {
      result.top3 = [sortedGifts[0], sortedGifts[1], sortedGifts[2]];
    } else {
      result.errors.push("Insufficient gifts calculated, using defaults");
    }
    
    // Additional validation: check for reasonable score ranges
    const maxPossibleScore = Math.max(...Object.values(result.totals));
    const minPossibleScore = Math.min(...Object.values(result.totals));
    
    if (maxPossibleScore === minPossibleScore) {
      result.errors.push("Warning: All gifts have identical scores");
    }
    
    if (maxPossibleScore < MIN_SCORE * 3) {
      result.errors.push("Warning: Suspiciously low maximum score");
    }
    
    result.isValid = result.errors.length === 0;
    
  } catch (error) {
    result.errors.push(`Scoring calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
  }
  
  return result;
}

/**
 * Safe score calculation with fallbacks
 */
export function safeScoreGifts(scores: ScoreInput[]): ScoreResult {
  try {
    const result = scoreGifts(scores);
    
    // If scoring failed but we have some data, try to recover
    if (!result.isValid && scores.length > 0) {
      console.warn("Primary scoring failed, attempting recovery", result.errors);
      
      // Attempt simple recovery by grouping valid scores
      const validScores = scores.filter(s => 
        s && typeof s.value === 'number' && 
        !isNaN(s.value) && 
        s.giftKey && 
        VALID_GIFT_KEYS.includes(s.giftKey)
      );
      
      if (validScores.length > 0) {
        return scoreGifts(validScores);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error("Critical scoring error:", error);
    
    // Return safe defaults
    return {
      totals: VALID_GIFT_KEYS.reduce((acc, gift) => {
        acc[gift] = 15; // Average score
        return acc;
      }, {} as Record<GiftKey, number>),
      top3: ["LEADERSHIP_ORG", "TEACHING", "WISDOM_INSIGHT"],
      isValid: false,
      errors: [`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}