/* ============================================================
   THATWAY · CAB — ROUTING-ENGINE (öffentliche Version)
   Gebäude-Daten:      map.js   (WAYPOINTS, EDGES, ROOMS, KEEP)
   Gebackene Routen:   saved.js (Linien / Blick / Schritte)
   Weg-Anweisungen:    directions.js  ("Turn left" etc. je Raum)
   Texte/Farben:       style.css
   Bilder:             panos/
   (Der Editor ist NICHT in dieser Version enthalten.)
   ============================================================ */
const $=s=>document.querySelector(s);

/* ---------- Graph aufbauen ---------- */
const ADJ={}, EDGE_BY_ID={};
EDGES.forEach(e=>{ e.id=e.from+'>'+e.to; EDGE_BY_ID[e.id]=e; (ADJ[e.from]=ADJ[e.from]||[]).push({to:e.to,edge:e}); });

function buildRoute(fromId,toId){
  if(!WAYPOINTS[fromId]||!WAYPOINTS[toId]) return null;
  if(fromId===toId) return [fromId];
  const prev={}, seen={}; seen[fromId]=1; const q=[fromId];
  while(q.length){ const cur=q.shift();
    for(const {to} of (ADJ[cur]||[])){ if(seen[to])continue; seen[to]=1; prev[to]=cur;
      if(to===toId){ const path=[to]; let c=to; while(c!==fromId){ c=prev[c]; path.unshift(c);} return path; }
      q.push(to); } }
  return null;
}

/* Route (Wegpunkte) -> Schritte für den Viewer */
function routeToSteps(path,room){
  const steps=[];
  for(let k=0;k<path.length-1;k++){
    const e=EDGE_BY_ID[path[k]+'>'+path[k+1]]; const wp=WAYPOINTS[path[k]];
    steps.push({ key:e.id, img:wp.img, floor:e.floor||wp.floor, big:e.big, sub:e.sub, wp:path[k],
                 view:e.view, tilt:e.tilt, elevSym:!!e.elevator });
  }
  const zwp=WAYPOINTS[path[path.length-1]];
  steps.push({ key:'arr:'+(room?room.id:path[path.length-1]), img:zwp.img, floor:zwp.floor, wp:path[path.length-1],
               big:room?room.name:'You have arrived', sub:room&&room.sub?room.sub:'', view:zwp.view, arrive:true });
  return steps;
}

/* ---------- Linien / Blick (aus saved.js) ---------- */
const _SAVED=(typeof SAVED!=='undefined')?SAVED:{};
const EPATHS={}, EVIEW={};
if(_SAVED.views){ for(const k in _SAVED.views) EVIEW[k]=_SAVED.views[k]; }
function seedEdge(id){ const e=EDGE_BY_ID[id]; EPATHS[id]=(e&&Array.isArray(e.line))?e.line.map(p=>p.slice()):[]; }
function seedPaths(){ EDGES.forEach(e=>seedEdge(e.id));
  if(_SAVED.lines){ for(const k in _SAVED.lines) if(Array.isArray(_SAVED.lines[k])) EPATHS[k]=_SAVED.lines[k].map(p=>p.slice()); } }
seedPaths();

/* ---------- Pro-Raum Routen (aus saved.js) ---------- */
const OVR={};
if(_SAVED.routes){ for(const k in _SAVED.routes) OVR[k]=JSON.parse(JSON.stringify(_SAVED.routes[k])); }
function nodeFromOvrStep(s){ const wp=WAYPOINTS[s.wp]||{}; return { key:s.key, img:wp.img, floor:wp.floor, wp:s.wp,
  big:s.big||'Der Linie folgen', sub:s.sub||'', arrive:!!s.arrive, elevSym:!!s.elevSym }; }

/* ---------- Weg-Anweisungen (directions.js) überschreiben den Text je Schritt ---------- */
const DIR=(typeof DIRECTIONS!=='undefined')?DIRECTIONS:{};
const _DEFBIG=['','follow the line','der linie folgen'];
function applyDirections(room,nodes){ const d=room&&DIR[room.id]; if(!d) return nodes;
  nodes.forEach((n,idx)=>{ if(n.arrive) return;
    if(_DEFBIG.indexOf((n.big||'').trim().toLowerCase())<0) return; /* vom Editor gesetzter Text gewinnt */
    if(typeof d[idx]==='string' && d[idx].trim()) n.big=d[idx]; }); return nodes; }

