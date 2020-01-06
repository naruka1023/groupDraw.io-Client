// var browserify = require('browserify-middleware');
var sio = require('socket.io');
var forwarded = require('forwarded-for');
var portSocket = process.env.BACK_PORT || 3001;

var mustache = require('mustache-express');
var express = require('express');


var app = express();

var port = process.env.PORT || 3000;

var redis = require('./redis')();

process.title = 'groupDraw';
console.log('listening on *:' + port);
app.listen(port, function(){
  console.log('listening on *:' + process.env.PORT);
  
});
var io = sio(app);

io.total = 0;
redis.scan('0', 'MATCH', 'room*',function(part, full){
  if(full.length == 0){
    return
  }else{
    temp = full.map((f)=>{
      return f.toString()
    })
    final = temp[1].split(",");
    redis.del(final, function(){
      console.log('all residual keys are deleted')
    })
  }
})
io.on('connection', function(socket){
  var req = socket.request;
  var ip = forwarded(req, req.headers);
  console.log('client ip %s', ip.port);

  function printStats(){
    console.log('done')
    Object.keys(socket.adapter.rooms).forEach( function(socketId){
      console.log('========')
      console.log("sioRoom client socket Id: " + socketId );
      console.log('inside that key have a value of: ' + JSON.stringify(socket.adapter.rooms[socketId]))
      console.log('========')
    }); 
    console.log('done')
  }

  function updateList(socket, action){
    redis.smembers(`roomMembers:${socket.room}`, function(err, result){
      final = []
      result.forEach(function(r){
        final.push(JSON.parse(r.toString()));
      })
      payload = {
        mainName: socket.userName,
        list:final
      };
      io.in(socket.room).emit(action, payload)
    })

  }
  // keep track of connected clients
  socket.on('disconnect', function(){
    // printStats()
    redis.srem(`roomMembers:${socket.room}`, socket.userEntity, function(){
      console.log(`client ${socket.userEntity} is leaving`)
      updateList(socket, 'leave')

    })
  });
  //broadcast clearing of canvas in a room
  socket.on('clear', function(room){
    redis.del(`roomRecords:${room}`, function(){
      socket.broadcast.to(room).emit('clear');
    })
  })
  // broadcast user joining
  socket.on('join', function(userInfo){
    socket.join(userInfo.room, function(){
      userEntity = {
        name:userInfo.name,
        id:socket.id
      }

      //set values for disconnect event
      userEntity = JSON.stringify(userEntity);
      socket.room = userInfo.room
      socket.userName = userInfo.name
      socket.userEntity = userEntity

      //update redis and broadcast redis value of memebers inside room to other clients in the same room
      redis.sadd(`roomMembers:${socket.room}`, userEntity, function(err, result){
        updateList(socket, 'joined')
      })

    })
  });
  socket.on('paint', function(data){
    redisData = {
      x:data.x,
      y:data.y,
      px:data.px,
      py:data.py,
      color:data.color,
      weight:data.weight 
    }
    redis.lpush(`roomRecords:${data.room}`,JSON.stringify(redisData),function(){
      broadcast('paint', data)
    })
  });
  socket.on('hover', function(data){
    broadcast('hover', data)
  });
  socket.on('pressed', function(data){
    broadcast('pressed', data)
  });
  
  socket.on('move', function(data){
    broadcast('move', data)
  });
  function broadcast(key, data){
    socket.broadcast.to(data.room).emit(key, data);
  }
});


app.engine('mustache', mustache());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
  req.socket.on('error', function(err){
      console.error(err.stack);
    });
  next();
});

var url = process.env.BACK_PORT || 3001;
app.get('/', function(req, res, next){
    // if ('development' == process.env.NODE_ENV) {
    //   app.use('/main.js', browserify('./client/app.js'));
    // }
      res.render('index.mustache');
});
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
app.get('/records', function(req, res, next){
  redis.lrange(`roomRecords:${req.query.room}`, 0, -1, function(err, result){
    res.send(result.map((r)=>{
      return JSON.parse(r.toString())
    }))
  })
})
app.get('/rooms', function(req, res, next){
  redis.scan('0', 'MATCH', 'roomRecords*',function(part, full){
    if(full[1].length == 0){
      res.send('zero')
    }else{
      final = full[1].toString().split(',')
      // console.log(final)
      res.send(final)
    }
    
  })
})
app.get('/room', function(req,res,next){
    // if ('development' == process.env.NODE_ENV) {
    //     app.use('/room.js', browserify('./client/app2.js'));
    // }
    res.render('room.mustache', {
        io: url,
        room: req.query.room,
        name: req.query.name,
        color:getRandomColor()
    })
})
