var p5 = require('p5');
var $ = require('jquery');
var Mustache = require('mustache')
var io = require('socket.io-client');
require('p5')
var socket = io(config.io);
let userInfo = {
    'name':config.name,
    'room':config.room,
    'color':config.color
}

socket.emit('join', userInfo)

socket.on('joined', function(name){
    userJoined(name)
})

// Bootstrap wants jQuery global =(
function userJoined(name){
    let named = {
        chosen:name
    }
    let template = '<div class="listItems"><span>{{chosen}}</span></div><br>'
    html = Mustache.to_html(template, named)

    if(name == userInfo.name){
        $('.joined').css('display', 'unset', 'opacity', '100').html(`Username: ${name} has joined.`);
        $('.loader').css('display', 'none')
        $('.canvasChild').css('display', 'block')
        $('.listWrapper').css('display', 'unset')
        $('.listOfUsers').append(html);
    }else{
        $('.joined').css('opacity', 100).html(`Username: ${name} has joined.`);
        $('.listOfUsers').append(html);
    }
    setTimeout(function(){
        $('.joined').animate({opacity:0})
    }, 1000)
}

//hovering overlay
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
            room:userInfo.room,
            color:userInfo.color
        }
        socket.emit('paint',data);
    }
}
//painting overlay
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
