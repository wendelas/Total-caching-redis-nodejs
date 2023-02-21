const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const port = process.env.PORT || 3000;

let redisClient;
/*
const clientModelRedis = createClient({
    password: 'AFZxXi1I7HpY0edBwayomd5voZUwiSXU',
    socket: {
        host: 'redis-18680.c270.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18680
    }
});
*/
(async () => {
  redisClient = redis.createClient({
    password: 'AFZxXi1I7HpY0edBwayomd5voZUwiSXU',
    socket: {
        host: 'redis-18680.c270.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18680
    }
});

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to the API");
  return apiResponse.data;
}

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;
  let isCached = false;

  try {
    const cacheResults = await redisClient.get(species);
    if (cacheResults) {
      isCached = true;
      results = JSON.parse(cacheResults);
      console.log(results);
    } else {
      results = await fetchApiData(species);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      await redisClient.set(species, JSON.stringify(results));
    }

    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/fish/:species", getSpeciesData);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});