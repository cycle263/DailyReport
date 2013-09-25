function mainCtrl($scope, $cookieStore, $http, reqCommonSrv, $location, globalVal, $timeout){
    $scope.init = function(){        
        $scope.forms = {};
        $scope.reqs = {};
        $scope.ques = {};
        $scope.ques.employee = 'All';
        $scope.ress = {};
        $scope.pRess = {};
        $scope.eRess = {};
        $scope.alerts = [];

        $scope.reqs.created = reqCommonSrv.transformDateFormat(new Date());

        $scope.vals = {};
        $scope.vals.sessionID = reqCommonSrv.CookieUtil.get('sessionID');
        $scope.vals.user = reqCommonSrv.CookieUtil.get('user');
        $scope.vals.fullname = reqCommonSrv.CookieUtil.get('fullname');
        // $scope.vals.user = $cookieStore.get('user');
        // $scope.vals.sessionID = $cookieStore.get('sessionID');
        // $scope.vals.fullname = $cookieStore.get('fullname');
        $scope.getLoginState();
        $scope.getManager();
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

    $scope.initUl = function() {
        $scope.createReport = function() {
            $scope.switchVal = 'createReport';
            $scope.curUl = 'createReport';
        };

        $scope.reportHistory = function() {
            $scope.switchVal = 'reportHistory';
            $scope.curUl = 'reportHistory';
            $scope.getPersonalReports();
        };

        $scope.employeeReport = function() {
            $scope.switchVal = 'employeeReport';
            $scope.curUl = 'employeeReport';
            $scope.getEmployees();
            $scope.getEmployeeReports();
        };

        $scope.statusChange = function() {
            $scope.showState = ($scope.reqs.status == 'processing');
        };
    };    

    $scope.initNav = function() {
        $scope.curUl = 'createReport';
        $scope.curNav = 'main';

        $scope.mainNav = function() {
            $scope.curNav = 'main';
        };

        $scope.adminNav = function() {
            $scope.curNav = 'admin';
        };
    };

    $scope.initDatePicker = function() {
        $scope.dates = {};

        $scope.open = function(param) {
            $scope.opened1 = true;
            $scope.opened2 = true;
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };

        $scope.today = function() {
            $scope.dates.dts = new Date();
            $scope.dates.dte = new Date();
        };
        $scope.today();


        $scope.showWeeks = true;
        $scope.toggleWeeks = function() {
            $scope.showWeeks = !$scope.showWeeks;
        };

        $scope.clear = function() {
            $scope.dates.dts = null;
            $scope.dates.dte = null;
        };
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
                console.log(data.state);
                reqCommonSrv.checkLogin(data, $location);
            }
        }).error(function(data){
            console.log(data);
            reqCommonSrv.checkLogin(data, $location);
        });
    };

    $scope.getEmployees = function(){
        var user = $scope.vals.user;

        reqCommonSrv.create($http, '/main/getEmployees/' + user, 'GET', {}, $scope.vals.sessionID, function(result){
            if (result.state == 'success') {
                result.data.unshift({username: 'All', fullname: 'All'});
                $scope.ress.employees = result.data;
            } else {
                console.log(result.state);
                reqCommonSrv.checkLogin(result, $location);
            }
        });
    };

    $scope.newReport = function(){
        $scope.reqs.user = $scope.vals.user;
        $scope.reqs.state = $scope.reqs.state ? $scope.reqs.state + '%' : '';

        reqCommonSrv.create($http, '/main/new', 'POST', $scope.reqs, $scope.vals.sessionID, function(result){
            if (result.state == 'success') {
                console.log(result);
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Submit success'
                }];
                $scope.reqs = {};
                $scope.reqs.created = reqCommonSrv.transformDateFormat(new Date());
            } else {
                $scope.alerts = [{
                    type: 'success',
                    msg: 'Submit failure, ' + result.state
                }];
                console.log(result.state);
            }
        });
    };

    $scope.getPersonalReports = function(){
        var user = $scope.vals.user;

        reqCommonSrv.create($http, '/main/getPersonalReports/' + user, 'GET', {}, $scope.vals.sessionID, function(result){
            if (result.state == 'success') {
                $scope.pRess = result.data;
            } else {
                console.log(result.state);
                reqCommonSrv.checkLogin(result, $location);
            }
        });
    };

    $scope.getEmployeeReports = function(){
        var user = $scope.vals.user,
            employee = $scope.ques.employee,
            start = reqCommonSrv.transformDateFormat($scope.dates.dts),
            end = reqCommonSrv.transformDateFormat($scope.dates.dte);
        
        reqCommonSrv.create($http, '/main/getEmployeeReports/' + employee + '/user/' + user + '/date/' + start + '/to/' + end, 'GET', {}, $scope.vals.sessionID, function(result){
            if (result.state == 'success') {
                $scope.eRess = result.data;
                if(result.data && result.data.length == 0){
                    console.log('There is no data');
                }
            } else {
                console.log(result.state);
            }
        });
    };

    $scope.exportReports = function(){
        var user = $scope.vals.user,
            employee = $scope.ques.employee,
            start = reqCommonSrv.transformDateFormat($scope.dates.dts),
            end = reqCommonSrv.transformDateFormat($scope.dates.dte);
        
        reqCommonSrv.create($http, '/main/exportReports/' + employee + '/user/' + user + '/date/' + start + '/to/' + end, 'GET', {}, $scope.vals.sessionID, function(result){
            if (result.state == 'success') {                
                console.log(result);
                document.getElementById('download-ele').click();
            } else {
                console.log(result);
            }
        });
    };

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.init();
    $scope.initUl();
    $scope.initNav();
    $scope.initDatePicker();
}