var browserify = require('browserify-middleware');
var mustache = require('mustache-express');
var express = require('express');


var app = express();

var port = process.env.CLIENT_PORT || 3000;

var redis = require('./redis')();

process.title = 'groupDraw-web';

app.listen(port);
console.log('listening on *:' + port);

app.engine('mustache', mustache());
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
  req.socket.on('error', function(err){
      console.error(err.stack);
    });
  next();
});

var url = process.env.BACK_PORT || 'http://localhost:3001';
app.get('/', function(req, res, next){
    if ('development' == process.env.NODE_ENV) {
      app.use('/main.js', browserify('./client/app.js'));
    }
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
    if ('development' == process.env.NODE_ENV) {
        app.use('/room.js', browserify('./client/app2.js'));
    }
    res.render('room.mustache', {
        io: url,
        room: req.query.room,
        name: req.query.name,
        color:getRandomColor()
    })
})
