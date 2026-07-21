
(()=>{
const $=id=>document.getElementById(id);
const KEY="photographyCoursesCameraV6";
let latest=null,selectedPoint=22;
const assignments={
 portrait:{scene:"portrait",mode:"A",shutter:"1/250",aperture:2.8,iso:200,focalLength:85,focusDistance:42,whiteBalance:"daylight",pictureProfile:"portrait"},
 action:{scene:"cyclist",mode:"S",shutter:"1/1000",aperture:4,iso:800,focalLength:135,focusDistance:46,whiteBalance:"daylight",pictureProfile:"standard"},
 landscape:{scene:"landscape",mode:"A",shutter:"1/125",aperture:11,iso:100,focalLength:24,focusDistance:62,whiteBalance:"daylight",pictureProfile:"landscape"},
 night:{scene:"night",mode:"M",shutter:"1/30",aperture:2,iso:1600,focalLength:35,focusDistance:70,whiteBalance:"tungsten",pictureProfile:"neutral"}
};
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return{}}}
function save(){localStorage.setItem(KEY,JSON.stringify({
 afArea:$("v6AfArea").value,afSensitivity:$("v6AfSensitivity").value,zoom:$("v6Zoom").value,manualFocus:$("v6ManualFocus").value,peaking:$("v6Peaking").checked,
 weather:$("v6Weather").value,lightDirection:$("v6LightDirection").value,lightIntensity:$("v6LightIntensity").value,
 histogram:$("v6HistogramToggle").checked,grid:$("v6GridToggle").checked,highlight:$("v6HighlightToggle").checked,level:$("v6LevelToggle").checked,selectedPoint
}))}
function buildAf(){
 const g=$("v6AfGrid");g.innerHTML="";
 for(let i=0;i<45;i++){let b=document.createElement("button");b.className=i===selectedPoint?"active":"";b.title="AF point "+(i+1);b.onclick=()=>{selectedPoint=i;g.querySelectorAll("button").forEach((x,n)=>x.classList.toggle("active",n===i));$("v6AfLabel").textContent=`AF point ${i+1} selected`;save()};g.appendChild(b)}
}
function screen(){return document.querySelector(".dslr-screen")}
function overlays(){
 const s=screen();if(!s)return;
 s.classList.toggle("v6-grid-on",$("v6GridToggle").checked);
 s.querySelectorAll(".v6-histogram,.v6-highlight,.v6-level,.v6-peaking").forEach(x=>x.remove());
 if($("v6HistogramToggle").checked){let h=document.createElement("div");h.className="v6-histogram";for(let i=0;i<28;i++){let bar=document.createElement("i");bar.style.height=(10+Math.abs(Math.sin(i*.42))*42+Math.random()*8)+"px";h.appendChild(bar)}s.appendChild(h)}
 if($("v6HighlightToggle").checked){let x=document.createElement("div");x.className="v6-highlight";s.appendChild(x)}
 if($("v6LevelToggle").checked){let x=document.createElement("div");x.className="v6-level";s.appendChild(x)}
 if($("v6Peaking").checked){let x=document.createElement("div");x.className="v6-peaking";s.appendChild(x)}
}
function weather(){
 const img=$("bodyScreenImage"),live=$("liveImage");if(!img)return;
 const w=$("v6Weather").value,l=+$("v6LightIntensity").value/100,d=$("v6LightDirection").value;
 let f=`brightness(${l})`;
 if(w==="cloudy")f+=" saturate(.82) contrast(.92)";
 if(w==="mist")f+=" contrast(.72) brightness(1.12) saturate(.65)";
 if(w==="rain")f+=" brightness(.78) saturate(.72) contrast(1.08)";
 if(w==="golden")f+=" sepia(.22) saturate(1.22) brightness(1.06)";
 if(w==="blue")f+=" hue-rotate(185deg) saturate(.75) brightness(.72)";
 if(d==="back")f+=" contrast(1.18) brightness(.9)";
 if(d==="side")f+=" contrast(1.1)";
 [img,live].forEach(x=>{if(x)x.style.filter=f});
}
function apply(){
 $("v6ZoomOut").textContent=$("v6Zoom").value+"mm";$("v6FocusOut").textContent=$("v6ManualFocus").value+"%";
 window.VIRTUAL_CAMERA_V5?.setState({focalLength:+$("v6Zoom").value,focusDistance:+$("v6ManualFocus").value});
 overlays();weather();save()
}
function score(){
 if(!latest){$("v6CoachTitle").textContent="Take a photograph first";$("v6CoachText").textContent="Capture a photo with the virtual shutter, then analyse it.";return}
 const st=latest.state||{},sim=latest.simulation||{};let n=100,notes=[];
 const ev=Math.abs(sim.e||0);if(ev>.5){n-=Math.min(35,ev*14);notes.push(ev>1?"Exposure needs significant correction":"Fine-tune the exposure")}
 if((sim.focus||0)>.15){n-=25;notes.push("Focus accuracy needs improvement")}
 if((sim.motion||0)>.7){n-=18;notes.push("Use a faster shutter speed or embrace motion intentionally")}
 if(st.iso>=3200){n-=10;notes.push("High ISO is adding visible noise")}
 if(st.scene==="portrait"&&st.focalLength<70){n-=8;notes.push("A longer focal length would flatter the portrait")}
 if(st.scene==="landscape"&&st.aperture<8){n-=8;notes.push("A smaller aperture would increase landscape depth of field")}
 n=Math.max(0,Math.round(n));$("v6ShotScore").textContent=n;$("v6ShotScore").parentElement.style.setProperty("--score",n+"%");
 $("v6CoachTitle").textContent=n>=90?"Excellent photograph":n>=75?"Strong result":n>=60?"Good foundation":"Keep practising";
 $("v6CoachText").textContent=notes.length?notes.join(". ")+".":"Exposure, focus, motion and lens choice are all well controlled."
}
function animate(id){let el=$(id);if(!el)return;el.classList.add("v6-turn");setTimeout(()=>el.classList.remove("v6-turn"),180)}
function init(){
 const s=load();["v6AfArea","v6AfSensitivity","v6Zoom","v6ManualFocus","v6Weather","v6LightDirection","v6LightIntensity"].forEach(id=>{if(s[id.replace("v6","").replace(/^./,c=>c.toLowerCase())]!==undefined)$(id).value=s[id.replace("v6","").replace(/^./,c=>c.toLowerCase())]});
 if(s.selectedPoint!==undefined)selectedPoint=s.selectedPoint;
 [["v6Peaking","peaking"],["v6HistogramToggle","histogram"],["v6GridToggle","grid"],["v6HighlightToggle","highlight"],["v6LevelToggle","level"]].forEach(([id,k])=>{if(s[k]!==undefined)$(id).checked=s[k]});
 buildAf();
 ["v6AfArea","v6AfSensitivity","v6Zoom","v6ManualFocus","v6Peaking","v6Weather","v6LightDirection","v6LightIntensity","v6HistogramToggle","v6GridToggle","v6HighlightToggle","v6LevelToggle"].forEach(id=>$(id).addEventListener("input",apply));
 $("v6Analyse").onclick=score;
 document.querySelectorAll("[data-v6-assignment]").forEach(b=>b.onclick=()=>{let key=b.dataset.v6Assignment;window.VIRTUAL_CAMERA_V5?.setState(assignments[key]);$("v6AssignmentText").textContent=`${b.textContent} settings loaded. Adjust them and take a photograph.`});
 window.addEventListener("camera:capture",e=>{latest=e.detail;$("v6CoachTitle").textContent="Photograph captured";$("v6CoachText").textContent="Select Analyse latest photo for professional feedback."});
 $("bodyWheel")?.addEventListener("click",()=>animate("bodyWheel"));$("bodyRearDial")?.addEventListener("click",()=>animate("bodyRearDial"));$("bodyMode")?.addEventListener("click",()=>animate("bodyMode"));
 apply();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
