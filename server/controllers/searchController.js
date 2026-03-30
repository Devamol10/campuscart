import { generateAIResponse } from "../utils/aiService.js";
import Listing from "../models/Listing.js";

// ── In-Memory Cache ────────────────────────────────
const searchCache = new Map();

/**
 * @desc    AI-powered smart search using Hugging Face (Mistral) to parse natural language queries
 * @route   POST /api/search
 * @access  Public
 */
export const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const sanitizedQuery = query.trim();
    const cacheKey = sanitizedQuery.toLowerCase();

    // ── Check Cache ────────────────────────────────────
    if (searchCache.has(cacheKey)) {
      return res.status(200).json(searchCache.get(cacheKey));
    }

// ── Optimized AI Prompt ─────────────────────────────
    const validCategories = ["electronics", "books", "furniture", "sports", "stationery", "lab equipment"];
    
    const prompt = `You are an API that ONLY returns valid JSON.

Extract filters from this query: "${sanitizedQuery}"

Return STRICT JSON:
{
"category": "${validCategories.join(" | ")}",
"keywords": [],
"priceRange": { "min": 0, "max": 0 }
}

Rules:
* Do NOT return null values
* Always infer category from the provided list
* Do NOT add explanation or extra text
* Only return JSON`;

    const aiText = await generateAIResponse(prompt);

    if (!aiText) {
      throw new Error("Empty response from AI Service");
    }

    // ── Safe & Robust JSON Parsing ─────────────────────
    let parsed;
    try {
      // First, remove markdown code blocks if present
      let cleaned = aiText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // Then, use regex to extract the first valid JSON object block
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const finalJson = jsonMatch ? jsonMatch[0] : cleaned;
      
      parsed = JSON.parse(finalJson);
      
      // Category Normalization & Validation
      if (parsed.category) {
        parsed.category = String(parsed.category).toLowerCase().trim();
        // Strict mapping check
        if (!validCategories.includes(parsed.category)) {
          // Attempt to find a partial match or default
          const found = validCategories.find(c => parsed.category.includes(c));
          parsed.category = found || "electronics";
        }
      } else {
        parsed.category = "electronics";
      }

      // Ensure keywords is an array of strings
      if (!Array.isArray(parsed.keywords)) {
        parsed.keywords = [];
      } else {
        parsed.keywords = parsed.keywords.filter(k => typeof k === "string" && k.length > 0);
      }

    } catch (parseError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("AI Response parsing failed, using production fallback:", aiText);
      }
      // Production Fallback
      parsed = {
        category: "electronics",
        keywords: [],
        priceRange: {}
      };
    }

    // ── Build MongoDB filters ──────────────────────────
    const filters = { status: "active" };

    // Use normalized category
    filters.category = { $regex: new RegExp(`^${parsed.category}$`, "i") };

    // Price Filter (max)
    const maxVal = parsed.priceRange?.max;
    if (typeof maxVal === "number" && maxVal > 0) {
      filters.price = { $lte: maxVal };
    }

    // Keyword Search
    if (parsed.keywords.length > 0) {
      const safeKeywords = parsed.keywords
        .filter(k => typeof k === "string")
        .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      
      if (safeKeywords.length > 0) {
        const combinedRegex = safeKeywords.join("|");
        filters.$or = [
          { title: { $regex: combinedRegex, $options: "i" } },
          { description: { $regex: combinedRegex, $options: "i" } }
        ];
      }
    }

    // ── Query database ─────────────────────────────────
    const items = await Listing.find(filters).limit(20).lean();

    const responseData = {
      success: true,
      parsed,
      items,
    };

    // Save to cache
    searchCache.set(cacheKey, responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    if (error.response?.status === 429 || error.message?.includes("busy") || error.message?.includes("timed out")) {
      return res.status(429).json({
        success: false,
        message: "AI assistant is currently busy. Please try again in secondary."
      });
    }
    console.error("AI Search Error:", error.message);
    next(error);
  }
};
