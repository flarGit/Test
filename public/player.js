$(document).ready(function(){


	// WebSocket
	var socket = io.connect();
	
	
//20180717 Nachricht von user to user
	function sendenChatctoc(){
		// Eingabefelder auslesen
		//var name = $('#name').val();
		var name = myID;
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
			'<img id="B' + data.name + '" alt="" height="100" src="B'+ data.name +'.jpg" width="100">' +
			'<div id="chatctocin" name="chatctocin">'+ data.text + '</div>'	
		);
	});	
//20180717 ctoc	
	// bei einem Klick auf senden
	$('#sendenctockey').click(sendenChatctoc);
	

});