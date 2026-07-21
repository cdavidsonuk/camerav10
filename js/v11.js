
(()=>{
const $=id=>document.getElementById(id);
const shutters=["1/4000","1/2000","1/1000","1/500","1/250","1/125","1/60","1/30","1/15","1/8","1/4","1/2","1s","2s","4s"];
const shutterSeconds={"1/4000":1/4000,"1/2000":1/2000,"1/1000":1/1000,"1/500":1/500,"1/250":1/250,"1/125":1/125,"1/60":1/60,"1/30":1/30,"1/15":1/15,"1/8":1/8,"1/4":1/4,"1/2":1/2,"1s":1,"2s":2,"4s":4};
const apertures=[1.4,2,2.8,4,5.6,8,11,16,22];
const isos=[100,200,400,800,1600,3200,6400,12800];
const scenes=[
{id:"landscape",name:"Mountain Lake",type:"Landscape",img:"assets/scenes/mountain-lake.svg",objective:"Sharp Landscape",text:"Use a small aperture, low ISO and accurate focus.",checks:["Use f/8 to f/16","Keep ISO at 100 or 200","Hold a safe shutter speed"],ideal:{ap:[8,16],iso:[100,200],shutter:[1/250,4],af:"AF-S",focus:[35,70]}},
{id:"portrait",name:"Portrait Studio",type:"People",img:"assets/scenes/portrait-studio.svg",objective:"Portrait with separation",text:"Focus on the eyes and soften the background.",checks:["Use f/1.4 to f/4","Use 50–100mm","Lock focus before capture"],ideal:{ap:[1.4,4],iso:[100,800],shutter:[1/125,1/2000],af:"AF-S",focus:[40,65]}},
{id:"waterfall",name:"Waterfall",type:"Long exposure",img:"assets/scenes/waterfall.svg",objective:"Silky Water",text:"Use a slow shutter speed while protecting highlights.",checks:["Use 1/4s or slower","Keep ISO low","Use a small aperture"],ideal:{ap:[8,22],iso:[100,200],shutter:[.25,4],af:"AF-S",focus:[30,75]}},
{id:"cyclist",name:"Cyclist",type:"Action / Sports",img:"assets/scenes/cyclist.svg",objective:"Freeze the Action",text:"Use continuous autofocus and a fast shutter.",checks:["Use 1/1000s or faster","Use AF-C or tracking","Use enough ISO for exposure"],ideal:{ap:[2.8,8],iso:[400,3200],shutter:[1/4000,1/1000],af:"AF-C",focus:[25,80]}},
{id:"night",name:"Night City",type:"Low light",img:"assets/scenes/night-city.svg",objective:"Clean Night Photograph",text:"Balance shutter speed, aperture and ISO without clipping lights.",checks:["Use a wide aperture","Avoid excessive ISO","Protect bright highlights"],ideal:{ap:[1.4,5.6],iso:[400,3200],shutter:[1/60,1],af:"AF-S",focus:[25,80]}},
{id:"wildlife",name:"Wildlife",type:"Birds",img:"assets/scenes/wildlife.svg",objective:"Bird in Flight",text:"Track the subject with a long lens and fast shutter.",checks:["Use 1/1600s or faster","Use AF-C / Tracking","Use 135–200mm"],ideal:{ap:[2.8,8],iso:[400,6400],shutter:[1/4000,1/1000],af:"AF-C",focus:[15,90]}}
];
let state={scene:"landscape",mode:"M",shutter:"1/125",aperture:5.6,iso:100,ev:0,af:"AF-S",area:"Single point",focal:50,focusDistance:50,time:"day",weather:"Cloudy",focused:false,lastShot:null};
const exposureBias={landscape:0,portrait:.4,waterfall:-1,cyclist:2,night:-3,wildlife:1.5};
function scene(){return scenes.find(s=>s.id===state.scene)}
function setupOptions(){
 $("v11ShutterSelect").innerHTML=shutters.map(v=>`<option>${v}</option>`).join("");
 $("v11ApertureSelect").innerHTML=apertures.map(v=>`<option value="${v}">f/${v}</option>`).join("");
 $("v11IsoSelect").innerHTML=isos.map(v=>`<option value="${v}">ISO ${v}</option>`).join("");
}
function renderScenes(){
 $("v11SceneList").innerHTML=scenes.map(s=>`<button class="v11-scene-card ${s.id===state.scene?"active":""}" data-scene="${s.id}"><img src="${s.img}" alt=""><span><strong>${s.name}</strong><span>${s.type}</span></span></button>`).join("");
 document.querySelectorAll("[data-scene]").forEach(b=>b.onclick=()=>{state.scene=b.dataset.scene;state.focused=false;renderAll()});
}
function renderObjective(){
 const s=scene();$("v11ObjectiveTitle").textContent=s.objective;$("v11ObjectiveText").textContent=s.text;
 const results=objectiveChecks();$("v11ObjectiveList").innerHTML=s.checks.map((c,i)=>`<li class="${results[i]?"met":""}">${results[i]?"✓":"○"} ${c}</li>`).join("");
}
function objectiveChecks(){
 const s=scene(),sec=shutterSeconds[state.shutter],f=state.focal;
 if(s.id==="landscape")return [state.aperture>=8&&state.aperture<=16,state.iso<=200,sec<=1/30];
 if(s.id==="portrait")return [state.aperture<=4,f>=50&&f<=100,state.focused];
 if(s.id==="waterfall")return [sec>=.25,state.iso<=200,state.aperture>=8];
 if(s.id==="cyclist")return [sec<=1/1000,state.af==="AF-C"||state.area==="Tracking",state.iso>=400];
 if(s.id==="night")return [state.aperture<=5.6,state.iso<=3200,exposureValue()<=1];
 return [sec<=1/1000,state.af==="AF-C"||state.area==="Tracking",f>=135];
}
function exposureValue(){
 const sec=shutterSeconds[state.shutter];
 const value=Math.log2((state.aperture*state.aperture)/sec)-Math.log2(state.iso/100);
 const target=11+exposureBias[state.scene]+(state.time==="night"?-3:state.time==="golden"?-1:state.time==="blue"?-2:0);
 return Math.max(-3,Math.min(3,(target-value)+state.ev));
}
function coach(){
 const ev=exposureValue(),s=scene(),sec=shutterSeconds[state.shutter];
 let msg="";
 if(ev>1.2)msg="The photograph is likely too bright. Use a faster shutter, smaller aperture or lower ISO.";
 else if(ev<-1.2)msg="The photograph is likely too dark. Use a slower shutter, wider aperture or higher ISO.";
 else if((s.id==="cyclist"||s.id==="wildlife")&&sec>1/1000)msg="Your shutter speed is too slow for fast action. Try 1/1000s or faster.";
 else if(s.id==="portrait"&&state.aperture>4)msg="Open the aperture to soften the background and separate the subject.";
 else if(s.id==="waterfall"&&sec<.25)msg="Use a slower shutter speed to smooth the moving water.";
 else if(!state.focused)msg="Settings look promising. Lock focus before taking the photograph.";
 else msg="Strong setup. Take the photograph and review the instructor score.";
 $("v11CoachText").textContent=msg;
}
function updateExposure(){
 const ev=exposureValue(),pct=(ev+3)/6*100;$("v11MeterNeedle").style.left=`${pct}%`;
 $("v11ExposureStatus").textContent=Math.abs(ev)<.6?"Balanced":ev>0?"Overexposed":"Underexposed";
 const img=$("v11SceneImage");img.style.filter=`brightness(${Math.pow(2,ev*.28)}) saturate(${state.time==="golden"?1.18:state.time==="blue"?.82:1}) contrast(${1+Math.abs(ev)*.035})`;
 $("v11ZebraOverlay").style.opacity=ev>1?Math.min(.65,ev/3):.08;
}
function renderAll(){
 const s=scene();renderScenes();renderObjective();
 $("v11SceneImage").src=s.img;$("v11SceneImage").style.transform=`scale(${1+(state.focal-16)/650})`;
 $("v11ModeDialText").textContent=state.mode;$("v11LcdMode").textContent=state.mode;
 $("v11LcdShutter").textContent=state.shutter;$("v11LcdAperture").textContent=`F${state.aperture}`;$("v11LcdIso").textContent=`ISO ${state.iso}`;
 $("v11ShutterSelect").value=state.shutter;$("v11ApertureSelect").value=String(state.aperture);$("v11IsoSelect").value=String(state.iso);$("v11ExposureComp").value=state.ev;$("v11ExposureCompOut").textContent=`${state.ev>0?"+":""}${state.ev.toFixed(1)} EV`;
 $("v11AfMode").value=state.af;$("v11AfArea").value=state.area;$("v11LcdAf").textContent=state.af;$("v11FocusPill").textContent=state.af;
 $("v11FocalLength").value=state.focal;$("v11FocalLengthOut").textContent=`${state.focal}mm`;
 $("v11FocusDistance").value=state.focusDistance;$("v11FocusDistanceOut").textContent=`${(state.focusDistance/10).toFixed(1)}m`;
 $("v11TimeSelect").value=state.time;$("v11WeatherSelect").value=state.weather;$("v11WeatherPill").textContent=state.weather;$("v11LightStatus").textContent=state.time[0].toUpperCase()+state.time.slice(1);
 $("v11FocusBox").classList.toggle("locked",state.focused);$("v11FocusStatus").textContent=state.focused?"Locked":"Ready";
 document.querySelectorAll("[data-v11-mode]").forEach(b=>b.classList.toggle("active",b.dataset.v11Mode===state.mode));
 const tint=$("v11SceneTint");tint.style.background=state.time==="golden"?"rgba(255,145,50,.2)":state.time==="blue"?"rgba(40,100,190,.25)":state.time==="night"?"rgba(0,20,70,.45)":"transparent";
 updateExposure();coach();
}
function focus(){state.focused=true;$("v11FocusBox").classList.add("locked");$("v11FocusStatus").textContent="Locked";$("v11CoachText").textContent="Focus locked. Press the shutter when ready."}
function scoreShot(){
 const s=scene(),sec=shutterSeconds[state.shutter],ev=Math.abs(exposureValue());
 const exposure=Math.max(0,100-Math.round(ev*28));
 const focusScore=state.focused?92:(state.af==="MF"?70:42);
 let settings=40;
 const apok=state.aperture>=s.ideal.ap[0]&&state.aperture<=s.ideal.ap[1],isook=state.iso>=s.ideal.iso[0]&&state.iso<=s.ideal.iso[1],shok=sec>=Math.min(...s.ideal.shutter)&&sec<=Math.max(...s.ideal.shutter),afok=state.af===s.ideal.af||(s.ideal.af==="AF-C"&&state.area==="Tracking");
 settings=25+[apok,isook,shok,afok].filter(Boolean).length*18;
 const composition=72+Math.round((state.focal>=s.ideal.focus[0]&&state.focal<=s.ideal.focus[1]?15:0));
 const total=Math.round(exposure*.32+focusScore*.25+settings*.28+composition*.15);
 return {total:Math.min(100,total),exposure,focus:focusScore,settings:Math.min(100,settings),composition:Math.min(100,composition)};
}
function capture(){
 $("v11CaptureFlash").classList.remove("fire");void $("v11CaptureFlash").offsetWidth;$("v11CaptureFlash").classList.add("fire");
 const score=scoreShot();state.lastShot={...score,scene:state.scene,image:$("v11SceneImage").src};
 setTimeout(()=>showReview(),260);
}
function showReview(){
 if(!state.lastShot)return;const r=state.lastShot;
 $("v11ReviewImage").src=r.image;$("v11Score").textContent=r.total;
 $("v11ReviewTitle").textContent=r.total>=85?"Excellent camera control":r.total>=70?"Good result with room to improve":"Review your settings and try again";
 const weakest=Object.entries({Exposure:r.exposure,Focus:r.focus,Settings:r.settings,Composition:r.composition}).sort((a,b)=>a[1]-b[1])[0];
 $("v11ReviewFeedback").textContent=`Your strongest areas are reflected in the score. The main improvement area is ${weakest[0].toLowerCase()}. Adjust that part of the setup and repeat the shot.`;
 $("v11ScoreBreakdown").innerHTML=[["Exposure",r.exposure],["Focus",r.focus],["Camera settings",r.settings],["Composition",r.composition]].map(([n,v])=>`<span>${n}<b>${v}%</b></span>`).join("");
 $("v11ReviewDialog").showModal();
}
function reset(){state={...state,shutter:"1/125",aperture:5.6,iso:100,ev:0,af:"AF-S",area:"Single point",focal:50,focusDistance:50,time:"day",weather:"Cloudy",focused:false};renderAll()}
function init(){
 document.body.classList.add("v11-active");document.body.classList.remove("v10-active","v9-active","v8-active");
 setupOptions();renderAll();
 $("v11ShutterSelect").onchange=e=>{state.shutter=e.target.value;state.focused=false;renderAll()};
 $("v11ApertureSelect").onchange=e=>{state.aperture=+e.target.value;renderAll()};
 $("v11IsoSelect").onchange=e=>{state.iso=+e.target.value;renderAll()};
 $("v11ExposureComp").oninput=e=>{state.ev=+e.target.value;renderAll()};
 $("v11AfMode").onchange=e=>{state.af=e.target.value;state.focused=false;renderAll()};
 $("v11AfArea").onchange=e=>{state.area=e.target.value;renderAll()};
 $("v11FocalLength").oninput=e=>{state.focal=+e.target.value;renderAll()};
 $("v11FocusDistance").oninput=e=>{state.focusDistance=+e.target.value;renderAll()};
 $("v11TimeSelect").onchange=e=>{state.time=e.target.value;renderAll()};
 $("v11WeatherSelect").onchange=e=>{state.weather=e.target.value;renderAll()};
 document.querySelectorAll("[data-v11-mode]").forEach(b=>b.onclick=()=>{state.mode=b.dataset.v11Mode;renderAll()});
 $("v11GridToggle").onchange=e=>$("v11GridOverlay").style.display=e.target.checked?"block":"none";
 $("v11HistogramToggle").onchange=e=>$("v11Histogram").style.display=e.target.checked?"flex":"none";
 $("v11PeakingToggle").onchange=e=>$("v11FocusPeaking").style.display=e.target.checked?"block":"none";
 $("v11ZebraToggle").onchange=e=>$("v11ZebraOverlay").style.display=e.target.checked?"block":"none";
 $("v11Lcd").onclick=e=>{const r=$("v11Lcd").getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;$("v11FocusBox").style.left=`${x}%`;$("v11FocusBox").style.top=`${y}%`;state.focused=false;renderAll()};
 ["v11HalfPress","v11AfOn"].forEach(id=>$(id).onclick=focus);
 ["v11Shutter","v11TakePhoto"].forEach(id=>$(id).onclick=capture);
 $("v11ReviewShot").onclick=showReview;$("v11ResetCamera").onclick=reset;
 $("v11CloseReview").onclick=$("v11RetryShot").onclick=()=>$("v11ReviewDialog").close();
 $("v11Help").onclick=()=>$("v11HelpDialog").showModal();$("v11CloseHelp").onclick=()=>$("v11HelpDialog").close();
 $("v11Fullscreen").onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
 $("v11Home").onclick=()=>{document.body.classList.add("v11-show-v10","v10-active")};
 $("v11Academy").onclick=()=>{document.body.classList.add("v11-show-v8","v8-active")};
 $("v11Lab").onclick=()=>{document.body.classList.add("v11-show-v9","v9-active")};
 document.addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();capture()}if(e.key.toLowerCase()==="f")focus()});
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
