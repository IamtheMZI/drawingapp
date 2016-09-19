var drawingUtil = null;
///////////////////////////////////////////////////////////
// Socket IO stuff
///////////////////////////////////////////////////////////
var socket, curColor, curSize;
var t = {
	x_val: 0,
	y_val: 0,
	touch: '',
	clear: false,
	color: 'black',
	size: 1,
	bg: 'white'
};

$(function() {
	var c = document.getElementById("theCanvas");
	var ctx = c.getContext("2d");

	String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
	var theCanvas = document.getElementById("theCanvas");
	drawingUtil = new DrawingUtil(theCanvas);
	
	theCanvas.width = window.innerWidth;
	theCanvas.height = window.innerHeight;
	
	$( "#weightSlider" ).bind( "change", function(event, ui) {
	   var theNewVal = $(this).val();
	   curSize = theNewVal;
	   drawingUtil.setStrokeWeight(theNewVal);
    });
	$( ".bgColor" ).bind( "touchend click", function(event, ui) {
	   var theNewVal = $(this).val();
	   drawingUtil.setBackgroundColor(theNewVal);
    });
	$( ".strokeColor" ).bind( "touchend click", function(event, ui) {
	   var theNewVal = $(this).val();
	   curColor = theNewVal;
	   drawingUtil.setStrokeColor(theNewVal);
    });
	$( "#clearScreen" ).bind( "touchend click", function(event, ui) {
	   drawingUtil.clear();
    });
	$(".sideNav").bind("swipeleft",function(){
		closeNav();
	});
	// //document.addEventListener('deviceready', function() {
     //socket = io.connect('http://192.168.1.126:3000');
	 //socket = io.connect('http://192.168.0.113:3000');
	 socket = io.connect('http://73.222.50.111:3000');
	 socket.on('connection', function(tweet) {  
    // todo: add the tweet as a DOM node
	});
	socket.on('tweet', function(tweet) {  
    // todo: add the tweet as a DOM node
		if(tweet.clear){
			ctx.clearRect(0,0,2000,2000);
		} else {
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
	
	socket.on('disconnect', function () {
		console.log("Disconnected ");
    });
	
});

// Drawing Class
function DrawingUtil(aCanvas) {
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
		var x, y;
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
		t.clear = true;
		sendData(t);
		t.clear = false;
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
		//sendData(t);
	}

// Change Stroke Color	
	this.setStrokeColor = function(color){
		context.strokeStyle = color;
		t.color = color;
		//sendData(t);
		$('#currentColor').css('background-color',color);
	}
	
	
	this.setBackgroundColor = function(color){
		$('#theCanvas').css('background-color',color);
		t.bg= color;
		//sendData(t);
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
		
	}
}
 function sendData(t){
	if(socket.connected){
		socket.emit("tweet",t);
	}
}


// Open the Navigation Pane for the Canvas
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

// Close the Navigation Pane for the Canvas
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}