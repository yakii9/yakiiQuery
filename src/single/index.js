(function () {
  var state = {
    loadingTimer: 0,
    page_size: 12,
    current_page: 1,
    itemsSum: 0,
    isRequesting: false,
    isDeeplinkValid: true,
    errors: "",
    isTestVersion: false
  }
  var tools = {
    map: function (obj, callback) {
      if (!obj || !(typeof obj === 'object')) return [];
      var values = [];
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          values.push(obj[prop]);
        }
      }
      values = values.map(callback);
      return values;
    },
    isWeixinBrowserOnAndroid: function () {
      return /micromessenger/.test(navigator.userAgent.toLowerCase()) &&
        navigator.userAgent.indexOf('Android') > -1;
    },
    handlePostRequest: function (url, params, callback) {
      try {
        state.isRequesting = true
        params = params || {};
        state.isRequesting = true;
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            state.isRequesting = false;
            if (httpRequest.status < 500 && httpRequest.status > 199) {
              callback(httpRequest.response, httpRequest.status);
            } else {
              tools.onError();
            }
          }
        },
        httpRequest.onerror = tools.onError;
        httpRequest.open('POST', url);
        httpRequest.setRequestHeader("Content-Type", "application/json");
        httpRequest.send(JSON.stringify(params));
        return httpRequest;
      } catch (e) {
        state.isRequesting = false;
        console.log(e);
        tools.onError(e);
      }
    },
    getQrCodeFromLink: function (link) {
      if (!link) return "";
      var idx = -1;
      (idx = link.indexOf("?")) > -1 && (link = link.slice(0, idx));
      return link.split("/").pop();
    },
    hiddenElementById: function (id) {
      tools.setCssById(id, "hidden", "visibility");
      tools.setCssById(id, "none", "display");
    },
    showElementById: function (id, display) {
      display = display || "block";
      tools.setCssById(id, "visible", "visibility");
      tools.setCssById(id, display, "display");
    },
    isScrollToBottom: function () {
      var documentHeight = 1,
        scrollTop = 0,
        windowHeight = 0;
      if (document.body && document.documentElement) {
        documentHeight = document.body.scrollHeight;
        scrollTop = document.body.scrollTop > document.documentElement.scrollTop ?
          document.body.scrollTop : document.documentElement.scrollTop;
        windowHeight = document.documentElement.clientHeight;
      }
      return (scrollTop + windowHeight >= documentHeight);
    },
    getLink: function (link, queryList) {
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
        var root = tools.buildElementsTree(entity[0]);
        for (i = 1; i < entity.length; i++) {
          root.appendChild(tools.buildElementsTree(entity[i]));
        }
        return root;
      } else {
        var element = document.createElement(entity.targetName);
        var properties = Object.getOwnPropertyNames(entity);
        for (i = 0; i < properties.length; i++) {
          element[properties[i]] = entity[properties[i]];
        }
        return element;
      }
    },
    insertElementsArray: function (list, targetNodeId) {
      if (!list || !targetNodeId) return
      var root = tools.buildElementsTree(list);
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
    addListernerById: function (id, type, callback, isBubble) {
      var elem = document.getElementById(id);
      isBubble = isBubble || false;
      if (!elem || !type || elem["on" + type] === callback) return;
      elem.addEventListener(type, callback, isBubble);
    },
    onError: function () {},
    handleGetRequest: function (url, callback) {
      try {
        state.isRequesting = true;
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            state.isRequesting = false;
            if (httpRequest.status < 499 && httpRequest.status > 199) {
              callback(httpRequest.response, httpRequest.status);
            } else {
              tools.onError();
            }
          }
        },
        httpRequest.onerror = tools.onError,
        httpRequest.open('GET', url);
        httpRequest.send();
        return httpRequest;
      } catch (e) {
        state.isRequesting = false;
        console.log(e);
        tools.onError(e);
      }
    },
    onLoading: function () {},
    onLoaded: function () {},
    completedLoading: function () {
      tools.onLoaded();
      clearTimeout(state.loadingTimer);
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
}())
