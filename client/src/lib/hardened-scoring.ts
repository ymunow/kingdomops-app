/**
 * Integration of bulletproof scoring with existing codebase
 */
import { safeScoreGifts, type ScoreInput } from "@/services/scoring";
import { type GiftKey } from "@shared/schema";

/**
 * Enhanced version of the existing scoreGifts function with error handling
 */
export function scoreGifts(scores: ScoreInput[]) {
  try {
    // Use the bulletproof scoring service
    const result = safeScoreGifts(scores);
    
    // Log any warnings or errors for debugging
    if (result.errors.length > 0) {
      console.warn("Scoring warnings:", result.errors);
    }
    
    // Return in the format expected by the existing codebase
    return {
      totals: result.totals,
      top3: result.top3
    };
    
  } catch (error) {
    console.error("Critical scoring failure:", error);
    
    // Return safe defaults that won't break the application
    const defaultTotals: Record<GiftKey, number> = {
      "LEADERSHIP_ORG": 15,
      "TEACHING": 15,
      "WISDOM_INSIGHT": 15,
      "PROPHETIC_DISCERNMENT": 15,
      "EXHORTATION": 15,
      "SHEPHERDING": 15,
      "FAITH": 15,
      "EVANGELISM": 15,
      "APOSTLESHIP": 15,
      "SERVICE_HOSPITALITY": 15,
      "MERCY": 15,
      "GIVING": 15
    };
    
    return {
      totals: defaultTotals,
      top3: ["LEADERSHIP_ORG", "TEACHING", "WISDOM_INSIGHT"] as [GiftKey, GiftKey, GiftKey]
    };
  }
}