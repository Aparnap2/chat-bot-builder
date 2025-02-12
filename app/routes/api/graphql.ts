// app/routes/api/graphql.ts
import { ApolloServer, gql } from "apollo-server-micro";
import { prisma } from "~/utils/prisma.server";
import { v4 as uuidv4 } from "uuid";
import { rateLimiter } from "~/utils/redis.server";
import Tesseract from "tesseract.js";


// GraphQL Schema with additional types for vector operations.
const typeDefs = gql`
  type Chatbot {
    id: ID!
    name: String!
    connectionString: String!
    ownerId: String!
    createdAt: String!
    updatedAt: String!
  }
  
  type UserUsage {
    totalChatbots: Int!
    totalQueries: Int!
    lastActive: String
  }

  input VectorInput {
    vector: [Float!]!
    content: String!
  }

  type Vector {
    id: ID!
    vector: [Float!]!
    content: String!
    userId: String!
    createdAt: String!
  }

  type Query {
    chatbots: [Chatbot!]!
    chatbot(id: ID!): Chatbot
    ragResponse(query: String!): String!
    userUsage: UserUsage!
    searchVectors(query: String!): [Vector!]!
  }

  type Mutation {
    createChatbot(name: String!): Chatbot!
    updateChatbot(id: ID!, name: String): Chatbot!
    deleteChatbot(id: ID!): Chatbot!
    processOCR(imageUrl: String!): String!
    submitVector(input: VectorInput!): Vector!
  }
`;

// Placeholder for Gemini integration using core packages.
async function fetchGeminiResponse(query: string): Promise<string> {
  // Replace with real Gemini integration logic.
  return `Gemini processed: ${query}`;
}

// Placeholder for Astra DB integration in RAG pipeline.
// Here we include user-specific filtering.
async function fetchAstraRAG(query: string, userId: string): Promise<string> {
  try {
    const response = await fetch(process.env.RAG_API_URL!, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${process.env.RAG_API_KEY}`,
      },
      body: JSON.stringify({ query, userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch RAG response");
    }
    const data = await response.json();
    return data.response || "No response from Astra DB";
  } catch (error) {
    console.error("Astra RAG error:", error);
    return "Error fetching RAG response";
  }
}

// OCR processing function using tesseract.js.
async function processOCRImage(imageUrl: string): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(imageUrl, "eng");
    return data.text;
  } catch (error) {
    console.error("OCR error:", error);
    return "Error processing OCR";
  }
}

// Function to submit vector data to Astra DB, embedding the userId in metadata.
async function submitVectorToAstra(input: { vector: number[]; content: string }, userId: string): Promise<any> {
  try {
    const response = await fetch(process.env.RAG_API_URL + "/submit", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${process.env.RAG_API_KEY}`,
      },
      body: JSON.stringify({
         userId, // Partition key / metadata for user data segregation.
         vector: input.vector,
         content: input.content,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit vector to Astra DB");
    }
    return await response.json();
  } catch (error) {
    console.error("Submit vector error:", error);
    throw error;
  }
}

// Function to search vectors from Astra DB, filtering by userId.
async function searchVectorsFromAstra(query: string, userId: string): Promise<any[]> {
  try {
    const response = await fetch(process.env.RAG_API_URL + "/search", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${process.env.RAG_API_KEY}`,
      },
      body: JSON.stringify({
         query,
         userId, // Ensure that we retrieve only this user's vectors.
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to search vectors in Astra DB");
    }
    return await response.json();
  } catch (error) {
    console.error("Search vectors error:", error);
    throw error;
  }
}

// In-memory usage counter for demo purposes (persist in production).
const userUsageCounters: { [userId: string]: { totalQueries: number; lastActive: Date } } = {};

const resolvers = {
  Query: {
    chatbots: async (_: any, __: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      if (!context.userId) throw new Error("Not authenticated");
      if (!userUsageCounters[context.userId]) {
         userUsageCounters[context.userId] = { totalQueries: 0, lastActive: new Date() };
      }
      userUsageCounters[context.userId].totalQueries++;
      userUsageCounters[context.userId].lastActive = new Date();
      return await prisma.chatbot.findMany({ where: { ownerId: context.userId } });
    },
    chatbot: async (_: any, { id }: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      if (!context.userId) throw new Error("Not authenticated");
      return await prisma.chatbot.findUnique({ where: { id } });
    },
    ragResponse: async (_: any, { query }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      const geminiRes = await fetchGeminiResponse(query);
      if (geminiRes && geminiRes !== "") {
         return geminiRes;
      }
      return await fetchAstraRAG(query, context.userId);
    },
    userUsage: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      const totalChatbots = await prisma.chatbot.count({ where: { ownerId: context.userId } });
      const usage = userUsageCounters[context.userId] || { totalQueries: 0, lastActive: new Date() };
      return {
        totalChatbots,
        totalQueries: usage.totalQueries,
        lastActive: usage.lastActive.toISOString(),
      };
    },
    searchVectors: async (_: any, { query }: any, context: any) => {
      if (!context.userId) throw new Error("Not authenticated");
      return await searchVectorsFromAstra(query, context.userId);
    },
  },
  Mutation: {
    createChatbot: async (_: any, { name }: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      if (!context.userId) throw new Error("Not authenticated");
      const connectionString = uuidv4();
      return await prisma.chatbot.create({
        data: {
          name,
          connectionString,
          ownerId: context.userId,
        },
      });
    },
    updateChatbot: async (_: any, { id, name }: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      if (!context.userId) throw new Error("Not authenticated");
      return await prisma.chatbot.update({ where: { id }, data: { name } });
    },
    deleteChatbot: async (_: any, { id }: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      if (!context.userId) throw new Error("Not authenticated");
      return await prisma.chatbot.delete({ where: { id } });
    },
    processOCR: async (_: any, { imageUrl }: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      return await processOCRImage(imageUrl);
    },
    submitVector: async (_: any, { input }: any, context: any) => {
      const ip = context.ip || "unknown";
      if (!(await rateLimiter(ip))) throw new Error("Rate limit exceeded");
      if (!context.userId) throw new Error("Not authenticated");
      return await submitVectorToAstra(input, context.userId);
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  context: async ({ request }: { request: Request }) => {
    const userId = request.headers.get("x-user-id") || null;
    const ip = request.headers.get("x-forwarded-for") || "";
    return { userId, ip };
  },
});

await apolloServer.start();

export const config = {
  api: { bodyParser: false },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
