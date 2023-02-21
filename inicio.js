const axios = require("axios");
const express = require("express");
const redis = require("redis");
 
const app = express();
const redisClient = redis.createClient(6379); // Redis server started at port 6379
const MOCK_API = "https://jsonplaceholder.typicode.com/users/";
 redisClient.connect();




app.get("/redisPing", (req, res) => {
    // Simple PING command
    console.log("\nCache command: PING");
    console.log("Cache response : " + redisClient.ping());

    // Simple get and put of integral data types into the cache
    console.log("\nCache command: GET Message");
    console.log("Cache response : " + redisClient.get("Message"));

    console.log("\nCache command: SET Message");
    console.log("Cache response : " + redisClient.set("Message",
        "Hello! The cache is working from Node.js!"));

    // Demonstrate "SET Message" executed as expected...
    console.log("\nCache command: GET Message");
    console.log("Cache response : " + redisClient.get("Message"));

    // Get the client list, useful to see if connection list is growing...
    console.log("\nCache command: CLIENT LIST");
    console.log("Cache response : " + redisClient.sendCommand(["CLIENT", "LIST"]));

    console.log("\nDone");
    //process.exit();
});

app.get("/users", (req, res) => {
  const email = req.query.email;
 const value = redisClient.get("Message");
  console.log("valor " + value);

  //redisClient.setEx(email, 600, JSON.stringify("users"));

  try {
    axios.get(`${MOCK_API}?email=${email}`).then(function (response) {
      const users = response.data;
 
      console.log("User successfully retrieved from the API l49");
 
      res.status(200).send(users);
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }




});
 
app.get("/cached-users", (req, res) => {
  const email = req.query.email;
 
  try {
    redisClient.get(email, (err, data) => {
      if (err) {
        console.error(err);
        throw err;
      }
 
      if (data) {
        console.log("User successfully retrieved from Redis");
 
        res.status(200).send(JSON.parse(data));
      } else {
        axios.get(`${MOCK_API}?email=${email}`).then(function (response) {
          const users = response.data;
          redisClient.setex(email, 600, JSON.stringify(users));
 
          console.log("User successfully retrieved from the API");
 
          res.status(200).send(users);
        });
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});