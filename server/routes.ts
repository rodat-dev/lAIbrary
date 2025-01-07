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
      const { language, description, example } = req.query as { 
        language?: string; 
        description?: string; 
        example?: string;
      };

      if (!language || !description) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Construct a more focused search query
      const searchTerms = [
        `language:${language}`,
        description,
        example ? `${example} in:name,description,readme` : "",
        "stars:>100", // Add minimum stars filter
        "sort:stars", // Sort by stars
      ].filter(Boolean).join(" ");

      console.log(`Searching GitHub with query: ${searchTerms}`);

      const { data } = await octokit.search.repos({
        q: searchTerms,
        sort: "stars",
        order: "desc",
        per_page: 10,
      });

      console.log(`Found ${data.total_count} repositories`);

      if (data.total_count === 0) {
        return res.json([]);
      }

      const results = data.items.map((repo) => ({
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description || "",
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
      }));

      res.json(results);
    } catch (error: any) {
      console.error('GitHub API Error:', error.response?.data || error);

      if (error.status === 403) {
        res.status(403).json({ 
          message: "GitHub API rate limit exceeded",
          details: error.response?.data
        });
      } else if (error.status === 422) {
        res.status(422).json({ 
          message: "Invalid search query",
          details: error.response?.data
        });
      } else {
        res.status(500).json({ 
          message: "Failed to search repositories",
          details: error.message
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}