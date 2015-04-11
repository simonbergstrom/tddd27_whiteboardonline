
//Controller over the header
function HeaderCtrl($scope, $rootScope, $http, $location) {

    // Highlight active link
    $scope.getClass = function(path) {

	    if ($location.path() == path) {
	        return "active"; 
	    } 
	    else {
	        return ""; 
	    }
    }   
}  

function ProfileCtrl($scope,$http,$location,canvasData,$route,ngDialog) {
  console.log("Im in the Profile Conroller!");

  $scope.canvas = [];

  $http.get('/getcanvas')
  .success(function(canvas){
    console.log("success");
    $scope.canvas = canvas;
  })
  .error(function(){

    $scope.errormessage = 'Something failed in the load canvas process..';
    console.log($scope.errormessage);
  });

  $scope.loadCanvas = function(canvas){
    
    $scope.value = canvas;
    ngDialog.open({ template: 'loadCanvasDialog', scope:$scope ,controller: 'ProfileCtrl' });
  }

  $scope.loadthisCanvas = function(value){

    canvasData.setProperty(value.data);

    $location.url('/index');
    ngDialog.close();
  }

  $scope.deleteCanvas = function(canvas){

    $scope.value = canvas.name;
    ngDialog.open({ template: 'deleteCanvasDialog', scope:$scope ,controller: 'ProfileCtrl' });
  }

  $scope.deleteThisCanvas = function(value){

    $http.post('/deletecanvas', {
                  name: value,
                })
                .success(function(){
                  console.log("Sucessfully deleted!");
                })
                .error(function(){
                  $scope.errormessage = 'Something failed in the delete process..';
                  console.log($scope.errormessage);
                });

    $route.reload();
    ngDialog.close();

  }



}

function MainCtrl($scope,$rootScope, $http, $location,$cookieStore) {
  
  // WHen logged out.. the local user gets undefined.. Set cookie to init so the socket will init when logging in again
  if($rootScope.useronline == undefined)
    $cookieStore.remove('login');
}; 

// Controller for Dialog export and clear canvas..
function exportCanvasCtrl($scope,$rootScope,$http,$location,canvasData,ngDialog)
{
    // Register the login() function
    var tempData = canvasData.getProperty();
    var maxSaves =0;

    $http.get('/getcanvas').success(function(user){

        maxSaves = user.length;
    });

    $scope.save = function(){


        if(maxSaves < 5)
        {  
                $http.post('/savecanvas', {
                  name: $scope.canvas.name,
                  data: tempData,
                })
                .success(function(){
                  ngDialog.close();
                })
                .error(function(){
                  $scope.errormessage = 'Something failed in the save process..';
                  console.log($scope.errormessage);
                });
        }
        else
        {
          $scope.errormessage = 'You can maximum have 5 drawings saved!';
        }
    };
}

