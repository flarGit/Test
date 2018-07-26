$(document).ready(function(){
	var name = "";

	// WebSocket
	var socket = io.connect();
	window.onload = function () {
		document.getElementById("javaskriptfehler").style.display = "none"
		document.getElementById("loadingsite").style.display = "none"
	}
//20180717 Nachricht von user to user
	function sendenChatctoc(){
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
	});	
	
	
	function sendenkeyname(){
		name = $('#playerNameeingabe').val();
		socket.emit('chatctoc', {id: "1", name: name, text: name + " ist dem chat beigetreten" });
		document.getElementById("myName").style.display = "none"
		document.getElementById("mychat").style.display = ""
	}
	// bei einem Klick auf senden
	$('#sendenctockey').click(sendenChatctoc);
	$('#sendenkeyname').click(sendenkeyname);

});