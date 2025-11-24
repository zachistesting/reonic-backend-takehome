import pino, { type Logger } from "pino";

export const getLoggerConfig = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return {
    level: process.env.LOG_LEVEL || "info",
    transport: isDevelopment
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
          },
        }
      : undefined,
  };
};

export const createLogger = (name: string): Logger => {
  return pino({
    name,
    ...getLoggerConfig(),
  });
};

export { pino };
export type { Logger };
