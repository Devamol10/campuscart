import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.HF_API_KEY;

async function testEndpoint(url, payload) {
  console.log(`\nTesting: ${url}`);
  try {
    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      timeout: 10000
    });
    console.log("SUCCESS:", res.data?.choices?.[0]?.message?.content || res.data);
  } catch (err) {
    console.error("FAIL:", err.response?.status, JSON.stringify(err.response?.data));
  }
}

async function run() {
  const payload = {
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [{ role: "user", content: "Say hello" }],
    max_tokens: 10
  };

  // 1. Router (OpenAI compatible)
  await testEndpoint("https://router.huggingface.co/v1/chat/completions", payload);

  // 2. Legacy host with V1 path
  await testEndpoint("https://api-inference.huggingface.co/v1/chat/completions", payload);

  // 3. Inference Provider Endpoint (Task specific)
  await testEndpoint("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
    inputs: "Say hello"
  });
}

run();
