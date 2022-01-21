var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
    var CourseSchema = mongoose.Schema({
        c_id : {type : Number, require : true, unique : true, default : '0'},
        c_name : {type : String, require : true, index : 'hashed', default : ''},
        class : {type : String, require : true, default : '전공'},
        grade : {type : String, require : true, default : '3'},
        prof : {type : String, default : ''},
        time : {type : String, require : true, default : 'A'},
        max : {type : Number, require : true, default : '5'},
        cnt : {type : Number, require : true, default : '0'}
    });
    
    CourseSchema.static('findById', function(c_id, callback){
            return this.find({c_id:c_id}, callback);
    });
    
    CourseSchema.static('findAll', function(callback){
        return this.find({}, callback);
    });
    
    console.log('CourseSchema is defined');

    return CourseSchema;
}

module.exports = Schema;