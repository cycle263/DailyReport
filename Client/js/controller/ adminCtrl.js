function adminCtrl($scope, $http, $dialog, $cookieStore, $location, reqCommonSrv, globalVal){
    $scope.init = function(){
        $scope.reqs = {};
        $scope.ress = {};
        $scope.errors = {};
        $scope.alerts = [];
        $scope.createAction = true;  

        $scope.vals = {};
        $scope.vals.sessionID = reqCommonSrv.CookieUtil.get('sessionID');
        $scope.vals.user = reqCommonSrv.CookieUtil.get('user');
        $scope.vals.fullname = reqCommonSrv.CookieUtil.get('fullname');
        // $scope.vals.user = $cookieStore.get('user');
        // $scope.vals.sessionID = $cookieStore.get('sessionID');
        // $scope.vals.fullname = $cookieStore.get('fullname');
        $scope.getLoginState();

        $scope.getManager();   //get all managers fill options
        $scope.getAllUsers();   //get all users fill table
    };

    $scope.initNav = function() {
        $scope.curUl = 'viewUser';
        $scope.curNav = 'admin';

        $scope.mainNav = function() {
            $scope.curNav = 'main';
        };

        $scope.adminNav = function() {
            $scope.curNav = 'admin';
        };
    };

    $scope.initUl = function() {
        $scope.createUser = function() {
            $scope.createAction = true;
            $scope.switchVal = 'createUser';
            $scope.curUl = 'createUser';
            $scope.getManager();
        };

        $scope.viewUser = function() {
            $scope.switchVal = 'viewUser';
            $scope.curUl = 'viewUser';
            $scope.reqs = {};
            $scope.alerts = [];
            $scope.getAllUsers();
        };
    };

    $scope.getLoginState = function(){
        reqCommonSrv.create($http, '/user/getLoginState', 'GET', {}, $scope.vals.sessionID, function(result){
            reqCommonSrv.checkLogin(result, $location);
        });
    };

    $scope.logout = function(){
        $cookieStore.remove('sessionID');
        $cookieStore.remove('user');
        $cookieStore.remove('fullname');
        $location.path('login');
        $location.replace();
    };

    $scope.getManager = function(){
        $http.get(globalVal.baseUrl + '/user/getManager', {
            headers: {'Molt-SessionID': $scope.vals.sessionID}
        }).success(function(data){
            if (data.state == 'success') {
                $scope.ress.managers = data.body;
                var l = data.body.length, truth = false;
                for(var i = 0; i < l; i++){
                    if(data.body[i].username == $scope.vals.user){
                        truth = true;
                    }                    
                }
                $scope.isManager = truth;
            }else{                
                console.log(data);
            }
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.getAllUsers = function(){
        $http.get(globalVal.baseUrl + '/user/getAll', {
            headers: {'Molt-SessionID': $scope.vals.sessionID}
        }).success(function(data){
            if (data.state == 'success') {
                $scope.ress.users = data.body;
            }else{
                console.log(data);
            }
        }).error(function(data){
            console.log(data);
        });
    };

    $scope.submitUser = function(trigger){
        if ($scope.reqs) {
            var obj = $scope.reqs;
            var path = trigger ? 'new' : 'update';    
            var method = trigger ? 'POST' : 'PUT';

            var config = {
                url: globalVal.baseUrl + '/user/' + path,
                method: method,
                headers:  {
                    'Molt-SessionID': $scope.vals.sessionID
                },
                data: obj
            };

            $http(config).success(function(data) {
                if (data.state == 'success') {                    
                    $scope.alerts = [{
                        type: 'success',
                        msg: 'Submit success'
                    }];
                    //$scope.viewUser();
                    $scope.reqs = {};
                    $scope.getAllUsers();
                }else{
                    $scope.alerts = [{
                        type: 'success',
                        msg: 'Submit failure, ' + data
                    }];
                }
            }).error(function(data) {
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Submit failure, ' + data
                }];
            });
        }
    };

    $scope.editUser = function(item){
        $scope.switchVal = 'createUser';
        $scope.curUl = 'createUser';
        $scope.getManager();
        $scope.createAction = false;

        $scope.reqs.username = item.username;
        $scope.reqs.firstPwd = item.password;
        $scope.reqs.secondPwd = item.password;
        $scope.reqs.fullname = item.fullname;
        $scope.reqs.region = item.region;

        $scope.reqs.id = item.id;
        $scope.reqs.reportTo = item.reportTo;
        $scope.reqs.isManager = item.account;
    };

    $scope.removeUser = function(item){
        var title = 'Delete User Information';
        var msg = 'Are you sure you want to delete this user information?';
        var btns = [{
            result: 'no',
            label: 'No'
        }, {
            result: 'yes',
            label: 'Yes',
            cssClass: 'btn-primary'
        }];

        $dialog.messageBox(title, msg, btns).open().then(function(result) {
            if(result == 'yes'){
                reqCommonSrv.create($http, '/user/delete/' + item.id, 'DELETE', {}, $scope.vals.sessionID, function(result){
                    if(result.state == 'success'){
                        $scope.getAllUsers();
                        $scope.alerts = [{
                            type: 'success',
                            msg: 'Submit success'
                        }];
                    }else{
                        $scope.alerts = [{
                            type: 'success',
                            msg: 'Submit failure, ' + result.body
                        }];
                    }
                });
            }
        });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
    $scope.init();
    $scope.initNav();
    $scope.initUl();
}
