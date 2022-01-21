var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
    var UCSchema = mongoose.Schema({
        c_id : {type : Number, require : true, default : '0'},
        id : {type : String, required : true, default : ' '},
        time : {type : String, require : true, default : 'A'},
        cred : {type : Number, require : true, default : '3'},
        tot_cred : {type : Number, required : true, default :'0'}
    });
    
    UCSchema.static('findById', function(id, callback){
            return this.find({id:id}, callback);
    });
    
    UCSchema.static('findAll', function(callback){
        return this.find({}, callback);
    });
    
    console.log('UCSchema is defined');

    return UCSchema;
}

module.exports = Schema;