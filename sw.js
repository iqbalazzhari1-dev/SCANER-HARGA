const V='stokrak-v7';
const LOCAL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
const CDN=['https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await Promise.all(LOCAL.map(async u=>{try{const r=await fetch(new Request(u,{cache:'reload'}));if(r.ok)await c.put(u,r)}catch(_){}}));
    await Promise.all(CDN.map(async u=>{try{const r=await fetch(new Request(u,{mode:'no-cors'}));await c.put(u,r)}catch(_){}}));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==V).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const same=new URL(req.url).origin===location.origin;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    if(!same){
      const hit=await c.match(req);if(hit)return hit;
      const r=await fetch(req);
      if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());
      return r;
    }
    try{
      const r=await Promise.race([fetch(req.url,{cache:'no-cache'}),new Promise((_,no)=>setTimeout(no,3000))]);
      if(r&&r.ok){c.put(req,r.clone());return r}
      throw new Error('bad');
    }catch(_){
      const hit=(await c.match(req,{ignoreSearch:true}))||(req.mode==='navigate'?await c.match('index.html'):null);
      if(hit)return hit;
      return fetch(req);
    }
  })());
});
