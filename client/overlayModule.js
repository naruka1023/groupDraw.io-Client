//paint overlay
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

//hover overlay
const s2 = (canvas) =>{
    socket.on('pressed',function(){
        canvas.background('white')
    })
    socket.on('hover',function(data){
        canvas.background('white')
        paint(data.x, data.y, false, data.color)
    })
    function paint(x, y, flag=true, newColor=null){
        (flag)?canvas.stroke(userInfo.color):canvas.stroke(newColor);
        canvas.strokeWeight(10)
        canvas.point(x, y)
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
        paint(canvas.mouseX, canvas.mouseY)
        let data = {
            x:canvas.mouseX,
            y:canvas.mouseY,
            room:userInfo.room,
            color:userInfo.color
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
module.exports = {
    s2:s2,
    s:s
}