import { createClient } from "redis";
import * as dotenv from "dotenv";
dotenv.config();

export const DEFAULT_EXPIRATION = 3600;

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
  },
});

const redisConnect = async () => {
  await redisClient
    .connect()
    .then(() => {
      console.log("Redis client is ready to use");
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

export { redisClient, redisConnect };
