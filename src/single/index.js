(function () {
  // 存储一些基础信息
  var id = localStorage.getItem("userId");
  var token = localStorage.getItem("token");
  var APIs = {

  };

  // 处理网络请求和取出本地记录、消除loading状态等等的基础函数
  var infrastructure = {
    handleGetRequest: function(url, callback, authToken) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          callback(httpRequest.response);
        }
      }
      httpRequest.open('GET', url);
      httpRequest.setRequestHeader("auth-token", authToken);
      httpRequest.send();

      return httpRequest
    },
    removeLoading: function() {
      var loading = document.getElementById('loading');
      if (!loading) return false;
      loading.style.opacity = 1;
      var opaqueTimer = setInterval(function () {
        loading.style.opacity = loading.style.opacity - 0.025;
      }, 50);

      setTimeout(function () {
        clearInterval(opaqueTimer);
      }, 2000);
    },
    accumulator: function(initValue, stepValue) {
      stepValue = stepValue || 1;
      initValue = initValue || 0;

      var value = initValue;

      return {
        add: function() {
          value = value + stepValue;
        },
        isSuccess: function(bigEnough) {
          return Boolean(value >= bigEnough);
        }
      }
    },
    getQueryStringByName: function (name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    setContentById: function(id, content, type) {
      type = type || "innerHTML";
      var elem = document.getElementById(id);
      if (!elem) return
      elem[type] = content;
    },
    setCssById: function(id, rule, type) {
      var elem = document.getElementById(id);
      if (!elem) return
      elem.style[type] = rule;
    }
  }

  // 业务逻辑相关的代码
  var business = {
    addContent: function() {

    }
  }

  var finishLoadingEvent = new Event('finishLoading');

  business.addContent()
}())
