
function matomo(docTitle, path, event, scriptId) {
    (function () {
      const u = "https://matomo.taxbuddy.com/";
  
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
        let commonUserId = userInfo.USER_UNIQUE_ID+'-'+userInfo.USER_F_NAME+' '+userInfo.USER_L_NAME;
        _paq.push(['setUserId', commonUserId]);
      }
      else{
        _paq.push(['resetUserId']);
      }

      if(event){
        if(event.length > 0){
          _paq.push(event);
        }
      }
      _paq.push(["setDocumentTitle", docTitle]);
      _paq.push(["setCustomUrl", path]);
      _paq.push(["trackPageView"]);
      _paq.push(['enableLinkTracking']);

      (function () {
        _paq.push(["setTrackerUrl", u + "matomo.php"]);

        _paq.push(["setSiteId", scriptId]);
        const d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
        g.type = "text/javascript";
        // g.src='//cdn.matomo.cloud/taxbuddy.matomo.cloud/matomo.js';
        s.parentNode.insertBefore(g, s);
      })();
    })();
  }