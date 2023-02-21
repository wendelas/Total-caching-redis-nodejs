//import { rediss } from 'redis';
var rediss = require("redis");

async function redisJSONDemo() {
  try {
    const TEST_KEY = 'test_node';

    const client = rediss.createClient(6379);
    await client.connect();

    // RedisJSON uses JSON Path syntax. '.' is the root.
    await client.set(TEST_KEY, '.WWW');
    
    const value = await client.get(TEST_KEY, {
      // JSON Path: .node = the element called 'node' at root level.
      path: '.node',
    });

    console.log(`value of node: ${value}`);

    await client.quit();
  } catch (e) {
    console.error(e);
  }
}

redisJSONDemo();