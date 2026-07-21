
(() => {
  const $ = id => document.getElementById(id);
  const settingsKey = "photographyCoursesCameraV5Phase2";
  let buffer = 12;

  const shutterSeconds = value => {
    if (!value) return 1/125;
    if (value.endsWith("s")) return parseFloat(value);
    const parts=value.split("/");
    return parts.length===2 ? Number(parts[0])/Number(parts[1]) : Number(value);
  };

  const formatInfo = {
    raw:["Maximum editing latitude and highlight recovery.","14-bit RAW"],
    "raw-jpeg":["RAW flexibility plus an instantly shareable JPEG.","RAW+JPEG"],
    "jpeg-fine":["High-quality processed file with moderate compression.","JPEG Fine"],
    "jpeg-normal":["Smaller processed file with stronger compression.","JPEG Normal"]
  };

  function saved(){
    try{return JSON.parse(localStorage.getItem(settingsKey)||"{}")}catch{return{}}
  }
  function persist(){
    localStorage.setItem(settingsKey,JSON.stringify({
      format:$("v5p2Format").value,bitDepth:$("v5p2BitDepth").value,
      zebra:$("v5p2Zebra").checked,zebraLevel:$("v5p2ZebraLevel").value,
      blinkies:$("v5p2Blinkies").checked,stabilisation:$("v5p2Stabilisation").checked,
      noiseReduction:$("v5p2NoiseReduction").value,longExposure:$("v5p2LongExposure").checked
    }));
  }
  function restore(){
    const s=saved();
    Object.entries({
      v5p2Format:s.format,v5p2BitDepth:s.bitDepth,v5p2ZebraLevel:s.zebraLevel,
      v5p2NoiseReduction:s.noiseReduction
    }).forEach(([id,v])=>{if(v!==undefined)$(id).value=v});
    Object.entries({
      v5p2Zebra:s.zebra,v5p2Blinkies:s.blinkies,
      v5p2Stabilisation:s.stabilisation,v5p2LongExposure:s.longExposure
    }).forEach(([id,v])=>{if(v!==undefined)$(id).checked=v});
  }

  function estimateFileSize(state){
    const format=$("v5p2Format").value,depth=+$("v5p2BitDepth").value;
    const base=format==="raw"?28:format==="raw-jpeg"?36:format==="jpeg-fine"?11:6;
    return Math.round(base*(depth/14)*(state?.iso>=3200?1.08:1));
  }

  function update(detail){
    const camera=window.VIRTUAL_CAMERA_V5;
    const state=detail?.state || camera?.getState?.() || {};
    const sim=detail?.simulation || camera?.getSimulation?.() || {e:0,focus:0,motion:0,clipping:0};
    const focal=+state.focalLength||50;
    const seconds=shutterSeconds(state.shutter);
    const stabilised=$("v5p2Stabilisation").checked;
    const handheldLimit=1/(focal*(stabilised?0.25:1));
    const stable=seconds<=handheldLimit;

    $("v5p2Ev").textContent=`${sim.e>=0?"+":""}${sim.e.toFixed(1)} EV`;
    $("v5p2Handheld").textContent=`1/${Math.max(1,Math.round(1/handheldLimit))}`;
    $("v5p2Focus").textContent=sim.focus>.28?"Missed":sim.focus>.11?"Soft":"Confirmed";
    $("v5p2FileSize").textContent=`${estimateFileSize(state)} MB`;
    $("v5p2MeterNeedle").style.left=`${Math.max(0,Math.min(100,50+(sim.e/3)*50))}%`;
    $("v5p2StabilityInfo").textContent=stable?"Handheld shutter speed is within the recommended limit.":"Camera shake is likely at this shutter speed.";

    const threshold=+$("v5p2ZebraLevel").value;
    const zebraRisk=sim.e > ((threshold-85)/10);
    $("v5p2ZebraOverlay").classList.toggle("active",$("v5p2Zebra").checked&&zebraRisk);
    $("v5p2BlinkOverlay").classList.toggle("active",$("v5p2Blinkies").checked&&sim.clipping>.2);
    $("v5p2ZebraOut").textContent=`${threshold}%`;

    const [info,badge]=formatInfo[$("v5p2Format").value];
    $("v5p2FormatInfo").textContent=info;
    $("v5p2RawBadge").textContent=$("v5p2Format").value.includes("raw")?`${$("v5p2BitDepth").value}-bit ${badge}`:badge;
  }

  function bind(){
    restore();
    ["v5p2Format","v5p2BitDepth","v5p2Zebra","v5p2ZebraLevel","v5p2Blinkies",
     "v5p2Stabilisation","v5p2NoiseReduction","v5p2LongExposure"].forEach(id=>{
      $(id)?.addEventListener("input",()=>{persist();update()});
    });
    window.addEventListener("camera:update",e=>update(e.detail));
    window.addEventListener("camera:autofocus",()=>update());
    window.addEventListener("camera:capture",e=>{
      buffer=Math.max(0,buffer-1);
      $("v5p2Buffer").textContent=buffer;
      const format=$("v5p2Format").value;
      const delay=format==="raw-jpeg"?1300:format==="raw"?900:500;
      setTimeout(()=>{buffer=Math.min(12,buffer+1);$("v5p2Buffer").textContent=buffer},delay);
      update(e.detail);
    });
    update();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);
  else bind();
})();
