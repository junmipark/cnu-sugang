var winston = require('winston');
var format = winston.format
var winstonDaily = require('winston-daily-rotate-file');
//var moment = require('moment');

var logger = new (winston.createLogger)({
    format : format.combine(
        format.colorize(),
        format.timestamp({format : 'YYYY-MM-DD HH:mm:ss.SSS ZZ'}),
        format.printf(info => `${info.timestamp} - ${info.level} : ${info.message}`)
    ),
    transports : [
        new (winstonDaily)({
            name : 'info-file',
            filename : './log/server_%DATE%.log',
            datePattern : 'YYYY-MM-DD',
            maxsize : 50000000,
            maxFiles : 1000,
            level : 'info',
            showLevel : true,
            json : false
        }),
        new (winston.transports.Console)({
            name : 'debug-console',
            level:'debug',
            showLevel:true,
            json:false
        })
    ],
    exceptionHandlers : [
    new (winstonDaily)({
            name : 'exception-file',
            filename : './log/exception_%DATE%.log',
            datePattern : 'YYYY-MM-DD',
            maxsize : 50000000,
            maxFiles : 1000,
            level : 'error',
            showLevel : true,
            json : false
        }),
        new (winston.transports.Console)({
            name : 'exception-console',
            level: 'debug',
            showLevel:true,
            json: false
        })
    ]
});


module.exports.logger = logger;
