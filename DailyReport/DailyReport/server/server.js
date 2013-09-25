var express = require('express'),
    csv = require('csv'),
    user = require('./user'),
    main = require('./main');

var app = express(),
    store = express.session.MemoryStore,
    sessionStore = new store();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,HEADER');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, custom-header, Accept, Origin, User-Agent, Content-Type, Molt-SessionID');
    res.header('Access-Control-Expose-Headers', 'User-Agent, Content-Type, Authorization, Set-Cookie');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Content-Type', 'application/json;charset=UTF-8');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
};

var checkLogin = function(req, res, next){
    if (req.method != 'OPTIONS' && req.headers['molt-sessionid']) {
        var id = req.headers['molt-sessionid'];
        if(req.sessionStore.sessions[id]){
            var session = JSON.parse(req.sessionStore.sessions[id]);
            if (session.loginState !== 'isLogin') {
                console.log('Login state: ' + session.loginState);
                res.send({
                    code: 200,
                    loginStatus: false,
                    state: 'not loggin in'
                });
            } else {
                next();
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

app.configure(function(){
    app.use(allowCrossDomain);
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.session({
        secret: '1234567890QWERTY!@#$%^', 
        key: 'sid',
        store: sessionStore, 
        cookie: {
            maxAge: new Date(Date.now() + 3600000 * 24)
        }
    }));
    app.use(express.logger('dev'));
});

app.post('/user/login', user.login);
app.get('/user/getLoginState', user.getLoginState);
app.post('/user/new', checkLogin, user.create);
app.delete('/user/delete/:id', checkLogin, user.delete);
app.put('/user/update', checkLogin, user.update);
app.get('/user/getAll', checkLogin, user.getAll);
app.get('/user/getManager', checkLogin, user.getManager);

app.post('/main/new', checkLogin, main.create);
app.get('/main/getPersonalReports/:user', checkLogin, main.getPersonalReports);
app.get('/main/getEmployeeReports/:employee/user/:user/date/:start/to/:end', checkLogin, main.getEmployeeReports);
app.get('/main/exportReports/:employee/user/:user/date/:start/to/:end', checkLogin, main.exportReports);
app.get('/main/getEmployees/:user', main.getEmployees);

app.get('/download', main.download);

app.listen(3000);
console.log('Server listening on port 3000');
