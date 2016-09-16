var drawingUtil = null;
///////////////////////////////////////////////////////////
// Socket IO stuff
///////////////////////////////////////////////////////////
var socket;
var isConnected = false;

$(function() {
	String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
	var theCanvas = document.getElementById("theCanvas");
	drawingUtil = new DrawingUtil(theCanvas);
	
	theCanvas.width = window.innerWidth;
	theCanvas.height = window.innerHeight;
	
	$( "#weightSlider" ).bind( "change", function(event, ui) {
	   var theNewVal = $(this).val();
	   drawingUtil.setStrokeWeight(theNewVal);
    });
	$( ".bgColor" ).bind( "touchend click", function(event, ui) {
	   var theNewVal = $(this).val();
	   drawingUtil.setBackgroundColor(theNewVal);
    });
	$( ".strokeColor" ).bind( "touchend click", function(event, ui) {
	   var theNewVal = $(this).val();
	   drawingUtil.setStrokeColor(theNewVal);
    });
	$( "#clearScreen" ).bind( "touchend click", function(event, ui) {
	   drawingUtil.clear();
    });
	$(".sideNav").bind("swipeleft",function(){
		closeNav();
	});
	// //document.addEventListener('deviceready', function() {
     socket = io.connect('http://192.168.0.113:3000');
	 socket.on('connection', function(tweet) {  
    // todo: add the tweet as a DOM node
		isConnected = true;
	});
	//socket.on('tweet', function(tweet) {  
		
	//});
	
	socket.on('disconnect', function () {
		isConnected = false;
		console.log("Disconnected ");
    });
	
});

// Drawing Class
function DrawingUtil(aCanvas) {
	var canvas = aCanvas;
	var context = canvas.getContext("2d");
	var isDrawing = false;
	var headerHeight = $("#theHeader").height();
	init();

// Start Drawing	
	function start(event) {
		isDrawing = true;
		context.beginPath();
		context.moveTo(getX(event),getY(event));
		event.preventDefault();
	}

// Draw on Canvas	
	function draw(event) {
		if(isDrawing) {
			var x = getX(event);
			var y = getY(event);
			sendData(x,y);
			context.lineTo(x,y);
			context.stroke();
		}
		event.preventDefault();
	}

// Stop drawing	
	function stop(event) {
		if(isDrawing) {
			context.stroke();
			context.closePath();
			isDrawing = false;
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
	}

// Change Stroke Color	
	this.setStrokeColor = function(color){
		context.strokeStyle = color;
		$('#currentColor').css('background-color',color);
	}
	
	this.setBackgroundColor = function(color){
		$('#theCanvas').css('background-color',color);
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
 function sendData(p,q){
	if(socket.connected){
		socket.emit("tweet",{x_val: p, y_val: q});
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