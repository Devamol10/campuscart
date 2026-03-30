import dotenv from "dotenv";
dotenv.config();

import { generateAIResponse } from "./utils/aiService.js";

async function testProductionLogic(query) {
  console.log(`\n--- Production Test: "${query}" ---`);

  const prompt = `You are an API that ONLY returns valid JSON.

Extract filters from this query: "${query}"

Return STRICT JSON:
{
"category": "electronics | books | furniture | sports | stationery | lab equipment",
"keywords": [],
"priceRange": {
"min": 0,
"max": 0
}
}

Rules:
* Do NOT return null values
* Always infer category
* Do NOT add explanation
* Do NOT add extra text
* Only return JSON`;

  try {
    const aiText = await generateAIResponse(prompt);
    console.log("Raw AI Output:", aiText);

    // Safe & Robust JSON Parsing
    const cleaned = aiText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const finalJson = jsonMatch ? jsonMatch[0] : cleaned;
    const parsed = JSON.parse(finalJson);

    console.log("Final Parsed Filter Object:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error("Critical Test Failure:", error.message);
  }
}

async function run() {
  await testProductionLogic("i need a table for my room maybe under 2000");
  await testProductionLogic("looking for some old textbooks");
}

run();
