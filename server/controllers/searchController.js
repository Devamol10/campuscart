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

// ── Optimized AI Prompt (Human-like Training) ─────────────────────────────
    const validCategories = ["Electronics", "Stationery", "Books", "Lab Equipment", "Furniture", "Sports", "Clothing", "Other"];
    
    const prompt = `### Role:
You are the Expert AI Retrieval Assistant for CampusCart, a student marketplace. Your job is to extract search intent from unstructured queries.

### Context:
Students search for items to buy/sell. We use these categories: ${validCategories.join(', ')}.

### Query to Process:
"${sanitizedQuery}"

### Training Examples (Few-Shot):
* User: "I need a hoodie and t-shirt" -> {"category": "Clothing", "keywords": ["hoodie", "t-shirt"], "priceRange": {"min": 0, "max": 0}}
* User: "Looking for a cheap desk for 500" -> {"category": "Furniture", "keywords": ["desk"], "priceRange": {"min": 0, "max": 500}}
* User: "Engineering books 4th sem" -> {"category": "Books", "keywords": ["engineering", "4th", "sem"], "priceRange": {"min": 0, "max": 0}}
* User: "Scientific calculator" -> {"category": "Electronics", "keywords": ["calculator"], "priceRange": {"min": 0, "max": 0}}

### Extraction Rules:
1. Return ONLY a valid JSON object. No Markdown.
2. Infer the intended "category" from my list. If ambiguous, pick "Other".
3. Extract specific product "keywords". Ignore common filler words.
4. If the user mentions a budget, accurately fill "priceRange.max".
5. Do NOT return null values; use defaults.

### Return JSON format:
{
"category": "String",
"keywords": ["String"],
"priceRange": { "min": Number, "max": Number }
}`;

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
      
      // Category Normalization & Validation (Case-Insensitive)
      if (parsed.category) {
        const found = validCategories.find(c => 
          c.toLowerCase() === String(parsed.category).toLowerCase().trim() ||
          String(parsed.category).toLowerCase().includes(c.toLowerCase())
        );
        parsed.category = found || "Other";
      } else {
        parsed.category = "Other";
      }

      // Ensure keywords is an array of strings
      if (!Array.isArray(parsed.keywords)) {
        parsed.keywords = [];
      } else {
        parsed.keywords = parsed.keywords
          .filter(k => typeof k === "string" && k.length > 0)
          .map(k => k.toLowerCase().trim());
      }

      // Price Range cleanup
      if (parsed.priceRange) {
        if (typeof parsed.priceRange.max !== 'number') parsed.priceRange.max = 0;
        if (typeof parsed.priceRange.min !== 'number') parsed.priceRange.min = 0;
      } else {
        parsed.priceRange = { min: 0, max: 0 };
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
