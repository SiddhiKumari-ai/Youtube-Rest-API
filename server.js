const http = require('http')

require('dotenv').config();

const app = require('./app')

const server = http.createServer(app)

server.listen(3000,()=>{
    console.log("Server is running...")
})