import { createClient } from 'redis';
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
    password:process.env.REDIS_PASSWORD,
    socket: {
        host:process.env.REDIS_HOST ,
        port:process.env.REDIS_PORT
    }
});

redisClient.on('error', (e) => console.log(e));

if (!redisClient.isOpen) {
  redisClient.connect();
};

export {redisClient};
