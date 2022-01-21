module.exports = {
    server_port : 3000,
    db_url : "mongodb://127.0.0.1:27017/R12_13",
    db_schemas : [
        {file : './user_schema', collection: 'users', schemaName : 'UserSchema',
        modelName : 'UserModel'},
        {file : './course_schema', collection: 'course', schemaName : 'CourseSchema',
        modelName : 'CourseModel'},
        {file : './uc_schema', collection: 'user_course', schemaName : 'UCSchema',
        modelName : 'UCModel'}
    ],    
    route_info : [
        {file : './user', path : '/process/login', method : 'login', type : 'post'},
        {file : './user', path : '/process/adduser', method : 'adduser', type : 'post'},
        {file : './user', path : '/process/logout', method : 'logout', type : 'get'},
        {file : './user', path : '/process/modifyUser', method : 'modifyUser', type : 'get'},
        {file : './user', path : '/process/modifyuser', method : 'modifyuser', type : 'post'},
        {file : './course', path : '/process/addcourse', method : 'addcourse', type : 'post'},
        {file : './course', path : '/process/listcourse', method : 'listcourse', type : 'get'},
        {file : './user_course', path : '/process/regcourse', method : 'regcourse', type : 'post'},
        {file : './user_course', path : '/process/mycourse', method : 'mycourse', type : 'get'},
        {file : './user_course', path : '/process/cancle', method : 'cancle', type : 'post'}
    ]
}