var p5 = require('p5');
var $ = require('jquery');
const axios = require('axios');
var Mustache = require('mustache')
var io = require('socket.io-client');
var openFlag = false
var socket = io(config.io);
var lastColour = 'white'
let userInfo = {
    'name':config.name,
    'room':config.room,
    'color':config.color,
    'weight':10
}


require('p5')

//painting overlay
const s = (canvas) =>{
    socket.on('paint',function(data){
        paint(data.x, data.y, data.px, data.py, false, data.weight, data.color)
    })

    socket.on('clear', function(){
        canvas.background('white')
    })
    canvas.smth = function(){
        a = parseInt(Math.random()* 100000)
        canvas.saveCanvas(`canvas${a}`, 'jpg')
    }
    function paint(x, y, px, py, flag=true, weight=10, newColor=null){
        (flag)?canvas.stroke(userInfo.color):canvas.stroke(newColor);
        canvas.strokeWeight(weight)
        canvas.line(x, y, px, py)
    }

    canvas.setup = function() {
        let myCanvas = canvas.createCanvas(700, 410);
        myCanvas.parent('canvasContainer')
        canvas.background('white') || null
        canvas.noStroke()
        canvas.resizeCanvas((canvas.windowWidth*8)/10, canvas.windowHeight- canvas.windowHeight/4);
        inp1 = canvas.createColorPicker(userInfo.color)
        inp1.id('colorPicker') 
        inp1.position(10, 50)
        inp1.input(function(){
                userInfo.color = this.value()
        })
    }
    // canvas.windowResized = function() {
    //     canvas.resizeCanvas((canvas.windowWidth*8)/10, canvas.windowHeight- canvas.windowHeight/9);
    // }

    canvas.draw = function(){
        
    }
    canvas.mouseDragged = function(){
        paint(canvas.mouseX, canvas.mouseY, canvas.pmouseX, canvas.pmouseY, true, userInfo.weight)
        let data = {
            x:canvas.mouseX,
            y:canvas.mouseY,
            px: canvas.pmouseX,
            py: canvas.pmouseY,
            color:userInfo.color,
            room:userInfo.room,
            weight:userInfo.weight
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

function buttonHandler(flag){
    switch(flag){   
        case 'clear': 
            socket.emit('clear', userInfo.room)
            firstCanvas.background('white')
        break;
    }
}
$('#clearBtn').click(function(event){
    buttonHandler('clear');
})
$('#downloadBtn').click(function(event){
    // firstCanvas.saveCanvas(firstCanvas, 'newPic', 'jpg')
    firstCanvas.smth()
})
$('#sRBtn').change(function(){
    userInfo.weight = $(this).val()
});
$('#eraserBtn').change(function(){
    if(this.checked){
        lastColour = userInfo.color
        userInfo.color = 'white'
        $('#colorPicker').css('display','none')
    }else{
        userInfo.color = lastColour
        $('#colorPicker').css('display','unset')
    }
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
                    firstCanvas.strokeWeight(record.weight)
                    firstCanvas.line(record.x, record.y, record.px, record.py)
                })
                resolve();
            })
            promise.then(function(result){
                $('.loader').css('display', 'none')
                $('.joined').css('display', 'unset', 'opacity', '100').html(`Username: ${payload.mainName} has joined.`);
                $('.smth').css('display', 'unset') 
                $('.buttonPanel').css('visibility', 'unset')   
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