function stepsFor(room,path){ const ov=OVR[room.id]; let nodes;
  if(ov&&ov.steps&&ov.steps.length) nodes=ov.steps.map(nodeFromOvrStep);
  else nodes=routeToSteps(path,room);
  return applyDirections(room,nodes); }

/* ---------- Route state ---------- */
let NODES=[], i=0, currentRoom=null, currentPath=null;
function rebuildRoute(keepIdx){ if(!currentRoom)return; NODES=stepsFor(currentRoom,currentPath);
  if(keepIdx===undefined)keepIdx=i; i=Math.max(0,Math.min(keepIdx,NODES.length-1)); setNode(); }

/* ---------- Editor-Hooks (in der öffentlichen Version alles No-Op) ---------- */
const HOOK={ down:()=>false, move:()=>false, up:()=>{}, setNode:()=>{}, frame:()=>{}, afterPath:()=>{} };
window.HOOK=HOOK;

/* ---------- 3D-Viewer ---------- */
let lon=0, lat=4, dragging=false, px=0, py=0;
const stage=$('#stage');
const renderer=new THREE.WebGLRenderer({canvas:$('#glc'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();
const FOV=74;
const camera=new THREE.PerspectiveCamera(FOV,1,0.1,9000);
const geo=new THREE.SphereGeometry(500,64,40); geo.scale(-1,1,1);
const sphMat=new THREE.MeshBasicMaterial();
scene.add(new THREE.Mesh(geo,sphMat));
const cap=new THREE.Mesh(new THREE.CircleGeometry(140,48),new THREE.MeshBasicMaterial({color:0x2a0a0a}));
cap.rotation.x=-Math.PI/2; cap.position.y=-455; scene.add(cap);

const EYE=451;
const pathGroup=new THREE.Group(); scene.add(pathGroup);
const pcv=document.createElement('canvas'); pcv.width=64; pcv.height=128;
(function(){const x=pcv.getContext('2d'); x.clearRect(0,0,64,128);
  x.strokeStyle='rgba(225,242,255,0.95)'; x.lineWidth=14; x.lineCap='round'; x.lineJoin='round';
  for(let cy=20; cy<128; cy+=54){ x.beginPath(); x.moveTo(12,cy+24); x.lineTo(32,cy); x.lineTo(52,cy+24); x.stroke(); }
})();
const pathTex=new THREE.CanvasTexture(pcv); pathTex.wrapS=THREE.RepeatWrapping; pathTex.wrapT=THREE.RepeatWrapping;
function clearPath(){ while(pathGroup.children.length){const c=pathGroup.children.pop(); c.geometry.dispose(); c.material.dispose();} }
function ribbonGeo(sm, halfW, tiles){ const N=sm.length-1; const pos=[],uv=[],idx=[];
 for(let k=0;k<=N;k++){ const p=sm[k]; const a=sm[Math.min(k+1,N)], b=sm[Math.max(k-1,0)];
   const tx=a.x-b.x, tz=a.z-b.z; const tl=Math.hypot(tx,tz)||1; const sx=-tz/tl*halfW, sz=tx/tl*halfW;
   pos.push(p.x+sx,p.y,p.z+sz, p.x-sx,p.y,p.z-sz); const v=k/N*tiles; uv.push(0,v, 1,v);
   if(k<N){const o=k*2; idx.push(o,o+1,o+2, o+1,o+3,o+2);} }
 const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); return g; }

function targetYaw(n){ const p=EPATHS[n.key]; if(p&&p.length){ const q=p[p.length-1]; return THREE.MathUtils.radToDeg(Math.atan2(q[1],q[0])); } return n.view||0; }

function buildPathFor(n){ clearPath(); const pts3=(EPATHS[n.key]||[]).map(([x,z])=>new THREE.Vector3(x,-EYE,z)); if(pts3.length<2){ HOOK.afterPath(); return; }
 const curve=new THREE.CatmullRomCurve3(pts3,false,'catmullrom',0.5); const sm=curve.getPoints(150);
 const glow=new THREE.Mesh(ribbonGeo(sm,48,1),new THREE.MeshBasicMaterial({color:0x1766ff,transparent:true,opacity:0.26,depthTest:false,depthWrite:false,side:THREE.DoubleSide})); glow.renderOrder=4; pathGroup.add(glow);
 const core=new THREE.Mesh(ribbonGeo(sm,27,1),new THREE.MeshBasicMaterial({color:0x2f86ff,transparent:true,opacity:0.96,depthTest:false,depthWrite:false,side:THREE.DoubleSide})); core.renderOrder=5; pathGroup.add(core);
 const ch=new THREE.Mesh(ribbonGeo(sm,23,10),new THREE.MeshBasicMaterial({map:pathTex,transparent:true,opacity:0.92,depthTest:false,depthWrite:false,side:THREE.DoubleSide})); ch.renderOrder=6; pathGroup.add(ch);
 HOOK.afterPath();
}

/* ---- Text ins Englische (Standard-Anzeige) ---- */
function tBig(s){ if(!s) return s;
  if(s==='Der Linie folgen') return 'Follow the line';
  let m=s.match(/^Aufzug in den (\d)\.\s*Stock$/); if(m) return 'Take the elevator to Floor '+m[1];
  m=s.match(/^Aufzug .*Stock\s*(\d)/); if(m) return 'Take the elevator to Floor '+m[1];
  return s; }

const loader=new THREE.TextureLoader();
function setNode(){
 const n=NODES[i]; if(!n) return;
 const ld=$('#load'); const lt=$('#loadTxt');
 if(!n.img){ if(lt)lt.textContent='Photo not available'; ld.hidden=false; }
 else { if(lt)lt.textContent='Loading 360° view…'; ld.hidden=false;
   const myImg=n.img;
   loader.load(myImg,
     tex=>{ if(NODES[i]&&NODES[i].img!==myImg) return; if('colorSpace' in tex){tex.colorSpace=THREE.SRGBColorSpace;} if(sphMat.map)sphMat.map.dispose(); sphMat.map=tex; sphMat.needsUpdate=true; setTimeout(()=>{ld.hidden=true;},120); },
     undefined,
     ()=>{ console.warn('360° photo failed to load:', myImg); if(lt)lt.textContent='Could not load this photo'; setTimeout(()=>{ld.hidden=true;},1500); }
   ); }
 const sv=EVIEW[n.key]; lon=(sv?sv.lon:(n.view!==undefined?n.view:targetYaw(n))); lat=(sv?sv.lat:(n.tilt!==undefined?n.tilt:-3));
 buildPathFor(n);
 $('#floorPill').textContent=n.floor; $('#bigTxt').textContent=tBig(n.big); $('#subTxt').textContent=n.sub||'';
 $('#nextBtn').textContent=n.arrive?'Arrived ✓':'Next ›'; $('#nextBtn').className='btn'+(n.arrive?' arrive':'');
 $('#backBtn').disabled=(i===0);
 $('#dots').innerHTML=NODES.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('');
 HOOK.setNode();
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function shortest(a){a=(a+540)%360-180;return a;}
function animate(){
 requestAnimationFrame(animate);
 if($('#navScreen').hidden) return;
 lat=Math.max(-80,Math.min(80,lat));
 const phi=THREE.MathUtils.degToRad(90-lat), th=THREE.MathUtils.degToRad(lon);
 camera.lookAt(Math.sin(phi)*Math.cos(th),Math.cos(phi),Math.sin(phi)*Math.sin(th));
 renderer.render(scene,camera);
 const n=NODES[i]; if(!n) return;
 const d=THREE.MathUtils.degToRad(shortest(targetYaw(n)-lon));
 const hHalf=Math.atan(Math.tan(THREE.MathUtils.degToRad(FOV/2))*camera.aspect);
 pathTex.offset.y=(pathTex.offset.y-0.012+1)%1;
 HOOK.frame();
 const w=stage.clientWidth,h=stage.clientHeight;
 const fb=$('#floorB'); fb.style.opacity=n.elevSym?1:0; fb.style.pointerEvents=n.elevSym?'auto':'none'; fb.style.cursor='pointer'; if(n.elevSym){ fb.style.left=(w/2)+'px'; fb.style.top=(h*0.42)+'px'; var _ef=(n.big||'').match(/Floor\s*(\d+)/); fb.querySelector('b').textContent=_ef?('Floor '+_ef[1]):(n.floor||''); }
 const pn=$('#pinA'); pn.style.opacity=n.arrive?1:0; if(n.arrive){ pn.style.left=(w/2)+'px'; pn.style.top=(h*0.62)+'px'; }
 const L=$('#edgeL'),R=$('#edgeR'); const inView=Math.abs(d)<hHalf*1.1;
 if(n.elevSym||n.arrive||inView){ L.classList.remove('on'); R.classList.remove('on'); }
 else { if(d>0){R.classList.add('on');L.classList.remove('on');} else {L.classList.add('on');R.classList.remove('on');} }
}
function down(e){ if(HOOK.down(e)) return;
 dragging=true;const p=e.touches?e.touches[0]:e;px=p.clientX;py=p.clientY;$('#look').style.opacity=0;}
function move(e){ if(HOOK.move(e)) return;
 if(!dragging)return;const p=e.touches?e.touches[0]:e;lon-=(p.clientX-px)*0.17;lat+=(p.clientY-py)*0.17;px=p.clientX;py=p.clientY;}
function up(e){ HOOK.up(e); dragging=false;}
stage.addEventListener('mousedown',down);window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
stage.addEventListener('touchstart',down,{passive:true});stage.addEventListener('touchmove',move,{passive:false});stage.addEventListener('touchend',up);

/* ---------- Navigation ---------- */
let started=false;
function startNav(){ $('#searchScreen').hidden=true; $('#navScreen').hidden=false; $('#done').classList.remove('show'); resize(); i=0; setNode(); if(!started){started=true; animate();} }
function backToSearch(){ $('#done').classList.remove('show'); $('#navScreen').hidden=true; $('#searchScreen').hidden=false; }
function showArrived(){ $('#doneName').textContent=arrivalName; $('#doneSub').textContent=arrivalSub||''; $('#done').classList.add('show'); }
function goNext(){ const n=NODES[i]; if(!n)return; if(n.arrive){ showArrived(); return;} if(i<NODES.length-1){i++;setNode();} }
$('#nextBtn').onclick=goNext;
$('#floorB').addEventListener('click',()=>{ const n=NODES[i]; if(n&&n.elevSym) goNext(); });
$('#backBtn').onclick=()=>{if(i>0){i--;setNode();}else{backToSearch();}};
$('#toSearch').onclick=backToSearch;
$('#again').onclick=()=>{$('#done').classList.remove('show');i=0;setNode();};

/* ---------- Ziel wählen ---------- */
function getStart(){ const p=new URLSearchParams(location.search).get('from'); return (p&&WAYPOINTS[p])?p:DEFAULT_START; }
let arrivalName='', arrivalSub='';
function chooseRoom(room){
  const from=getStart(); const to=room.wp||room.id; const label=room.label||room.name||disp(room.id);
  if(!WAYPOINTS[to]){ alert('The route to '+label+' is being mapped and will be available soon.'); return; }
  const path=buildRoute(from,to);
  if(!path){ alert('No continuous path to '+label+' yet.'); return; }
  const sub = (room.id && !room.extra) ? ('Room '+disp(room.id)+' · Floor '+roomFloorNum(room.id))
                                       : ('CAB · Floor '+(roomFloorNum(room.id)||room.floor||''));
  currentRoom={...room,name:label,sub}; currentPath=path; NODES=stepsFor(currentRoom,currentPath);
  const last=NODES[NODES.length-1]; if(last&&last.arrive){ last.big=label; last.sub=sub; }
  arrivalName=label; arrivalSub=sub;
  $('#destName').textContent=label; $('#destSub').textContent=sub;
  startNav();
}
function roomFloor(id){ const m=String(id).match(/(\d)/); return m?('CAB · Floor '+m[1]):'CAB'; }
function disp(id){ return String(id).replace(/^B/i,''); }

/* ---------- Räume ---------- */
const LIVE={}; ROOMS.forEach(r=>LIVE[r.id]=r);
const EXTRA=[ { id:'DINING', label:'Dining Hall', wp:'f1-dining-w', floor:1, extra:true } ];
EXTRA.forEach(e=>{ LIVE[e.id]=e; });
function roomFloorNum(id){ const r=LIVE[id]; if(r&&r.floor) return r.floor; const m=String(id).match(/(\d)/); return m?+m[1]:0; }
const KEEPSET={}; if(typeof KEEP!=='undefined'){ Object.keys(KEEP).forEach(f=>{ KEEPSET[f]=new Set(KEEP[f]); }); }
function isVisible(id){ const r=LIVE[id]; if(r&&r.extra) return true; const f=roomFloorNum(id); const s=KEEPSET[f]; return s ? s.has(id) : true; }
const CATALOG = ([...((typeof ALL_ROOMS!=='undefined' && ALL_ROOMS.length) ? ALL_ROOMS : ROOMS.map(r=>r.id)), ...EXTRA.map(e=>e.id)]).filter(isVisible);

/* ---------- Funktion je Raum (aus dem Label) ---------- */
function funcOf(id){ const lab=((LIVE[id]||{}).label||'').toLowerCase(); if(!lab) return 'office';
  if(lab.indexOf('restroom')>=0) return 'restroom';
  if(lab.indexOf('classroom')>=0) return 'classroom';
  if(lab.indexOf('conference')>=0) return 'conference';
  if(lab.indexOf('dining')>=0) return 'dining';
  return 'office'; }
const ICONMAP={ restroom:'ic-restroom', classroom:'ic-classroom', conference:'ic-conference', dining:'ic-dining' };
function iconFile(id){ return ICONMAP[funcOf(id)] || 'ic-office'; }
function funcImg(id){ return '<span class="ic"><img src="images/'+iconFile(id)+'.png" alt=""></span>'; }
function esc(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function roomRow(id){ const r=LIVE[id]||{}; const live=!!LIVE[id]; const lab=r.label;
  const b=document.createElement('button'); b.className='drow'+(live?'':' soon');
  const nm = lab ? esc(lab) : disp(id);
  const fl = lab ? (r.extra?('CAB · Floor '+roomFloorNum(id)):('Room '+disp(id)+' · Floor '+roomFloorNum(id))) : roomFloor(id);
  b.innerHTML=funcImg(id)+'<span class="txt"><span class="nm">'+nm+'</span><span class="fl">'+fl+'</span></span>'+(live?'<span class="go">›</span>':'');
  b.onclick=()=>chooseRoomById(id); return b; }
function chooseRoomById(id){ chooseRoom(LIVE[id] || {id:id}); }

function renderRooms(ids){ const list=$('#dlist'); list.innerHTML=''; let n=0; const CAP=250;
  ids.forEach(id=>{ if(n<CAP){ list.appendChild(roomRow(id)); n++; } }); }

/* ---------- Suche (mit englischen Synonymen) ---------- */
const SYN={ toilet:'restroom', bathroom:'restroom', washroom:'restroom', wc:'restroom', loo:'restroom', restrooms:'restroom',
  meeting:'conference', boardroom:'conference', meetings:'conference',
  food:'dining', cafeteria:'dining', canteen:'dining', eat:'dining', cafe:'dining',
  prof:'faculty', professor:'faculty', teacher:'faculty', exam:'testing', test:'testing' };
function expandSyn(v){ const terms=[v]; if(SYN[v]) terms.push(SYN[v]);
  v.split(/\s+/).forEach(w=>{ if(SYN[w]) terms.push(SYN[w]); }); return terms.filter((t,i)=>t&&terms.indexOf(t)===i); }

function applyFilter(){ const raw=($('#q').value||'').trim();
  $('#sclear').classList.toggle('show', !!raw);
  const base = raw ? CATALOG : [...ROOMS.map(r=>r.id), ...EXTRA.map(e=>e.id)].filter(isVisible);
  if(!raw){ renderRooms(base); return; }
  const syn=expandSyn(raw.toLowerCase());
  renderRooms(base.filter(id=>{ const num=disp(id).toLowerCase(),lab=((LIVE[id]||{}).label||'').toLowerCase(),idl=id.toLowerCase();
    return syn.some(t=> num.indexOf(t)>=0||idl.indexOf(t)>=0||lab.indexOf(t)>=0); })); }

$('#q').addEventListener('input',applyFilter);
$('#sclear').onclick=()=>{ $('#q').value=''; applyFilter(); $('#q').focus(); };
applyFilter();
window.addEventListener('resize',()=>{if(!$('#navScreen').hidden)resize();});

/* Direkt-Ziel aus der URL (?to=…) */
(function(){ const to=new URLSearchParams(location.search).get('to'); if(to){ const room=ROOMS.find(r=>r.id===to); if(room) chooseRoom(room); } })();

/* ---------- API für den Editor (nur private Version nutzt das) ---------- */
window.APP={
  get NODES(){return NODES}, set NODES(v){NODES=v}, get i(){return i}, set i(v){i=v},
  get currentRoom(){return currentRoom}, get currentPath(){return currentPath},
  EPATHS, EVIEW, OVR, WAYPOINTS, EDGE_BY_ID,
  rebuildRoute, setNode, buildPathFor, seedEdge, stepsFor, disp,
  get lon(){return lon}, get lat(){return lat}, stage, EYE, camera, HOOK
};
