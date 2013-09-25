function reqCommon(){
    this.baseUrl = 'http://10.16.86.152:3000';
}

reqCommon.prototype.create = function($http, path, method, body, sessionID, callback){
    var config = {
        url: this.baseUrl + path,
        method: method,
        headers:  {
            'Molt-SessionID': sessionID
        },
        data: body
    };

    $http(config).then(function(result){
        callback(result.data);
    });
};

reqCommon.prototype.checkLogin = function(data, $location) {
    if (data.state != 'isLogin' || !data.loginStatus) {
        $location.path('login');
        $location.replace();
    } else {
        console.log('LoginState: ' + data.state);
    }
};

reqCommon.prototype.transformDateFormat = function(date) {
    var m = (date.getMonth() + 1).toString(),
        d = date.getDate().toString();

    date = date.getFullYear() + '-' + (m[1] ? m : '0' + m) + '-' + (d[1] ? d : '0' + d);
    return date;
}

reqCommon.prototype.CookieUtil = {
    get: function(name){
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null;
        if(cookieValue > -1){
            var cookieEnd = document.cookie.indexOf(";", cookieStart);
            if(cookieEnd == -1){
                cookieEnd = document.cookie.length;             
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart +
                        cookieName.length, cookieEnd));
        }
        return cookieValue;
    },
    set: function(name, value, expires, path, domain, secure){
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        
        (expires instanceof Date) && (cookieText += "; expires=" + expires.toGMTString());
        path && (cookieText += "; path=" + path);
        domain && (cookieText += "; domain=" + domain);
        secure && (cookieText += "; secure");

        document.cookie = cookieText;
    },
    unset: function(name, path, domain, secure){
        this.set(name, "", new Date(0), path, domain, secure);
    }
};

app.service('reqCommonSrv', reqCommon);