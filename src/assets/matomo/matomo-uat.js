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
      _paq.push(["disableCookies"]);
      _paq.push(["setCustomUrl", path]);
      _paq.push(["trackPageView"]);
  
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