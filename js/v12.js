
(()=>{
const $=id=>document.getElementById(id);
let dialRotation=0,rearRotation=0,drag=null,lastY=0;
const toast=t=>{const el=$("v12Toast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1400)};
const clickSound=(freq=420,dur=.035,vol=.025)=>{if($("v12SoundMode")?.value==="off")return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur)}catch{}};
function syncDisplay(){
 const shutter=$("v11ShutterSelect")?.value||"1/125",ap=$("v11ApertureSelect")?.value||"5.6",iso=$("v11IsoSelect")?.value||"100",af=$("v11AfMode")?.value||"AF-S",mode=document.querySelector("[data-v11-mode].active")?.dataset.v11Mode||"M";
 $("v12TopMode").textContent=mode;$("v12TopShutter").textContent=shutter;$("v12TopAperture").textContent="F"+ap;$("v12TopIso").textContent=iso;$("v12TopAf").textContent=af;
 $("v12InfoScene").textContent=document.querySelector(".v11-scene-card.active strong")?.textContent||"Scene";
 $("v12InfoLens").textContent=($("v11FocalLength")?.value||50)+"mm";
 $("v12InfoExposure").textContent=$("v11ExposureStatus")?.textContent||"Balanced";
 $("v12InfoFocus").textContent=$("v11FocusStatus")?.textContent||"Ready";
 $("v12InfoWb").textContent=$("v12WhiteBalance")?.value||"Auto";
 $("v12InfoDrive").textContent=$("v12DriveMode")?.value||"Single shot";
}
function stepSelect(id,dir){
 const el=$(id);if(!el)return;const i=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+dir));if(i!==el.selectedIndex){el.selectedIndex=i;el.dispatchEvent(new Event("change",{bubbles:true}));clickSound();syncDisplay()}
}
function bindDial(el,id,isRear=false){
 el.addEventListener("wheel",e=>{e.preventDefault();stepSelect(id,e.deltaY>0?1:-1);if(isRear){rearRotation+=e.deltaY>0?12:-12;el.style.transform=`rotate(${rearRotation}deg)`}else{dialRotation+=e.deltaY>0?12:-12;el.style.transform=`rotate(${dialRotation}deg)`}},{passive:false});
 el.addEventListener("pointerdown",e=>{drag={el,id,isRear};lastY=e.clientY;el.setPointerCapture(e.pointerId)});
 el.addEventListener("pointermove",e=>{if(!drag||drag.el!==el)return;const d=e.clientY-lastY;if(Math.abs(d)>12){stepSelect(id,d>0?1:-1);lastY=e.clientY;if(isRear){rearRotation+=d>0?12:-12;el.style.transform=`rotate(${rearRotation}deg)`}else{dialRotation+=d>0?12:-12;el.style.transform=`rotate(${dialRotation}deg)`}}});
 el.addEventListener("pointerup",()=>drag=null);
}
function openPanel(panel){
 const p=$(panel);p.classList.add("open");p.setAttribute("aria-hidden","false");clickSound(520,.045,.02)
}
function closePanel(panel){
 const p=$(panel);p.classList.remove("open");p.setAttribute("aria-hidden","true");clickSound(300,.035,.018)
}
function menuTab(name){
 document.querySelectorAll("[data-v12-menu]").forEach(b=>b.classList.toggle("active",b.dataset.v12Menu===name));
 document.querySelectorAll("[data-v12-menu-view]").forEach(v=>v.classList.toggle("active",v.dataset.v12MenuView===name));
}
function applyProfile(){
 const img=$("v11SceneImage"),profile=$("v12PictureProfile")?.value;
 if(!img)return;
 img.style.filter+=" "+(profile==="Vivid"?"saturate(1.22) contrast(1.08)":profile==="Neutral"?"saturate(.88) contrast(.96)":profile==="Monochrome"?"grayscale(1) contrast(1.08)":"");
}
function init(){
 document.body.classList.add("v12-active");
 bindDial($("v12CommandDial"),"v11ShutterSelect",false);
 bindDial($("v12RearDial"),"v11ApertureSelect",true);
 $("v11MenuButton").onclick=()=>openPanel("v12MenuPanel");
 $("v11InfoButton").onclick=()=>openPanel("v12InfoPanel");
 $("v12CloseMenu").onclick=()=>closePanel("v12MenuPanel");$("v12CloseInfo").onclick=()=>closePanel("v12InfoPanel");
 document.querySelectorAll("[data-v12-menu]").forEach(b=>b.onclick=()=>menuTab(b.dataset.v12Menu));
 $("v12Tracking").oninput=e=>{$("v12TrackingOut").textContent=["","Locked-on","Stable","Balanced","Responsive","Very responsive"][+e.target.value];toast("Tracking response updated")};
 $("v12MenuGrid").onchange=e=>{$("v11GridToggle").checked=e.target.checked;$("v11GridToggle").dispatchEvent(new Event("change"))};
 $("v12MenuHistogram").onchange=e=>{$("v11HistogramToggle").checked=e.target.checked;$("v11HistogramToggle").dispatchEvent(new Event("change"))};
 $("v12MenuHighlight").onchange=e=>{$("v11ZebraToggle").checked=e.target.checked;$("v11ZebraToggle").dispatchEvent(new Event("change"))};
 $("v12PictureProfile").onchange=()=>{applyProfile();toast("Picture profile changed")};
 ["v12DriveMode","v12Metering","v12WhiteBalance","v12EyeDetect","v12AfIllumination","v12SoundMode"].forEach(id=>$(id).onchange=()=>{syncDisplay();toast(`${$(id).previousElementSibling?.textContent||"Setting"} updated`)});
 const obs=new MutationObserver(syncDisplay);["v11ExposureStatus","v11FocusStatus"].forEach(id=>{const el=$(id);if(el)obs.observe(el,{childList:true,subtree:true})});
 ["v11ShutterSelect","v11ApertureSelect","v11IsoSelect","v11AfMode","v11FocalLength"].forEach(id=>$(id)?.addEventListener("change",syncDisplay));
 document.addEventListener("click",e=>{if(e.target.closest("button"))clickSound()});
 $("v11HalfPress").addEventListener("click",()=>toast("Autofocus locked"));
 $("v11AfOn").addEventListener("click",()=>toast("Back-button focus"));
 $("v11Shutter").addEventListener("click",()=>{$("v12SystemStatus").textContent="Captured";setTimeout(()=>$("v12SystemStatus").textContent="System ready",900)});
 $("v11TakePhoto").addEventListener("click",()=>{$("v12SystemStatus").textContent="Captured";setTimeout(()=>$("v12SystemStatus").textContent="System ready",900)});
 window.addEventListener("keydown",e=>{if(e.key==="Escape"){closePanel("v12MenuPanel");closePanel("v12InfoPanel")}});
 syncDisplay();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
