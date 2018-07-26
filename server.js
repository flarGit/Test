var debug = true;
var fs = require('fs');
var conf = require('./config.json');
if(conf.https){
	var express = require('express')
	,   app = express()
	,   server = require('https').createServer({
      key: fs.readFileSync('Zertifikat/schluessel.key'),
      cert: fs.readFileSync('Zertifikat/zertifikat.pem')
    }, app)
	,   io = require('socket.io').listen(server);   
}else{
	var express = require('express')
	,   app = express()
	,   server = require('http').createServer(app)
	,   io = require('socket.io').listen(server)
}

// Webserver
// auf den Port x schalten
server.listen(conf.port);

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
	

	
	Chat from C to C
	socket.on('chatctoc', function (data) {
		//speichern des chats
		socketidIdAdmin.forEach(function(value, key) {
				var tempid = socketidId.get(socket.id);
				idChatVerlauf.set(tempid,"ID"+tempid+ ": " + data.text + idChatVerlauf.get(tempid));
		});
		// und an mich selbst, wieder zurück das ich ihn auch sehe
		io.sockets.emit('awchatctoc', { zeit: new Date(), text: data.text,name: data.name, blinken: false});
	});
	

	
	
	//test für das beenden des Socket
	socket.on('error', function(exception) {
	  console.log('Cool da kommt was schau mal nach Ralf SOCKET ERROR');
	})

	socket.on('close', function(exception) {
	  console.log('Cool da kommt was schau mal nach Ralf SOCKET CLOSED');
	})
	

	
	function saveFile(filename, savedata){
		return new Promise(function(resolve, reject){
			var erg = "";
			savedata.forEach(function(value, key) {
				erg+= key + ":::" + value + "\r\n";
			});			
			fs.writeFile(__dirname + '/backup/'+filename, erg, function (err) {
			if (err) 
				return console.log(err);
			});
		});
	}
	
});


// Portnummer in die Konsole schreiben
console.log('Der Server läuft nun unter http://127.0.0.1:' + conf.port + '/');