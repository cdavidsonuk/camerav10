
(()=>{
const $=id=>document.getElementById(id);
const shutterToSec=v=>v.includes("/")?1/+v.split("/")[1]:parseFloat(v)||1;
function ensureLayers(){
 const lcd=$("v11Lcd");if(!lcd)return;
 ["depth","motion","noise","bokeh"].forEach(n=>{const d=document.createElement("div");d.className=`v15-${n}-layer`;d.id=`v15${n[0].toUpperCase()+n.slice(1)}Layer`;lcd.appendChild(d)});
 const b=document.createElement("div");b.className="v15-engine-badge";b.textContent="REAL-TIME PHOTO ENGINE";lcd.appendChild(b);
}
function update(){
 const img=$("v11SceneImage");if(!img)return;
 const ap=+$("v11ApertureSelect").value,iso=+$("v11IsoSelect").value,sh=$("v11ShutterSelect").value,sec=shutterToSec(sh),focal=+$("v11FocalLength").value;
 const time=$("v11TimeSelect").value,weather=$("v11WeatherSelect").value;
 const blur=Math.max(0,Math.min(10,(5.6-ap)*1.5+(focal-50)/35));
 $("v15DepthLayer").style.setProperty("--v15-blur",`${Math.max(0,blur)}px`);
 $("v15BokehLayer").style.opacity=ap<=2.8?Math.min(.8,(3.2-ap)/2):0;
 const motion=sec>=1/30?Math.min(.7,sec*2.2):0;
 $("v15MotionLayer").style.opacity=motion;
 $("v15MotionLayer").style.transform=`translateX(${motion*18}px)`;
 const noise=Math.max(0,(Math.log2(iso/100))/7);
 $("v15NoiseLayer").style.opacity=Math.min(.62,noise*.72);
 const wb=time==="golden"?"sepia(.16) saturate(1.18) hue-rotate(-8deg)":time==="blue"?"saturate(.88) hue-rotate(8deg)":time==="night"?"brightness(.78) saturate(.8)":"";
 const weatherFx=weather==="Mist"?"contrast(.82) brightness(1.06)":weather==="Rain"?"saturate(.8) contrast(1.08)":weather==="Cloudy"?"saturate(.92)":"";
 img.style.filter=`${img.style.filter||""} ${wb} ${weatherFx}`.trim();
}
function init(){
 document.body.classList.add("v15-active");
 ensureLayers();
 ["v11ApertureSelect","v11IsoSelect","v11ShutterSelect","v11FocalLength","v11TimeSelect","v11WeatherSelect"].forEach(id=>{
  $(id)?.addEventListener("input",update);$(id)?.addEventListener("change",update);
 });
 update();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
