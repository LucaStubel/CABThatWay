/* ============================================================
   THATWAY · CAB — EDITOR (nur private Version)
   Läuft nur, wenn diese Datei + editor.css eingebunden sind.
   Speichert lokal im Browser (localStorage). Über 💾 exportieren
   und den Text an den Entwickler geben -> wird in saved.js gebacken.
   ============================================================ */
(function(){
if(typeof APP==='undefined'){ return; }
const $=s=>document.querySelector(s);
const EP=APP.EPATHS, EV=APP.EVIEW, OV=APP.OVR, WP=APP.WAYPOINTS;

/* lokale Overrides über die gebackenen Defaults legen */
try{const s=localStorage.getItem('thatway_paths_v3'); if(s){const o=JSON.parse(s); for(const k in o) if(Array.isArray(o[k])) EP[k]=o[k];}}catch(e){}
try{const s=localStorage.getItem('thatway_views_v3'); if(s){const o=JSON.parse(s); for(const k in o) EV[k]=o[k];}}catch(e){}
try{const s=localStorage.getItem('thatway_routes_v1'); if(s){const o=JSON.parse(s); for(const k in o) OV[k]=o[k];}}catch(e){}
function savePaths(){ try{localStorage.setItem('thatway_paths_v3',JSON.stringify(EP));}catch(e){} }
function saveViews(){ try{localStorage.setItem('thatway_views_v3',JSON.stringify(EV));}catch(e){} }
function saveOvr(){ try{localStorage.setItem('thatway_routes_v1',JSON.stringify(OV));}catch(e){} }

const cur=()=>APP.NODES[APP.i];
let editMode=false, addArmed=false, dragH=null, handleEls=[];
const THREE=window.THREE, camera=APP.camera, stage=APP.stage, EYE=APP.EYE;
const eray=new THREE.Raycaster();
const floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0), EYE);
function endc(e){const r=$('#glc').getBoundingClientRect(); const p=e.touches?e.touches[0]:e; return new THREE.Vector2(((p.clientX-r.left)/r.width)*2-1, -((p.clientY-r.top)/r.height)*2+1);}
function efloor(e){eray.setFromCamera(endc(e),camera); const o=new THREE.Vector3(); return eray.ray.intersectPlane(floorPlane,o)?o:null;}

function buildHandles(){ const host=$('#handles'); host.innerHTML=''; handleEls=[]; const n=cur(); if(!editMode||!n) return; const pts=EP[n.key]||[];
 pts.forEach((p,idx)=>{ const el=document.createElement('div'); el.className='handle'+(idx===0?' start':''); el.dataset.idx=idx; host.appendChild(el); handleEls.push(el); }); }
const _hv=new THREE.Vector3();
function updateHandles(){ const n=cur(); if(!editMode||!n) return; const w=stage.clientWidth,h=stage.clientHeight; const pts=EP[n.key]||[];
 handleEls.forEach((el,idx)=>{ const p=pts[idx]; if(!p){el.style.display='none';return;} _hv.set(p[0],-EYE,p[1]).project(camera);
   if(_hv.z>1){el.style.display='none';return;} const x=(_hv.x*0.5+0.5)*w, y=(-_hv.y*0.5+0.5)*h;
   if(x<-30||x>w+30||y<-30||y>h+30){el.style.display='none';return;}
   el.style.display='block'; el.style.left=x+'px'; el.style.top=y+'px'; }); }
function pickHandle(e){ const r=$('#glc').getBoundingClientRect(); const pp=e.touches?e.touches[0]:e; const mx=pp.clientX-r.left,my=pp.clientY-r.top; let best=null,bd=36;
 handleEls.forEach((el,idx)=>{ if(el.style.display==='none')return; const hx=parseFloat(el.style.left),hy=parseFloat(el.style.top); const dd=Math.hypot(hx-mx,hy-my); if(dd<bd){bd=dd;best=idx;} }); return best; }

