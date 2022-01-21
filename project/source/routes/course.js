var database;
var CourseSchema;
var CourseModel;

var init = function(db) {
    console.log('init 호출됨');

    database = db;
    CourseSchema = database.CourseSchema;
    CourseModel = database.CourseModel;
}

var addcourse = function(req, res){
    console.log('/process/addcourse 호출됨.');
    CourseModel.estimatedDocumentCount().then(function(docs){
        var c_id = docs+1;
        var c_name = req.body.name || req.query.name;
        var c_class = req.body.class || req.query.class;
        var prof = req.body.prof || req.query.prof;
        var grade = req.body.grade || req.query.grade;
        var time = req.body.time || req.query.time;

        if(database) {
            addCourse(database, c_id, c_name, c_class, prof, grade, time, function(err, result) {
                if(err) {throw err;}
                // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
                if (result) {
                    var context = {title : '강의 개설 성공', description: '강의가 정상적으로 개설되었습니다.' , curID : c_id, curName : c_name};
                    req.app.render('addcourse', context, function(err,html){  
                        if(err) throw err;
                        res.end(html);
                    })
                }
                else{
                    var context = {title : '강의 개설 실패', description: '데이터를 올바르게 입력한 뒤 다시 시도해주세요.' , curID : ' ', curName : ' '};
                    req.app.render('addcourse', context, function(err,html){  
                        if(err) throw err;
                        res.end(html);
                    })
                }
            })
        }
    })
}

var addCourse = function(database, c_id, c_name, c_class, prof, grade, time, callback){
    console.log('addCourse 호출됨.');
    
    var course = new CourseModel({"c_id" : c_id, "c_name" : c_name, "class" : c_class, "prof" : prof, "grade" : grade, "time" : time});
    
    course.save(function(err){
        if(err) {
            callback(err,null);
            return;
        }
        
        console.log('사용자 데이터 추가함.');
        callback(null, course);
    })
}

var listcourse = function(req, res){
    console.log('listcourse 호출됨.');
    var context;
    
    CourseModel.findAll(function(err,results){
        if(req.session.user){
        if(err) throw err;
        context = {results : results, title : '수강신청하기', curName : req.session.user.name};
        req.app.render('listcourse', context, function(err,html){
            if(err) throw err;
            res.end(html);
        });}
        else res.redirect('../public/login.html');
    });
}

module.exports.listcourse = listcourse;
module.exports.init = init;
module.exports.addcourse = addcourse;
