import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      userId: number;
    };
  }
}
