// const express = require("express");
// const http = require('http');
// const socketIo = require('socket.io');
// const keyRoute = require('./routes/key');
// const gameRoute = require('./routes/game');
// const connectionRoute = require('./routes/connection');
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://gamefront.onrender.com"
  }
});

const port = process.env.PORT || 5000;
let users = {};

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://gamefront.onrender.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/', (req, res) => {
    res.send("Hello World!!");
});

io.on('connection', (socket) => {
    console.log("user connected");

    socket.on('generateKey', () => {
        const key = generateKey();
        users[key] = socket.id;
        socket.emit('keyGenerated', key);
    });

    socket.on('connectByKey', (key) => {
        const otherUserSocketId = users[key];
        if(otherUserSocketId){
            socket.join(key);
            const myUserSocketId = socket.id;
            io.to(otherUserSocketId).emit('userConnected', [key, myUserSocketId]);
            io.to(myUserSocketId).emit('userConnected', [key, otherUserSocketId]);
        }
        else{
            socket.emit('keyNotFound');
        }
    });

    socket.on('connectAgain', (param) => {
        socket.join(param[0]);
        const curr = socket.id;
        io.to(param[0]).emit('userConnected', curr);
    });

    socket.on('sendReady', (param) => {
        io.to(param[1]).emit('otherReady', param[0]);
    });

    socket.on('bothReady', ([w1, w2, other]) => {
        io.to(other).emit('wordsEntered', [w2, w1]);
        io.to(socket.id).emit('wordsEntered', [w1, w2]);
        
    });

    // socket.on('shareWord', (word) => {

    // })

    socket.on('discon', (other) => {
        io.to(other).emit('close');
        io.to(socket.id).emit('close');
    });
})

function generateKey(){
    return Math.random().toString(36).substring(2,8);
}

app.use('/key', keyRoute);
app.use('/game', gameRoute);
app.use('/connection', connectionRoute);

server.listen(port, () => {
    console.log(`App is running on port ${port}`);
})
