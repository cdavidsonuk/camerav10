
(()=>{
const $=id=>document.getElementById(id);
const KEY="photographyCoursesCameraV62";
let lastCapture=null;
const scenarios={
 wedding:["Wedding portrait outdoors","Balance a bright background with flattering subject light and secure focus on the eyes.",{scene:"portrait",mode:"A",shutter:"1/250",aperture:2.8,iso:200,focalLength:85}],
 sports:["Evening football action","Freeze a fast player under falling light while maintaining reliable autofocus.",{scene:"cyclist",mode:"S",shutter:"1/1000",aperture:4,iso:1600,focalLength:135}],
 wildlife:["Bird in flight","Track an erratic subject and protect highlights in bright plumage.",{scene:"wildlife",mode:"S",shutter:"1/2000",aperture:4,iso:800,focalLength:200}],
 street:["Night street moment","Capture a sharp candid scene without destroying the ambient atmosphere.",{scene:"night",mode:"M",shutter:"1/125",aperture:2,iso:3200,focalLength:35}],
 macro:["Close-up flower detail","Maximise useful depth of field while avoiding diffraction and camera shake.",{scene:"portrait",mode:"A",shutter:"1/250",aperture:8,iso:400,focalLength:135}],
 astro:["Stars above a landscape","Collect enough light while preventing visible star trails.",{scene:"night",mode:"M",shutter:"1s",aperture:2,iso:3200,focalLength:24}]
};
function shutterSeconds(v){if(!v)return 1/125;if(v.endsWith("s"))return parseFloat(v);let p=v.split("/");return p.length===2?+p[0]/+p[1]:+v}
function crop(){return $("v62Sensor").value==="full"?1:$("v62Sensor").value==="aps"?1.5:2}
function metrics(){
 const state=window.VIRTUAL_CAMERA_V5?.getState?.()||{aperture:5.6,focalLength:50,shutter:"1/125",iso:200};
 const f=+state.focalLength||50,N=+state.aperture||5.6,s=+$("v62SubjectDistance").value*1000,c=0.03/crop();
 const H=(f*f)/(N*c)+f;
 const near=(H*s)/(H+(s-f)),far=s>=H?Infinity:(H*s)/(H-(s-f));
 const dof=far===Infinity?Infinity:(far-near)/1000;
 $("v62Dof").textContent=dof===Infinity?"To infinity":dof.toFixed(2)+"m";
 $("v62Hyperfocal").textContent=(H/1000).toFixed(1)+"m";
 $("v62Diffraction").textContent=N>=16?"High":N>=11?"Visible":"Low";
 const speed=+$("v62Speed").value,ss=shutterSeconds(state.shutter),panning=$("v62Panning").checked;
 const blur=speed*ss*(panning?.35:1);
 $("v62MotionResult").textContent=blur<.12?"Frozen":blur<.5?"Slight blur":"Strong blur";
 $("v62MotionAdvice").textContent=blur<.12?"Current shutter speed should freeze the subject.":panning?"Panning may keep the subject sharper while blurring the background.":"Use a faster shutter speed.";
 $("v62Noise").textContent=state.iso>=3200?"High":state.iso>=800?"Moderate":"Low";
 $("v62LensCharacter").textContent=f>=135?"Strong compression":f<=35?"Wide perspective":"Natural perspective";
 const contrast=+$("v62Contrast").value,sensorRange=$("v62Sensor").value==="full"?13:$("v62Sensor").value==="aps"?12:11;
 const latitude=sensorRange-contrast;
 $("v62Latitude").textContent=(latitude>=0?"+":"")+latitude.toFixed(1)+" EV";
 $("v62RangeFill").style.width=Math.min(100,contrast/18*100)+"%";
 $("v62RangeAdvice").textContent=latitude>=0?"The scene is within the simulated sensor range.":"Highlights or shadows will clip unless you modify the light or exposure.";
 $("v62SubjectDistanceOut").textContent=(+$("v62SubjectDistance").value).toFixed(1)+"m";
 $("v62BackgroundDistanceOut").textContent=$("v62BackgroundDistance").value+"m";
 $("v62SpeedOut").textContent=$("v62Speed").value+" km/h";
 $("v62ContrastOut").textContent=$("v62Contrast").value+" EV";
 const fp=+$("v62FlashPower").value;
 $("v62FlashOut").textContent=fp<13?"1/8 power":fp<38?"1/4 power":fp<75?"1/2 power":"Full power";
 animateSubject(speed);
 flashEffect();
 save();
}
function animateSubject(speed){
 const el=$("v62MovingSubject");if(!el)return;
 el.getAnimations().forEach(a=>a.cancel());
 if(speed<=0)return;
 const duration=Math.max(900,7000-speed*55);
 el.animate([{transform:"translateX(0)"},{transform:"translateX(520px)"}],{duration,iterations:Infinity,easing:"linear"});
}
function flashEffect(){
 const screen=document.querySelector(".dslr-screen");if(!screen)return;
 screen.querySelectorAll(".v62-flash").forEach(x=>x.remove());
 if($("v62FlashMode").value==="off")return;
 const x=document.createElement("div");x.className="v62-flash";
 const power=+$("v62FlashPower").value/100;
 x.style.opacity=Math.min(.75,.18+power*.65);
 if($("v62Modifier").value==="softbox"||$("v62Modifier").value==="umbrella")x.style.filter="blur(18px)";
 screen.appendChild(x);
}
function evaluate(){
 metrics();
 const st=window.VIRTUAL_CAMERA_V5?.getState?.()||{},sim=window.VIRTUAL_CAMERA_V5?.getSimulation?.()||{};
 let score=100,notes=[];
 if(Math.abs(sim.e||0)>1){score-=20;notes.push("exposure")}
 if((sim.focus||0)>.15){score-=20;notes.push("focus")}
 const speed=+$("v62Speed").value,blur=speed*shutterSeconds(st.shutter)*($("v62Panning").checked?.35:1);
 if(blur>.5){score-=20;notes.push("motion")}
 if(st.iso>=3200){score-=10;notes.push("noise")}
 const contrast=+$("v62Contrast").value,sensorRange=$("v62Sensor").value==="full"?13:$("v62Sensor").value==="aps"?12:11;
 if(contrast>sensorRange){score-=15;notes.push("dynamic range")}
 $("v62EngineState").textContent=`Technical score ${Math.max(0,score)}%`;
 $("v62EngineState").style.color=score>=80?"#75e39a":score>=60?"#efd486":"#ef8080";
}
function generate(){
 const k=$("v62ScenarioType").value,[title,text,setup]=scenarios[k];
 $("v62ScenarioTitle").textContent=title;$("v62ScenarioText").textContent=text;
 window.VIRTUAL_CAMERA_V5?.setState(setup);
}
function save(){localStorage.setItem(KEY,JSON.stringify({
 subjectDistance:$("v62SubjectDistance").value,backgroundDistance:$("v62BackgroundDistance").value,sensor:$("v62Sensor").value,speed:$("v62Speed").value,movement:$("v62Movement").value,panning:$("v62Panning").checked,contrast:$("v62Contrast").value,highlights:$("v62Highlights").value,shadows:$("v62Shadows").value,flashMode:$("v62FlashMode").value,flashPower:$("v62FlashPower").value,modifier:$("v62Modifier").value,flashDirection:$("v62FlashDirection").value
}))}
function restore(){try{let s=JSON.parse(localStorage.getItem(KEY)||"{}");Object.entries({v62SubjectDistance:s.subjectDistance,v62BackgroundDistance:s.backgroundDistance,v62Sensor:s.sensor,v62Speed:s.speed,v62Movement:s.movement,v62Contrast:s.contrast,v62Highlights:s.highlights,v62Shadows:s.shadows,v62FlashMode:s.flashMode,v62FlashPower:s.flashPower,v62Modifier:s.modifier,v62FlashDirection:s.flashDirection}).forEach(([id,v])=>{if(v!==undefined)$(id).value=v});if(s.panning!==undefined)$("v62Panning").checked=s.panning}catch{}}
function init(){
 restore();
 ["v62SubjectDistance","v62BackgroundDistance","v62Sensor","v62Speed","v62Movement","v62Panning","v62Contrast","v62Highlights","v62Shadows","v62FlashMode","v62FlashPower","v62Modifier","v62FlashDirection"].forEach(id=>$(id).addEventListener("input",metrics));
 $("v62Evaluate").onclick=evaluate;$("v62Generate").onclick=generate;
 window.addEventListener("camera:capture",e=>{lastCapture=e.detail;evaluate()});
 setTimeout(metrics,150);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
