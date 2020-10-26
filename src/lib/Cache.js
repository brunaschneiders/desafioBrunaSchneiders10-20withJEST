import redis from 'redis';
import Promise from 'bluebird';

Promise.promisifyAll(redis);

class Cache {
  constructor() {
    this.client = redis.createClient(process.env.REDISCLOUD_URL);
  }

  get(key) {
    return this.client.getAsync(key);
  }

  set(key, data) {
    return this.client.setAsync(key, data);
  }

  setExpire(key, data, ttl) {
    return this.client.setAsync(key, data, 'EX', ttl);
  }

  delete(key) {
    return this.client.del(key);
  }
}

export default new Cache();
