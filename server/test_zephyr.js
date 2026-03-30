import dotenv from "dotenv";
dotenv.config();

import { generateAIResponse } from "./utils/aiService.js";

async function testZephyr() {
  console.log("--- Testing Final Fix with Zephyr-7B-Beta ---");
  const query = "used laptop under 30000";
  const prompt = `<|system|>
You are a helpful assistant that parses search queries into JSON.
Convert the user query into a STRICT JSON object with these fields:
- category: one of [electronics, stationery, books, lab equipment, furniture, sports, clothing, other] or null
- maxPrice: number or null
- keywords: array of strings

Rules:
- category must be lowercase.
- Return ONLY the JSON object. Do not include markdown or explanations.
<|user|>
"${query}"
<|assistant|>`;

  try {
    const result = await generateAIResponse(prompt);
    console.log("SUCCESS! AI Response:", result);
    
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : result;
    const parsed = JSON.parse(cleaned);
    console.log("Final Parsed JSON:", JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.error("FINAL TEST FAILED:", error.message);
    if (error.response) {
      console.error("HTTP Debug:", error.response.status, JSON.stringify(error.response.data));
    }
  }
}

testZephyr();
