var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var ejs = require('ejs');

var config = require('./config');

var app = express();

app.set('port', process.env.PORT || config.server_port);
app.use('/public',express.static(path.join(__dirname,'public')));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

console.log('뷰 엔진이 ejs로 설정되었습니다.')


var cookieParser = require('cookie-parser');
app.use(cookieParser());

var expressSession = require('express-session');
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

var db_loader = require('./database/db_loader');

http.createServer(app).listen(process.env.PORT||app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    db_loader.init(app, config);
});

var router = express.Router();
var route_loader = require('./routes/route_loader');

route_loader.init(app, router);