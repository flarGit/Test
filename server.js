var debug = true;

var groupsize = 2;
var idcheck = new Map();
var nametoGroup = new Map();
var groupGelb = new Map();
var groupGruen = new Map();
var grouptoActive = new Map();		// 0 = start 1=warten 2 = läuft 3 = timeout

var express = require('express');
var app = express();


var morgan = require('morgan');
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};


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
	if (!db) {
		initDb(function(err){});
	}
	if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.sendfile(__dirname + '/public/login.html');
    });
  } else {
    res.sendfile(__dirname + '/public/login.html');
	}
});

app.post('/login', function (req, res) {
    var user = req.body.username,
    pw = req.body.password;
    if (user === 'u1' && pw === 'test') {
		nametoGroup.set(user,"G1");
        req.session.user = 'u1';
    } else if (user === 'u2' && pw === 'test') {
		nametoGroup.set(user,"G1");
		req.session.user = 'u2';
    } else if (user === 'u3' && pw === 'test') {
		nametoGroup.set(user,"G2");
		req.session.user = 'u3';
    } else if (user === 'u4' && pw === 'test') {
		nametoGroup.set(user,"G2");
		req.session.user = 'u4';
    }
	idcheck.set(user,rand(100000,999999))
    res.redirect('/player'+'?id='+user+'?key='+idcheck.get(user));
});

app.get('/player', checkAuth, function (req, res) {
	//var user = req.query.id;
	//console.log('username parameter:'+user);
	res.sendfile(__dirname + '/public/player.html', {user: req.session.user});
});

//kann eigendlich weg echzeit überwachung :)
app.get('/logout', function (req, res) {
    var names = Object.keys(connectionsfull);

    names.splice(names.indexOf(req.session.user), 1);

    var msg = '{"names": ["' + names.join('","') + '"]}';

    connectionsfull[req.session.user].broadcast.emit('join', msg);

    connectionsfull[req.session.user].disconnect();
    delete connectionsfull[req.session.user];

    delete req.session.user;

    res.redirect('/');
	console.log('tschussssssss');
});

//funktionen----------------------------------------------------------------
function rand (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
//--------------------------------------------------------------------------

var http = require('http');
var server = http.createServer(app);
server.listen(8080);
var io = require('socket.io').listen(server);

var connections = {};
var connectionsfull = {};

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
	
	socket.on('chatnachricht', function (data) {
		// und an mich selbst, wieder zurück das ich ihn auch sehe
		var name = getName(connections, socket.id);
		var group = nametoGroup.get(name);
		var idSocketid = new Map();
		idSocketid = groupGruen.get(group);
		if(typeof idSocketid !== "undefined"){
			idSocketid.forEach(function(value, key) {
				if(typeof io.sockets.connected[value] === "undefined"){
					//nicht senden, Player entfernen und Admin melden
					console.log('\u001b[31m check PlayerID '+ key + ' verloren \u001b[0m');
					if (debug) console.log("\007");
					//key wieder freigeben
					//entfernen der ID über PlayerID
					if(idSocketid.has(key))idSocketid.delete(key);									
				}else{
					io.sockets.connected[key].emit('awchatnachricht', { zeit: new Date(), text: data.text,name: name});

				}
			});
		}
		console.log(new Date() + ' from:' + name + ' group:'+ group +' text:' + data.text);
	});
	
	socket.on('join', function(data) {
		if(data.key == idcheck.get(data.name)){
			connections[data.name] = socket.id;
			connectionsfull[data.name] = socket;
			socket.emit('waitstart', {name: data.name,groupsize:groupsize});
			var temp = new Map();
			temp = groupGelb.get(nametoGroup.get(data.name));
			if(typeof temp === "undefined"){
				temp = new Map();
				temp.set(socket.id,socket.id);
				groupGelb.set(nametoGroup.get(data.name),temp);
			}else{
				temp.set(socket.id,socket.id);
			}
		}else{
			console.log('da hat jemand was an der URL geaendert --> logout');
			socket.emit('logout', {});
		}
		//io.sockets.emit('awchatctoc', { zeit: new Date(), text: data.name + ' ist dem chat beigetreten',name: 'SYSTEM'});
		//console.log(new Date() +""+ data.name + "ist dem chat beigetreten SYSTEM");
    });
	
	socket.on('joinstatus', function(data) {
		var gruen = 0;
		var gelb = 0;
		
		var idSocketid = new Map();
		idSocketid = groupGelb.get(nametoGroup.get(data.name));
		if(typeof idSocketid !== "undefined"){
				idSocketid.forEach(function(value, key) {
					if(typeof io.sockets.connected[value] === "undefined"){
						//nicht senden, Player entfernen und Admin melden
						console.log('\u001b[31m check PlayerID '+ key + ' verloren \u001b[0m');
						if (debug) console.log("\007");
						//entfernen der ID über PlayerID
						if(idSocketid.has(key))idSocketid.delete(key);
					}
				});
			gelb = idSocketid.size;
		}
		
		idSocketid = groupGruen.get(nametoGroup.get(data.name));
		if(typeof idSocketid !== "undefined"){
			idSocketid.forEach(function(value, key) {
				if(typeof io.sockets.connected[value] === "undefined"){
					//nicht senden, Player entfernen und Admin melden
					console.log('\u001b[31m check PlayerID '+ key + ' verloren \u001b[0m');
					if (debug) console.log("\007");
					//key wieder freigeben
							
					//entfernen der ID über PlayerID
					if(idSocketid.has(key))idSocketid.delete(key);									
				}
			});
			gruen = idSocketid.size;
		}
		if(gruen == groupsize){
			socket.emit('startchat', {});
		}else{
			socket.emit('rejoinstatus', {gruen: gruen,gelb:gelb,groupsize:groupsize});
		}
	});
	
	socket.on('joinstatusgruen', function(data) {
		var idSocketid = new Map();
		idSocketid = groupGelb.get(nametoGroup.get(data.name));
		if(typeof idSocketid !== "undefined"){
			idSocketid = groupGelb.get(nametoGroup.get(data.name));
			idSocketid.delete(socket.id);
		}
		
		var temp = new Map();
		temp = groupGruen.get(nametoGroup.get(data.name));
		if(typeof temp === "undefined"){
			temp = new Map();
			temp.set(socket.id,socket.id);
			groupGruen.set(nametoGroup.get(data.name),temp);
		}else{
			temp.set(socket.id,socket.id);
		}
	});
	socket.on('joinstatusgelb', function(data) {
		var idSocketid = new Map();
		idSocketid = groupGruen.get(nametoGroup.get(data.name));
		if(typeof idSocketid !== "undefined"){
			idSocketid = groupGruen.get(nametoGroup.get(data.name));
			idSocketid.delete(socket.id);
		}
		
		var temp = new Map();
		temp = groupGelb.get(nametoGroup.get(data.name));
		if(typeof temp === "undefined"){
			temp = new Map();
			temp.set(socket.id,socket.id);
			groupGelb.set(nametoGroup.get(data.name),temp);
		}else{
			temp.set(socket.id,socket.id);
		}
	});
	
});


// Portnummer in die Konsole schreiben
console.log('Der Server läuft nun');