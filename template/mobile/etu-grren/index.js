(function() {
  // 处理网络请求和取出本地记录、消除loading状态等等的基础函数
  var constant = {
    loadingTimer: 0,
    page_size: 12,
    current_page: 1,
    itemsSum: 0,
    isRequesting: false
  }

  var BASEURL = window.ETUBASEURL || "http://api.test.etuschool.org";
  var APIS = {
    getArticles: BASEURL + "/discovery/api/v1/articles/"
  }

  var infrastructure = {
    hiddenElementById: function(id) {
      infrastructure.setCssById(id, "hidden", "visibility");
      infrastructure.setCssById(id, "none", "display");
    },
    showElementById: function(id, display) {
      display = display || "block";
      infrastructure.setCssById(id, "visible", "visibility");
      infrastructure.setCssById(id, display, "display");
    },
    isScrollToBottom: function() {
      var documentHeight = 1,
      scrollTop = 0,
      windowHeight = 0;
      if (document.body && document.documentElement) {
        documentHeight = document.body.scrollHeight;
        scrollTop = document.body.scrollTop > document.documentElement.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
        windowHeight = document.documentElement.clientHeight;
      }

      return (scrollTop + windowHeight >= documentHeight);
    },
    getLink: function(queryList, link) {
      if (!queryList || !Array.isArray(queryList) || queryList.length === 0) return link;

      return link + "?" + queryList.map(function(v) {
        return v.key + "=" + v.value;
      }).join("&")
    },
    buildElementsTree: function(entity) {
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
        var element = document.createElement(entity.targetName);
        var properties = Object.getOwnPropertyNames(entity);
        for (i = 0; i < properties.length; i++) {
          element[properties[i]] = entity[properties[i]];
        }
        return element;
      }
    },
    insertElementsArray: function(list, targetNodeId) {
      if (!list || !targetNodeId) return

      var root = infrastructure.buildElementsTree(list);
      return document.getElementById(targetNodeId).appendChild(root);
    },
    setContentById: function(id, content, type) {
      type = type || "innerHTML";
      var elem = document.getElementById(id);
      if (!elem) return;
      elem[type] = content;
    },
    setCssById: function(id, rule, type) {
      var elem = document.getElementById(id);
      if (!elem) return;
      elem.style[type] = rule;
    },
    addListernerById: function(id, type, callback, isBubble) {
      var elem = document.getElementById(id);
      isBubble = isBubble || false;
      if (!elem || !type) return;
      elem.addEventListener(type, callback, isBubble);
    },
    onError: function() {},
    handleGetRequest: function(url, callback) {
      constant.isRequesting = true;
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          constant.isRequesting = false;
          if (httpRequest.status < 399 && httpRequest.status > 199) {
            callback(httpRequest.response);
          } else {
            infrastructure.onError();
          }
        }
      },
      httpRequest.onerror = function() {
        infrastructure.onError();
      },
      httpRequest.open('GET', url);
      httpRequest.send();

      return httpRequest;
    },
    showProgress: function() {},
    hideProgress: function() {},
    removeLoading: function() {
      infrastructure.hideProgress();
      clearTimeout(constant.loadingTimer);
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
    getQueryStringByName: function(name, url) {
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

  // 业务逻辑相关的代码
  var business = {
    addContent: function() {
      // please realize some necssary interface
      infrastructure.onError = function() {
        infrastructure.setContentById("loadingH2", "貌似出了点小问题...");
        infrastructure.setContentById("loadingH1", "请刷新重试");
        infrastructure.addListernerById('loading', 'click', function() {
          window.location.reload(true);
        })
        infrastructure.showElementById("loading", "flex");
        infrastructure.hiddenElementById("progress_bar");
      };

      infrastructure.showProgress = function() {
        var progress_range = 0;

        var bar = document.getElementById("progress_bar");
        if (!bar) return;

        var timer = setInterval(function() {
          progress_range += 1;
          infrastructure.setCssById("progress_current", progress_range, "flex");
          infrastructure.setCssById("progress_left", 100 - progress_range, "flex");
        },
        100)

        setTimeout(function() {
          clearInterval(timer);
        },
        10000);

        constant.loadingTimer = setTimeout(function() {
          infrastructure.onError();
        },
        10000);
      };

      infrastructure.hideProgress = function() {
        infrastructure.showElementById("content");
        infrastructure.hiddenElementById("progress_bar");
        clearTimeout(constant.loadingTimer);
      };

      // 此处为业务代码

    }
  };

  var finishLoadingEvent = new Event('finishLoading');
  document.body.addEventListener('finishLoading', infrastructure.removeLoading, false);

  business.addContent();
  infrastructure.showProgress();
} ());
