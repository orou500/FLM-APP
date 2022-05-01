const http = require('http')
const app = require('./app')
const port = process.env.PORT || 5000

const server = http.createServer(app);
io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });

      socket.on('newMatch', (title) => {
        io.emit('newMatch');
      });

      socket.on('deletedMatch', () => {
        io.emit('newMatch');
      });
      socket.on('updateMatch', () => {
        io.emit('newMatch');
      });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});

server.listen(port)
