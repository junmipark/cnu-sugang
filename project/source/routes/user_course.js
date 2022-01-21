var database;
var CourseModel;
var UserModel;
var UCModel;

var init = function(db) {
    console.log('init 호출됨');

    database = db;
    CourseModel = database.CourseModel;
    UserModel = database.UserModel;
    UCModel = database.UCModel;
}

var regcourse = function(req, res){
    console.log('/process/regcourse 호출됨.');
    var context;
    var c_id = req.body.c_id || req.query.c_id;
    var grade = req.body.grade || req.query.grade;
    var time = req.body.time || req.query.time;
    var cnt = req.body.cnt || req.query.cnt;
    var max = req.body.max || req.query.max;
    var id = req.session.user.id;
    var tot_cred=0;
    var cred = parseInt(grade);
    var int_cnt = parseInt(cnt);
    
    UCModel.findById(req.session.user.id, function(err, result){
        //기존에 수강신청한 기록이 있음    
        if(cnt >= max){ //수강 가능한 인원을 초과함
            context = {title : '수강 실패', description: '수강인원을 초과하였습니다.'};
            req.app.render('regcourse', context, function(err,html){
                if(err) throw err;
                res.end(html);
            });
        }
        else if(result.length > 0) {
            console.log('기존에 수강신청한 기록이 있음')
            for(var i=0;i<result.length;i++){
                //이미 수강 신청한 과목인 경우
                if(result[i]._doc.c_id == c_id){
                    console.log('수강 중복');
                    context = {title : '수강 실패', description: '이미 신청한 과목입니다.'};
                    req.app.render('regcourse', context, function(err,html){
                        if(err) throw err;
                        res.end(html);
                    });
                }
                //수강신청할 과목이 이전 시간표와 겹치는 경우
                else if(result[i]._doc.time == time){
                    console.log('시간표 중복');
                    context = {title : '수강 실패', description: '이미 신청한 시간표와 중복됩니다.'};
                    req.app.render('regcourse', context, function(err,html){
                        if(err) throw err;
                        res.end(html);
                    });
                }
                else if(result[i]._doc.tot_cred + cred > 6){//수강 가능한 학점 초과함                
                    console.log('수강 가능 학점 초과')
                    context = {title : '수강 실패', description: '수강 가능한 학점을 초과하였습니다.'};
                    req.app.render('regcourse', context, function(err,html){
                        if(err) throw err;
                        res.end(html);
                    });
                }
                else {
                    tot_cred = result[i]._doc.tot_cred + cred;
                    int_cnt += parseInt('1');
                    regCourse(c_id, id, tot_cred, cred, time, function(err,result){
                        if(err) throw err;
                        if(result){
                            UCModel.updateMany({id: id},{tot_cred : tot_cred}, function(err){
                                if(err) throw err;
                                CourseModel.updateOne({c_id:c_id}, {cnt:int_cnt}, function(err){
                                    if(err) throw err;                        
                                    context = {title : '수강 성공', description: '수강 신청에 성공하였습니다.'};
                                    req.app.render('regcourse', context, function(err,html){
                                        if(err) throw err;
                                        res.end(html);})
                                });
                            });   
                        }})
                }
            }//for
        }//result O
        //기존에 수강신청한 기록이 존재하지 않음
        else {
            tot_cred += cred;
            int_cnt += parseInt('1');
            regCourse(c_id, id, tot_cred, cred, time, function(err,result){
                if(err) throw err;
                if(result){
                    CourseModel.updateOne({c_id: c_id},{cnt : int_cnt}, function(err){
                        context = {title : '수강 성공', description: '수강 신청에 성공하였습니다.'};
                        req.app.render('regcourse', context, function(err,html){
                            if(err) throw err;
                            res.end(html);
                        });
                    });
                }
            })
        }
    })//findById
}

var regCourse = function(c_id, id, tot_cred, cred, time, callback) {
    console.log('regCourse 호출됨');
    var uc = new UCModel({"c_id" : c_id, "id" : id, "tot_cred" : tot_cred, "cred" : cred, "time" : time});
    uc.save(function(err){
        if(err) {
            callback(err,null);
            return;
        }
        console.log('수강 데이터 추가함.');
        callback(null, uc);
    });    
}

var mycourse = function(req, res) { 
    console.log('/process/mycourse 호출됨.');    
    var context;
    UCModel.findById(req.session.user.id, function(err, results){
        if(req.session.user){
            if(err) throw err;
            if(results){
                tot_cred = results[0]._doc.tot_cred;
                context = {results : results, tot_cred : tot_cred, title : '나의 수강목록 조회하기', curName : req.session.user.name};
                req.app.render('mycourse', context, function(err,html){
                    if(err) throw err;
                    res.end(html);
                });   
            }
        }
        else res.redirect('../public/login.html');
    })
}

var cancle = function(req, res) {
    var c_id = req.body.c_id || req.query.c_id;
    var cred = req.body.cred || req.query.cred;
    var tot_cred = req.body.tot_cred || req.query.tot_cred;
    var context;

    console.log('/process/cancle 호출됨.');
    
    if(req.session.user){
        CourseModel.findOne({c_id:c_id}, function(err, docs){
            var cnt = docs._doc.cnt;
            cnt -= parseInt('1');
            tot_cred -= cred;
            CourseModel.updateOne({c_id:c_id}, {cnt:cnt}, function(){
                console.log('cnt 처리함.');
                UCModel.deleteOne({c_id:c_id, id:req.session.user.id}, function() {
                    console.log('수강 취소 완료.');
                        UCModel.updateMany({id:req.session.user.id}, {tot_cred : tot_cred}, function() {
                            console.log('tot_cred 수정 완료.');
                            context = {title : '수강 취소 성공'};
                            req.app.render('cancle', context, function(err,html){
                                if(err) throw err;
                                res.end(html);
                            });//render
                        });//update
                })//deleteOne
            })//updateOne
        })//findByid
    }
    else res.redirect('../public/login.html');
}

module.exports.mycourse = mycourse;
module.exports.cancle = cancle;
module.exports.regcourse = regcourse;
module.exports.init = init;
