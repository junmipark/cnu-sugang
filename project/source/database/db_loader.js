var mongoose = require('mongoose');

var database = {};

database.init = function (app, config) {
    connect(app, config);
}

function connect(app, config) {
    console.log('connect() 호출됨.');

    var databaseUrl = config.db_url;

    console.log("데이터베이스 연결에 시도합니다.");

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, { useUnifiedTopology: true, useNewUrlParser: true });
    database = mongoose.connection;

    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function () {
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);

        createSchema(app, config);
    });

    database.on('disconnected', function () {
        console.log('disconnectd, reconnect in 5 seconds');
        setInterval(connect, 5000);
    });
}

function createSchema(app, config) {
    var schemaLen = config.db_schemas.length;
    console.log(`설정에 정의된 스키마의 수 : ${schemaLen}`);

    for (var i = 0; i < schemaLen; i++) {
        var curItem = config.db_schemas[i];

        var curSchema = require(curItem.file).createSchema(mongoose);
        console.log(`${curItem.file} 모듈을 불러들인 후 스키마 정의함. `);

        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log(`${curItem.file} 모듈을 불러들인 후 모델 정의함. `);

        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log(`스키마 이름 [${curItem.schemaName}], 모델 이름 [${curItem.modelName}]이 database 객체의 속성으로 추가됨.`);
    }

    require('../routes/user').init(database);
    require('../routes/course').init(database);
    require('../routes/user_course').init(database);

    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가됨. ');
}

module.exports = database;
