$(document).ready(function(){
	var name = "";
	var pw = "";
	
	// WebSocket
	var socket = io.connect();
	socket.on('connect', function () {
		//?id=user?pw=pw?temppw=
		var temp = location.search.split('?id=')[1];
		var myName = temp.split('?pw=')[0];
		temp  = temp.split('?pw=')[1];
		var mypw = temp.split('?temppw=')[0];
		pw = mypw;
		var tempPW = temp.split('?temppw=')[1];
		name = myName;
		socket.emit('join', {name:myName,pw:pw,tempPW:tempPW});
	});
	
	window.onload = function () {
		document.getElementById("javaskriptfehler").style.display = "none";
		document.getElementById("loadingsite").style.display = "none";
		document.getElementById("mychat").style.display = "none";
		
	}

	function chatnachrichtsenden(){
		// Eingabefelder auslesen
		var text = $('#chattextinput').val();
		// Socket senden
		socket.emit('chatnachricht',{name: name,pw:pw, text: text });
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
		mytime();
	});
	
	socket.on('logout', function (data) {
		//location.replace('/logout');
	});
	
	function waitbereit(){
		if(document.getElementById("waitbereit").value === "ready"){
			document.getElementById("waitbereit").value = "not ready anymore";
			socket.emit('joinstatusgruen',{name:name,pw:pw});
			
		}
		else if(document.getElementById("waitbereit").value === "not ready anymore"){
			document.getElementById("waitbereit").value = "ready";
			socket.emit('joinstatusgelb',{name:name,pw:pw});
		}
		socket.emit('joinstatus',{name:name,pw:pw});
	}
	// bei einem Klick auf senden
	$('#chatnachrichtsendenkey').click(chatnachrichtsenden);
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
	
	var vartime = 120;
	function mytime(){
		if(vartime > 0){
			//console.log("Hallo Tick");
			vartime = vartime - 1;
			$('#time').empty();
			if(vartime > 30){
				$('#time').append(vartime + ' seconds left');
			}else{
				$('#time').append('<font color="#FF0000">'+vartime + ' seconds left </font>');
			}
			window.setTimeout(mytime, 1000);
		}
	}
	
	function joinstatusstart(){
		socket.emit('joinstatus',{name:name,pw:pw});
	}
});