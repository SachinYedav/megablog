/* eslint-env node */
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ Production Warning: GEMINI API Key is missing in environment variables!");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });
  }

  // ============================================================
  // 1. GENERATE TITLE 
  // ============================================================
  async generateTitle(content) {
    try {
      const prompt = `
        Act as an SEO Expert. Read the blog content below and generate a single, catchy, and engaging blog title.
        
        Constraints:
        1. Length: 6 to 10 words maximum.
        2. Must include the main keyword or topic naturally.
        3. Tone: Professional yet exciting (High Click-Through Rate).
        4. Do NOT use quotes (""), colons (:), or special characters (* #).
        5. Output ONLY the title text.

        Content: ${content.substring(0, 2000)}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      return text.replace(/["*#]/g, "").trim();

    } catch (error) {
      console.error("❌ AI Title Generation Failed:", error.message);
      return null;
    }
  }

  // ============================================================
  //  2. GENERATE META DESCRIPTION 
  // ============================================================
  async generateSummary(content) {
    try {
      const prompt = `
        Act as an SEO Expert. Write a compelling meta description for this blog post.
        
        Constraints:
        1. Length: Strictly between 140 to 160 characters.
        2. Goal: Summarize the value and make the user want to click.
        3. Do NOT use quotes ("") or markdown formatting.
        4. Output ONLY the description text.

        Content: ${content.substring(0, 2000)}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      //  Cleaning
      text = text.replace(/["*#]/g, "").trim();
      
      if (text.length > 158) {
        const cutOff = text.substring(0, 155).lastIndexOf(" ");
        text = text.substring(0, cutOff) + "...";
      }
      
      return text;

    } catch (error) {
      console.error("❌ AI Summary Generation Failed:", error.message);
      return null;
    }
  }
}

const aiService = new AIService();
export default aiService;