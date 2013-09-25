var db = require('./database').db();

exports.login = function(req, res){
    var body = req.body;    

    db.collection('userCollection', function(err, collection){
        collection.findOne({username: body.username}, function(err, result){
            if(!err){                
                if(result && result.password === body.password){
                    req.session.loginState = 'isLogin';
                    req.session.user = body.username;
                    
                    res.send({
                        code: 200,
                        sessionID: req.session.id,
                        user: req.session.user,
                        fullname: result.fullname,
                        state: 'success'
                    });
                }else{
                    req.session.loginState = '';
                    req.session.user = '';
                    res.send({
                        code: 200,                        
                        state: 'account unavail'
                    });
                }
            }            
        });
    });
};

exports.create = function(req, res){
    var body = {};
    if(req.body){
        body = {
            username: req.body.username,
            password: req.body.secondPwd,
            fullname: req.body.fullname,
            region: req.body.region,
            account: req.body.isManager,
            reportTo: req.body.reportTo,
            created: (new Date()).getTime()
        };
    }

    db.collection('userCollection', function(err, collection){
        collection.find().toArray(function(err, arr){
            var l = arr.length, temp = 0, exist = false;
            for(var i = 0; i < l; i++){
                if(arr[i].id > temp){
                    temp = arr[i].id;
                }
                if(arr[i].username == body.username){
                    exist = true;
                }
            }
            
            body.id = temp + 1;
            if(!exist){
                collection.insert(body, function(err, result){
                    if(!err){
                        console.log(result);
                        res.send({
                            code: 200,
                            state: 'success',
                            user: body
                        });
                    }
                });
            }else{
                res.send({
                    code: 200,
                    state: 'user has exist'
                });
            }
        });        
    });
};

exports.delete = function(req, res){
    var id = req.params.id;
    console.log('Remove id: ' + req.params.id);
    if(!id){res.send({state:'failure', code: 200, body: {msg: "User doesn't exist"}});}

    db.collection('userCollection', function(err, collection){
        err || collection.remove({id: id - 0}, {}, function(err, result){
            err || res.send({
                code: 200,
                state: 'success',
                body: result
            });
        });
    });
};

exports.update = function(req, res){
    var body = {},
        id = req.body.id;
    if(req.body){
        body = {
            username: req.body.username,
            password: req.body.secondPwd,
            fullname: req.body.fullname,
            region: req.body.region,
            account: req.body.isManager,
            reportTo: req.body.reportTo
        };
    }

    db.collection('userCollection', function(err, collection){
        err || collection.update({id: id}, {$set: body}, function(err, result){
            err || res.send({
                code: 200,
                state: 'success',
                body: result
            });
        });        
    });
};

exports.getAll = function(req, res){
    db.collection('userCollection', function(err, collection) {
        err || collection.find().toArray(function(err, result) {
            if (!err) {    
                if(result){    
                    for(var i = 0, l = result.length; i < l; i++){
                        delete result[i].password;
                    } 
                }       
                res.send({
                    code: 200,
                    state: 'success',
                    body: result
                });
            }
        });
    });
};

exports.getManager = function(req, res, next){
    db.collection('userCollection', function(err, collection){
        collection.find({$or:[{account: 'manager'}, {account: 'admin'}]}).toArray(function(err, arr){
            if(!err){
                if(arr){    
                    for(var i = 0, l = arr.length; i < l; i++){
                        delete arr[i].password;
                    } 
                }   
                res.send({
                    code: 200,
                    state: 'success',
                    body: arr
                });
            }
        });
    });
};

exports.getLoginState = function(req, res){
    console.log('Check login state...');
    if (req.headers['molt-sessionid']) {
        var id = req.headers['molt-sessionid'];
        if(req.sessionStore.sessions[id]){
            var session = JSON.parse(req.sessionStore.sessions[id]);
            if (session.loginState !== 'isLogin') {
                res.send({
                    code: 200,
                    loginStatus: false,
                    state: 'not loggin in'
                });
            } else {
                res.send({
                    code: 200,
                    loginStatus: true,
                    data: {
                        user: session.user
                    },
                    state: 'isLogin'
                });
            }
        }else{
            res.send({
                code: 200,
                loginStatus: false,
                state: "sessionStore haven't the sessionID"
            });
        }
    }else{
        res.send({
            code: 200,
            loginStatus: false,
            state: "sessionID doesn't exist"
        });
    }
};
