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
      console.log(language, description, example);

      if (!language || !description) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Construct a more focused search query
      const searchTerms = [
        `language:${language}`,
        description.replace(/[^\w\s]/g, ''), // Clean up special characters
        example ? `${example} in:name,description,readme` : "",
        "stars:>50", // Lower the stars threshold
      ].filter(Boolean).join(" ");

      console.log(`[GitHub Search] Query: "${searchTerms}"`);

      const { data } = await octokit.search.repos({
        q: searchTerms,
        sort: "stars",
        order: "desc",
        per_page: 10,
      });

      console.log(`[GitHub Search] Found ${data.total_count} repositories`);

      if (data.items?.length > 0) {
        console.log(`[GitHub Search] First result: ${data.items[0].full_name}`);
      } else {
        console.log('[GitHub Search] No items in response');
      }

      if (data.total_count === 0) {
        return res.json([]);
      }

      const results = data.items.map((repo) => ({
        name: repo.name,
        owner: repo.owner?.login,
        description: repo.description || "",
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
      }));

      res.json(results);
    } catch (error: any) {
      console.error('[GitHub Search Error]', {
        status: error.status,
        message: error.message,
        response: error.response?.data,
        headers: error.response?.headers,
      });

      if (error.status === 403) {
        const rateLimit = error.response?.headers?.['x-ratelimit-remaining'];
        res.status(403).json({ 
          message: "GitHub API rate limit exceeded",
          details: {
            rateLimit,
            ...error.response?.data
          }
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