/* Hooks in die Engine */
APP.HOOK.afterPath=buildHandles;
APP.HOOK.frame=updateHandles;
APP.HOOK.setNode=function(){ if(editMode) refreshEditUI(); };
APP.HOOK.down=function(e){ if(!editMode) return false;
  const hi=pickHandle(e); if(hi!==null){ dragH=hi; return true; }
  if(addArmed){ const f=efloor(e); if(f){ const k=cur().key; (EP[k]=EP[k]||[]).push([f.x,f.z]); addArmed=false; $('#eAdd').classList.remove('on'); APP.buildPathFor(cur()); savePaths(); } return true; }
  return false; };
APP.HOOK.move=function(e){ if(dragH!==null){ const f=efloor(e); if(f){ EP[cur().key][dragH]=[f.x,f.z]; APP.buildPathFor(cur()); } return true; } return false; };
APP.HOOK.up=function(){ if(dragH!==null){ dragH=null; savePaths(); } };
stage.addEventListener('touchmove',e=>{ if(editMode&&dragH!==null) e.preventDefault(); },{passive:false});

/* Pro-Raum forken */
function ensureOvr(){ const r=APP.currentRoom; if(!r)return null; if(OV[r.id])return OV[r.id];
  const steps=APP.NODES.map((n,idx)=>{ const nk='r:'+r.id+'#'+idx;
    if(EP[n.key]&&EP[n.key].length&&!EP[nk]) EP[nk]=EP[n.key].map(p=>p.slice());
    if(EV[n.key]&&!EV[nk]) EV[nk]=Object.assign({},EV[n.key]);
    return { wp:n.wp, key:nk, big:n.big, sub:n.sub, arrive:!!n.arrive, elevSym:!!n.elevSym }; });
  OV[r.id]={ seq:steps.length, steps }; savePaths(); saveViews(); saveOvr();
  APP.NODES=APP.stepsFor(r,APP.currentPath); return OV[r.id]; }
function newKey(ov,r){ return 'r:'+r.id+'#'+(ov.seq++); }

function refreshEditUI(){ const n=cur(); $('#eStep').textContent=(APP.i+1)+'/'+APP.NODES.length; const h=$('#ebhint'); if(!n||!h) return;
 const rid=APP.currentRoom?APP.disp(APP.currentRoom.id):''; const forked=APP.currentRoom&&OV[APP.currentRoom.id]; const foto=n.wp?(' · 📷 '+n.wp):'';
 if(n.arrive){ h.innerHTML='🎯 <b>Destination '+rid+'</b>'+foto+' — 🖼 = other photo · S＋/S－ · line to the door.'; }
 else if(forked){ h.innerHTML='🧩 <b>Own step</b> (only '+rid+')'+foto+' — 🖼 photo · S＋/S－ · 🎯 destination.'; }
 else if(n.key && n.key.indexOf('arr:')===0){ h.innerHTML='🎯 <b>Arrival '+rid+'</b>'+foto+' — this room only. 🖼 swaps the photo.'; }
 else if(n.key && n.key.indexOf('>')>0){ const p=n.key.split('>'); h.innerHTML='↔️ Corridor <b>'+p[0]+' → '+p[1]+'</b> — shared. With 🖼/S＋/S－ it becomes independent for THIS room only.'; }
 else { h.textContent='Drag = move point · ＋ new point · 📷 remember view'; } }

