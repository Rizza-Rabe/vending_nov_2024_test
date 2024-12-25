'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "a0f09b843ae153d91721b0836f7a0b7d",
"assets/AssetManifest.bin.json": "496263dcb0a3912a645d8c4ffaf5a019",
"assets/AssetManifest.json": "1a1068636a963fab123131f135e72e0f",
"assets/assets/add_icon.png": "c0dd0b6ce82773b6e8838288bb0e6168",
"assets/assets/ad_icon.png": "41c1f8ce1e3fd615c06abce3c6c2f194",
"assets/assets/cart_icon.png": "2a9cd26232d12b8a85f0bb30ecd3152d",
"assets/assets/cloud_icon.png": "3c564e06c1bfea582ee8eb0cd20fa450",
"assets/assets/crown_icon.png": "1d573bd63689e2db5ca90c7072a205bc",
"assets/assets/drop_icon.png": "301598fd29a053cfbcbbdd446436fad6",
"assets/assets/duration_icon.png": "e00f856de452302863c70134fade9574",
"assets/assets/email_icon.png": "025a33addbe6efac5731132a1723f031",
"assets/assets/empty_box_icon.png": "a9d988cd6785918680f105ce032970be",
"assets/assets/fonts/Andika_Regular.ttf": "003ca0be89cb3dec1ba76f380e045df6",
"assets/assets/google.png": "84c7007eb6ac4374f77394d1e4954a96",
"assets/assets/helmet_icon.png": "3cc17f40dd40c42a206610a3f1f23e8f",
"assets/assets/help_icon.png": "8df565bbd87e5d03fa2a5df1db047463",
"assets/assets/id_icon.png": "742ea1360ab32892225f1138549b2232",
"assets/assets/map_icon.png": "97f79f018dbe10b6b709e7b1199f29e7",
"assets/assets/money_icon.png": "2f5b14e5685a6457b8bb94bfd831a52a",
"assets/assets/my_vendo_rounded_image.png": "76e8bc6cf7734c745f359247f2979223",
"assets/assets/pencil_icon.png": "95ee98debeb6308aca5fe41897a27167",
"assets/assets/people_icon.png": "665c6998d44b5ba01641a5ffc8891dfc",
"assets/assets/peso_icon.png": "5e87c65ea9e6cbacbdef4d23fcd62c69",
"assets/assets/rate_icon.png": "05576c6f1217198dbb17210f6d5096c3",
"assets/assets/terms_icon.png": "df125908c8d1cb426744799a0acced01",
"assets/assets/transaction_icon.png": "9cbcd5cc8778aa1da73c0b4794e32b9b",
"assets/assets/trash_icon.png": "e5a81464ea808b2f85188b8210042a79",
"assets/assets/user_icon.png": "ee2b8cfc02750dbf1a193dc1d0e2f28f",
"assets/assets/vending_machine.png": "213304fc9e306f6a9f4a3075d985fdb4",
"assets/assets/web_icon.png": "b44353dfdc9389b69e3fa5c0690c646a",
"assets/FontManifest.json": "40df3b39113db2c3329fc0538122b185",
"assets/fonts/MaterialIcons-Regular.otf": "a480b45a288a7eb44e68b40782b856b2",
"assets/NOTICES": "3734a5485b24b3cb662cac59518bbb31",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "e986ebe42ef785b27164c36a9abc7818",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/packages/fluttertoast/assets/toastify.js": "56e2c9cedd97f10e7e5f1cebd85d53e3",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"main.dart.js": "2dea960ac34024ae4c7f652959959e24",
"manifest.json": "412738dc2e4b3e142b433626060ff4f2",
"version.json": "b0ae650b953660b2f10e14c0b075a22d"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
