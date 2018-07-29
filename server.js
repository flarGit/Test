var debug = true;

var express = require('express');
var app = express();

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');


app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({ extended: false }));

app.configure(function(){
	// statische Dateien ausliefern
	app.use(express.static(__dirname + '/public'));
});

function checkAuth(req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next(); 
	}
}

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/login.html');
});

app.post('/login', function (req, res) {
    var user = req.body.username,
    pw = req.body.password;
    if (user === 'u1' && pw === 'test') {
        req.session.user = 'u1';
    } else if (user === 'u2' && pw === 'test') {
        req.session.user = 'u2';
    }
    res.redirect('/player'+'?id='+user);
});

app.get('/player', checkAuth, function (req, res) {
	//var user = req.query.id;
	//console.log('username parameter:'+user);
	res.sendfile(__dirname + '/public/player.html', {user: req.session.user});
});

app.get('/logout', function (req, res) {
    var names = Object.keys(connections);

    names.splice(names.indexOf(req.session.user), 1);

    var msg = '{"names": ["' + names.join('","') + '"]}';

    connections[req.session.user].broadcast.emit('join', msg);

    connections[req.session.user].disconnect();
    delete connections[req.session.user];

    delete req.session.user;

    res.redirect('/');
	console.log('tschussssssss');
});


var http = require('http');
var server = http.createServer(app);
server.listen(8080);
var io = require('socket.io').listen(server);

var connections = {};

function getName (connections, socket) {
    var name;
    for (var key in connections) {
        if (socket === connections[key]) {
            name = key; }
    }
    return name;
}

io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
	if (debug) console.log('Verbunden mit '+ socket.id);	
	

	
	//Chat from C to C
	socket.on('chatctoc', function (data) {
		// und an mich selbst, wieder zurück das ich ihn auch sehe
		var name = getName(connections, socket);
		console.log('Der name ist:' + name);
		io.sockets.emit('awchatctoc', { zeit: new Date(), text: data.text,name: name});
		console.log(new Date() + ' from:' + name + ' text:' + data.text);
	});
	
	socket.on('join', function(data) {
        connections[data.name] = socket;
		io.sockets.emit('awchatctoc', { zeit: new Date(), text: data.name + ' ist dem chat beigetreten',name: 'SYSTEM'});
		console.log(new Date() +""+ data.name + "ist dem chat beigetreten SYSTEM");
    });
	
});


// Portnummer in die Konsole schreiben
console.log('Der Server läuft nun');