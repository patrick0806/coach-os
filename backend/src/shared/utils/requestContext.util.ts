import { FastifyRequest } from "fastify";

interface RequestContext {
  correlationId: string | null;
  userId?: string;
  tenantId?: string;
}

export function getRequestContext(request: FastifyRequest): RequestContext {
  const user = (request as any).user;
  return {
    correlationId: request.correlationId ?? null,
    userId: user?.sub,
    tenantId: user?.personalId,
  };
}
