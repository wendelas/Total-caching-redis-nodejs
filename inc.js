//import { rediss } from 'redis';
var rediss = require("redis");

async function redisJSONDemo() {
  try {
    const valor = 'likes';

    const client = rediss.createClient(6379);
    await client.connect();

    // RedisJSON uses JSON Path syntax. '.' is the root.
    await client.set(valor, '10');
    
    const value = await client.get(valor);

    console.log(`value of node: ${value}`);
    const incs = await client.incr(valor);
    
    console.log("incs: " + incs);
    await client.quit();
  } catch (e) {
    console.error(e);
  }
}

redisJSONDemo();