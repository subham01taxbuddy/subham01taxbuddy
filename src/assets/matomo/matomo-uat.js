function matomo(path) {
    (function () {
      const u = "https://finbingo.matomo.cloud/";
  
      // Remove the script added before
      const d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
      const sSrc = s.getAttribute('src');
      if (sSrc === u + "matomo.js") {
        s.remove();
      }
  
      // Set variables
      const _paq = window._paq = window._paq || [];
      let userInfo = JSON.parse(localStorage.getItem("UMD"));
      _paq.push(["disableCookies"]);
      if(!!userInfo){
        _paq.push(['setUserId', userInfo.USER_UNIQUE_ID]);
      }
      _paq.push(["setCustomUrl", path]);
      _paq.push(["trackPageView"]);
      _paq.push(['enableLinkTracking']);
  
      (function () {
        _paq.push(["setTrackerUrl", u + "matomo.php"]);

        _paq.push(["setSiteId", "2"]);
        const d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
        g.type = "text/javascript";
        g.async = true;
        g.src = u + "matomo.js";
        s.parentNode.insertBefore(g, s);
      })();
    })();
  }