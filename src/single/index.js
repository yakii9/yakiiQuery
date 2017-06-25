(function () {
  // 处理网络请求和取出本地记录、消除loading状态等等的基础函数
  var loadingTimer = 0;
  var infrastructure = {
    getLink: function (queryList, link) {
      if (!queryList || !Array.isArray(queryList) || queryList.length === 0)
        return link;
      return link + "?" + queryList.map(function (v) {
        return v.key + "=" + v.value;
      }).join("&")
    },
    buildElementsTree: function (entity) {
      if (!entity) return null;
      var i;
      if (Array.isArray(entity)) {
        // 我们约定，数组的第一个元素存储根节点的信息
        var root = infrastructure.buildElementsTree(entity[0]);
        for (i = 1; i < entity.length; i++) {
          root.appendChild(infrastructure.buildElementsTree(entity[i]));
        }
        return root;
      } else {
        var element = document.createElement(entity.nodeName);
        var properties = Object.getOwnPropertyNames(entity);
        for (i = 0; i < properties.length; i++) {
          element[properties[i]] = entity[properties[i]];
        }
        return element;
      }
    },
    insertElementsArray: function (list, targetNodeId) {
      if (!list || !targetNodeId) return
      var root = infrastructure.buildElementsTree(list);
      return document.getElementById(targetNodeId).appendChild(root);
    },
    setContentById: function (id, content, type) {
      type = type || "innerHTML";
      var elem = document.getElementById(id);
      if (!elem) return;
      elem[type] = content;
    },
    setCssById: function (id, rule, type) {
      var elem = document.getElementById(id);
      if (!elem) return;
      elem.style[type] = rule;
    },
    addListernerById: function (id, type, callback) {
      var elem = document.getElementById(id);
      if (!elem || !type) return;
      elem.addEventListener(type, callback, false);
    },
    onError: function () {},
    handleGetRequest: function (url, callback, authToken) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status < 399 && httpRequest.status > 199) {
            callback(httpRequest.response);
          } else {
            infrastructure.onError();
          }
        }
      },
      httpRequest.onerror = function () {
        infrastructure.onError();
      },
      httpRequest.open('GET', url);
      httpRequest.setRequestHeader("auth-token", authToken);
      httpRequest.send();
      return httpRequest;
    },
    showProgress: function () {},
    hideProgress: function () {},
    removeLoading: function () {
      hideProgress();
      clearTimeout(loadingTimer);
    },
    accumulator: function (initValue, stepValue) {
      stepValue = stepValue || 1;
      initValue = initValue || 0;
      var value = initValue;
      return {
        add: function () {
          value = value + stepValue;
        },
        isSuccess: function (bigEnough) {
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
    }
  };
  // 存储一些基础信息
  var id = localStorage.getItem("userId");
  var token = localStorage.getItem("token");
  var APIs = {};
  // 业务逻辑相关的代码
  var business = {
    addContent: function () {
      // please realize some necssary interface
      infrastructure.onError = function () {};
      infrastructure.showProgress = function () {};
      infrastructure.hideProgress = function () {};
    }
  };
  var finishLoadingEvent = new Event('finishLoading');
  infrastructure.showProgress();
  business.addContent();
}());
