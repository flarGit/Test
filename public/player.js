$(document).ready(function(){
	var name = "";

	// WebSocket
	var socket = io.connect();
	socket.on('connect', function () {
		var temp = location.search.split('?id=')[1];
		var myName = temp.split('?key=')[0];
		var key  = temp.split('?key=')[1];
		name = myName;
		socket.emit('join', {name:myName,key:key});
	});
	
	window.onload = function () {
		document.getElementById("javaskriptfehler").style.display = "none";
		document.getElementById("loadingsite").style.display = "none";
		document.getElementById("myName").style.display = "none";
		document.getElementById("mychat").style.display = "none";
		
	}
//20180717 Nachricht von user to user
	/*function sendenChatctoc(){
		// Eingabefelder auslesen
		var text = $('#chattestctoc').val();
		// Socket senden
		socket.emit('chatctoc', {id: "1", name: name, text: text });
		// Text-Eingabe leeren
		$('#chattestctoc').val('');
	}
//20180717 neue Nachricht CtoC
	socket.on('awchatctoc', function (data) {
		var zeit = new Date(data.zeit);
		$('#chatctoc').append(
			//'<img id="B' + data.name + '" alt="" height="100" src="B'+ data.name +'.jpg" width="100">' +
			'<div id="chatctocname" name="chatctocname">'+ data.name + '</div>' +
			'<div id="chatctocin" name="chatctocin">'+ data.text + '</div>'
		);
	});*/	
	
	//20180717 Nachricht von user to user
	function chatnachrichtsenden(){
		// Eingabefelder auslesen
		var text = $('#chattextinput').val();
		// Socket senden
		socket.emit('chatnachricht',{name: name, text: text });
		// Text-Eingabe leeren
		$('#chattextinput').val('');
	}
	socket.on('awchatnachricht', function (data) {
		var zeit = new Date(data.zeit);
		$('#chattextform').append(
			//'<img id="B' + data.name + '" alt="" height="100" src="B'+ data.name +'.jpg" width="100">' +
			'<div id="chattext" name="chattext">'+data.name+':<br>'+ data.text + '</div>'
		);
		//scroll down
		if(document.getElementById("autoscroll").checked){
			document.getElementById("chattextform").scrollTop = 10000;
		}
	});	
	
	
	socket.on('waitstart', function (data) {
		document.getElementById("wait").style.display = "";
		$('#waitme').append('welcome '+data.name+'<br>Please wait until all other participants ('+data.groupsize+') to be ready:');
		for (i = 0; i < data.groupsize; i++) { 
			$('#waitother').append('<font color="#FF0000">player '+ (i+1) +'</font><br>');
		}
		tickenforwaitONOFF = true;
		tickenforwait();
	});	
	socket.on('rejoinstatus', function (data) {
		$('#waitother').empty();
		
		for (i = 0; i < data.groupsize; i++) {
			if(data.gruen > i){
				$('#waitother').append('<font color="#00C000">Player '+ (i+1) +'</font><br>');
			}else if(data.gelb + data.gruen > i){
				$('#waitother').append('<font color="#DBA901">Player '+ (i+1) +'</font><br>');
			}else{
				$('#waitother').append('<font color="#FF0000">Player '+ (i+1) +'</font><br>');
			}
		}
	});
	socket.on('startchat', function (data) {
		tickenforwaitONOFF = false;
		document.getElementById("wait").style.display = "none";
		document.getElementById("mychat").style.display = "";
	});
	
	socket.on('logout', function (data) {
		location.replace('/logout');
	});
	
	function sendenkeyname(){
		name = $('#playerNameeingabe').val();
		socket.emit('chatctoc', {id: "1", name: name, text: name + " ist dem chat beigetreten" });
		document.getElementById("myName").style.display = "none"
		document.getElementById("mychat").style.display = ""
	}
	
	function waitbereit(){
		if(document.getElementById("waitbereit").value === "ready"){
			document.getElementById("waitbereit").value = "not ready anymore";
			socket.emit('joinstatusgruen',{name:name});
			
		}
		else if(document.getElementById("waitbereit").value === "not ready anymore"){
			document.getElementById("waitbereit").value = "ready";
			socket.emit('joinstatusgelb',{name:name});
		}
		socket.emit('joinstatus',{name:name});
	}
	// bei einem Klick auf senden
	$('#chatnachrichtsendenkey').click(chatnachrichtsenden);
	$('#sendenkeyname').click(sendenkeyname);
	$('#waitbereit').click(waitbereit);

	
	var timeinterval = 3000;
	var tickenforwaitONOFF = false;
	function tickenforwait(){	
		if(tickenforwaitONOFF){
			//console.log("Hallo Tick");
			joinstatusstart();
			window.setTimeout(tickenforwait, timeinterval);
		}
	}
	
	function joinstatusstart(){
		socket.emit('joinstatus',{name:name});
	}
});