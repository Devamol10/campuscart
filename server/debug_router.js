import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DATA_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
const apiKey = process.env.HF_API_KEY;

async function debugRouter(query) {
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

  console.log(`\n--- Debugging Router for query: "${query}" ---`);

  try {
    const res = await axios.post(HF_ROUTER_URL, {
      model: DATA_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512
    }, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 15000
    });

    console.log("Full Response Object:", JSON.stringify(res.data, null, 2));
    const content = res.data.choices[0].message.content;
    console.log("Response Content Length:", content.length);
    console.log("Finish Reason:", res.data.choices[0].finish_reason);
    
  } catch (err) {
    console.error("Debug Failure:", err.message);
    if (err.response) console.error("Data:", JSON.stringify(err.response.data));
  }
}

debugRouter("i need a table for my room maybe under 2000");
