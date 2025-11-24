import type { FastifyReply, FastifyRequest } from "fastify";

export const errorHandler = (
  error: Error & { statusCode?: number; validation?: unknown },
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error.name === "NotFoundError") {
    reply.code(404).send({ error: error.message });
    return;
  }

  if (error.name === "DuplicateError") {
    reply.code(409).send({ error: error.message });
    return;
  }

  if (error.name === "ValidationError") {
    reply.code(400).send({ error: error.message });
    return;
  }

  if (error.validation) {
    reply.code(400).send({ error: "Validation failed", details: error.validation });
    return;
  }

  reply.code(error.statusCode || 500).send({
    error: error.message || "Internal server error",
  });
};
