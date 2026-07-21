
(()=>{
const images=window.SCENE_IMAGES||{};
const sceneInfo={
 landscape:{name:"Mountain Lake",desc:"Sharp landscape",motion:.1,subjectDepth:.62,contrast:.8},
 portrait:{name:"Portrait",desc:"Shallow depth of field",motion:.05,subjectDepth:.42,contrast:.55},
 waterfall:{name:"Waterfall",desc:"Long exposure",motion:1,subjectDepth:.58,contrast:.72},
 cyclist:{name:"Cyclist",desc:"Fast action",motion:1,subjectDepth:.46,contrast:.78},
 night:{name:"Night City",desc:"Low-light photography",motion:.35,subjectDepth:.7,contrast:1},
 wildlife:{name:"Wildlife",desc:"Telephoto action",motion:.85,subjectDepth:.38,contrast:.82}
};
const modes=["M","A","S","P","AUTO"],shutters=["1/4000","1/2000","1/1000","1/500","1/250","1/125","1/60","1/30","1/15","1/8","1/4","1/2","1s"],apertures=[1.4,2,2.8,4,5.6,8,11,16],isos=[100,200,400,800,1600,3200,6400],lenses=[24,35,50,85,135,200];
const $=id=>document.getElementById(id);
let currentScene="landscape",modeIndex=0,shutterIndex=5,apertureIndex=4,isoIndex=1,lensIndex=2,shots=0,focused=false;
const sec=v=>v.endsWith("s")?parseFloat(v):(()=>{let p=v.split("/");return p.length===2?+p[0]/+p[1]:+v})();

function state(){return{scene:currentScene,mode:modes[modeIndex],shutter:shutters[shutterIndex],aperture:apertures[apertureIndex],iso:isos[isoIndex],focalLength:lenses[lensIndex],focusDistance:+$("focusDistance").value,whiteBalance:$("whiteBalance").value,pictureProfile:$("pictureProfile").value,meteringMode:$("meteringMode").value,autofocusMode:window.V5_PHASE3_STATE?.afMode||"AF-S",driveMode:window.V5_PHASE3_STATE?.driveMode||"single",exposureComp:+(window.V5_PHASE3_STATE?.exposureComp||0)}}
function simulation(){
 const s=state(), base={landscape:0,portrait:.2,waterfall:-.1,cyclist:.15,night:-3,wildlife:.05}[s.scene]||0;
 const ev=Math.log2((s.aperture*s.aperture)/sec(s.shutter))-Math.log2(s.iso/100)-12+base+(s.exposureComp||0);
 const focus=Math.abs(s.focusDistance-sceneInfo[s.scene].subjectDepth*100)/100;
 return{e:Math.max(-4,Math.min(4,-ev)),focus,noise:Math.max(0,(s.iso-400)/6000),motion:sceneInfo[s.scene].motion*sec(s.shutter)*20};
}
function filters(){
 const s=state(),sim=simulation();let bright=Math.max(.35,Math.min(1.8,1+sim.e*.22)),sat=1,contrast=1;
 if(s.pictureProfile==="vivid"){sat=1.35;contrast=1.12} if(s.pictureProfile==="neutral"){sat=.85;contrast=.92} if(s.pictureProfile==="mono")sat=0;
 let temp=""; if(s.whiteBalance==="tungsten")temp=" sepia(.08) hue-rotate(180deg)"; if(s.whiteBalance==="cloudy"||s.whiteBalance==="shade")temp=" sepia(.12) saturate(1.08)";
 const blur=Math.min(6,Math.max(0,sim.focus*9 + (s.aperture<=2.8?Math.max(0,sceneInfo[s.scene].subjectDepth-.45)*3:0)));
 return`brightness(${bright}) contrast(${contrast}) saturate(${sat}) blur(${blur}px)${temp}`;
}
function buildCamera(){
 const host=$("threeContainer");
 host.innerHTML=`<div class="dslr" aria-label="Interactive professional camera">
 <div class="dslr-grip"></div><div class="dslr-brand">PHOTOGRAPHY<br>COURSES</div>
 <div class="dslr-mode" id="bodyMode">M</div><div class="dslr-wheel" id="bodyWheel" title="Command wheel"></div><button class="dslr-shutter" id="bodyShutter" aria-label="Shutter"></button>
 <div class="dslr-toplcd"><div><b id="bodyTopMode">M</b><b id="bodyTopShots">999</b></div><div><span id="bodyTopShutter">1/125</span><span id="bodyTopAperture">F5.6</span></div><div><span id="bodyTopIso">ISO 200</span><span>▰▰▰</span></div></div>
 <button class="dslr-button dslr-menu" id="bodyMenu">MENU</button><button class="dslr-button dslr-info" id="bodyInfo">INFO</button><button class="dslr-button dslr-af" id="bodyAf">AF-ON</button><button class="dslr-button dslr-play" id="bodyPlay">▶</button>
 <div class="dslr-screen"><img id="bodyScreenImage" alt="Camera live view"><div class="dslr-hud"><div class="top"><span id="bodyHudMode">M</span><span>RAW · 14-bit</span></div><div class="dslr-focus" id="bodyFocus"></div><div class="bottom"><span id="bodyHudExposure">1/125 · F5.6</span><span id="bodyHudIso">ISO 200 · 50mm</span></div></div></div>
 <div class="dslr-dial" id="bodyRearDial"></div><div class="dslr-caption">CLICK THE DIALS AND BUTTONS TO OPERATE THE CAMERA</div></div>`;
 $("bodyMode").onclick=()=>{modeIndex=(modeIndex+1)%modes.length;updateReadouts();log("Mode changed to "+modes[modeIndex])};
 $("bodyWheel").onclick=()=>rotateWheel(1,"front");$("bodyRearDial").onclick=()=>rotateWheel(1,"rear");
 $("bodyShutter").onclick=capture;$("bodyAf").onclick=autofocus;$("bodyMenu").onclick=()=>$("menuUi").click();$("bodyPlay").onclick=()=>$("playUi").click();
}
function buildScenes(){
 const host=$("sceneButtons");host.innerHTML="";
 Object.entries(sceneInfo).forEach(([key,d])=>{let b=document.createElement("button");b.className="scene-button"+(key===currentScene?" active":"");b.innerHTML=`<img src="${images[key]||""}" alt=""><span><strong>${d.name}</strong><small>${d.desc}</small></span>`;b.onclick=()=>{currentScene=key;focused=false;document.querySelectorAll(".scene-button").forEach(x=>x.classList.toggle("active",x===b));updateReadouts();log("Scene selected: "+d.name)};host.appendChild(b)})
}
function render(){
 const s=state(),src=images[currentScene]||"";
 ["liveImage","bodyScreenImage"].forEach(id=>{let im=$(id);if(im){im.src=src;im.style.filter=filters();im.style.transform=`scale(${1+(s.focalLength-24)/400})`}});
}
function updateReadouts(){
 const s=state(),sim=simulation(),ev=sim.e;
 const map={modeOut:s.mode,shutterOut:s.shutter,apertureOut:"F"+s.aperture,isoOut:s.iso,bodyMode:s.mode,bodyTopMode:s.mode,bodyTopShutter:s.shutter,bodyTopAperture:"F"+s.aperture,bodyTopIso:"ISO "+s.iso,bodyHudMode:s.mode,bodyHudExposure:s.shutter+" · F"+s.aperture,bodyHudIso:"ISO "+s.iso+" · "+s.focalLength+"mm"};
 Object.entries(map).forEach(([id,v])=>{if($(id))$(id).textContent=v});
 if($("modeBadge"))$("modeBadge").textContent=s.mode;if($("engineStatus"))$("engineStatus").textContent="Camera interface ready";
 if($("exposureReadout"))$("exposureReadout").textContent=(ev>=0?"+":"")+ev.toFixed(1)+" EV";
 if($("liveHudLeft"))$("liveHudLeft").textContent=s.shutter+" · F"+s.aperture;if($("liveHudRight"))$("liveHudRight").textContent="ISO "+s.iso+" · "+s.focalLength+"mm";
 if($("diagExposure"))$("diagExposure").textContent=Math.abs(ev)<.6?"Balanced":ev>0?"Bright":"Dark";
 if($("diagDof"))$("diagDof").textContent=s.aperture<=2.8?"Shallow":s.aperture>=8?"Deep":"Moderate";
 if($("diagMotion"))$("diagMotion").textContent=sim.motion>.7?"Blur likely":"Frozen";
 if($("diagNoise"))$("diagNoise").textContent=s.iso>=3200?"High":s.iso>=800?"Moderate":"Very low";
 if($("diagFocus"))$("diagFocus").textContent=focused?"Confirmed":sim.focus<.12?"Accurate":"Needs adjustment";
 if($("simulationSummary"))$("simulationSummary").textContent=`${sceneInfo[currentScene].name}: ${Math.abs(ev)<.6?"balanced exposure":ev>0?"bright exposure":"dark exposure"}, ${s.aperture<=2.8?"shallow":"controlled"} depth of field.`;
 render();window.dispatchEvent(new CustomEvent("camera:update",{detail:{state:s,simulation:sim}}));
}
function rotateWheel(direction=1,which="front"){
 const mode=modes[modeIndex],fn=$("wheelFunction")?.value||"smart";let target=fn;
 if(fn==="smart")target=which==="rear"?(mode==="M"?"aperture":"iso"):(mode==="A"?"aperture":mode==="S"?"shutter":"shutter");
 if(target==="shutter")shutterIndex=(shutterIndex+direction+shutters.length)%shutters.length;
 if(target==="aperture")apertureIndex=(apertureIndex+direction+apertures.length)%apertures.length;
 if(target==="iso")isoIndex=(isoIndex+direction+isos.length)%isos.length;
 updateReadouts();log(target+" adjusted");
}
function autofocus(){focused=true;$("focusDistance").value=Math.round(sceneInfo[currentScene].subjectDepth*100);$("bodyFocus")?.classList.add("locked");$("focusMarker")?.classList.add("locked");updateReadouts();log("Autofocus locked")}
function capture(){
 const s=state(),sim=simulation();shots++;if($("bodyTopShots"))$("bodyTopShots").textContent=Math.max(0,999-shots);
 const detail={state:s,simulation:sim,shotNumber:shots,timestamp:new Date().toISOString()};
 window.dispatchEvent(new CustomEvent("camera:capture",{detail}));log("Photo captured");$("bodyScreenImage")?.animate([{opacity:1},{opacity:.15},{opacity:1}],{duration:240});
}
function log(msg){if($("feedbackTitle"))$("feedbackTitle").textContent=msg;if($("feedbackText"))$("feedbackText").textContent="Use the controls and observe the live image, exposure and diagnostics."}
function setState(s={}){
 if(s.scene&&sceneInfo[s.scene])currentScene=s.scene;if(s.mode&&modes.includes(s.mode))modeIndex=modes.indexOf(s.mode);if(s.shutter&&shutters.includes(s.shutter))shutterIndex=shutters.indexOf(s.shutter);if(s.aperture!==undefined&&apertures.includes(+s.aperture))apertureIndex=apertures.indexOf(+s.aperture);if(s.iso!==undefined&&isos.includes(+s.iso))isoIndex=isos.indexOf(+s.iso);if(s.focalLength!==undefined&&lenses.includes(+s.focalLength))lensIndex=lenses.indexOf(+s.focalLength);if(s.focusDistance!==undefined)$("focusDistance").value=s.focusDistance;if(s.whiteBalance)$("whiteBalance").value=s.whiteBalance;if(s.pictureProfile)$("pictureProfile").value=s.pictureProfile;if(s.meteringMode)$("meteringMode").value=s.meteringMode;if(window.V5_PHASE3_SET_CONTROLS)window.V5_PHASE3_SET_CONTROLS(s);document.querySelectorAll(".scene-button").forEach((b,i)=>b.classList.toggle("active",Object.keys(sceneInfo)[i]===currentScene));updateReadouts()
}
function init(){
 buildCamera();buildScenes();$("fallback").hidden=true;
 $("frontView").onclick=()=>log("Front styling view selected");$("rearView").onclick=()=>log("Rear camera view selected");$("topView").onclick=()=>log("Top controls selected");$("resetView").onclick=()=>updateReadouts();
 $("afButton").onclick=autofocus;$("shutterUi").onclick=capture;$("menuUi").onclick=()=>log("Camera menu opened");$("playUi").onclick=()=>log("Playback opened");
 ["focusDistance","whiteBalance","pictureProfile","meteringMode"].forEach(id=>$(id)?.addEventListener("input",updateReadouts));
 updateReadouts();window.VIRTUAL_CAMERA_V5={getState:state,setState,autofocus,capture,rotateFront:d=>rotateWheel(d,"front"),rotateRear:d=>rotateWheel(d,"rear"),getSimulation:simulation};window.dispatchEvent(new Event("camera:v5-ready"));
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
