var database;
var UserSchema;
var UserModel;

var logger = require('../log.js').logger;

var init = function(db) {
    console.log('init 호출됨');

    database = db;
    UserSchema = db.UserSchema;
    UserModel = db.UserModel;
}

var login = function(req, res){
    console.log('user 모듈 안에서 login 호출됨.');
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var context = {};
    
    if(req.session.user) {
        UserModel.findById(req.session.user.id, function(err, result){
            if(result.length > 0) {
                context = {title : '로그인 실패', description: '이미 로그인 한 상태입니다.' , curID : result._doc.id, curName : result._doc.name};
                req.app.render('login', context, function(err,html){
                    if(err) throw err;
                    res.end(html);
                })
            }
        })
    }
    
    else {    
        if(database) {
            authUser(database, paramId, paramPassword, function(err, docs){
                if(err) {throw err;}
                if(docs) {
                    logger.info(`서버에 로그인 하였습니다. (${paramId})`);
                    context = {title : '로그인 성공', description: '로그인에 성공하였습니다.' , curID : docs[0]._doc.id, curName : docs[0]._doc.name};
                    
                    req.session.user = {
                        id : docs[0]._doc.id,
                        name : docs[0]._doc.name,
                        authorized : true
                    }
                }
                else {
                    context = {title : '로그인 실패', description: '로그인에 실패하였습니다.' , curID : ' ', curName : ' '};
                }    
                req.app.render('login', context, function(err,html){
                    if(err) throw err;
                    res.end(html);
                })
            })
        }
    }
}

var logout = function(req,res) {
    console.log('/process/logout 호출됨.');
    var id = req.session.user.id;
    
    var context;
    
    if(req.session.user){
        console.log('로그아웃 합니다.');
        
        req.session.destroy(function(err){
            if(err){
                context = {title: '로그아웃 실패', description : '로그아웃에 실패하였습니다.'}
            }
            logger.info(`서버에서 로그아웃 되었습니다. (${id})`);
            context = {title : '로그아웃 성공', description: '로그아웃에 성공하였습니다.'};
            req.app.render('logout', context, function(err,html){
                if(err) throw err;
                res.end(html);
            })    
        })
    }
    
    else{
        context = { title:'로그아웃 실패', description : '로그인 상태가 아닙니다.'}    
        req.app.render('logout', context, function(err,html){
        if(err) throw err;
        res.end(html);
        })
    }
}

var adduser = function(req, res){    
    console.log('/process/adduser 호출됨.');    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    var paramBirth = req.body.birth || req.query.birth;
    var paramEmail = req.body.email || req.query.email;
    var paramTel = req.body.tel || req.query.tel;
    var context;
        
    if(database) {
        addUser(database, paramId, paramPassword, paramName, paramBirth, paramEmail, paramTel, function(err, result) {
            if(err) {throw err;}
            // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
            if (result)
                context = {title : '사용자 추가 성공', description: '계정이 정상적으로 추가되었습니다.' , curID : result._doc.id, curName : result._doc.name};
            else
                var context = {title : '사용자 추가 실패', description: '계정이 정상적으로 추가되지 않았습니다.' , curID : ' ', curName : ' '};
            
            req.app.render('adduser', context, function(err,html){  
                if(err) throw err;
                res.end(html);
            });
        });
    }
}

var addUser = function(database, id, password, name, birth, email, tel, callback){
    console.log('addUser 호출됨.');
    
    var user = new UserModel({"id" : id, "password" : password, "name" : name, "birth" : birth, "email" : email, "tel" : tel});
    
    user.save(function(err){
        if(err) {
            callback(err,null);
            return;
        }
        
        console.log('사용자 데이터 추가함.');
        callback(null, user);
    })
}

var authUser = function(database, id, password, callback) {
    console.log('authUser 호출됨.');
    UserModel.findById(id, function(err, results){
        if(err) {
            callback(err, null);
            return;
        }
        if(results.length > 0) {
            var user = new UserModel({id : id});
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);
            if (authenticated)
                callback(null, results);
            else
                callback(null, null);
        } 
        else {
            console.log("일치하는 id를 찾지 못함.");
            callback(null, null);
        }
    })
}

var modifyUser = function(req, res){
    console.log('modifyUser 호출됨.');
    var context;
    
    if(req.session.user) {
        UserModel.findById(req.session.user.id, function(err, result){
            if(result.length > 0) {
                context = {title : '사용자 정보 수정하기', description: '사용자 정보를 수정합니다.', curID : result[0]._doc.id, curName : result[0]._doc.name,  curEmail : result[0]._doc.email, curTEL : result[0]._doc.tel, curBirth : result[0]._doc.birth}; 
                req.app.render('modify', context, function(err,html){
                    if(err) throw err;
                    res.end(html);
            });
            }
        })
    }
    else
        res.redirect('../public/login.html');
}

var modifyuser = function(req, res){    
    console.log('/process/modifyuser 호출됨.');    
    var paramBirth = req.body.birth || req.query.birth;
    var paramEmail = req.body.email || req.query.email;
    var paramTel = req.body.tel || req.query.tel;
    var context;

    UserModel.update({id:req.session.user.id}, {tel : paramTel, birth : paramBirth, email : paramEmail}, function(err){    
        
        context = {title : '사용자 정보 수정 완료', description: '사용자 정보를 수정하였습니다.', curID : req.session.user.id, curName : req.session.user.name,  curEmail : paramEmail, curTEL : paramTel, curBirth : paramBirth};
        
        req.app.render('modify-s', context, function(err,html){
            if(err) throw err;
            res.end(html);
        });
    });
}

module.exports.init = init;
module.exports.logout = logout;
module.exports.login = login;
module.exports.adduser = adduser;
module.exports.modifyUser = modifyUser;
module.exports.modifyuser = modifyuser;

