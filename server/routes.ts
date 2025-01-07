import type { Express } from "express";
import { createServer, type Server } from "http";
import { Octokit } from "@octokit/rest";
import { analyzeLibrary } from "./lib/aiAnalyzer";
import { db } from "@db";
import { bookmarks, libraries } from "@db/schema";
import { eq, and } from "drizzle-orm";

let octokit: Octokit;

if (process.env.GITHUB_TOKEN) {
  octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
} else {
  octokit = new Octokit();
}

export function registerRoutes(app: Express): Server {
  // Bookmark routes
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const { userId, libraryId, notes, tags } = req.body;

      if (!userId || !libraryId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const [bookmark] = await db.insert(bookmarks).values({
        userId,
        libraryId,
        notes,
        tags: tags || [],
      }).returning();

      res.json(bookmark);
    } catch (error: any) {
      console.error("[Bookmark Creation Error]", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.get("/api/bookmarks", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const userBookmarks = await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, Number(userId)),
        with: {
          library: true,
        },
      });

      res.json(userBookmarks);
    } catch (error: any) {
      console.error("[Bookmark Retrieval Error]", error);
      res.status(500).json({ message: "Failed to retrieve bookmarks" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const [deletedBookmark] = await db.delete(bookmarks)
        .where(and(
          eq(bookmarks.id, Number(id)),
          eq(bookmarks.userId, Number(userId))
        ))
        .returning();

      if (!deletedBookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      res.json({ message: "Bookmark deleted successfully" });
    } catch (error: any) {
      console.error("[Bookmark Deletion Error]", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // Existing search route
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

      const searchTerms = [
        `language:${language}`,
        description.replace(/[^\w\s]/g, ''),
        example ? `${example} in:name,description,readme` : "",
        "stars:>50",
      ].filter(Boolean).join(" ");

      console.log(`[GitHub Search] Query: "${searchTerms}"`);

      const { data } = await octokit.search.repos({
        q: searchTerms,
        sort: "stars",
        order: "desc",
        per_page: 10,
      });

      if (data.total_count === 0) {
        return res.json([]);
      }

      const results = await Promise.all(data.items.map(async (repo) => {
        try {
          const readmeResponse = await octokit.repos.getReadme({
            owner: repo.owner!.login,
            repo: repo.name,
          });

          const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');

          const analysis = await analyzeLibrary(
            repo.name,
            repo.description || "",
            readmeContent
          );

          return {
            name: repo.name,
            owner: repo.owner!.login,
            description: repo.description || "",
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            topics: repo.topics || [],
            updatedAt: repo.updated_at,
            analysis,
          };
        } catch (error) {
          console.error(`[GitHub Analysis Error] Failed to analyze ${repo.full_name}:`, error);
          return {
            name: repo.name,
            owner: repo.owner!.login,
            description: repo.description || "",
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            topics: repo.topics || [],
            updatedAt: repo.updated_at,
          };
        }
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