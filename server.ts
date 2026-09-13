import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for AI Tutor
app.post("/api/tutor", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAiClient();

    // Construct standard history formatted as required by the model
    // history is expected to be array of { role: 'user' | 'model', text: string }
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content || msg.text }],
        });
      }
    }

    // Append current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Helper function for retry and fallback model strategy
    async function generateContentWithRetryAndFallback(ai: GoogleGenAI, params: any) {
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let lastError: any = null;

      for (const model of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            console.log(`Attempting generateContent using model: ${model} (attempt ${attempts + 1})`);
            const response = await ai.models.generateContent({
              ...params,
              model: model,
            });
            return response;
          } catch (err: any) {
            attempts++;
            lastError = err;
            console.error(`Error with model ${model} on attempt ${attempts}:`, err.message || err);
            if (attempts < maxAttempts) {
              // Wait 1.5 seconds before retrying
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        }
      }
      throw lastError;
    }

    const response = await generateContentWithRetryAndFallback(ai, {
      contents,
      config: {
        systemInstruction: `You are an expert master chocolatier and educator specializing in both bean-to-bar chocolate making and professional chocolate panning (coated nuts & fruits).
Your tone is professional, warm, encouraging, and detailed.
You know everything about:
1. Sourcing cocoa beans (Criollo, Forastero, Trinitario, Nacional), fermentation, and drying.
2. Roasting profiles (convection vs drum, temperature, duration) and winnowing.
3. Melanging, conching, particle size (aiming for 15-20 microns), fat ratios, and lecithin/cocoa butter additions.
4. The exact chemistry of tempering: Polymorphism of cocoa butter, focusing on Crystal Form V (Beta 5) which is the stable crystal needed for shine, snap, and heat resistance. Crystal structures: Form I (17°C) to Form VI (36°C). Tempering profiles: Dark (melt 45-50°C, cool 27-28°C, reheat 31-32°C), Milk/White (melt 45°C, cool 26-27°C, reheat 29-30°C).
5. Professional Panning (Coated Nuts): Pre-coating/Sealing (using gum arabic/sugar syrup to prevent oil migration), building chocolate layers (using tempered chocolate in a revolving pan with cold air), and polishing/glazing (using shellac, carnauba, or special gum blends for high shine).
6. Troubleshooting common defects: fat bloom, sugar bloom, over-thick chocolate, chocolate seizing (due to moisture), nuts sticking together during panning, or dull/lumpy coatings.

When responding:
- Keep answers structured and easy to read.
- Use bullet points for steps or recipes.
- Provide practical chocolatier advice, numbers, temperatures, and physical mechanisms.
- If the user asks for a recipe or formula, provide specific percentages (e.g., 70% dark chocolate: 65% nibs, 5% extra cocoa butter, 30% sugar).`,
      },
    });

    const text = response.text;
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini Tutor API Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// API endpoint for AI Recipe Formulation Guide
app.post("/api/formulate-guide", async (req, res) => {
  try {
    const { name, fillingType, targetShelfLife, waterActivity, pH, ingredients, addAcid } = req.body;
    
    if (!name || !ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Recipe name and ingredients are required" });
    }

    const ai = getAiClient();

    // Construct detailed formulation description
    const ingredientListText = ingredients
      .map((ing: any) => `- ${ing.name}: ${ing.weight}g (${ing.category || "General"})`)
      .join("\n");

    const prompt = `Please evaluate the following custom confectionery filling recipe being formulated in our Recipe Lab:
Recipe Name: "${name}"
Filling Type: ${fillingType} (dairy ganache, caramel, fruit gel, or fat-based)
Target Shelf Life: ${targetShelfLife} Months
Calculated Water Activity (a_w): ${waterActivity}
Calculated pH Level: ${pH}
Citric Acid Active: ${addAcid ? "Yes (0.8% dose)" : "No"}

Ingredients Added:
${ingredientListText}

Please provide an expert Master Chocolatier and Food Scientist evaluation. Give the student the ease of focusing on their batch by structuring your response exactly into these sections:
1. **Safety & Stability Audit**: Is this water activity (${waterActivity}) and pH (${pH}) truly safe for a ${targetShelfLife}-month shelf life? Explain the physical hurdles in play.
2. **Batch Balancing & Ingredient Tips**: Analyze their specific ingredient weights. Are there balance improvements? (e.g. suggesting humectants like Trimoline, glucose syrup, or sorbitol, or adding solid fats). Keep it practical with numbers.
3. **Piping & Temperature Controls**: Tell them exactly what temperature to boil cream/liquids, what temperature to blend/emulsify, and most importantly, what the safe piping temperature limit is to avoid melting their chocolate shell (e.g., must be under 30°C).
4. **Actionable Step-by-Step Batch Guide**: Briefly list 3-4 clear step-by-step physical instructions for making this exact batch to ensure a perfect emulsion that won't separate.

Keep your tone professional, encouraging, and rich in molecular confectionery science. Avoid empty fluff and focus entirely on helping them make a perfect batch!`;

    async function generateContentWithRetryAndFallback(ai: GoogleGenAI, params: any) {
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let lastError: any = null;

      for (const model of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            console.log(`[Formulator] Attempting generateContent using model: ${model} (attempt ${attempts + 1})`);
            const response = await ai.models.generateContent({
              ...params,
              model: model,
            });
            return response;
          } catch (err: any) {
            attempts++;
            lastError = err;
            console.error(`[Formulator] Error with model ${model} on attempt ${attempts}:`, err.message || err);
            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }
        }
      }
      throw lastError;
    }

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an expert Confectionery Food Scientist and Master Chocolatier AI Guide. You specialize in water activity, pH hurdles, shelf-life chemistry, and stable emulsions.",
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Formulation Guide API Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// API endpoint for Interactive Guided Formulation
app.post("/api/guided-formulation", async (req, res) => {
  try {
    const { fillingDescription, chocolateType, shelfLife, addAcidSetting } = req.body;

    if (!fillingDescription) {
      return res.status(400).json({ error: "Please tell us what you would like to make today." });
    }

    const ai = getAiClient();

    const prompt = `A confectionery student wants to formulate a custom filling today:
- What they want to make: "${fillingDescription}"
- Which chocolate they are using: "${chocolateType}"
- What shelf life they want: "${shelfLife}" months
- Citric Acid Option: "${addAcidSetting}"

As an expert Confectionery Food Scientist and Master Chocolatier AI, formulate a scientifically balanced, safe recipe (totaling around 1000g) that achieves their target shelf life.

In the 'explanation' field, write a clear, student-friendly, and deeply educational explanation of the recipe formulation:
1. **Explain why you specified this particular fat and solid chocolate percentage** (e.g., to create a stable crystalline emulsion, control fat crystallization, and ensure stability under ambient conditions).
2. **Explain why you added (or did not add) citric acid** (e.g., for fruit fillings like banana, explain why citric acid is crucial to lower the pH under 4.5, activating pectin and acting as a microbial hurdle against pathogenic spores, while also balancing fruit sugars).
3. **Detail how the water-bearing/sugar/fat ratios are balanced** to bind free water and safely control Water Activity (Aw).

Ensure the explanation is formatted beautifully with Markdown bold text, bullet points, and clean spacing so the student is fully engaged and can easily master the food science.

In the 'recipe' field, provide the list of ingredients to load into their Batch Builder. Each ingredient must have:
- name: a descriptive name (e.g. "Mashed Banana Purée", "White Chocolate (32% Cocoa Butter)", "Trimoline / Invert Sugar", "Citric Acid Solution (50% w/w)")
- weight: integer weight in grams (the sum of all ingredients must total around 1000g)
- category: must be one of "water_bearing", "sugar_humectant", "solid_fat_cocoa", or "other"
- purpose: a short educational purpose (e.g. "Fruit moisture phase, provides main flavor", "Provides structure & solid fats", "Binds free water, lowering Aw", "Lowers pH below 4.5 for microbial hurdle barrier")

Map the filling to the closest standard category in 'fillingType' ("ganache", "caramel", "fruit_gel", "fat_based").
Map 'targetShelfLife' to one of "3", "6", "12".
Set 'addAcid' to a boolean indicating if citric acid was included in the formula.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an expert Confectionery Food Scientist and Master Chocolatier AI Guide. You formulate balanced, safe, stable recipes and explain the molecular physics of fats, water activity, and pH barriers in clear, encouraging, educational terms.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A rich, friendly, educational Markdown explanation of why we added this much fat/chocolate, why we added citric acid/acidity, and how the ratios bind free water."
            },
            recipe: {
              type: Type.ARRAY,
              description: "An array of 4-6 balanced ingredients totaling exactly or around 1000g.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  weight: { type: Type.INTEGER },
                  category: { type: Type.STRING, description: "Must be water_bearing, sugar_humectant, solid_fat_cocoa, or other" },
                  purpose: { type: Type.STRING }
                },
                required: ["name", "weight", "category", "purpose"]
              }
            },
            fillingType: { type: Type.STRING },
            targetShelfLife: { type: Type.STRING },
            addAcid: { type: Type.BOOLEAN }
          },
          required: ["explanation", "recipe", "fillingType", "targetShelfLife", "addAcid"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Guided Formulation Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// WordPress Connection Verification API Endpoint
app.post("/api/wordpress/test-connection", async (req, res) => {
  try {
    const { wpUrl, wpUsername, wpAppPassword, useSimulation } = req.body;

    if (useSimulation) {
      return res.json({
        success: true,
        message: "Successfully connected to WordPress API (Simulated). Found 5 active students.",
        siteTitle: "Kreative Chocolates Academy",
        siteUrl: "https://www.kreativechocolates.com",
      });
    }

    if (!wpUrl) {
      return res.status(400).json({ error: "WordPress site URL is required" });
    }

    // Clean URL
    let targetUrl = wpUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    if (targetUrl.endsWith("/")) {
      targetUrl = targetUrl.slice(0, -1);
    }

    const testEndpoint = `${targetUrl}/wp-json/wp/v2/users/me`;
    console.log(`Testing WordPress connection to: ${testEndpoint}`);

    const headers: Record<string, string> = {
      "User-Agent": "kreative-academy-portal/1.0",
      "Content-Type": "application/json",
    };

    if (wpUsername && wpAppPassword) {
      const b64Auth = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");
      headers["Authorization"] = `Basic ${b64Auth}`;
    }

    // Call WordPress REST API with 6 seconds timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const wpResponse = await fetch(testEndpoint, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (wpResponse.status === 200) {
        const userData: any = await wpResponse.json();
        return res.json({
          success: true,
          message: `Connected successfully! Authenticated as "${userData.name || wpUsername}".`,
          siteTitle: "Kreative Chocolates",
          siteUrl: targetUrl,
          user: {
            id: userData.id,
            name: userData.name,
            roles: userData.roles || [],
          }
        });
      } else {
        // Fallback to fetch public site info if /users/me is restricted
        const infoResponse = await fetch(`${targetUrl}/wp-json/`, {
          method: "GET",
          headers: { "User-Agent": "kreative-academy-portal/1.0" }
        });
        if (infoResponse.status === 200) {
          const siteInfo: any = await infoResponse.json();
          return res.json({
            success: true,
            message: `Connected to site public REST API, but credentials for user query need verification. Site: "${siteInfo.name || 'WordPress'}"`,
            siteTitle: siteInfo.name || "Kreative Chocolates",
            siteUrl: targetUrl,
            warning: "Authentication failed for Users endpoint, but site REST API is reachable."
          });
        }

        return res.status(400).json({
          error: `WordPress returned status ${wpResponse.status}. Please verify your site URL, Username, and Application Password.`
        });
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.error("WordPress fetch failed:", fetchErr);
      return res.status(400).json({
        error: `Could not reach WordPress site at ${targetUrl}. Is REST API enabled? Details: ${fetchErr.message || fetchErr}`
      });
    }
  } catch (err: any) {
    console.error("WordPress connection test error:", err);
    res.status(500).json({ error: err.message || "Unexpected server error" });
  }
});

// WordPress Student/Customer Sync API Endpoint
app.post("/api/wordpress/sync-students", async (req, res) => {
  try {
    const { wpUrl, wpUsername, wpAppPassword, useSimulation, syncType } = req.body;

    const simulatedStudents = [
      {
        email: "sehgalbalpreet@gmail.com",
        fullName: "Balpreet Sehgal",
        courseName: "Bean to Bar Professional",
        wpUserId: 101,
        wpUserRegistered: "2026-03-12T14:22:11",
      },
      {
        email: "rohan.mehta@kreativechocolates.com",
        fullName: "Rohan Mehta",
        courseName: "Tempering Science Masterclass",
        wpUserId: 102,
        wpUserRegistered: "2026-04-05T09:15:30",
      },
      {
        email: "sophia.lin@gmail.com",
        fullName: "Sophia Lin",
        courseName: "Artisanal Chocolate Panning",
        wpUserId: 105,
        wpUserRegistered: "2026-05-20T18:44:02",
      },
      {
        email: "gauri.sharma@yahoo.com",
        fullName: "Gauri Sharma",
        courseName: "Bean to Bar Professional",
        wpUserId: 108,
        wpUserRegistered: "2026-06-01T11:30:00",
      },
      {
        email: "amit.patel@outlook.com",
        fullName: "Amit Patel",
        courseName: "Chocolate Formulations Lab",
        wpUserId: 110,
        wpUserRegistered: "2026-06-15T16:05:45",
      }
    ];

    if (useSimulation) {
      return res.json({
        success: true,
        source: "WordPress User Database (Simulated)",
        syncedCount: simulatedStudents.length,
        students: simulatedStudents,
      });
    }

    if (!wpUrl) {
      return res.status(400).json({ error: "WordPress site URL is required" });
    }

    let targetUrl = wpUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    if (targetUrl.endsWith("/")) {
      targetUrl = targetUrl.slice(0, -1);
    }

    // If syncType is "woocommerce", we'll query wc/v3/customers, otherwise wp/v2/users
    const isWoo = syncType === "woocommerce";
    const syncEndpoint = isWoo 
      ? `${targetUrl}/wp-json/wc/v3/customers?per_page=50`
      : `${targetUrl}/wp-json/wp/v2/users?context=edit&per_page=50`;

    const headers: Record<string, string> = {
      "User-Agent": "kreative-academy-portal/1.0",
      "Content-Type": "application/json",
    };

    if (wpUsername && wpAppPassword) {
      const b64Auth = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");
      headers["Authorization"] = `Basic ${b64Auth}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log(`Syncing students from WordPress: ${syncEndpoint}`);
      const wpResponse = await fetch(syncEndpoint, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (wpResponse.status === 200) {
        const wpUsers: any[] = await wpResponse.json();
        
        // Transform standard users or WC customers to matching Student records
        const mappedStudents = wpUsers.map((user: any) => {
          return {
            email: user.email || `${user.slug || user.username}@kreativechocolates.com`,
            fullName: user.name || (user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.username) || "WordPress Student",
            courseName: isWoo ? "WooCommerce Customer Storefront" : "WordPress User Profile",
            wpUserId: user.id,
            wpUserRegistered: user.registered_date || user.date_created || new Date().toISOString(),
          };
        });

        return res.json({
          success: true,
          source: isWoo ? "WooCommerce Customers API" : "WordPress Users API",
          syncedCount: mappedStudents.length,
          students: mappedStudents,
        });
      } else {
        // Fallback to fetch public users list (which might not contain email addresses but let's try)
        console.log("Edit context users query failed. Trying public users list fallback.");
        const fallbackResponse = await fetch(`${targetUrl}/wp-json/wp/v2/users?per_page=20`, {
          method: "GET",
          headers: { "User-Agent": "kreative-academy-portal/1.0" }
        });

        if (fallbackResponse.status === 200) {
          const publicUsers: any[] = await fallbackResponse.json();
          const mappedStudents = publicUsers.map((user: any) => ({
            email: `${user.slug || 'user' + user.id}@kreativechocolates.com`, // email is hidden in public endpoint, so we synthesize it
            fullName: user.name || "WordPress Student",
            courseName: "WordPress Public Enrollee (Email Hidden)",
            wpUserId: user.id,
            wpUserRegistered: new Date().toISOString(),
          }));

          return res.json({
            success: true,
            source: "WordPress Public Users API (Fallback - Emails Obfuscated)",
            syncedCount: mappedStudents.length,
            students: mappedStudents,
            warning: "Note: Since public WordPress endpoint does not expose emails, we synthesized placeholder emails. Please use Application Passwords with Administrator credentials to query actual customer/student emails."
          });
        }

        return res.status(400).json({
          error: `WordPress REST API responded with status ${wpResponse.status}. Verify credentials and permission levels.`
        });
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.error("WordPress student sync failed:", fetchErr);
      return res.status(400).json({
        error: `Failed to fetch users from WordPress: ${fetchErr.message || fetchErr}`
      });
    }
  } catch (err: any) {
    console.error("WordPress sync error:", err);
    res.status(500).json({ error: err.message || "Unexpected server error" });
  }
});

async function startServer() {
  // Vite dev middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
