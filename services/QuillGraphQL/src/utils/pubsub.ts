import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as Redis from 'ioredis';

const options = {
  host: process.env.REDIS_DOMAIN_NAME,
  port: process.env.PORT_NUMBER,
  retry_strategy: options => {
    // reconnect after
    return Math.max(options.attempt * 100, 3000);
  }
};

const pubSub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_CONNECTION_STRING),
  subscriber: new Redis(process.env.REDIS_CONNECTION_STRING)
});

export default pubSub
