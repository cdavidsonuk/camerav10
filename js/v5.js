
(() => {
  const presets = {
    portrait: {scene:"portrait",mode:"A",shutter:"1/250",aperture:2.8,iso:200,focalLength:85,focusDistance:42,whiteBalance:"daylight",pictureProfile:"portrait"},
    action: {scene:"cyclist",mode:"S",shutter:"1/1000",aperture:4,iso:800,focalLength:135,focusDistance:46,whiteBalance:"daylight",pictureProfile:"standard"},
    night: {scene:"night",mode:"M",shutter:"1/30",aperture:2,iso:1600,focalLength:35,focusDistance:70,whiteBalance:"tungsten",pictureProfile:"neutral"}
  };
  let selectedFocusPoint = 12;

  const $ = id => document.getElementById(id);
  const status = message => {
    if ($("v5Status")) $("v5Status").textContent = message;
  };
  const withCamera = callback => {
    if (window.VIRTUAL_CAMERA_V5) callback(window.VIRTUAL_CAMERA_V5);
    else window.addEventListener("camera:v5-ready", () => callback(window.VIRTUAL_CAMERA_V5), {once:true});
  };

  function buildFocusGrid(){
    const grid = $("v5FocusGrid");
    if (!grid) return;
    for(let i=0;i<25;i++){
      const button=document.createElement("button");
      button.className="v5-focus-point"+(i===selectedFocusPoint?" active":"");
      button.type="button";
      button.setAttribute("aria-label",`Focus point ${i+1}`);
      button.addEventListener("click",()=>{
        selectedFocusPoint=i;
        grid.querySelectorAll("button").forEach((b,n)=>b.classList.toggle("active",n===i));
        const row=Math.floor(i/5)+1,col=i%5+1;
        $("v5FocusLabel").textContent=`Focus point row ${row}, column ${col} selected`;
        const marker=document.getElementById("focusMarker");
        if(marker){
          marker.style.left=`${18+col*13}%`;
          marker.style.top=`${17+row*11}%`;
        }
        status("Focus point moved");
      });
      grid.appendChild(button);
    }
  }

  function init(){
    buildFocusGrid();

    document.querySelectorAll("[data-v5-preset]").forEach(button=>{
      button.addEventListener("click",()=>withCamera(camera=>{
        const key=button.dataset.v5Preset;
        camera.setState(presets[key]);
        status(`${button.querySelector("strong").textContent} assignment loaded`);
      }));
    });

    $("v5HalfPress")?.addEventListener("click",()=>withCamera(camera=>{
      $("v5AfLock").classList.remove("locked");
      $("v5AeLock").classList.remove("locked");
      status("Focusing and metering…");
      camera.autofocus();
    }));

    $("v5FullPress")?.addEventListener("click",()=>withCamera(camera=>{
      camera.capture();
      status("Photograph captured");
    }));

    window.addEventListener("camera:autofocus", event=>{
      $("v5AfLock")?.classList.add("locked");
      $("v5AeLock")?.classList.add("locked");
      if($("v5AfLock")) $("v5AfLock").textContent="AF LOCK";
      if($("v5AeLock")) $("v5AeLock").textContent=`AE ${event.detail.ev>=0?"+":""}${event.detail.ev.toFixed(1)} EV`;
      status("Focus and exposure locked");
    });

    $("v5SaveSetup")?.addEventListener("click",()=>withCamera(camera=>{
      const payload={...camera.getState(),focusPoint:selectedFocusPoint,savedAt:new Date().toISOString()};
      localStorage.setItem("photographyCoursesCameraV5",JSON.stringify(payload));
      $("v5StorageMessage").textContent="Current camera setup saved in this browser.";
      status("Setup saved");
    }));

    $("v5LoadSetup")?.addEventListener("click",()=>withCamera(camera=>{
      try{
        const saved=JSON.parse(localStorage.getItem("photographyCoursesCameraV5")||"null");
        if(!saved) throw new Error("empty");
        camera.setState(saved);
        selectedFocusPoint=Number.isInteger(saved.focusPoint)?saved.focusPoint:12;
        document.querySelectorAll(".v5-focus-point").forEach((b,n)=>b.classList.toggle("active",n===selectedFocusPoint));
        $("v5StorageMessage").textContent="Saved setup restored.";
        status("Saved setup loaded");
      }catch{
        $("v5StorageMessage").textContent="There is no saved setup on this device yet.";
        status("No saved setup found");
      }
    }));
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
