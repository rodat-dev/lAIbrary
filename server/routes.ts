import type { Express } from "express";
import { createServer, type Server } from "http";
import { Octokit } from "@octokit/rest";

let octokit: Octokit;

if (process.env.GITHUB_TOKEN) {
  octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
} else {
  octokit = new Octokit();
}

export function registerRoutes(app: Express): Server {
  app.get("/api/search", async (req, res) => {
    try {
      const { language, description, example } = req.query;

      if (!language || !description) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const query = `language:${language} ${description} ${example || ""}`;
      
      const { data } = await octokit.search.repos({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 10,
      });

      const results = data.items.map((repo) => ({
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
      }));

      res.json(results);
    } catch (error: any) {
      if (error.status === 403) {
        res.status(403).json({ message: "GitHub API rate limit exceeded" });
      } else {
        res.status(500).json({ message: "Failed to search repositories" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
