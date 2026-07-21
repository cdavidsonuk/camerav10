
(()=>{
const $=id=>document.getElementById(id);
const apertureValues=[1.4,2,2.8,4,5.6,8,11,16,22];
let state={body:"mirrorless",subject:"human",presets:[]};
const load=()=>{try{state={...state,...JSON.parse(localStorage.getItem("photographyV9")||"{}")}}catch{}};
const save=()=>localStorage.setItem("photographyV9",JSON.stringify(state));
function tab(name){document.querySelectorAll("[data-v9-tab]").forEach(b=>b.classList.toggle("active",b.dataset.v9Tab===name));document.querySelectorAll("[data-v9-view]").forEach(v=>v.classList.toggle("active",v.dataset.v9View===name))}
function bodyPreview(){const p=$("v9CameraPreview");p.dataset.body=state.body;document.querySelectorAll("[data-body]").forEach(b=>b.classList.toggle("active",b.dataset.body===state.body))}
function lensMetrics(){
 const f=+$("v9LensFocal").value,a=apertureValues[+$("v9LensAperture").value];
 $("v9LensFocalOut").textContent=f+"mm";$("v9LensApertureOut").textContent="f/"+a;
 $("v9Perspective").textContent=f<28?"Very wide":f<50?"Wide":f<85?"Natural":f<135?"Compressed":"Strongly compressed";
 $("v9Compression").textContent=f<50?"Low":f<100?"Moderate":"High";
 $("v9Vignetting").textContent=a<=2?"Visible":a<=4?"Moderate":"Low";
 $("v9Diffraction").textContent=a>=16?"High":a>=11?"Visible":"Low";
 $("v9Dof").textContent=a<=2.8?"Shallow":a<=8?"Medium":"Deep";
}
function trackingLabels(){
 const sens=+$("v9TrackingSensitivity").value,acc=+$("v9Acceleration").value;
 $("v9TrackingSensitivityOut").textContent=["","Locked-on","Responsive","Balanced","Quick","Very quick"][sens];
 $("v9AccelerationOut").textContent=["Constant","Variable","Erratic"][acc];
}
function runTracking(){
 const sub=$("v9TrackSubject"),box=$("v9TrackBox"),sens=+$("v9TrackingSensitivity").value,acc=+$("v9Acceleration").value;
 sub.getAnimations().forEach(a=>a.cancel());box.getAnimations().forEach(a=>a.cancel());
 const keyframes=acc===2?[{transform:"translateX(0)"},{transform:"translateX(380px)"},{transform:"translateX(160px)"},{transform:"translateX(500px)"}]:[{transform:"translateX(0)"},{transform:"translateX(500px)"}];
 const duration=5600-sens*700;
 sub.animate(keyframes,{duration,iterations:1,easing:acc===0?"linear":"ease-in-out"});
 box.animate(keyframes,{duration:duration+(6-sens)*110,iterations:1,easing:"ease-in-out"});
 $("v9TrackingResult").textContent=sens>=4?"Tracking response is quick but may jump to distractions.":sens<=2?"Tracking is stable but may lag behind sudden movement.":"Balanced tracking for mixed movement.";
}
function environment(){
 const time=$("v9TimeOfDay").value,weather=$("v9Weather").value,wind=+$("v9Wind").value,angle=+$("v9SunAngle").value,cloud=+$("v9CloudCover").value,haze=+$("v9Haze").value;
 $("v9WindOut").textContent=wind<20?"Light":wind<50?"Moderate":wind<80?"Strong":"Very strong";
 $("v9SunAngleOut").textContent=angle+"°";$("v9CloudCoverOut").textContent=cloud+"%";$("v9HazeOut").textContent=haze+"%";
 const preview=$("v9EnvironmentPreview"),sun=$("v9Sun"),weatherLayer=$("v9WeatherLayer");
 const colors={sunrise:"linear-gradient(#f28b62,#ffd49c 55%,#33472f 55%)",day:"linear-gradient(#4f88bf 0 55%,#263c2b 55%)",golden:"linear-gradient(#e59a55,#f2cc8e 55%,#3c4d2c 55%)",blue:"linear-gradient(#365a7b,#7690a9 55%,#1e2d27 55%)",night:"linear-gradient(#07111d,#17283b 55%,#0b1410 55%)"};
 preview.style.background=colors[time];
 const rad=angle*Math.PI/180;sun.style.left=(50+Math.cos(rad)*35)+"%";sun.style.top=(45-Math.sin(rad)*32)+"%";sun.style.opacity=time==="night"?.25:1;
 $("v9CloudLayer").style.opacity=cloud/100;$("v9HazeLayer").style.opacity=haze/100;weatherLayer.className="v9-weather-layer "+weather;
}
function studio(){
 const key=+$("v9KeyPower").value,fill=+$("v9FillPower").value,rim=+$("v9RimPower").value,bg=+$("v9BackgroundPower").value,pos=+$("v9KeyPosition").value;
 $("v9KeyPowerOut").textContent=key+"%";$("v9FillPowerOut").textContent=fill+"%";$("v9RimPowerOut").textContent=rim+"%";$("v9BackgroundPowerOut").textContent=bg+"%";$("v9KeyPositionOut").textContent=pos+"°";
 $("v9KeyGlow").style.opacity=key/100;$("v9FillGlow").style.opacity=fill/100;$("v9RimGlow").style.opacity=rim/100;$("v9StudioPreview").style.boxShadow=`inset 0 0 ${bg}px rgba(255,255,255,.25)`;
 const ratio=fill?Math.round(key/fill*10)/10:key;$("v9LightingAdvice").textContent=ratio>4?"High-contrast dramatic lighting.":ratio<1.8?"Soft, low-contrast lighting.":"Balanced portrait lighting.";
}
function proActions(){
 $("v9FocusFramesOut").textContent=$("v9FocusFrames").value+" frames";$("v9FocusStepOut").textContent=$("v9FocusStep").value;
}
function renderPresets(){
 $("v9PresetList").innerHTML=state.presets.map((p,i)=>`<div class="v9-preset"><span>${p.name}</span><button data-preset="${i}">Load</button></div>`).join("");
 document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>alert(`Preset "${state.presets[+b.dataset.preset].name}" loaded.`));
}
function init(){
 document.body.classList.add("v9-active");
 document.body.classList.remove("v8-active");
 load();bodyPreview();lensMetrics();trackingLabels();environment();studio();proActions();renderPresets();
 document.querySelectorAll("[data-v9-tab]").forEach(b=>b.onclick=()=>tab(b.dataset.v9Tab));
 document.querySelectorAll("[data-body]").forEach(b=>b.onclick=()=>{state.body=b.dataset.body;bodyPreview();save()});
 document.querySelectorAll("#v9SubjectDetection button").forEach(b=>b.onclick=()=>{state.subject=b.dataset.value;document.querySelectorAll("#v9SubjectDetection button").forEach(x=>x.classList.toggle("active",x===b));save()});
 ["v9LensFocal","v9LensAperture"].forEach(id=>$(id).oninput=lensMetrics);
 ["v9TrackingSensitivity","v9Acceleration"].forEach(id=>$(id).oninput=trackingLabels);$("v9StartTracking").onclick=runTracking;
 ["v9TimeOfDay","v9Weather","v9Wind","v9SunAngle","v9CloudCover","v9Haze"].forEach(id=>$(id).oninput=environment);
 ["v9KeyPower","v9FillPower","v9RimPower","v9BackgroundPower","v9KeyPosition"].forEach(id=>$(id).oninput=studio);
 ["v9FocusFrames","v9FocusStep"].forEach(id=>$(id).oninput=proActions);
 $("v9RunBracket").onclick=()=>{$("v9BracketResult").textContent=`Captured ${$("v9BracketFrames").value} simulated frames at ${$("v9BracketSpacing").value} spacing.`};
 $("v9RunFocusStack").onclick=()=>{$("v9FocusStackResult").textContent=`Simulated ${$("v9FocusFrames").value} focus steps. Estimated extended depth of field created.`};
 $("v9RunTimelapse").onclick=()=>{$("v9TimelapseResult").textContent=`Previewed ${$("v9IntervalFrames").value} frames at ${$("v9Interval").value} intervals.`};
 $("v9SavePreset").onclick=()=>{state.presets.push({name:$("v9PresetName").value||"My Setup",date:Date.now()});state.presets=state.presets.slice(-8);save();renderPresets()};
 $("v9EnterCamera").onclick=()=>{document.body.classList.add("v9-camera-mode","v8-camera-mode");document.body.classList.remove("v9-academy-mode")};
 $("v9ReturnAcademy").onclick=()=>{document.body.classList.add("v9-academy-mode");document.body.classList.remove("v9-camera-mode","v8-camera-mode")};
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
