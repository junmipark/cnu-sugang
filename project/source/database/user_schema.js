var crypto = require('crypto');

var Schema = {};


Schema.createSchema = function(mongoose) {
    var UserSchema = mongoose.Schema({
        id : {type : String, required : true, unique : true, default : ' '},
        name : {type : String, index : 'hashed', 'default' : ' '},
        salt : {type : String, required : true},
        birth : {type : Date, index : {unique : false}, 'default' : Date.now},
        email : {type : String, 'default' : " "},
        tel : {type : String, 'default' : '010-XXXX-XXXX'},
        hashed_password : {type : String, required : true, 'default' : ' '},
        created_at : {type: Date, index : {unique : false}, 'default' : Date.now}
    });
    
    UserSchema.static('findById', function(id, callback){
            return this.find({id:id},callback);
        });

    UserSchema.virtual('password').set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
        console.log('virtual password 호출됨 : ' + this.hashed_password);
    }).get(function(){return this._password});        
    
    UserSchema.method('encryptPassword', function(plainText, inSalt){
        if(inSalt) return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        else return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
    });
    
    UserSchema.method('makeSalt', function(){
        return Math.round((new Date().valueOf()*Math.random())) + '';
    });

    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
        if(inSalt) return this.encryptPassword(plainText, inSalt) === hashed_password;
        else return this.encryptPassword(plainText) === hashed_password;
    });
    
    UserSchema.path('id').validate(function(id){return id.length;}, 'id 칼럼의 값이 없습니다.');
    
    UserSchema.path('name').validate(function(name) {return name.length;}, 'name 칼럼의 값이 없습니다.');
    
    console.log('UserSchema is defined');
    
    return UserSchema;
}

module.exports = Schema;