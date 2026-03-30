import dotenv from "dotenv";
dotenv.config();

import { generateAIResponse } from "./utils/aiService.js";

async function testAI(query) {
  console.log(`\n--- Testing Query: "${query}" ---`);

  const prompt = `[INST] You are a helpful assistant that parses search queries into JSON.
Convert the user query into a STRICT JSON object with these fields:
- category: one of [electronics, stationery, books, lab equipment, furniture, sports, clothing, other] or null
- maxPrice: number or null
- keywords: array of strings

Rules:
- category must be lowercase.
- Return ONLY the JSON object. Do not include markdown or explanations.

User query: "${query}" [/INST]`;

  try {
    console.log("Calling Hugging Face AI Service (NEW ROUTER)...");
    const aiText = await generateAIResponse(prompt);
    console.log("Raw AI Response:", aiText);

    // Safe JSON Parsing logic (copied from searchController.js)
    let parsed;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const cleaned = jsonMatch ? jsonMatch[0] : aiText;
      
      parsed = JSON.parse(cleaned);
      console.log("Parsed JSON:", JSON.stringify(parsed, null, 2));

      if (parsed.category) {
        parsed.category = parsed.category.toLowerCase();
      }
    } catch (parseError) {
      console.warn("AI Response JSON parse failed, using fallback keywords.");
      parsed = {
        category: null,
        maxPrice: null,
        keywords: [query],
      };
      console.log("Fallback Result:", JSON.stringify(parsed, null, 2));
    }

    return parsed;
  } catch (error) {
    console.error("Test Error:", error.message);
    if (error.response) {
      console.error("Response Debug:", error.response.status, JSON.stringify(error.response.data));
    }
  }
}

async function runTests() {
  await testAI("used laptop under 30000");
  await testAI("second hand iPhone");
}

runTests();
