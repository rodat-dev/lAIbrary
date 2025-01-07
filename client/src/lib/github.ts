export interface LibraryAnalysis {
  isOpenSource: boolean;
  pricing?: {
    type: "free" | "paid" | "freemium";
    startingPrice?: string;
  };
  integrationComplexity: number;
  complexityReason: string;
}

export interface LibraryRecommendation {
  id?: number;
  name: string;
  owner: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt: string;
  analysis?: LibraryAnalysis;
}