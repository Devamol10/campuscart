import axios from "axios";

/**
 * AI Service for Hugging Face Router API (OpenAI-compatible)
 * Features: Retry logic (503), timeout handling, and validation
 */
const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DATA_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export const generateAIResponse = async (prompt, retries = 3) => {
  const apiKey = process.env.HF_API_KEY;

  // Pre-flight Validation
  if (!apiKey || apiKey.includes("your_hf_api_key") || apiKey === "") {
    console.error("AI Service Error: HF_API_KEY is missing or invalid.");
    throw new Error("AI service is currently unavailable (config error)");
  }

  const payload = {
    model: DATA_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 512,
  };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(HF_ROUTER_URL, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15s timeout
      });

      const content = response.data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("Empty or malformed response from AI provider");
      }

      return content.trim();

    } catch (error) {
      const is503 = error.response?.status === 503;
      const isLastRetry = i === retries - 1;

      if (is503 && !isLastRetry) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`HF model loading (503). Retrying... (${i + 1}/${retries})`);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      // Handle Timeout specifically
      if (error.code === "ECONNABORTED") {
        throw new Error("AI Assistant request timed out.");
      }

      // Propagate critical errors to the controller
      throw error;
    }
  }

  throw new Error("AI Service failed after multiple retries.");
};
