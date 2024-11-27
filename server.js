const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const appname = process.env.APP_NAME
const node_env = process.env.NODE_ENV

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
    console.log(`Request served by ${appname} on ${node_env} environment`)
})

app.listen(port, () => {
    console.log(`node app is listening on port ${port}`)
})
