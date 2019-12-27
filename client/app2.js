var p5 = require('p5');
var $ = require('jquery');
const axios = require('axios');
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
        axios.get(`/records?room=${userInfo.room}`).then(function(response){
            let promise = new Promise(function(resolve, reject){
                canvasRecords = response.data
                canvasRecords.forEach((record) =>{
                    firstCanvas.stroke(record.color)
                    firstCanvas.strokeWeight(10)
                    firstCanvas.line(record.x, record.y, record.px, record.py)
                })
                resolve();
            })
            promise.then(function(result){
                $('.loader').css('display', 'none')
                $('.joined').css('display', 'unset', 'opacity', '100').html(`Username: ${payload.mainName} has joined.`);
                $('.smth').css('display', 'unset')    
                $('.wrapper').css('display', 'block')
            })
        })
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
        paint(data.x, data.y, data.px, data.py, false, data.color)
    })

    socket.on('clear', function(){
        canvas.background('white')
    })

    function paint(x, y, px, py, flag=true, newColor=null){
        (flag)?canvas.stroke(userInfo.color):canvas.stroke(newColor);
        canvas.strokeWeight(10)
    
        canvas.line(x, y, px, py)
    }

    canvas.setup = function() {
        let myCanvas = canvas.createCanvas(700, 410);
        myCanvas.parent('canvasContainer')
        canvas.background('white') || null
        canvas.noStroke()
        function buttonHandler(flag){
            switch(flag){
                case 'clear': 
                    socket.emit('clear', userInfo.room,  function(){
                        canvas.background('white')
                    })
                break;
            }
        }

        ////////////////////////////////////////
        clearButton = canvas.createButton('CLEAR')
        clearButton.position(10, 50)
        clearButton.mousePressed(buttonHandler('clear'))

        eraserButton = canvas.createCheckbox('ERASER')
        eraserButton.position(110, 50)

        saveButton = canvas.createButton('SAVE')
        saveButton.position(210, 50)

        shareButton = canvas.createButton('SHARE')
        shareButton.position(310, 50)

        downloadButton = canvas.createButton('DOWNLOAD')
        downloadButton.position(410, 50)

        strokeWeightSlider = canvas.createSlider(0, 255, 100);
        strokeWeightSlider.position(70, 100);
        strokeWeightSlider.style('width', '300px');

        colorPicker = canvas.createColorPicker(userInfo.color)
        colorPicker.position(10, 100)
        ////////////////////////////////////////

        canvas.resizeCanvas((canvas.windowWidth*8)/10, canvas.windowHeight- canvas.windowHeight/4);
    }
    // canvas.windowResized = function() {
    //     canvas.resizeCanvas((canvas.windowWidth*8)/10, canvas.windowHeight- canvas.windowHeight/9);
    // }
    canvas.draw = function(){
        
    }
    canvas.mouseDragged = function(){
        paint(canvas.mouseX, canvas.mouseY, canvas.pmouseX, canvas.pmouseY)
        let data = {
            x:canvas.mouseX,
            y:canvas.mouseY,
            px: canvas.pmouseX,
            py: canvas.pmouseY,
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
        canvas.resizeCanvas((canvas.windowWidth*8)/10, canvas.windowHeight- canvas.windowHeight/4);
    }
    // canvas.windowResized = function() {
    //     canvas.resizeCanvas((canvas.windowWidth*8)/10, canvas.windowHeight- canvas.windowHeight/9);
    // }
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
