// let port = process.env.PORT || 3000;

// let IO = require("socket.io")(port, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// IO.use((socket, next) => {
//   if (socket.handshake.query) {
//     let callerId = socket.handshake.query.callerId;
//     socket.user = callerId;
//     next();
//   }
// });

// IO.on("connection", (socket) => {
//   console.log(socket.user, "Connected");
//   socket.join(socket.user);

//   socket.on("makeCall", (data) => {
//     let calleeId = data.calleeId;
//     let sdpOffer = data.sdpOffer;

//     socket.to(calleeId).emit("newCall", {
//       callerId: socket.user,
//       sdpOffer: sdpOffer,
//     });
//   });

//   socket.on("answerCall", (data) => {
//     let callerId = data.callerId;
//     let sdpAnswer = data.sdpAnswer;

//     socket.to(callerId).emit("callAnswered", {
//       callee: socket.user,
//       sdpAnswer: sdpAnswer,
//     });
//   });

//   socket.on("IceCandidate", (data) => {
//     let calleeId = data.calleeId;
//     let iceCandidate = data.iceCandidate;

//     socket.to(calleeId).emit("IceCandidate", {
//       sender: socket.user,
//       iceCandidate: iceCandidate,
//     });
//   });
// });

const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||10000)