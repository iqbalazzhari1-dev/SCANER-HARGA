const V='stokrak-v5';
const LOCAL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
const CDN=['https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(LOCAL.map(u=>c.add(u).catch(()=>{})));
    await Promise.all(CDN.map(async u=>{try{const r=await fetch(new Request(u,{mode:'no-cors'}));await c.put(u,r)}catch(_){}}));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==V).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const hit=await c.match(e.request,{ignoreSearch:true});
    if(hit)return hit;
    try{const r=await fetch(e.request);if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}
    catch(_){if(e.request.mode==='navigate')return c.match('index.html');throw _}
  })());
});
