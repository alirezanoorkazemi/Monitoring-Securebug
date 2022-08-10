let globalIDSchema = new mongoose.Schema({
    _id: {type:String},
    value: {type:Number},
});
const GlobalIDModel = mongoose.model('global_id', globalIDSchema);

const UserSchema = new mongoose.Schema({
    email: {type:String ,unique: true},
    avatar_file : String,
    first_name : String,
    last_name : String,
    password : String,
    status : {type:Boolean,default:true},
    register_date_time : Date,
});
const UserModel = mongoose.model('user', UserSchema);


const LogSchema = new mongoose.Schema({
    user: {type:String},
    status_code : Number,
    method : String,
    page : String,
    get_data : String,
    post_data : String,
    cookie_data : String,
    header_data : String,
    date_time:Date,
    user_agent : String,
    ip : String,
    referer : String,
    server_ip : String,
    server_name : String,
});
const LogModel = mongoose.model('log', LogSchema);



Models = {
    "GlobalIDModel" : GlobalIDModel,
    "UserModel" : UserModel,
    "LogModel" : LogModel,
};


