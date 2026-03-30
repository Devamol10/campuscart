import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.HF_API_KEY;

async function listModels() {
  console.log("Fetching supported models from Hugging Face Router...");
  try {
    const res = await axios.get("https://router.huggingface.co/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    
    // The response is usually an OpenAI-compatible list of models
    const models = res.data.data.map(m => m.id);
    console.log("AVAILABLE MODELS (first 20):");
    console.log(JSON.stringify(models.slice(0, 20), null, 2));
    
    // Look for popular ones
    const searchTerms = ["mistral", "llama", "qwen", "zephyr", "phi", "deepseek"];
    const found = {};
    searchTerms.forEach(term => {
      found[term] = models.filter(m => m.toLowerCase().includes(term));
    });
    console.log("\nPOPULAR MODELS FOUND:");
    console.log(JSON.stringify(found, null, 2));

  } catch (err) {
    console.error("FAIL:", err.response?.status, JSON.stringify(err.response?.data));
  }
}

listModels();
