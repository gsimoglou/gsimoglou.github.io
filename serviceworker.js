var staticCacheName = "pwa";
 
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
          "/",
          "/customizer.html",
          "/media/logo.png",
          "/media/logo-alt.png",
          "/media/logo-2x.png",
          "/media/og-image.png",
          "/media/standing-table-bg.jpg",
          "/media/app-stores/App_Store_Badge.svg",
          "/media/app-stores/Google_Play_Store_badge_EN.svg",
          "/media/app-stores/Huawei_AppGallery_white_badge_EN.png",
          "/media/favicon/browserconfig.xml",
          "/media/favicon/favicon.ico",
          "/media/favicon/favicon-16.png",
          "/media/favicon/favicon-32.png",
          "/media/favicon/favicon-57.png",
          "/media/favicon/favicon-60.png",
          "/media/favicon/favicon-64.png",
          "/media/favicon/favicon-70.png",
          "/media/favicon/favicon-72.png",
          "/media/favicon/favicon-76.png",
          "/media/favicon/favicon-96.png",
          "/media/favicon/favicon-114.png",
          "/media/favicon/favicon-120.png",
          "/media/favicon/favicon-144.png",
          "/media/favicon/favicon-150.png",
          "/media/favicon/favicon-152.png",
          "/media/favicon/favicon-160.png",
          "/media/favicon/favicon-180.png",
          "/media/favicon/favicon-192.png",
          "/media/favicon/favicon-310.png",
          "/media/favicon/favicon-512.png",
          "/js/customizer.js?ver=1.0",
          "/css/customizer-table.css?ver=1.0",
          "/css/customizer-table-editor.css?ver=1.0",
          "/css/style.css?ver=1.0"
        ]);
    })
  );
});
 
self.addEventListener("fetch", function (event) {
  console.log(event.request.url);
 
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
