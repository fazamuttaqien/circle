import { createClient } from "redis";
import * as dotenv from "dotenv";
dotenv.config();

export const DEFAULT_EXPIRATION = 3600;

const url = `redis://${process.env.REDIS_DB_USER}:${process.env.REDIS_DB_PASS}@${process.env.REDIS_DB_URL}`;
const redis = createClient({
  url: url,
});

const redisconnect = async () => {
  await redis.connect().catch((error) => {
    console.error(error);
    process.exit(0);
  });
};

export { redis, redisconnect };
