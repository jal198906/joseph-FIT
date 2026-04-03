import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Spoonacular Random Recipe
  app.get("/api/recipes/random", (req, res) => {
    const options = {
      method: "GET",
      hostname: "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      port: null,
      path: "/recipes/random?number=1",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
        "x-rapidapi-host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    };

    const spoonReq = https.request(options, (spoonRes) => {
      const chunks: Buffer[] = [];

      spoonRes.on("data", (chunk) => {
        chunks.push(chunk);
      });

      spoonRes.on("end", () => {
        const body = Buffer.concat(chunks);
        try {
          const data = JSON.parse(body.toString());
          res.json(data);
        } catch (e) {
          res.status(500).json({ error: "Failed to parse Spoonacular response", raw: body.toString() });
        }
      });
    });

    spoonReq.on("error", (error) => {
      res.status(500).json({ error: error.message });
    });

    spoonReq.end();
  });

  // Vite middleware for development
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
