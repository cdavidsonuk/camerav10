
(()=>{
const $=id=>document.getElementById(id);
let powered=true;
function sync(){
 const src=$("v11SceneImage"),img=$("proReal2Scene");
 if(src&&img){if(img.src!==src.src)img.src=src.src;img.style.cssText=src.style.cssText||""}
 const sh=$("v11ShutterSelect")?.value||"1/125";
 const ap=$("v11ApertureSelect")?.value||"5.6";
 const iso=$("v11IsoSelect")?.value||"100";
 const af=$("v11AfMode")?.value||"AF-S";
 const mode=$("v11LcdMode")?.textContent||"M";
 [["proReal2Shutter",sh],["proReal2Aperture","F"+ap],["proReal2Iso","ISO "+iso],["proReal2Af",af],["proReal2Mode",mode]]
 .forEach(([id,val])=>{if($(id))$(id).textContent=val});
}
function step(id,delta){
 const el=$(id);if(!el||!powered)return;
 const n=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+delta));
 if(n===el.selectedIndex)return;
 el.selectedIndex=n;el.dispatchEvent(new Event("change",{bubbles:true}));el.dispatchEvent(new Event("input",{bubbles:true}));sync();
}
function bindDial(id,target){
 const el=$(id);if(!el)return;
 el.addEventListener("wheel",e=>{e.preventDefault();step(target,e.deltaY>0?1:-1)},{passive:false});
 el.addEventListener("click",()=>step(target,1));
}
function addChallengeClose(){
 const panel=$("proChallengePanel");if(!panel)return;
 const header=panel.querySelector("header");if(!header||header.querySelector(".pro-challenge-close"))return;
 const close=document.createElement("button");close.className="pro-challenge-close";close.type="button";close.innerHTML="×";close.setAttribute("aria-label","Close challenge");
 close.onclick=()=>panel.classList.add("is-hidden");
 header.appendChild(close);
 const reopen=document.createElement("button");reopen.type="button";reopen.textContent="CHALLENGE";reopen.className="pro-engine-toggle";reopen.style.cssText="left:20px;right:auto;top:86px";
 reopen.onclick=()=>panel.classList.remove("is-hidden");
 document.body.appendChild(reopen);
}
function init(){
 document.body.classList.add("pro-real2-active");
 bindDial("proReal2ModeDial","v11ModeSelect");
 bindDial("proReal2RearDial","v11ApertureSelect");
 $("proReal2ShutterButton")?.addEventListener("click",()=>{if(powered)$("v11Shutter")?.click()});
 $("proReal2Power")?.addEventListener("click",()=>{
   powered=!powered;
   const img=$("proReal2Scene");if(img)img.style.filter=powered?($("v11SceneImage")?.style.filter||""):"brightness(.025)";
 });
 $("proReal2Menu")?.addEventListener("click",()=>document.querySelector("#v12MenuButton,[data-v12-menu]")?.click());
 $("proReal2Info")?.addEventListener("click",()=>document.querySelector("#v11InfoButton,[data-action='info']")?.click());
 $("proReal2AfOn")?.addEventListener("click",()=>document.querySelector("#v11AfOn")?.click());
 $("proReal2Q")?.addEventListener("click",()=>document.querySelector("#proQuickControlButton")?.click());
 ["v11ShutterSelect","v11ApertureSelect","v11IsoSelect","v11AfMode","v11FocalLength"].forEach(id=>{
   $(id)?.addEventListener("change",sync);$(id)?.addEventListener("input",sync);
 });
 const scene=$("v11SceneImage");if(scene)new MutationObserver(sync).observe(scene,{attributes:true,attributeFilter:["src","style"]});
 addChallengeClose();sync();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
