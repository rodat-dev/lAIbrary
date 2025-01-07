import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSearchTerms(language: string, description: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a programming expert that helps find relevant GitHub libraries. Generate 3 different search queries that would help find relevant libraries. Focus on technical and functional aspects, avoid AI/ML terms unless specifically requested. Return only the search terms, one per line."
        },
        {
          role: "user",
          content: `I need to find GitHub libraries for ${language} that can help with: ${description}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const searchTerms = response.choices[0].message.content
      ?.split('\n')
      .filter(term => term.trim().length > 0)
      .map(term => term.trim()) || [];

    // Add the original description as one of the search terms
    searchTerms.push(description);

    return [...new Set(searchTerms)]; // Remove duplicates
  } catch (error) {
    console.error("[Search Term Generation Error]", error);
    return [description]; // Fallback to original description if AI fails
  }
}

export function cleanSearchTerm(term: string): string {
  // Remove special characters but keep spaces and hyphens
  return term.replace(/[^\w\s-]/g, '');
}

export function buildSearchQuery(language: string, term: string, example?: string): string {

  return [
    `language:${language}`,
    cleanSearchTerm(term),
    example ? `${example} in:name,description,readme` : "",
    "stars:>50",
  ].filter(Boolean).join(" ");
}
