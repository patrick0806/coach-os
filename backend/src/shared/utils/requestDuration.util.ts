import { FastifyRequest } from 'fastify';

/**
 * Calcula a duração da request em milissegundos
 * @param request - FastifyRequest object
 * @returns Duração em ms ou undefined se startTime não estiver definido
 */
export function getRequestDuration(request: FastifyRequest): number | undefined {
  const startTime = (request as any).startTime;

  if (!startTime || typeof startTime !== 'number') {
    return undefined;
  }

  return Date.now() - startTime;
}
