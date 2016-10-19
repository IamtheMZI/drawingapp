//Working Prototype 
/*
* Date: 10-18-2016
* Author: Muhammad Zian Ilahee
* State: Working with drawing share, image upload, clear screen, background color change
* Defect: Simultaneous Drawing is not possible
*/
var drawingUtil = null;
var nav_open = false; //Side navigation bar
var socket, curColor, curSize, imSize;
// Data to be sent
var t = {
	x_val: 0,
	y_val: 0,
	touch: '',
	clear: false,
	color: 'black',
	size: 1,
	bg: 'white',
	image:false,
	buffer:''

};
// Joining a canvas
var canvasinfo = {
	name:'',
	room:''
};

//Main Function
$(function() {
	
	var c = document.getElementById("theCanvas1");
	var ctx = c.getContext("2d");

	String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
	var theCanvas = document.getElementById("theCanvas");
	drawingUtil = new DrawingUtil(theCanvas);
	var sidenav = document.getElementById("mySidenav");
	
	sidenav.height = window.innerHeight;
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	theCanvas.width = window.innerWidth;
	theCanvas.height = window.innerHeight;

/////////////////   BINDING TO CHANGES ON BUTTONS AND SLIDERS ///////////////////////////////////	
	$( "#weightSlider" ).bind( "change", function(event, ui) {
	   var theNewVal = $(this).val();
	   curSize = theNewVal;
	   drawingUtil.setStrokeWeight(theNewVal);
    });
	$( ".bgColor" ).bind( "touchend click", function(event, ui) {	   
	   var theNewVal = $(this).val();
	   t.bgchange = true;
	   t.bg = theNewVal;
	   sendData(t);
	   t.clear = false;
	   drawingUtil.setBackgroundColor(theNewVal);
	   $('#theCanvas1').css('background-color',theNewVal);
    });
	$( ".strokeColor" ).bind( "touchend click", function(event, ui) {
	   var theNewVal = $(this).val();
	   curColor = theNewVal;
	   drawingUtil.setStrokeColor(theNewVal);
    });
	$( "#clearScreen" ).bind( "touchend click", function(event, ui) {
	   t.clear = true;
	   sendData(t);
	   t.clear = false;
	   drawingUtil.clear();
	   ctx.clearRect(0,0,2000,2000);
    });
	
	$("#mySidenav").bind("swipeleft",function(){
		closeNav();
	});
	$( "#imageSlider" ).bind( "change", function(event, ui) {
	   var theNewVal = $(this).val();
	   imSize = theNewVal;
	   console.log(imSize);
    });
	
////////////////// SOCKET STUFF ////////////////////////////////////////////////
     //socket = io.connect('http://192.168.1.126:3000');
	 //socket = io.connect('http://192.168.0.113:3000');
	 socket = io.connect('http://54.67.125.184:3000');
	 
	 // Connecting to the Server
	 socket.on('connect', function(tweet) {  
		canvasinfo.name = prompt('Please enter your name:');
		canvasinfo.room = prompt('Please enter your roomname');
		socket.emit('adduser',canvasinfo.name,canvasinfo.room);
	});
	
	// Sending Data to the Server
	socket.on('tweet', function(tweet) {  
		if(tweet.clear){
			ctx.clearRect(0,0,2000,2000);
			drawingUtil.clear();
		} else if(tweet.bgchange){
			var bg = tweet.bg;
			t.bg = tweet.bg;
			drawingUtil.setBackgroundColor(tweet.bg);
			$('#theCanvas1').css('background-color',tweet.bg);
		} else if(tweet.image){
			var img = new Image();
			img.src = "data:image/png;base64" + tweet.buffer;
			ctx.drawImage(img, 20, 20);
		}else{
			ctx.lineWidth = tweet.size;
			if(tweet.touch=="touchstart"){
				ctx.beginPath();
				ctx.moveTo(tweet.x_val,tweet.y_val);
			} else if (tweet.touch=="touchmove"){
				ctx.strokeStyle = tweet.color;
				ctx.lineTo(tweet.x_val,tweet.y_val);
				ctx.stroke();
			} else if (tweet.touch=="touchend"){
				ctx.stroke();
				ctx.closePath();
			}
		}
		
	});
	// Disconnecting from the Server
	socket.on('disconnect', function () {
		console.log("Disconnected ");
    });
	
	
});

