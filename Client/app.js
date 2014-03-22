var app = angular.module('dailyReportApp', ['ui.bootstrap', 'ngCookies']);

app.config(function($routeProvider, $httpProvider, $locationProvider){
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    //$locationProvider.html5Mode(true);

    $routeProvider.when('/login', {templateUrl: 'view/login.html', controller: loginCtrl})
        .when('/main', {templateUrl: 'view/main.html', controller: mainCtrl})
        .when('/admin', {templateUrl: 'view/admin.html', controller: adminCtrl})
        .otherwise({redirectTo: '/login'});
});

app.run(function($rootScope){
    $rootScope.globalVal = {};
});

app.constant('globalVal', { "baseUrl": "http://10.16.86.152:3000" });

app.directive('confirmpassword', function(){
    return function(scope, ele, attrs){
        ele.bind('input', function(e){
            if(scope.reqs.firstPwd){
                if(scope.reqs.secondPwd && scope.reqs.firstPwd.substr(0, scope.reqs.secondPwd.length) == scope.reqs.secondPwd){
                    scope.errors.confirmpasswordError = false;
                }else{
                    scope.errors.confirmpasswordError = true;
                }
                scope.errors.emptypasswordError = false;
            }else{
                scope.errors.emptypasswordError = true;
            }
            scope.$apply();
        });

        ele.bind('blur', function(e){
            if(scope.reqs.firstPwd != scope.reqs.secondPwd){
                scope.errors.confirmpasswordError = true;               
            }else{
                scope.errors.confirmpasswordError = false;
            }
            scope.$apply();
        });
    };
});
