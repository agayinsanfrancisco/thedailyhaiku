import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

interface ValidationResult {
  valid: boolean;
  headline?: string;
  description?: string;
  sources?: string[];
  error?: string;
}

export async function validateEventForDate(
  eventTitle: string,
  date: string,
  link: string,
): Promise<ValidationResult> {
  const [month, day] = date.split("-");
  const dateStr = `${month}/${day}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Given this event title, date (month/day), and a URL the user provided as evidence:

Event: "${eventTitle}"
Date: ${dateStr}
URL: ${link}

Do the following:
1. Visit the URL content and determine if it proves this event happened on the given month and day.
2. If YES: respond with VALID=true, extract a 2-3 sentence summary of the event's significance, generate an eye-catching headline (max 8 words, lively), and list up to 3 source URLs found on the page.
3. If NO: respond with VALID=false and explain why the link doesn't match the event or date.

IMPORTANT: Never use Wikipedia as a source. If the URL is Wikipedia, consider it invalid.

Respond with a JSON object (no markdown, no code fences):
{
  "valid": true/false,
  "headline": "...",
  "description": "...",
  "sources": ["...", "..."],
  "error": null or "explanation"
}`,
      },
    ],
  });

  const textBlock = response.content[0];
  if (textBlock.type !== "text") {
    return { valid: false, error: "Unexpected response from Claude" };
  }

  try {
    return JSON.parse(textBlock.text);
  } catch {
    return { valid: false, error: "Failed to parse Claude response" };
  }
}
