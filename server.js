var debug = true;
var fs = require('fs');
	var express = require('express')
	,   app = express()
	,   server = require('http').createServer(app)
	,   io = require('socket.io').listen(server)


// Webserver
// auf den Port x schalten
server.listen(8080);

app.configure(function(){
	// statische Dateien ausliefern
	app.use(express.static(__dirname + '/public'));
});

app.get('/player', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/player.html');
});
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/index.html');
});
//-----------------------------------------------------------------------------------------------------------------------


//------------------zusatz funktionen----------------------------
//zufall floor das die warscheinlichkeit am anfang und ende gleich mit dem rest ist
function rand (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
//-----------------------------------------------------------------------------------------------------------------------

// Websocket
io.sockets.on('connection', function (socket) {
	// der Client ist verbunden
	if (debug) console.log('Verbunden mit '+ socket.id);	
	

	
	//Chat from C to C
	socket.on('chatctoc', function (data) {
		// und an mich selbst, wieder zurück das ich ihn auch sehe
		io.sockets.emit('awchatctoc', { zeit: new Date(), text: data.text,name: data.name});
		console.log(new Date() + ' from:'+data.name+' text:'+data.text);
	});
	

	
});


// Portnummer in die Konsole schreiben
console.log('Der Server läuft nun');