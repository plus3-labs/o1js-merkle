import fastify from 'fastify';
import { isReady, PrivateKey } from 'snarkyjs';

await isReady;

const server = fastify()

server.get('/ping', async (request, reply) => {
  const priKey = PrivateKey.random();
  return priKey.toBase58();
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
});