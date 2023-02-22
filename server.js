const express = require("express");
const axios = require("axios");
const redis = require("redis");
const {
  createClient,
  SchemaFieldTypes,
  AggregateGroupByReducers,
  AggregateSteps
} = require('redis');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3001;
const passRedis = process.env.PASS_REDIS || "";
const hostRedis = process.env.HOST_REDIS || "127.0.0.1";
const portRedis = process.env.PORT_REDIS || 6379;


let redisClient;
let contador = 0;

(async () => {
  redisClient = redis.createClient({
    password: "AFZxXi1I7HpY0edBwayomd5voZUwiSXU",
    socket: {
      host: "redis-18680.c270.us-east-1-3.ec2.cloud.redislabs.com",
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
      console.log("------ RESULTADO redis: ");
      //console.log(results);
    } else {
      results = await fetchApiData(species);
      console.log("RESULTADO API :   ");
      //console.log(results);
      if (results.length === 0) {
        throw "Api não foi chamada";
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


//api busca escola por id
async function fetchEscolaData(name) {
  const apiResponse = await axios.get(
    `http://localhost:3000/schools?name=${name}`
  );
  console.log("Request name for sent to the API");
  return apiResponse.data;
}

async function getEscolaData(req, res) {
  const name = req.params.name;
  let results;
  let isCached = false;

  try {
    const cacheResults = await redisClient.get(name);
    if (cacheResults) {
      isCached = true;
      results = JSON.parse(cacheResults);
      console.log("------ RESULTADO redis: ");
      console.log(results);
    } else {
      results = await fetchEscolaData(name);
      console.log("RESULTADO API :   ");
      console.log(results);
      if (results.length === 0) {
        throw "Api não foi chamada";
      }
      await redisClient.set(name, JSON.stringify(results));
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

app.get("/schools/:name", getEscolaData);


//api busca escola por id
async function fetchLikeData(keyNoticia) {
  const apiResponse = await axios.get(
    `http://localhost:3000/schools/${keyNoticia}`
  );
  console.log("Request name for sent to the API");

  return apiResponse.data;
}

//incrementa api
async function fetchLikeApi(keyNoticia) {
  const apiResponse = await axios.get(
    `http://localhost:3000/schools/${keyNoticia}`
  );
  console.log("Request name for sent to the API");

  return apiResponse.data;
}

//like
async function likeData(req, res) {
  const keyNoticia = req.params.keyNoticia; //like:comentario:1
  let results;
  let isCached = false;

  try {
    const cacheResults = await redisClient.get(keyNoticia);
    if (cacheResults) {
      isCached = true;
      results = await redisClient.incr(keyNoticia);

      quantidadeLikes = JSON.parse(results);
      console.log("------ RESULTADO redis: ");
      console.log(quantidadeLikes);
    } else {
      //acessar baseMongo inserir likes e depois incrementar
      //incrementar minha base
      const id = keyNoticia.slice(-1);
      //recuperar minha base
      results = await fetchLikeData(id);
      const likesq = results.likes;
      console.log("RESULTADO API :   ");
      console.log(likesq);

      if (results.length === 0) {
        throw "Api não foi chamada";
      }
      await redisClient.set(keyNoticia, JSON.stringify(likesq));
      results = await redisClient.incr(keyNoticia);
      console.log(results);
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
app.get("/like/:keyNoticia", likeData);

//dislikeData
async function dislikeData(req, res) {
  const keyNoticia = req.params.keyNoticia; //like:comentario:1
  let results;
  let isCached = false;

  try {
    const cacheResults = await redisClient.get(keyNoticia);
    if (cacheResults) {
      isCached = true;
      results = await redisClient.decr(keyNoticia);

      quantidadeLikes = JSON.parse(results);
      console.log("------ RESULTADO redis: ");
      console.log(quantidadeLikes);
    } else {
      //acessar baseMongo inserir likes e depois incrementar
      //incrementar minha base
      const id = keyNoticia.slice(-1);
      //recuperar minha base
      results = await fetchLikeData(id);
      const likesq = results.likes;
      console.log("RESULTADO API :   ");
      console.log(likesq);

      if (results.length === 0) {
        throw "Api não foi chamada";
      }
      await redisClient.set(keyNoticia, JSON.stringify(likesq));
      results = await redisClient.incr(keyNoticia);
      console.log(results);
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
app.get("/dislike/:keyNoticia", dislikeData);

//jsonSetData
async function jsonSetData(req, res) {
  const jsonSet = req.body; //like:comentario:1

  //console.log(jsonSet);
  let isCached = true;
  let nomeKey = "school_json:"



  const results = await redisClient.json.set('noticia:agn:2', '$', jsonSet);

  res.send({
    fromCache: isCached,
    data: results,
  });

}

//jsonGetData
async function jsonGetData(req, res) {
  const keyNoticia = req.params.keyNoticia; //like:comentario:1


  let isCached = true;
  let nomeKey = "school_json:"



  const results = await redisClient.json.get('keyNoticia');

  res.send({
    fromCache: isCached,
    data: results,
  });

}


//jsonGetDataParametros
async function jsonGetDataParametros(req, res) {
  const keyNoticia = req.params.keyNoticia; //like:comentario:1
  const filtro = req.params.parametro; //like:comentario:1


  let isCached = true;
  let nomeKey = "school_json:"



  const results = await redisClient.json.get('keyNoticia');

  res.send({
    fromCache: isCached,
    data: results,
  });

}

async function searchJson(req, res) {

  // Create an index.
  // https://redis.io/commands/ft.create/
  try {
    await redisClient.ft.create('idx:users', {
      '$.name': {
        type: SchemaFieldTypes.TEXT,
        SORTABLE: 'UNF'
      },
      '$.age': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'age'
      },
      '$.coins': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'coins'
      },
      '$.email': {
        type: SchemaFieldTypes.TAG,
        AS: 'email'
      }
    }, {
      ON: 'JSON',
      PREFIX: 'noderedis:users'
    });
  } catch (e) {
    if (e.message === 'Index already exists') {
      console.log('Index exists already, skipped creation.');
    } else {
      // Something went wrong, perhaps RediSearch isn't installed...
      console.error(e);
      process.exit(1);
    }
  }

  // Add some users.
  // https://redis.io/commands/json.set/
  await Promise.all([
    redisClient.json.set('noderedis:users:1', '$', {
      name: 'Alice',
      age: 32,
      coins: 100,
      email: 'alice@nonexist.com'
    }),
    redisClient.json.set('noderedis:users:2', '$', {
      name: 'Bob',
      age: 23,
      coins: 15,
      email: 'bob@somewhere.gov'
    })
  ]);

  // Search all users under 30
  console.log('Users under 30 years old:');
  console.log(
    // https://redis.io/commands/ft.search/
    JSON.stringify(
      await redisClient.ft.search('idx:users', '@age:[0 30]'),
      null,
      2
    )
  );
  // {
  //   "total": 1,
  //   "documents": [
  //     {
  //       "id": "noderedis:users:2",
  //       "value": {
  //         "name": "Bob",
  //         "age": 23,
  //         "coins": 15,
  //         "email": "bob@somewhere.gov"
  //       }
  //     }
  //   ]
  // }

  // Find a user by email - note we need to escape . and @ characters
  // in the email address.  This applies for other punctuation too.
  // https://redis.io/docs/stack/search/reference/tags/#including-punctuation-in-tags
  console.log('Users with email "bob@somewhere.gov":');
  const emailAddress = 'bob@somewhere.gov'.replace(/[.@\\]/g, '\\$&');
  console.log(
    JSON.stringify(
      await redisClient.ft.search('idx:users', `@email:{${emailAddress}}`),
      null,
      2
    )
  );
  // {
  //   "total": 1,
  //   "documents": [
  //     {
  //       "id": "noderedis:users:2",
  //       "value": {
  //         "name": "Bob",
  //         "age": 23,
  //         "coins": 15,
  //         "email": "bob@somewhere.gov"
  //       }
  //     }
  //   ]
  // }

  // Some aggregrations, what's the average age and total number of coins...
  // https://redis.io/commands/ft.aggregate/
  console.log('Aggregation Demo:');
  console.log(
    JSON.stringify(
      await redisClient.ft.aggregate('idx:users', '*', {
        STEPS: [{
          type: AggregateSteps.GROUPBY,
          REDUCE: [{
            type: AggregateGroupByReducers.AVG,
            property: 'age',
            AS: 'averageAge'
          }, {
            type: AggregateGroupByReducers.SUM,
            property: 'coins',
            AS: 'totalCoins'
          }]
        }]
      }),
      null,
      2
    )
  );
  // {
  //   "total": 1,
  //   "results": [
  //     {
  //       "averageAge": "27.5",
  //       "totalCoins": "115"
  //     }
  //   ]
  // }
  res.send({
    fromCache: "true",
    data: "ok",
  });

}

//objetosJson
async function objetosJson(req, res) {
  const jsonSet = req.body; //like:comentario:1

  //console.log(jsonSet);
  let isCached = true;

  const resultadoSet = await redisClient.json.set('noderedis:jsondata', '$', {
    name: 'Roberta McDonald',
    pets: [{
        name: 'Fluffy',
        species: 'dog',
        age: 5,
        isMammal: true
      },
      {
        name: 'Rex',
        species: 'dog',
        age: 3,
        isMammal: true
      },
      {
        name: 'Goldie',
        species: 'fish',
        age: 2,
        isMammal: false
      }
    ],
    address: {
      number: 99,
      street: 'Main Street',
      city: 'Springfield',
      state: 'OH',
      country: 'USA'
    }
  });

  // Retrieve the name and age of the second pet in the pets array.
  let results = await redisClient.json.get('noderedis:jsondata', {
    path: [
      '$.pets[1].name',
      '$.pets[1].age'
    ]
  });

  // { '$.pets[1].name': [ 'Rex' ], '$.pets[1].age': [ 3 ] }
  console.log(results);

  // Goldie had a birthday, increment the age...
  await redisClient.json.numIncrBy('noderedis:jsondata', '$.pets[2].age', 1);
  results = await redisClient.json.get('noderedis:jsondata', {
    path: '$.pets[2].age'
  });

  // Goldie is 3 years old now.
  console.log(`Goldie is ${JSON.stringify(results[0])} years old now.`);

  // Add a new pet...
  await redisClient.json.arrAppend('noderedis:jsondata', '$.pets', {
    name: 'Robin',
    species: 'bird',
    isMammal: false,
    age: 1
  });

  // How many pets do we have now?
  const numPets = await redisClient.json.arrLen('noderedis:jsondata', '$.pets');

  // We now have 4 pets.
  console.log(`We now have ${numPets} pets.`);

  res.send({
    fromCache: isCached,
    data: resultadoSet,
  });

}

async function countMinSketch(req, res) {

  // Initialize a Count-Min Sketch with error rate and probability:
  // https://redis.io/commands/cms.initbyprob/
  try {
    await redisClient.cms.initByProb('mycms', 0.001, 0.01);
    console.log('Reserved Count Min Sketch.');
  } catch (e) {
    console.log('Error, maybe RedisBloom is not installed?:');
    console.log(e);
  }

  const teamMembers = [
    'leibale',
    'simon',
    'guy',
    'suze',
    'brian',
    'steve',
    'kyleb',
    'kyleo',
    'josefin',
    'alex',
    'nava',
    'lance',
    'rachel',
    'kaitlyn'
  ];

  // Store actual counts for comparison with CMS.
  let actualCounts = {};

  // Randomly emit a team member and count them with the CMS.
  // https://redis.io/commands/cms.incrby/
  for (let n = 0; n < 1000; n++) {
    const teamMember = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    await redisClient.cms.incrBy('mycms', {
      item: teamMember,
      incrementBy: 1
    });

    actualCounts[teamMember] = actualCounts[teamMember] ? actualCounts[teamMember] + 1 : 1;

    console.log(`Incremented score for ${teamMember}.`);
  }

  // Get count estimate for some team members:
  // https://redis.io/commands/cms.query/
  const [alexCount, rachelCount] = await redisClient.cms.query('mycms', [
    'alex',
    'rachel'
  ]);

  console.log(`Count estimate for alex: ${alexCount} (actual ${actualCounts.alex}).`);
  console.log(`Count estimate for rachel: ${rachelCount} (actual ${actualCounts.rachel}).`);

  // Get overall information about the Count-Min Sketch:
  // https://redis.io/commands/cms.info/
  const info = await redisClient.cms.info('mycms');
  console.log('Count-Min Sketch info:');

  // info looks like this:
  // { 
  //   width: 2000, 
  //   depth: 7, 
  //   count: 1000 
  // }
  console.log(info);
  res.send({
    fromCache: "true",
    data: "ok",
  });

}

async function pubsub(req, res) {
  // Declare constant variables for the name of the clients we will publish to as they will be required for logging.
  const channel1 = 'chan1nel';
  const channel2 = 'chan2nel';

  for (let i = 0; i < 10000; i++) {
    // 1st channel created to publish 10000 messages.
    await redisClient.publish(channel1, `channel1_message_${i}`);
    console.log(`publishing message on ${channel1}`);
    // 2nd channel created to publish 10000 messages.
    await redisClient.publish(channel2, `channel2_message_${i}`);
    console.log(`publishing message on ${channel2}`);
  }


}

async function testConexao(req, res) {

  console.log('Before redisClient.connect()...');

  // isOpen will return False here as the client's socket is not open yet.
  // isReady will return False here, client is not yet ready to use.
  console.log(`redisClient.isOpen: ${redisClient.isOpen}, redisClient.isReady: ${redisClient.isReady}`);

  // Begin connection process...
  const connectPromise = redisClient.connect();

  console.log('After redisClient.connect()...');

  // isOpen will return True here as the redisClient's socket is open now.
  // isReady will return False here as the promise hasn't resolved yet.
  console.log(`redisClient.isOpen: ${redisClient.isOpen}, redisClient.isReady: ${redisClient.isReady}`);

  await connectPromise;
  console.log('Afer connectPromise has resolved...');

  // isOpen will return True here as the client's socket is open now.
  // isReady will return True here, client is ready to use.
  console.log(`redisClient.isOpen: ${redisClient.isOpen}, redisClient.isReady: ${redisClient.isReady}`);

}

async function getServerTime(req, res) {

  const serverTime = await redisClient.time();
  // 2022-02-25T12:57:40.000Z { microseconds: 351346 }
  console.log(serverTime);

}

app.post("/jsonset", jsonSetData);
app.get("/jsonget/:keyNoticia", jsonGetData);
app.get("/jsonget?keyNoticia&parametro", jsonGetDataParametros);
app.get("/ObjetosJson", objetosJson);
app.get("/countMin", countMinSketch);
app.get("/searchJson", searchJson);
app.get("/getServerTime", getServerTime);
app.get("/pubsub", pubsub);
app.get("/testConexao", testConexao);


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});