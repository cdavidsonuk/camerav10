
(()=>{
const $=id=>document.getElementById(id);
const apertures=[1.8,2.8,4,5.6,8,11,16,22,32,36];
const shutters=["1/8000","1/4000","1/2000","1/1000","1/500","1/250","1/125","1/60","1/30","1/15","1/8","1/4","1/2","1s"];
const isos=[100,200,400,800,1600,3200,6400,12800,25600];
const modes=["M","A","S","P"];
const scenes=[
 {key:"landscape",name:"Mountain Lake",type:"Landscape",objective:"Sharp landscape",text:"Use a small aperture, low ISO and accurate focus.",checks:["Use f/8 to f/16","Keep ISO at 100 or 200","Hold a safe shutter speed"],setup:{mode:"M",shutter:"1/125",aperture:11,iso:100,focalLength:24}},
 {key:"portrait",name:"Portrait Studio",type:"People",objective:"Professional portrait",text:"Focus on the eyes and separate the subject from the background.",checks:["Use f/1.8 to f/4","Choose 70–135mm","Focus accurately"],setup:{mode:"A",shutter:"1/250",aperture:2.8,iso:200,focalLength:85}},
 {key:"waterfall",name:"Waterfall",type:"Long exposure",objective:"Silky moving water",text:"Use a slow shutter while protecting the highlights.",checks:["Use 1/4s or slower","Keep ISO low","Use a stable camera"],setup:{mode:"S",shutter:"1/4",aperture:11,iso:100,focalLength:35}},
 {key:"cyclist",name:"Cyclist",type:"Action / Sports",objective:"Freeze fast action",text:"Track the subject and choose a shutter speed that stops movement.",checks:["Use 1/1000 or faster","Use tracking AF","Raise ISO when required"],setup:{mode:"S",shutter:"1/1000",aperture:4,iso:800,focalLength:135}},
 {key:"night",name:"Night City",type:"Low light",objective:"Clean night photograph",text:"Balance shutter speed, aperture and noise in low light.",checks:["Use a wide aperture","Avoid camera shake","Control high-ISO noise"],setup:{mode:"M",shutter:"1/30",aperture:2.8,iso:1600,focalLength:35}},
 {key:"wildlife",name:"Wildlife",type:"Birds",objective:"Wildlife action",text:"Use a long lens and continuous tracking for unpredictable movement.",checks:["Use 1/1600 or faster","Choose 135–200mm","Use tracking AF"],setup:{mode:"S",shutter:"1/2000",aperture:4,iso:800,focalLength:200}}
];
let state={scene:"landscape",mode:"M",aperture:5.6,shutter:"1/125",iso:200,focalLength:50,whiteBalance:"auto",afMode:"single",focused:false,xp:0,sound:true};
let audioCtx;
const legacy=()=>window.VIRTUAL_CAMERA_V5;
function sceneImage(){
 const src=$("liveImage")?.src||$("bodyScreenImage")?.src;
 if(src && $("v7SceneImage").src!==src)$("v7SceneImage").src=src;
}
function tone(freq=600,dur=.035,vol=.025){
 if(!state.sound)return;
 try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur)}catch{}
}
function setCamera(patch){
 state={...state,...patch};
 legacy()?.setState?.(patch);
 render();
}
function ev(){
 const target={landscape:14,portrait:12,waterfall:13,cyclist:13,night:8,wildlife:13}[state.scene]||12;
 const sec=state.shutter.endsWith("s")?parseFloat(state.shutter):(()=>{const p=state.shutter.split("/");return +p[0]/+p[1]})();
 const exposure=Math.log2((state.aperture*state.aperture)/sec)-Math.log2(state.iso/100);
 return target-exposure;
}
function render(){
 $("v7ModeDialLabel").textContent=$("v7TopMode").textContent=$("v7LcdMode").textContent=state.mode;
 $("v7TopShutter").textContent=$("v7LcdShutter").textContent=$("v7ShutterValue").textContent=$("v7SideShutter").textContent=state.shutter;
 const f="F"+state.aperture;$("v7TopAperture").textContent=$("v7LcdAperture").textContent=f;$("v7ApertureValue").textContent=$("v7SideAperture").textContent="f/"+state.aperture;
 $("v7TopIso").textContent=$("v7LcdIso").textContent="ISO "+state.iso;$("v7IsoValue").textContent=$("v7SideIso").textContent=state.iso;
 $("v7LcdFocal").textContent=$("v7SideFocal").textContent=state.focalLength+"mm";
 $("v7Modes").querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.value===state.mode));
 const e=Math.max(-3,Math.min(3,ev()));
 $("v7MeterNeedle").style.left=((e+3)/6*100)+"%";
 const image=$("v7SceneImage"),shade=$("v7LcdShade");
 shade.style.opacity=Math.max(0,Math.min(.72,-e*.13));
 const blur=Math.max(0,(state.aperture-4)*.08);
 image.style.filter=`brightness(${Math.max(.42,Math.min(1.6,1+e*.15))}) saturate(${state.whiteBalance==="cloudy"?1.15:state.whiteBalance==="tungsten"?.78:1}) blur(${state.focused?0:Math.min(2.2,blur+.7)}px)`;
 image.style.transform=`scale(${1+(state.focalLength-24)/500})`;
 $("v7GridLines").style.display=$("v7GridToggle").checked?"block":"none";
 $("v7Histogram").style.display=$("v7HistogramToggle").checked?"block":"none";
 drawHistogram(e);
 updateChecklist();
}
function drawHistogram(e){
 const c=$("v7Histogram"),x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.fillStyle="rgba(0,0,0,.55)";x.fillRect(0,0,w,h);
 const centre=Math.max(.08,Math.min(.92,.5+e*.11));for(let i=0;i<48;i++){let p=i/47;let y=Math.exp(-Math.pow((p-centre)*5,2))*55+Math.random()*9;x.fillStyle=`rgba(${80+Math.round(p*140)},${120+Math.round((1-p)*90)},255,.8)`;x.fillRect(i*w/48,h-y,w/48-1,y)}
}
function updateChecklist(){
 const s=scenes.find(x=>x.key===state.scene)||scenes[0];$("v7ObjectiveTitle").textContent=s.objective;$("v7ObjectiveText").textContent=s.text;
 const checks=[
  state.scene==="landscape"?state.aperture>=8:state.scene==="portrait"?state.aperture<=4:state.scene==="cyclist"||state.scene==="wildlife"?shutters.indexOf(state.shutter)<=3:true,
  state.scene==="landscape"||state.scene==="waterfall"?state.iso<=200:state.focalLength>=35,
  Math.abs(ev())<1.2
 ];
 $("v7Checklist").innerHTML=s.checks.map((t,i)=>`<li class="${checks[i]?"done":""}">${t}</li>`).join("");
}
function buildScenes(){
 const list=$("v7SceneList");list.innerHTML="";
 scenes.forEach(s=>{const b=document.createElement("button");b.className="v7-scene"+(s.key===state.scene?" active":"");b.innerHTML=`<img alt="" src=""><span><strong>${s.name}</strong><small>${s.type}</small></span>`;b.onclick=()=>{state.scene=s.key;state.focused=false;setCamera({...s.setup,scene:s.key});document.querySelectorAll(".v7-scene").forEach(x=>x.classList.toggle("active",x===b));setTimeout(()=>{sceneImage();b.querySelector("img").src=$("v7SceneImage").src},100)};list.appendChild(b)});
 setTimeout(()=>list.querySelectorAll("img").forEach(img=>img.src=$("v7SceneImage").src),250);
}
function autofocus(){
 state.focused=false;$("v7FocusField").classList.remove("locked");tone(420,.05);$("v7Tip").textContent="Focusing…";
 setTimeout(()=>{state.focused=true;$("v7FocusField").classList.add("locked");tone(880,.08);$("v7Tip").textContent="Focus locked. Fully press the shutter to take the photograph.";legacy()?.autofocus?.();render()},420);
}
function evaluate(){
 const notes=[];let score=100,e=Math.abs(ev());
 if(e>.5){score-=Math.min(35,Math.round(e*16));notes.push(e>1.4?"Exposure is significantly off. Bring the meter closer to zero.":"Fine-tune the exposure toward the centre of the meter.")}
 if(!state.focused){score-=24;notes.push("Focus was not locked before capture. Half-press AF-ON first.")}
 if(state.scene==="portrait"&&state.aperture>4){score-=10;notes.push("Use a wider aperture for stronger subject separation.")}
 if((state.scene==="cyclist"||state.scene==="wildlife")&&shutters.indexOf(state.shutter)>3){score-=18;notes.push("The shutter speed is too slow for fast action.")}
 if(state.scene==="landscape"&&state.aperture<8){score-=10;notes.push("Use f/8–f/16 for deeper landscape sharpness.")}
 if(state.iso>=6400){score-=9;notes.push("High ISO will create visible noise.")}
 score=Math.max(0,Math.round(score));
 return {score,notes:notes.length?notes:["Excellent control of exposure, focus and creative settings."]};
}
function capture(){
 tone(180,.03,.05);setTimeout(()=>tone(95,.06,.05),38);legacy()?.capture?.();
 const flash=$("v7Flash");flash.animate([{opacity:0},{opacity:.82},{opacity:0}],{duration:210});
 const result=evaluate();state.xp+=Math.max(10,Math.round(result.score/5));save();
 $("v7ReviewImage").src=$("v7SceneImage").src;$("v7ReviewScore").textContent=result.score+"%";$("v7ReviewBar").style.width=result.score+"%";
 $("v7ReviewTitle").textContent=result.score>=90?"Excellent photograph":result.score>=75?"Strong result":result.score>=60?"Good foundation":"Try the shot again";
 $("v7ReviewText").textContent=result.score>=80?"Your technical choices are working well. Review the notes below before moving on.":"The photograph has potential, but one or more technical settings need attention.";
 $("v7ReviewNotes").innerHTML=result.notes.map(n=>`<li>${n}</li>`).join("");updateXp();$("v7ReviewDialog").showModal();
}
function updateXp(){const level=Math.floor(state.xp/500)+1,inside=state.xp%500;$("v7Level").textContent=level;$("v7Xp").textContent=state.xp+" XP";$("v7XpBar").style.width=(inside/500*100)+"%"}
function save(){localStorage.setItem("photographyCoursesV7",JSON.stringify(state))}
function restore(){try{state={...state,...JSON.parse(localStorage.getItem("photographyCoursesV7")||"{}")}}catch{}}
function init(){
 document.body.classList.add("v7-active");restore();
 setTimeout(()=>{sceneImage();buildScenes();render()},220);
 $("v7Aperture").value=Math.max(0,apertures.indexOf(state.aperture));$("v7ShutterSpeed").value=Math.max(0,shutters.indexOf(state.shutter));$("v7Iso").value=Math.max(0,isos.indexOf(state.iso));$("v7Focal").value=state.focalLength;
 $("v7Modes").onclick=e=>{if(e.target.dataset.value)setCamera({mode:e.target.dataset.value})};
 $("v7ModeDial").onclick=()=>{let i=(modes.indexOf(state.mode)+1)%modes.length;setCamera({mode:modes[i]});tone(300)};
 $("v7Aperture").oninput=e=>setCamera({aperture:apertures[+e.target.value]});
 $("v7ShutterSpeed").oninput=e=>setCamera({shutter:shutters[+e.target.value]});
 $("v7Iso").oninput=e=>setCamera({iso:isos[+e.target.value]});
 $("v7Focal").oninput=e=>setCamera({focalLength:+e.target.value});
 $("v7WhiteBalance").onchange=e=>setCamera({whiteBalance:e.target.value});
 $("v7AfMode").onchange=e=>setCamera({afMode:e.target.value});
 $("v7GridToggle").onchange=render;$("v7HistogramToggle").onchange=render;
 $("v7AfOn").onclick=autofocus;$("v7Shutter").onmousedown=autofocus;$("v7Shutter").onmouseup=capture;$("v7CaptureButton").onclick=capture;
 $("v7Lcd").onclick=e=>{const r=e.currentTarget.getBoundingClientRect();$("v7FocusField").style.left=((e.clientX-r.left)/r.width*100)+"%";$("v7FocusField").style.top=((e.clientY-r.top)/r.height*100)+"%";state.focused=false;$("v7FocusField").classList.remove("locked")};
 $("v7Reset").onclick=()=>{state={...state,mode:"M",aperture:5.6,shutter:"1/125",iso:200,focalLength:50,focused:false};render()};
 $("v7PlaybackButton").onclick=()=>$("v7ReviewDialog").showModal();$("v7CloseReview").onclick=$("v7TryAgain").onclick=()=>$("v7ReviewDialog").close();
 $("v7SoundToggle").onclick=()=>{state.sound=!state.sound;$("v7SoundToggle").textContent=state.sound?"Sound on":"Sound off";save()};
 $("v7Fullscreen").onclick=()=>document.fullscreenElement?document.exitFullscreen():$("v7App").requestFullscreen();
 $("v7LegacyToggle").onclick=()=>document.body.classList.add("v7-show-legacy");
 $("v7CollapseScenes").onclick=()=>{document.querySelector(".v7-scenes").classList.toggle("collapsed");document.querySelector(".v7-workspace").classList.toggle("scenes-collapsed")};
 $("v7CollapseSettings").onclick=()=>{document.querySelector(".v7-settings").classList.toggle("collapsed");document.querySelector(".v7-workspace").classList.toggle("settings-collapsed")};
 document.querySelectorAll("[data-v7-delta]").forEach(b=>b.onclick=()=>{let i=apertures.indexOf(state.aperture)+ +b.dataset.v7Delta;i=Math.max(0,Math.min(apertures.length-1,i));setCamera({aperture:apertures[i]});$("v7Aperture").value=i;tone(260)});
 ["v7ApertureKnob","v7ShutterKnob","v7IsoKnob"].forEach((id,n)=>$(id).onclick=()=>{const controls=[$("v7Aperture"),$("v7ShutterSpeed"),$("v7Iso")],c=controls[n];c.value=(+c.value+1)%(+c.max+1);c.dispatchEvent(new Event("input"));tone(260)});
 window.addEventListener("camera:state",()=>{sceneImage()});window.addEventListener("camera:render",()=>sceneImage());
 updateXp();render();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