function IndexCtrl($scope,$rootScope,$http,ngDialog,canvasData,$cookieStore) {

// Open dialog for export/save canvas
$scope.openExport = function () {

  ngDialog.open({ template: 'exportDialog', scope:$scope ,controller: 'exportCanvasCtrl' });

};


$scope.checkBoxData = false;
$scope.useronlinelist = [];

// If you decline a invite... you want to set scope room to undefined
var invite = true;


$scope.checkBox = function(value,checked)
{
  console.log("Checkbox klickad!",checked);
  console.log("Values in checkbox: ", value);

  //Add checked user to list..
  if(checked === true){
    $scope.useronlinelist.push({"name": value});
  }

  // If checked of erase it from the list...
  else{
    var i, user;
    for (i = 0; i < $scope.useronlinelist.length; i++) {
      user = $scope.useronlinelist[i];
      if (user.name === value) {
        $scope.useronlinelist.splice(i, 1);
        break;
      }
    }
  }
  console.log("Onlinelist checked:",$scope.useronlinelist);
}

$scope.inviteUsers = function(users) {

  // Invite all users in list users to join the room..
  if($scope.useronlinelist.length > 0)
  { 
    // Create a room and name it after the client who invites
    $rootScope.room = $rootScope.useronline;
    io.emit('joinRoom',{"room" : $rootScope.useronline});

    // Invite the people from dropdown menu to the room..
    io.emit('invite',{"data": $scope.useronlinelist, "room" : $rootScope.useronline});
  }
  else
      alert('No user online to invite!');

  //Closing dropdown menu....
  $('[data-toggle="dropdown"]').parent().removeClass('open');



}

$scope.dropDown = function(event)
{
    /*if($(".dropdown-menu").hasClass('dropdown-menu-form')) {
      console.log("Inside dropdown"); 
        event.originalEvent.stopPropagation();
        //console.log(event);
        console.log(event.originalEvent);
    }*/
    $('.dropdown-menu').on('click', function(e) {
      if($(this).hasClass('dropdown-menu-form')) {
        e.stopPropagation();
      }
    });

}

// Some option variables for draw functionality
  var data;
  var path;
  var drag = false;
  var color = 'black';
  var strokeWidth = '1';


  // SOCKET variables
  var sessionId = io.socket.sessionid;
  paths = {};

  $scope.changeStrokeSize = function(){

      strokeWidth = $scope.strokeSize;
  };

  $scope.paintoption = function(event)
  {
    var paintoption = event.toElement.value;

    if(paintoption == 'red' || paintoption == 'green' || paintoption == 'black' )
     {
        color = paintoption;
     }
     else if(paintoption == 'eraser')
     {
        color='white';
        strokeWidth = '30';
     } 
     else if (paintoption =='clear')
     {
        ngDialog.open({ template: 'clearDialog',scope: $scope ,controller: 'IndexCtrl' });
     }
   
  }

 $scope.clearoption = function(){
      paper.clear();
      paper.setup('canvas');
      canvasData.setProperty("First");
      ngDialog.close();
  }


//*** MOUSE EVENT FOR DRAWING ****///

/// Three event functions for drawing functionality.. will emit to socket if client have joined a room
// if no room is joined... no emit
  $scope.onMouseUp = function(){
    //Clear Mouse Drag Flag
    drag = false;

    var point3 = {"x":event.offsetX, "y":event.offsetY};

    endPath(point3,sessionId,callback2);

    if(typeof($rootScope.room) !== 'undefined')
        emit("endPath", {point: point3, room: $rootScope.room}, sessionId);
  };

  $scope.onMouseDown = function(event){

    drag=true;
    var point1 = {"x":event.offsetX, "y":event.offsetY};

    startPath( point1, color, strokeWidth, sessionId,callback);

    if(typeof($rootScope.room) !== 'undefined')
        emit("startPath", {point: point1, color: color, strokeWidth: strokeWidth, room : $rootScope.room}, sessionId);
  };

    $scope.onMouseDrag = function(event){
    if(drag){

      var point2 = {"x":event.offsetX, "y":event.offsetY}; //SOCKET 
      continuePath(point2,sessionId,callback3);

      if(typeof($rootScope.room) !== 'undefined')
        emit("continuePath", {point: point2,room: $rootScope.room}, sessionId);//SOCKET 
      
    }
  };

  //**** MOUSE EVENTS FOR DRAWING END ***//////
  
  init();
  
  function init(){

    var papertext = canvasData.getProperty();
    paper.install(window);

    // Canvas data in service is "First" when nothing has been drawn...
    if(papertext =="First" )
    {   
      paper.setup('canvas'); 
    }  
    else
    {
      paper.setup('canvas');
      paper.project.importJSON(papertext);
      paper.view.draw();
    }

  } 

  function startPath( point1, color,strokeWidth, sessionId,callback ) {

      paths[sessionId] = new Path();
      paths[sessionId].strokeColor = color;
      paths[sessionId].strokeWidth = strokeWidth;

      callback(paths[sessionId],point1);

  }
  function continuePath(point2, sessionId,callback3) {

    paths[sessionId].add(new paper.Point(point2));
    //paths[sessionId].smooth(); // Would be nice but bug somehow... possible fix for future..


  }
  function endPath(point3, sessionId,callback2) {

    paths[sessionId].add(new paper.Point(point3));
    canvasData.setProperty(paper.exportJSON());  // Bug here ... If change screen on two devices the paths gets lost
    callback2(paths[sessionId]);
  }

  function callback(path, point){
      path.add(new paper.Point(point));
  }
  function callback2(path){
    delete path;
  }
  function callback3(){
    paths[sessionId].smooth();
  }

  function emit(eventName, data) {
    io.emit(eventName, data, sessionId);
  }

  /************ USER SOCKETS ***************/

  // When server have initialized the name and an array of users online gets back...
  var tempbool = $cookieStore.get('login');

  if(typeof(tempbool) === 'undefined')
  { 
    $rootScope.users = [];
      // Send name from client via socket to server when log in...
    io.emit('onlogin',{
      name: $rootScope.useronline 
    }); 
    $cookieStore.put('login','true');
  }
  else
  {
    // If page refresh .. load onlineusers from cookie
    if ($rootScope.users == undefined)
      console.log("Rooscope user is undefined..");
  }

  io.on('init',function(data){
    $scope.name = data.name;
    
    //Delete current client from onlineusers list....
    $rootScope.users = data.users;
    var i, user;
    for (i = 0; i < $rootScope.users.length; i++) {
      user = $rootScope.users[i]; console.log(user.name,data.name);
      if (user.name === data.name) {
        $rootScope.users.splice(i, 1);
        break;
      }
    }
    console.log("User init: " + data.name);
    console.log(data.users);
  });

  io.on('user:join', function (data) {

    $rootScope.users.push(data);
    console.log("User joined..",$rootScope.users);

  });

  // add a message to the conversation when a user disconnects or leaves the room
  io.on('user:left', function (data) {

    console.log("User loggin out: ",data);
    var i, user;
    for (i = 0; i < $rootScope.users.length; i++) {
      user = $rootScope.users[i]; console.log(user.name,data.name);
      if (user.name === data.name) {
        $rootScope.users.splice(i, 1);
        break;
      }
    }
  });

  io.on('sendinvite', function(data) {

    var i;

      for(i=0;i<data.name.length;i++)
      {
          var j = data.name[i].name;

          if(j === $rootScope.useronline)
           {
              $rootScope.room = data.room;
              // A dialog shows up and let you choose between stay in room or leave it
              ngDialog.open({ template: 'inviteDialog',  scope: $scope ,controller: 'IndexCtrl' });
           } 
      }  

  });

  $scope.roomChoice = function(event){

   if(event.toElement.value === 'Yes'){
    console.log("Joining room",$rootScope.room);
    io.emit('joinRoom',{"room" : $rootScope.room});
   }
   else
   {
      $rootScope.room = undefined;
   }
     ngDialog.close();
  };

  $scope.leaveRoom = function(){

    console.log("You left the room...");
    io.emit('leaveroom',{"room" : $rootScope.room });
    $rootScope.room = undefined;
  }
 
    // Logout function is available in any pages
  $rootScope.logout = function(){

   console.log("Log out user:",$rootScope.useronline); 
    io.emit('user:left', {
      name: $rootScope.useronline
    });
    $cookieStore.remove('login');
    $rootScope.useronline = undefined;
    $rootScope.users = [];

    $http.post('/logout');
  };

  /************ USER END ***************/

  io.on( 'startPath', function( data, sessionId ) {
    
    startPath(data.point, data.color, data.strokeWidth, sessionId,callback);  
  })


  io.on( 'continuePath', function( data, sessionId ) {

    continuePath(data.point, sessionId,callback3);
    view.draw(); 
  })

  io.on( 'endPath', function( data, sessionId ) {

    endPath(data.point, sessionId,callback2);
    view.draw(); 
  })


};  

function SignupCtrl($scope,$rootScope, $http, $location) {

  // Register the login() function
  $scope.signup = function(){
      $http.post('/signup', {
        username: $scope.user.username,
        password: $scope.user.password,
      })
      .success(function(user){
        $rootScope.useronline =$scope.user.username;
        $location.url('/index');
      })
      .error(function(){
        // Error: authentication failed
        $rootScope.useronline = undefined;
        $scope.errormessage = 'Username already taken';
        $location.url('/signup');
        });
    };
}; 

function LoginCtrl($scope,$rootScope,$http, $location) { 

  $scope.user = {};

  $scope.login = function(){

      $http.post('/Login', {
        username: $scope.user.username,
        password: $scope.user.password,
      })
      .success(function(user){
        $rootScope.useronline = $scope.user.username; 
        $location.url('/index');
      })
      .error(function(){
        // Error: authentication failed
        $scope.user = undefined;
        $rootScope.useronline = undefined;
        console.log($rootScope.useronline);
        $scope.errormessage = 'Wrong username or password';
        $location.url('/Login');
        });
    };
};

