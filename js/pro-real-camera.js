
(()=>{
const $=id=>document.getElementById(id);
let powered=true;
const sync=()=>{
  const src=$("v11SceneImage");
  const dst=$("proRealSceneImage");
  if(src&&dst){
    if(dst.src!==src.src)dst.src=src.src;
    dst.style.cssText=src.style.cssText||"";
  }
  const sh=$("v11ShutterSelect")?.value||"1/125";
  const ap=$("v11ApertureSelect")?.value||"5.6";
  const iso=$("v11IsoSelect")?.value||"100";
  const af=$("v11AfMode")?.value||"AF-S";
  const mode=$("v11LcdMode")?.textContent||"M";
  [["proRealShutter",sh],["proRealAperture","F"+ap],["proRealIso","ISO "+iso],
   ["proRealAf",af],["proRealMode",mode],["proRealTopShutter",sh],
   ["proRealTopAperture","F"+ap],["proRealTopIso","ISO "+iso]].forEach(([id,val])=>{if($(id))$(id).textContent=val});
}
function step(id,delta){
  const el=$(id);if(!el||!powered)return;
  const next=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+delta));
  if(next===el.selectedIndex)return;
  el.selectedIndex=next;
  el.dispatchEvent(new Event("change",{bubbles:true}));
  el.dispatchEvent(new Event("input",{bubbles:true}));
  sync();
}
function dial(id,target){
  const el=$(id);if(!el)return;
  el.addEventListener("wheel",e=>{e.preventDefault();step(target,e.deltaY>0?1:-1)},{passive:false});
  el.addEventListener("click",()=>step(target,1));
  el.addEventListener("keydown",e=>{
    if(["ArrowRight","ArrowDown"].includes(e.key))step(target,1);
    if(["ArrowLeft","ArrowUp"].includes(e.key))step(target,-1);
  });
}
function init(){
  document.body.classList.add("pro-real-camera-active");
  dial("proRealModeDial","v11ModeSelect");
  dial("proRealRearDial","v11ApertureSelect");
  $("proRealShutterButton")?.addEventListener("click",()=>{
    if(!powered)return;
    $("v11Shutter")?.click();
  });
  $("proRealPowerSwitch")?.addEventListener("click",()=>{
    powered=!powered;
    document.getElementById("proRealSceneImage").style.filter=powered?($("v11SceneImage")?.style.filter||""):"brightness(.03)";
    $("proRealPowerSwitch").setAttribute("x",powered?"276":"250");
  });
  $("proRealMenuButton")?.addEventListener("click",()=>document.querySelector("[data-v12-menu],#v12MenuButton")?.click());
  $("proRealInfoButton")?.addEventListener("click",()=>document.querySelector("#v11InfoButton,[data-action='info']")?.click());
  $("proRealAfOn")?.addEventListener("click",()=>document.querySelector("#v11AfOn")?.click());
  ["v11ShutterSelect","v11ApertureSelect","v11IsoSelect","v11AfMode","v11FocalLength"].forEach(id=>{
    $(id)?.addEventListener("change",sync);$(id)?.addEventListener("input",sync);
  });
  const scene=$("v11SceneImage");
  if(scene)new MutationObserver(sync).observe(scene,{attributes:true,attributeFilter:["src","style"]});
  sync();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