// Drawing Class
function DrawingUtil(aCanvas) {
	var my_image = document.getElementById("imageLoader");
	var canvas = aCanvas;
	var context = canvas.getContext("2d");
	var isDrawing = false;
	var headerHeight = $("#theHeader").height();
	curColor = 'black';
	curSize = 1;
	init();

// Start Drawing	
	function start(event) {
		var x,y;
		isDrawing = true;
		context.beginPath();
		x = getX(event);
		y = getY(event);
		t.x_val = x;
		t.y_val=y;
		t.touch='touchstart';
		sendData(t);
		context.strokeStyle = curColor;
		context.lineWidth = curSize;
		context.moveTo(x,y);
		event.preventDefault();
	}
	

// Draw on Canvas	
	function draw(event) {
		var x, y,imsize;
		if(isDrawing) {
			x = getX(event);
			y = getY(event);
			t.x_val = x;
			t.y_val=y;
			t.touch='touchmove';
			sendData(t);
			context.strokeStyle = curColor;
			context.lineWidth = curSize;
			console.log(curColor);
			context.lineTo(x,y);
			context.stroke();
			imsize = imSize;
			
		}
		event.preventDefault();
	}

// Stop drawing	
	function stop(event) {
		if(isDrawing) {
			context.strokeStyle = curColor;
			context.lineWidth = curSize;
			context.stroke();
			context.closePath();
			isDrawing = false;
			t.touch='touchend';
			sendData(t);
		}
		event.preventDefault();
	}

// Get X coordinate of touch	
	function getX(event) {
		if(event.type.contains("touch")) {
			return event.targetTouches[0].pageX;
		}
		else {
			return event.layerX;
		}
	}

// Get Y coordinate of touch	
	function getY(event) {
		var headerHeight = $("#theHeader").height();
		if(event.type.contains("touch")) {
			return (event.targetTouches[0].pageY - headerHeight);
		}
		else {
			return event.layerY;
		}
	}

// Clear the whole canvas	
	this.clear = function() {
		context.clearRect(0,0,canvas.width,canvas.height);
	}

// Save the canvas as an image
	this.toImage = function() {
    	var imageData = canvas.toDataURL();
    	$("#thePopupImage").attr("src",imageData);
    	$.mobile.popup.prototype.options.initSelector = "#popupPhoto";
    	$('#popupPhoto').popup('open',0,0);
	}

// Change Stroke Size	
	this.setStrokeWeight = function(weight) {
    	context.lineWidth = weight;
		t.size = weight;
	}

// Change Stroke Color	
	this.setStrokeColor = function(color){
		context.strokeStyle = color;
		t.color = color;
		$('#currentColor').css('background-color',color);
	}
	
	
	this.setBackgroundColor = function(color){
		$('#theCanvas').css('background-color',color);
	}
	
	function setImage() {
    if ( this.files && this.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
           var img = new Image();
           img.onload = function() {
             //context.drawImage(img, 20, 20, img.width*1,img.height*1);
			 t.image=true;
			 t.buffer=img.src.toString('base64');
			 sendData(t);
			 t.image = false;
			 t.buffer ='';
           };
           img.src = e.target.result;
        };       
        FR.readAsDataURL( this.files[0] );
    }
}

	function drawImage(img){
		context.drawImage(img, 20, 20, img.width*1,img.height*1);
	}

// Listen to touch and mouse events	
	function init() {
		canvas.addEventListener("touchstart",start,false);
		canvas.addEventListener("touchmove",draw,false);
		canvas.addEventListener("touchend",stop,false);
		canvas.addEventListener("mousedown",start,false);
		canvas.addEventListener("mousemove",draw,false);
		canvas.addEventListener("mouseup",stop,false);
		canvas.addEventListener("mouseout",stop,false);
		my_image.addEventListener("change", setImage, false);
		
	}
}
 function sendData(t){
	if(socket.connected){
		socket.emit("tweet",t);
	}
}


// Open the Navigation Pane for the Canvas
function openNav() {
	if(!nav_open){
		document.getElementById("mySidenav").style.width = "250px";
		nav_open = true;
	} else {
		closeNav();
	}

}

// Close the Navigation Pane for the Canvas
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
	nav_open = false;
}