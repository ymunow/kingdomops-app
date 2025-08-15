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

export function calculateScorePercentage(
  score: number,
  maxPossible: number = 25
): number {
  return Math.round((score / maxPossible) * 100);
}
