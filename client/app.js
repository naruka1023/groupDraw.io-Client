var $ = require('jquery');
axios = require('axios')
// var io = require('socket.io-client');
var newRoomFlag = true
// var socket = io(config.io);

var modal = document.getElementById("myModal");


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
$(document).ready(function(){    
    $('form').submit((event)=>{
        event.preventDefault();
        validateForm()
    });
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    $('#findBtn').click(()=>{
        axios.get('/rooms').then(function(response){
            console.log(response.data)
            $('.allRooms').html('')
            if(response.data == 'zero'){
                $('.allRooms').html('<div>No Rooms found. Create One!')
            }
            response.data.forEach(function(r){
                html = '<div class="oneRoom">' + r.split(':')[1] + '</div>'
                $('.allRooms').append(html)
            })
        })
        modal.style.display = "block";
    })
    
    $('#createBtn').click((event)=>{
        if(newRoomFlag){
            $('#createInput').css('visibility', 'unset')
        }else{
            $('#createInput').css('visibility', 'hidden')
        }
        newRoomFlag = !newRoomFlag
    })
    function validateForm(){
        let x = document.forms["myForm"]["rname"].value;
        let y = document.forms["myForm"]["name"].value;
        if(x == "" || y == ""){
            $('#result').html('Please fill out the given form')
        }else{
            window.location.href += `room?room=${x}&name=${y}`;
        }
    }
  });