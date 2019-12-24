var $ = require('jquery');
// var io = require('socket.io-client');

// var socket = io(config.io);
$('form').submit((event)=>{
    event.preventDefault();
    validateForm()
});
function validateForm(){
    let x = document.forms["myForm"]["rname"].value;
    let y = document.forms["myForm"]["name"].value;
    if(x == "" || y == ""){
        $('#result').html('Please the given form')
    }else{
        window.location.href = window.location.href + `room?room=${x}&name=${y}`;
    }
}