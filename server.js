const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Admin';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, `Welcome to the ${user.room} Room!`));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the room`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    socket.to(user.room).emit('message', formatMessage(user.username, msg));
    io.to(socket.id).emit('message', formatMessage('You', msg));   //trial send only to ourself to get username you
  });


//for files
socket.on('base64 file', function (msg) {
  //console.log('received base64 file from' + msg.username);
  socket.username = msg.username;
    var ftype='txt'
    var parts = msg.fileName.split('.');
    var fext=parts[parts.length - 1];
    if (isImage(fext)) ftype='image'
    else if(isVideo(fext)) ftype='video'


  //console.log(ftype)
  
  // socket.broadcast.emit('base64 image', //exclude sender
  // io.sockets.emit('base64 file',  //include sender

      // {
      //   username: socket.username,
      //   file: msg.file,
      //   fileName: msg.fileName
      // }
  const user = getCurrentUser(socket.id);
  // console.log(msg.file);
  socket.to(user.room).emit('image', formatMessage(user.username, msg.file,ftype));
  io.to(socket.id).emit('image', formatMessage('You', msg.file,ftype));
}

  );


  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT);


 
function isImage(filename) {
  var ext = filename
  switch (ext.toLowerCase()) {
    case 'jpg':
      case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'png':
      //etc
      return true;
  }
  return false;
}

function isVideo(filename) {
  var ext = filename;
  switch (ext.toLowerCase()) {
    case 'm4v':
    case 'avi':
    case 'mpg':
    case 'mp4':
    case 'mp3':
      // etc
      return true;
  }
  return false;
}