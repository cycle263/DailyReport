exports.db = function() {
    var mongo = require('mongodb');

    var Server = mongo.Server,
        Db = mongo.Db,
        BSON = mongo.BSONPure;

    var server = new Server('localhost', 27017, {
        auto_reconnect: true
    });
    db = new Db('dbDailyReport', server);

    db.open(function(err, db) {
        if (!err) {
            console.log("Connectd to 'dbDailyReport' database");
            db.collection('userCollection', {
                strict: true
            }, function(err, collection) {
                if (err) {
                    console.log("The collection doesn't exist. Creating it with sample data...");
                    populateCollection();
                }                
            });
        }
    });
    return db;
};


/************ create user collection ***********/

function populateCollection(){
    var userCollection = [{
        id: 0,
        username: 'admin',
        password: '123qwe!@#',
        account: 'admin',
        region: 'CD',
        created: new Date(),
        fullname: 'Administrator',
        reportTo: []
    }];

    db.collection('userCollection', function(err, collection) {
        collection.insert(userCollection, {
            safe: true
        }, function(err, result) {});
    });
}