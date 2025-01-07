import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. AI analysis features will be disabled.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LibraryAnalysis {
  isOpenSource: boolean;
  pricing?: {
    type: "free" | "paid" | "freemium";
    startingPrice?: string;
  };
  integrationComplexity: number;
  complexityReason: string;
}

export async function analyzeLibrary(
  name: string,
  description: string,
  readme: string
): Promise<LibraryAnalysis> {
  try {
    const prompt = `Analyze this GitHub library:
Name: ${name}
Description: ${description}
README excerpt: ${readme.slice(0, 1500)}...

Please analyze the following aspects:
1. Is it free and open source? (true/false)
2. If it's not completely free, what's the pricing model and starting price?
3. Rate the integration complexity from 1-5 (1 being very easy, 5 being very complex)
4. Briefly explain the complexity rating

Respond in JSON format:
{
  "isOpenSource": boolean,
  "pricing": {
    "type": "free" | "paid" | "freemium",
    "startingPrice": string (if applicable)
  },
  "integrationComplexity": number (1-5),
  "complexityReason": string
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a technical analyst specialized in evaluating software libraries. Provide accurate, concise analysis in JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error("[AI Analysis Error]", error);
    // Return a default analysis if AI fails
    return {
      isOpenSource: true, // Assume open source by default
      pricing: {
        type: "free",
      },
      integrationComplexity: 3, // Medium complexity by default
      complexityReason: "Analysis unavailable",
    };
  }
}
