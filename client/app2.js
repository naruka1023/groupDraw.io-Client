var p5 = require('p5');
var $ = require('jquery');
var Mustache = require('mustache')
var io = require('socket.io-client');
var openFlag = false
require('p5')
var socket = io(config.io);
let userInfo = {
    'name':config.name,
    'room':config.room,
    'color':config.color
}

socket.emit('join', userInfo)

socket.on('leave',function(payload){
    refreshList(payload.list)
    $('.joined').css('opacity', 100).html(`Username: ${payload.mainName} has left.`);
    setTimeout(function(){
        $('.joined').animate({opacity:0})
    }, 1000)
})

socket.on('joined', function(payload){
    userJoined(payload)
})

function refreshList(names){
    $('.listOfUsers').html('');
    names.forEach((name)=>{
        let template = '<div class="listItems"><span data-id={{id}}>{{name}}</span></div><br>'
        html = Mustache.to_html(template, name)
        $('.listOfUsers').append(html);
    })
}
// Bootstrap wants jQuery global =(
function userJoined(payload){
        if(payload.mainName == userInfo.name){
        $('.joined').css('display', 'unset', 'opacity', '100').html(`Username: ${payload.mainName} has joined.`);
        $('.loader').css('display', 'none')
        $('.canvasChild').css('display', 'block')
        $('.listWrapper').css('display', 'unset')
        refreshList(payload.list);
    }else{
        $('.joined').css('opacity', 100).html(`Username: ${payload.mainName} has joined.`);
        refreshList(payload.list);
    }
    setTimeout(function(){
        $('.joined').animate({opacity:0})
    }, 1000)
}

//painting overlay
const s = (canvas) =>{
    socket.on('paint',function(data){
        paint(data.x, data.y, false, data.color)
    })
    function paint(x, y, flag=true, newColor=null){
        (flag)?canvas.stroke(userInfo.color):canvas.stroke(newColor);
        canvas.strokeWeight(10)
    
        canvas.point(x, y)
    }
    canvas.setup = function() {
        let myCanvas = canvas.createCanvas(700, 410);
        myCanvas.parent('canvasContainer')
        canvas.background('white')
        canvas.noStroke()
    }
    canvas.draw = function(){
        
    }
    canvas.mouseDragged = function(){
        paint(canvas.mouseX, canvas.mouseY)
        let data = {
            x:canvas.mouseX,
            y:canvas.mouseY,
            color:userInfo.color,
            room:userInfo.room
        }
        socket.emit('paint',data);

    }
}
//hovering overlay
const s2 = (canvas) =>{
    socket.on('pressed',function(){
        canvas.background('white')
    })
    socket.on('hover',function(data){
        canvas.background('white')
        paint(data.x, data.y, data.color, data.name)
    })
    function paint(x, y, newColor, name){
        canvas.textSize(20);
        canvas.fill(newColor);
        canvas.text(name, x, y);
    }
    canvas.setup = function() {
        let myCanvas = canvas.createCanvas(700, 410);
        myCanvas.parent('canvasContainer2')
        canvas.background('white')
        canvas.noStroke()
    }
    canvas.draw = function(){
    }
    canvas.mouseMoved = function(){
        canvas.background('white')
        canvas.textSize(20);
        canvas.fill(userInfo.color);
        canvas.text(userInfo.name, canvas.mouseX, canvas.mouseY);
        let data = {
            x:canvas.mouseX,
            y:canvas.mouseY,
            room:userInfo.room,
            color:userInfo.color,
            name:userInfo.name
        }
        socket.emit('hover',data);
    }
    canvas.mousePressed = ()=> {
        let data = {
            room:userInfo.room
        }
        canvas.background('white')
        socket.emit('pressed', data);
    }
}

let firstCanvas  = new p5(s) 
let secondCanvas  = new p5(s2) 

// mouseMoved = function(){
//     if(movedX != null && movedY != null){
//         paint('white', movedX, movedY)
//         // paint(mouseX, mouseY)
//     }
//     let data = {
//         x:movedX,
//         y:movedY,
//         room:config.room
//     }
//     socket.emit('move', data)
// }
