function loginCtrl($scope, $http, $cookieStore, reqCommonSrv, globalVal, $location){
    $scope.init = function(){
        $scope.req = {};
        $scope.errors = {};
        $scope.req.name = 'rl15';
        $scope.req.pwd = '123';
    };    

    $scope.submit = function(){
        if(!$scope.req.name || !$scope.req.pwd){
            console.log("Please input username or password");
            return;
        }
        var config = {
            url: globalVal.baseUrl + '/user/login',
            method: 'POST',
            headers: {
                'custom-header': 'test'
            },
            data: {
                username: $scope.req.name,
                password: $scope.req.pwd
            }
        };

        $http(config).success(function(result){
            if(result.state == 'success'){
                $scope.errors.login = false;
                reqCommonSrv.CookieUtil.set('sessionID', result.sessionID);
                reqCommonSrv.CookieUtil.set('user', result.user);
                reqCommonSrv.CookieUtil.set('fullname', result.fullname);

                // $cookieStore.put('sessionID', result.sessionID);
                // $cookieStore.put('user', result.user);
                // $cookieStore.put('fullname', result.fullname);
                $location.path('/main');
                $location.replace();
            }else{
                $scope.errors.login = true;
            }
        }).error(function(result){
            console.log(result);
        });
    };

    $scope.init();
}
