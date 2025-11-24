export const envSchema = {
  type: "object",
  required: ["DATABASE_URL"],
  properties: {
    DATABASE_URL: {
      type: "string",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    PORT: {
      type: "number",
      default: 3000,
    },
    LOG_LEVEL: {
      type: "string",
      default: "info",
    },
    CORS_ORIGIN: {
      type: "string",
      default: "*",
    },
  },
} as const;
