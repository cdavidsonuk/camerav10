
(()=>{
const $=id=>document.getElementById(id);
const lessons={
 mode:{title:"Mode Dial",text:"Selects how the camera controls exposure. Manual gives full control; Aperture and Shutter priority automate one setting."},
 shutter:{title:"Shutter Button",text:"Half-press to focus and meter. Fully press to take the photograph."},
 af:{title:"AF-ON",text:"Separates focusing from the shutter button. This is called back-button focus and is popular with action photographers."},
 menu:{title:"MENU Button",text:"Opens the camera settings menu for drive mode, metering, white balance and display options."},
 info:{title:"INFO Button",text:"Cycles shooting information and overlays on the live-view display."},
 wheel:{title:"Rear Command Wheel",text:"Changes a selected setting and navigates camera menus."},
 lcd:{title:"Rear LCD",text:"Shows live view, exposure information, autofocus point, histogram and captured photographs."}
};
let active=false;
function addHotspot(parent,cls,style,key){
 const el=document.createElement("button");
 el.className=`v14-control-hotspot ${cls}`;
 el.style.cssText=style;
 el.title=lessons[key].title;
 el.onclick=e=>{e.stopPropagation();showLesson(key)};
 parent.appendChild(el);
 return el;
}
function showLesson(key){
 const l=lessons[key];
 $("v14ExplorerContent").innerHTML=`<span class="v14-label">CAMERA CONTROL</span><h2>${l.title}</h2><p>${l.text}</p><button id="v14TryControl">Try this control</button>`;
 $("v14TryControl").onclick=()=>{document.querySelector(".v14-explorer-panel").classList.remove("open")};
}
function toggle(){
 active=!active;
 document.querySelectorAll(".v14-control-hotspot").forEach(x=>x.classList.toggle("hidden",!active));
 $("v14ExplorerPanel").classList.toggle("open",active);
 $("v14ExplorerPanel").setAttribute("aria-hidden",String(!active));
 $("v14ExplorerToggle").textContent=active?"Exit Explorer":"Explore Camera";
}
function init(){
 document.body.classList.add("v14-active");
 const shell=document.querySelector(".v11-camera-shell");
 if(shell){
  addHotspot(shell,"","left:40px;top:24px;width:82px;height:82px;background:transparent","mode");
  addHotspot(shell,"","right:42px;top:18px;width:76px;height:76px;background:transparent","shutter");
  addHotspot(shell,"","right:38px;top:170px;width:80px;height:48px;background:transparent;border-radius:25px","af");
  addHotspot(shell,"","left:28px;top:166px;width:80px;height:48px;background:transparent;border-radius:25px","menu");
  addHotspot(shell,"","left:28px;top:232px;width:80px;height:48px;background:transparent;border-radius:25px","info");
  addHotspot(shell,"","right:28px;top:250px;width:112px;height:112px;background:transparent","wheel");
  addHotspot(shell,"","left:150px;right:150px;top:118px;bottom:98px;border-radius:18px;background:transparent","lcd");
 }
 $("v14ExplorerToggle").onclick=toggle;
 $("v14ExplorerClose").onclick=toggle;
 document.querySelectorAll(".v14-control-hotspot").forEach(x=>x.classList.add("hidden"));
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
