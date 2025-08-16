import { type GiftKey, type ScoreResult } from "@shared/schema";

export interface ScoreInput {
  questionId: string;
  giftKey: GiftKey;
  value: number;
}

export function scoreGifts(input: ScoreInput[]): ScoreResult {
  const totals: Record<GiftKey, number> = {
    LEADERSHIP_ORG: 0,
    TEACHING: 0,
    WISDOM_INSIGHT: 0,
    PROPHETIC_DISCERNMENT: 0,
    EXHORTATION: 0,
    SHEPHERDING: 0,
    FAITH: 0,
    EVANGELISM: 0,
    APOSTLESHIP: 0,
    SERVICE_HOSPITALITY: 0,
    MERCY: 0,
    GIVING: 0,
  };

  for (const answer of input) {
    totals[answer.giftKey] += answer.value;
  }

  const top3 = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([gift]) => gift as GiftKey);

  return { totals, top3 };
}

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

export function calculateScorePercentage(
  score: number,
  giftKey?: string,
  maxPossible?: number
): number {
  const maxScore = maxPossible || (giftKey ? GIFT_MAX_SCORES[giftKey] : undefined) || 25;
  return Math.round((score / maxScore) * 100);
}

export function getGiftMaxScore(giftKey: string): number {
  return GIFT_MAX_SCORES[giftKey] || 25;
}
