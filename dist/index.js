var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { Octokit } from "@octokit/rest";

// server/lib/aiAnalyzer.ts
import OpenAI from "openai";
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. AI analysis features will be disabled.");
}
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
async function analyzeLibrary(name, description, readme) {
  try {
    const prompt = `Analyze this GitHub library:
Name: ${name}
Description: ${description}
README excerpt: ${readme.slice(0, 1500)}...

Please analyze the following aspects:
1. Is it free and open source? (true/false)
2. If it's not completely free, what's the pricing model and starting price?
3. Rate the integration complexity from 1-5 (1 being very easy, 5 being very complex)
4. Briefly explain the complexity rating

Respond in JSON format:
{
  "isOpenSource": boolean,
  "pricing": {
    "type": "free" | "paid" | "freemium",
    "startingPrice": string (if applicable)
  },
  "integrationComplexity": number (1-5),
  "complexityReason": string
}`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a technical analyst specialized in evaluating software libraries. Provide accurate, concise analysis in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error("[AI Analysis Error]", error);
    return {
      isOpenSource: true,
      // Assume open source by default
      pricing: {
        type: "free"
      },
      integrationComplexity: 3,
      // Medium complexity by default
      complexityReason: "Analysis unavailable"
    };
  }
}

// server/lib/searchEnhancer.ts
import OpenAI2 from "openai";
var openai2 = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY
});
async function generateSearchTerms(language, description) {
  try {
    const response = await openai2.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a programming expert that helps find relevant GitHub libraries. Generate 3 different search queries that would help find relevant libraries. Focus on technical and functional aspects, avoid AI/ML terms unless specifically requested. Return only the search terms, one per line."
        },
        {
          role: "user",
          content: `I need to find GitHub libraries for ${language} that can help with: ${description}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    const searchTerms = response.choices[0].message.content?.split("\n").filter((term) => term.trim().length > 0).map((term) => term.trim()) || [];
    searchTerms.push(description);
    return [...new Set(searchTerms)];
  } catch (error) {
    console.error("[Search Term Generation Error]", error);
    return [description];
  }
}
function cleanSearchTerm(term) {
  return term.replace(/[^\w\s-]/g, "");
}
function buildSearchQuery(language, term, example) {
  return [
    `language:${language}`,
    cleanSearchTerm(term),
    example ? `${example} in:name,description,readme` : "",
    "stars:>50"
  ].filter(Boolean).join(" ");
}

// db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  achievementsRelations: () => achievementsRelations,
  bookmarks: () => bookmarks,
  bookmarksRelations: () => bookmarksRelations,
  insertAchievementSchema: () => insertAchievementSchema,
  insertBookmarkSchema: () => insertBookmarkSchema,
  insertLibrarySchema: () => insertLibrarySchema,
  insertSearchResultSchema: () => insertSearchResultSchema,
  insertSearchSchema: () => insertSearchSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserSchema: () => insertUserSchema,
  libraries: () => libraries,
  librariesRelations: () => librariesRelations,
  searchResults: () => searchResults,
  searchResultsRelations: () => searchResultsRelations,
  searches: () => searches,
  searchesRelations: () => searchesRelations,
  selectAchievementSchema: () => selectAchievementSchema,
  selectBookmarkSchema: () => selectBookmarkSchema,
  selectLibrarySchema: () => selectLibrarySchema,
  selectSearchResultSchema: () => selectSearchResultSchema,
  selectSearchSchema: () => selectSearchSchema,
  selectUserAchievementSchema: () => selectUserAchievementSchema,
  selectUserSchema: () => selectUserSchema,
  userAchievements: () => userAchievements,
  userAchievementsRelations: () => userAchievementsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  lastLoginAt: timestamp("last_login_at").defaultNow()
});
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").notNull(),
  category: text("category").notNull()
});
var userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull()
});
var searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  language: text("language").notNull(),
  description: text("description").notNull(),
  example: text("example"),
  points: integer("points").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var libraries = pgTable("libraries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  stars: integer("stars").notNull(),
  forks: integer("forks").notNull(),
  topics: json("topics").$type().default([]),
  updatedAt: timestamp("updated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id).notNull(),
  libraryId: integer("library_id").references(() => libraries.id).notNull(),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  libraryId: integer("library_id").references(() => libraries.id).notNull(),
  notes: text("notes"),
  tags: json("tags").$type().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var searchesRelations = relations(searches, ({ many }) => ({
  results: many(searchResults)
}));
var usersRelations = relations(users, ({ many }) => ({
  achievements: many(userAchievements),
  searches: many(searches),
  bookmarks: many(bookmarks)
}));
var achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));
var userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));
var librariesRelations = relations(libraries, ({ many }) => ({
  searchResults: many(searchResults),
  bookmarks: many(bookmarks)
}));
var searchResultsRelations = relations(searchResults, ({ one }) => ({
  search: one(searches, {
    fields: [searchResults.searchId],
    references: [searches.id]
  }),
  library: one(libraries, {
    fields: [searchResults.libraryId],
    references: [libraries.id]
  })
}));
var bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id]
  }),
  library: one(libraries, {
    fields: [bookmarks.libraryId],
    references: [libraries.id]
  })
}));
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);
var insertSearchSchema = createInsertSchema(searches);
var selectSearchSchema = createSelectSchema(searches);
var insertLibrarySchema = createInsertSchema(libraries);
var selectLibrarySchema = createSelectSchema(libraries);
var insertSearchResultSchema = createInsertSchema(searchResults);
var selectSearchResultSchema = createSelectSchema(searchResults);
var insertAchievementSchema = createInsertSchema(achievements);
var selectAchievementSchema = createSelectSchema(achievements);
var insertUserAchievementSchema = createInsertSchema(userAchievements);
var selectUserAchievementSchema = createSelectSchema(userAchievements);
var insertBookmarkSchema = createInsertSchema(bookmarks);
var selectBookmarkSchema = createSelectSchema(bookmarks);

// db/index.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var db = drizzle({
  connection: process.env.DATABASE_URL,
  schema: schema_exports,
  ws
});

// server/routes.ts
import { eq, and } from "drizzle-orm";
var octokit;
if (process.env.GITHUB_TOKEN) {
  octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
} else {
  octokit = new Octokit();
}
function registerRoutes(app2) {
  app2.post("/api/bookmarks", async (req, res) => {
    try {
      const { userId, libraryId, notes, tags } = req.body;
      if (!userId || !libraryId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const [bookmark] = await db.insert(bookmarks).values({
        userId,
        libraryId,
        notes,
        tags: tags || []
      }).returning();
      res.json(bookmark);
    } catch (error) {
      console.error("[Bookmark Creation Error]", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });
  app2.get("/api/bookmarks", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const userBookmarks = await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, Number(userId)),
        with: {
          library: true
        }
      });
      res.json(userBookmarks);
    } catch (error) {
      console.error("[Bookmark Retrieval Error]", error);
      res.status(500).json({ message: "Failed to retrieve bookmarks" });
    }
  });
  app2.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const [deletedBookmark] = await db.delete(bookmarks).where(and(
        eq(bookmarks.id, Number(id)),
        eq(bookmarks.userId, Number(userId))
      )).returning();
      if (!deletedBookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      res.json({ message: "Bookmark deleted successfully" });
    } catch (error) {
      console.error("[Bookmark Deletion Error]", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const { language, description, example } = req.query;
      if (!language || !description) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const searchTerms = await generateSearchTerms(language, description);
      console.log(`[Search Terms Generated]`, searchTerms);
      const searchPromises = searchTerms.map(async (term) => {
        const searchQuery = buildSearchQuery(language, term, example);
        console.log(`[GitHub Search] Query: "${searchQuery}"`);
        try {
          const { data } = await octokit.search.repos({
            q: searchQuery,
            sort: "stars",
            order: "desc",
            per_page: 5
            // Reduce per_page since we're doing multiple searches
          });
          return data.items || [];
        } catch (error) {
          console.error(`[GitHub Search Error] Failed query: ${searchQuery}`, error);
          return [];
        }
      });
      const searchResults2 = await Promise.all(searchPromises);
      const uniqueRepos = /* @__PURE__ */ new Map();
      searchResults2.flat().forEach((repo) => {
        if (!uniqueRepos.has(repo.html_url)) {
          uniqueRepos.set(repo.html_url, repo);
        }
      });
      const dedupedResults = Array.from(uniqueRepos.values()).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
      if (dedupedResults.length === 0) {
        return res.json([]);
      }
      const results = await Promise.all(dedupedResults.map(async (repo) => {
        try {
          const readmeResponse = await octokit.repos.getReadme({
            owner: repo.owner.login,
            repo: repo.name
          });
          const readmeContent = Buffer.from(readmeResponse.data.content, "base64").toString("utf-8");
          const analysis = await analyzeLibrary(
            repo.name,
            repo.description || "",
            readmeContent
          );
          return {
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description || "",
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            topics: repo.topics || [],
            updatedAt: repo.updated_at,
            analysis
          };
        } catch (error) {
          console.error(`[GitHub Analysis Error] Failed to analyze ${repo.full_name}:`, error);
          return {
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description || "",
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            topics: repo.topics || [],
            updatedAt: repo.updated_at
          };
        }
      }));
      res.json(results);
    } catch (error) {
      console.error("[GitHub Search Error]", {
        status: error.status,
        message: error.message,
        response: error.response?.data,
        headers: error.response?.headers
      });
      if (error.status === 403) {
        const rateLimit = error.response?.headers?.["x-ratelimit-remaining"];
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        if (msg.includes("[TypeScript] Found 0 errors. Watching for file changes")) {
          log("no errors found", "tsc");
          return;
        }
        if (msg.includes("[TypeScript] ")) {
          const [errors, summary] = msg.split("[TypeScript] ", 2);
          log(`${summary} ${errors}\x1B[0m`, "tsc");
          return;
        } else {
          viteLogger.error(msg, options);
          process.exit(1);
        }
      }
    },
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
