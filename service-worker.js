
const CACHE="photography-camera-v12-1";
const ASSETS=[
"./","./index.html",
"./css/v7.css","./css/v8.css","./css/v9.css","./css/v10.css","./css/v11.css","./css/v12.css",
"./js/v7.js","./js/v8.js","./js/v9.js","./js/v10.js","./js/v11.js","./js/v12.js",
"./assets/scenes/mountain-lake.svg","./assets/scenes/portrait-studio.svg",
"./assets/scenes/waterfall.svg","./assets/scenes/cyclist.svg",
"./assets/scenes/night-city.svg","./assets/scenes/wildlife.svg"
];
self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("./index.html")))
  );
});
