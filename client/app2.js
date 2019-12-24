var p5 = require('p5');
var $ = require('jquery');
var io = require('socket.io-client');
require('p5')
var socket = io(config.io);
let userInfo = {
    'name':config.name,
    'room':config.room
}

socket.emit('join', userInfo)

socket.on('joined', function(name){
    userJoined(name)
})

function userJoined(name){
    if(name == config.name){
        $('.joined').css('display', 'unset', 'opacity', '100').html(`Username: ${name} has joined.`);
        $('.loader').css('display', 'none')
        $('#canvasContainer').css('display', 'block')

    }else{
        $('.joined').css('opacity', 100).html(`Username: ${name} has joined.`);
    }
    setTimeout(function(){
        $('.joined').animate({opacity:0})
    }, 1000)
}

socket.on('paint',function(data){
    paint('red', data.x, data.y)
})

function paint(color, x, y){
    stroke(color);
    strokeWeight(10)
    point(x, y)
}

new p5() 

setup = function() {
    let myCanvas = createCanvas(700, 410);
    myCanvas.parent('canvasContainer')
    noStroke()
}
draw = function(){
    background('white')
    fill('red')
    ellipse(mouseX, mouseY, 10, 10)

}
// mouseMoved = function(){
//     if(movedX != null && movedY != null){
//         paint('white', movedX, movedY)
//         // paint('red', mouseX, mouseY)
//     }
//     let data = {
//         x:movedX,
//         y:movedY,
//         room:config.room
//     }
//     socket.emit('move', data)
// }
mouseMoved = function(){
    if(!mouseIsPressed){
        background('white')
    }
        paint('red', mouseX, mouseY)
        let data = {
            x:mouseX,
            y:mouseY,
            room:config.room
        }
        socket.emit('paint',data);
}
