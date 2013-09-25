exports.create = function(req, res){
    var body = {};
    if(req.body){
        body = {
            created: (new Date(req.body.created)).getTime(),
            content: req.body.content,
            status: req.body.status,
            state: req.body.state,
            comment: req.body.comment,
            reportTo: req.body.reportTo,
            user: req.body.user
        };
    }

    db.collection('mainCollection', function(err, collection){
        err || collection.find().toArray(function(err, arr){
            if(!err){
                var l = arr.length, temp = 0, exist = false;
                for(var i = 0; i < l; i++){
                    if(arr[i].id > temp){
                        temp = arr[i].id;
                    }
                }                
                body.id = temp + 1;

                collection.insert(body, function(err, result) {
                    if (!err) {
                        console.log(result);
                        res.send({
                            code: 200,
                            state: 'success',
                            user: body
                        });
                    }
                });
            }
        });        
    });
};

exports.getPersonalReports = function(req, res){
    var user = req.params.user;

    db.collection('mainCollection', function(err, collection) {
        err || collection.find({user: user}).toArray(function(err, result) {
            if (!err) {                
                res.send({
                    code: 200,
                    state: 'success',
                    data: result
                });
            }
        });
    });
};

exports.getEmployees = function(req, res){
    var user = req.params.user;

    db.collection('userCollection', function(err, collection){
        err || collection.find({reportTo: user}).toArray(function(err, result){
            if(!err){
                res.send({
                    code: 200, 
                    state: 'success',
                    data: result
                });
            }
        });
    });
};

exports.getEmployeeReports = function(req, res){
    var u = req.params.user,
        employee = req.params.employee,
        start = new Date(req.params.start).getTime(),
        end = new Date(req.params.end).getTime();

    db.collection('mainCollection', function(err, collection) {
        if (!err) {
            if (employee != 'All') {
                collection.find({
                    $and: [{user: employee}, {reportTo: u}, {created: {$gte: start}}, {created: {$lte: end}}]
                }).toArray(function(err, result) {
                    if (!err) {
                        res.send({
                            code: 200,
                            state: 'success',
                            data: result
                        });
                    }
                });
            } else {
                collection.find({
                    $and: [{reportTo: u}, {created: {$gte: start}}, {created: {$lte: end}}] 
                }).toArray(function(err, result) {
                    if (!err) {
                        res.send({
                            code: 200,
                            state: 'success',
                            data: result
                        });
                    }
                });
            }
        }

    });
};

function transformDateFormat(date) {
    var m = (date.getMonth() + 1).toString(),
        d = date.getDate().toString();

    date = date.getFullYear() + '-' + (m[1] ? m : '0' + m) + '-' + (d[1] ? d : '0' + d);
    return date;
}

function jsonToCSV(json, isFirst, isLast) {
    var result = '';
    if(isFirst){
        for(var item in json){
            result += '"' + item + '",';
        }
        result = result.substring(0, result.lastIndexOf(',')) + '\n';
    }
    for (var item in json) {
        result += '"' + json[item] + '",';            
    }
    result = result.substring(0, result.lastIndexOf(','));
    return isLast ? result : result + '\n';
}

var csv = require('csv'),
    dt = '-' + transformDateFormat(new Date()),
    em = '',
    fs = require('fs');

exports.exportReports = function(req, res){
    var u = req.params.user,
        employee = req.params.employee,
        start = new Date(req.params.start).getTime(),
        end = new Date(req.params.end).getTime();
    em = employee;

    db.collection('mainCollection', function(err, collection) {
        if (!err) {
            if (employee != 'All') {
                collection.find({
                    $and: [{user: employee}, {reportTo: u}, {created: {$gte: start}}, {created: {$lte: end}}]
                }).toArray(function(err, result) {
                    if (!err) {
                        var temp = '';      
                                              
                        for (var j = 0, len = result.length; j < len; j++) {
                            result[j].created = new Date(result[j].created).toLocaleString();
                        }

                        for (var i = 0, l = result.length; i < l; i++) {
                            temp += jsonToCSV(result[i], i == 0, i == result.length - 1);
                        }

                        csv().from.string(temp, {
                            delimiter: ',',
                            escape: '"'
                        }).to.stream(
                            fs.createWriteStream(__dirname+'/download/'+employee+dt+'.csv')                            
                        ).transform(function(row) {
                            row.unshift(row.pop());
                            return row;
                        }).on('record', function(row, index) {
                            console.log('#' + index + ' ' + JSON.stringify(row));
                        }).on('close', function(count) {
                            console.log('Number of lines: ' + count);
                            res.send({
                                code: 200,
                                state: 'success',
                                data: result
                            });
                        }).on('error', function(error) {
                            console.log("---Error---" + error.message);
                            res.send({
                                code: 200,
                                state: 'failure',
                                data: result
                            });
                        });                       
                    }
                });
            } else {
                collection.find({
                    $and: [{reportTo: u}, {created: {$gte: start}}, {created: {$lte: end}}] 
                }).toArray(function(err, result) {
                    if (!err) {
                        var temp = '';

                        for (var j = 0, len = result.length; j < len; j++) {
                            result[j].created = new Date(result[j].created).toLocaleString();
                        }

                        for(var i = 0, l = result.length; i < l; i++){
                            temp += jsonToCSV(result[i], i == 0, i == result.length - 1);
                        }

                        console.log(temp);
                        csv().from.string(temp, {
                            delimiter: ',',
                            escape: '"'
                        }).to.stream(
                            fs.createWriteStream(__dirname+'/download/'+employee+dt+'.csv')
                        ).transform(function(row) {
                            row.unshift(row.pop());
                            return row;
                        }).on('record', function(row, index) {
                            console.log('#' + index + ' ' + JSON.stringify(row));
                        }).on('close', function(count) {
                            console.log('Number of lines: ' + count);
                            res.send({
                                code: 200,
                                state: 'success',
                                data: result
                            });
                        }).on('error', function(error) {
                            console.log("---Error---" + error.message);
                            res.send({
                                code: 200,
                                state: 'failure',
                                data: result
                            });
                        });
                    }
                });
            }
        }
    });
};

exports.download = function(req, res) {
    console.log('download starting...');

    res.download(__dirname+'/download/'+em+dt+'.csv', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Downloading file '+em+dt+'.csv');
        }
    });
};