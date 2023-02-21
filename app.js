const express = require('express');
const path = require('path');
const fetch = require('fetch');
//const redis = require('./redis-client');
const redis = require('redis');

console.log(redis)

const app = express();

app.use(express.json());

app.post('/data', async (req, res) => {
    
    const repo = req.body.repo;
    const response = await fetch('https://api.github.com/repos/${repo}').then(t => t.json());

    res.json({
        status: 'ok',
        stars: response.stargazers_count
    })

})

app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(process.env.PUBLIC_PORT, () => {
    console.log('listening on, server ready')
})
