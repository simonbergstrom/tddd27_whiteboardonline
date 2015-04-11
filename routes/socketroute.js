
// Variabler..
var onlineUsers = [];
var name;

module.exports = function (io) {


// When socket connects..
io.sockets.on('connection',function(socket){

//***************USER HANDLING *********************//
  
  // Client logs in... gets pushed into the array of online users and emit an init to the user who initialized an local
  // list of online users and at last broadcast to all already online user that he client has went online.
  socket.on('onlogin', function(data) {
    // When logged in set username on socke and push to online userlist
    name = data.name;
    socket.name = data.name; // Name the socket
    console.log(socket.name); 
    onlineUsers.push({"name" : data.name});
    console.log("Users to the onlineList: ",onlineUsers);
    socket.emit('init', {
      name: data.name,
      users: onlineUsers
    });
    // notify other clients that the new user has joined
    socket.broadcast.emit('user:join', {
      name: data.name
    });
  });
  // When user left it gets deletes from the array of onlineuser and a emit tells all other online users
  // that the user went offline
  socket.on('user:left', function(data){

    console.log("Log out: ",data);
    socket.broadcast.emit('user:left', {
      name: data.name
    });

    var i, user;
    for (i = 0; i < onlineUsers.length; i++) {
      user = onlineUsers[i].name;
      if (user === data.name) {
        onlineUsers.splice(i, 1);
        break;
      }
    }

    //var j = onlineUsers.indexOf({"name":name});
    //onlineUsers.splice(j);
    console.log("Users left: ",onlineUsers,"deleted user: ",data.name);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function (value) {


    socket.broadcast.emit('user:left', {
      name: socket.name
    });
    console.log("Number of users before delete: ",onlineUsers);

    //var j = onlineUsers.indexOf({"name":name});
    //onlineUsers.splice(j);

    //Delete current client from onlineusers list....
    var i, user;
    for (i = 0; i < onlineUsers.length; i++) {
      user = onlineUsers[i].name; 
      if (user === socket.name) {
        onlineUsers.splice(i, 1);
        break;
      }
    }


    console.log("Users left: ", onlineUsers, "Name: ", socket.name);
  });
  // When user gets invited and a room is created... join the room
  socket.on('joinRoom', function (data) {

     socket.room = data.room;

     console.log("The user: ",socket.name," joined the room: ",data.room);

     socket.join(data.room); // We are using room of socket io

  });
  // When user leace room
  socket.on('leaveroom',function(data){

    console.log(socket.name," left the room: ", data.room);

    socket.leave(data.room);

  });
  // Client will create a room and send a invitation which will be broadcast to all users... invite 
  // contains a list of users and the user in the list will get the option to join the room
  socket.on('invite' , function(data){

    console.log("Inviting the users",data);

    socket.join(data.room);
    socket.broadcast.emit('sendinvite', {
      name : data.data , room: data.room
    });
  });

//******************USER END ***********************//

//***************DRAWING FUNCTIONALITY *********************//

  // A User starts a path
  socket.on( 'startPath', function( data, sessionId) {

    io.sockets.in(data.room).emit('startPath', data,sessionId);
  });

  // A User continues a path
  socket.on( 'continuePath', function( data, sessionId ) {

    io.sockets.in(data.room).emit('continuePath', data,sessionId);
  });

  // A user ends a path
  socket.on( 'endPath', function( data, sessionId ) {
    
    io.sockets.in(data.room).emit('endPath', data,sessionId);
  });  
//*************** DRAWING END *********************//
 
});

};