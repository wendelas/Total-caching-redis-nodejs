var redis = require("redis");

async function testCache() {

    // Conectar no cache Redis
    var cacheHostName = process.env.REDISCACHEHOSTNAME;
    var cachePassword = process.env.REDISCACHEKEY;
    var cacheConnection = redis.createClient(6379);
    await cacheConnection.connect();

    // executar operacoes...

    // executando o comando PING
    console.log("\nCache command: PING");
    console.log("Cache response : " + await cacheConnection.ping());

    // GET e put 
    console.log("\nCache command: GET Message");
    console.log("Cache response : " + await cacheConnection.get("Message"));

    console.log("\nCache command: SET Message");
    console.log("Cache response : " + await cacheConnection.set("Message",
        "Hello! The cache is working from Node.js!"));

    // Demonstrate "SET Message" executed as expected...
    console.log("\nCache command: GET Message");
    console.log("Cache response : " + await cacheConnection.get("Message"));

    // lista de clientes usando a conexãoGet the client list, useful to see if connection list is growing...
    console.log("\nCache command: CLIENT LIST");
    console.log("Cache response : " + await cacheConnection.sendCommand(["CLIENT", "LIST"]));

    console.log("Fim");
    process.exit();
}

testCache();