const editBtn=$('#editBtn'); if(editBtn) editBtn.style.display='flex';
$('#editBtn').onclick=()=>{ editMode=!editMode; $('#editBar').hidden=!editMode; $('#ebhint').hidden=true; $('#editBtn').classList.toggle('on',editMode); addArmed=false; $('#eAdd').classList.remove('on'); APP.buildPathFor(cur()); refreshEditUI(); };
$('#eAdd').onclick=()=>{ addArmed=!addArmed; $('#eAdd').classList.toggle('on',addArmed); };
$('#eDel').onclick=()=>{ const a=EP[cur().key]; if(a&&a.length){ a.pop(); APP.buildPathFor(cur()); savePaths(); } };
$('#eReset').onclick=()=>{ APP.seedEdge(cur().key); APP.buildPathFor(cur()); savePaths(); };
$('#eNext').onclick=()=>{ if(APP.i<APP.NODES.length-1){ APP.i=APP.i+1; APP.setNode(); } };
$('#ePrev').onclick=()=>{ if(APP.i>0){ APP.i=APP.i-1; APP.setNode(); } };
$('#eDone').onclick=()=>{ editMode=false; $('#editBar').hidden=true; $('#ebhint').hidden=true; $('#editBtn').classList.remove('on'); addArmed=false; $('#eAdd').classList.remove('on'); APP.buildPathFor(cur()); };
$('#eView').onclick=()=>{ if(!cur())return; EV[cur().key]={lon:Math.round(((APP.lon%360)+360)%360),lat:Math.round(APP.lat)}; saveViews(); const b=$('#eView'); b.classList.add('on'); b.textContent='✓'; setTimeout(()=>{b.textContent='📷';b.classList.remove('on');},900); };

let pickCb=null;
function floorPhotos(){ const cur0=(WP[cur()&&cur().wp]||{}).floor; return Object.keys(WP).filter(id=>WP[id].floor===cur0); }
function openPicker(title,cb){ pickCb=cb; const g=$('#pickGrid'); g.innerHTML='';
  const curWp=cur()&&cur().wp;
  floorPhotos().forEach(id=>{ const c=document.createElement('button'); c.className='pcell'+(id===curWp?' on':'');
    c.innerHTML='<img src="'+WP[id].img+'"><span>'+id+(id===curWp?' ✓':'')+'</span>';
    c.onclick=()=>{ $('#picker').hidden=true; const f=pickCb; pickCb=null; if(f)f(id); }; g.appendChild(c); });
  $('#pickTitle').textContent=title||'Choose a photo'; $('#picker').hidden=false; }
$('#pickClose').onclick=()=>{ $('#picker').hidden=true; pickCb=null; };
$('#eImg').onclick=()=>{ if(!cur())return; openPicker('Photo for this step', wp=>{ const ov=ensureOvr(); ov.steps[APP.i].wp=wp; saveOvr(); APP.rebuildRoute(APP.i); }); };
$('#eStepAdd').onclick=()=>{ if(!APP.currentRoom)return; openPicker('Photo for a new step', wp=>{ const ov=ensureOvr(); const k=newKey(ov,APP.currentRoom);
   ov.steps.splice(APP.i+1,0,{wp,key:k,big:'Der Linie folgen',sub:'',arrive:false,elevSym:false}); saveOvr(); APP.rebuildRoute(APP.i+1); }); };
$('#eStepDel').onclick=()=>{ if(!APP.currentRoom||APP.NODES.length<=1)return; const ov=ensureOvr(); ov.steps.splice(APP.i,1); saveOvr(); APP.rebuildRoute(APP.i); };
$('#eGoal').onclick=()=>{ if(!cur())return; const ov=ensureOvr(); ov.steps[APP.i].arrive=!ov.steps[APP.i].arrive; saveOvr(); APP.rebuildRoute(APP.i); };
$('#eAuto').onclick=()=>{ if(!APP.currentRoom||!OV[APP.currentRoom.id])return; if(!confirm('Recalculate the route for '+APP.disp(APP.currentRoom.id)+' automatically? Custom steps for this room will be lost.'))return; delete OV[APP.currentRoom.id]; saveOvr(); APP.rebuildRoute(0); };
$('#eExp').onclick=()=>{ savePaths(); saveViews(); saveOvr(); $('#expTxt').value=JSON.stringify({lines:EP,views:EV,routes:OV}); $('#expModal').hidden=false; };
$('#expCopy').onclick=()=>{ const t=$('#expTxt'); t.select(); try{document.execCommand('copy');}catch(e){} if(navigator.clipboard) navigator.clipboard.writeText(t.value).catch(()=>{}); $('#expCopy').textContent='Copied ✓'; setTimeout(()=>$('#expCopy').textContent='Copy',1200); };
$('#expClose').onclick=()=>{ $('#expModal').hidden=true; };
})();
