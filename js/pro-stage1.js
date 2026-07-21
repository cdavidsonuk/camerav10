
(()=>{
  const $ = id => document.getElementById(id);
  const state = { powered:true, vf:false, quick:false };

  const getValues = () => ({
    mode: $("v11LcdMode")?.textContent || "M",
    shutter: $("v11ShutterSelect")?.value || $("v11LcdShutter")?.textContent || "1/125",
    aperture: $("v11ApertureSelect")?.value || "5.6",
    iso: $("v11IsoSelect")?.value || "100",
    af: $("v11AfMode")?.value || "AF-S",
    wb: $("v12WhiteBalance")?.value || "Auto",
    drive: $("v12DriveMode")?.value || "Single shot"
  });

  function sync(){
    const v=getValues();
    const scene=$("v11SceneImage");
    [["proTopMode",v.mode],["proTopShutter",v.shutter],["proTopAperture",v.aperture],["proTopIso",v.iso],
     ["proVfShutter",v.shutter],["proVfAperture","F"+v.aperture],["proVfIso","ISO "+v.iso],
     ["proQuickShutter",v.shutter],["proQuickAperture","F"+v.aperture],["proQuickIso",v.iso],
     ["proQuickAf",v.af],["proQuickWb",v.wb],["proQuickDrive",v.drive]
    ].forEach(([id,val])=>{if($(id))$(id).textContent=val});
    if(scene && $("proViewfinderImage") && $("proViewfinderImage").src!==scene.src){
      $("proViewfinderImage").src=scene.src;
    }
  }

  function stepSelect(id,delta){
    const el=$(id); if(!el || !state.powered) return;
    const options=[...el.options];
    let next=Math.max(0,Math.min(options.length-1,el.selectedIndex+delta));
    if(next===el.selectedIndex) return;
    el.selectedIndex=next;
    el.dispatchEvent(new Event("change",{bubbles:true}));
    el.dispatchEvent(new Event("input",{bubbles:true}));
    sync();
  }

  function wireDial(id,selectId){
    const dial=$(id); if(!dial)return;
    let startY=null;
    dial.addEventListener("wheel",e=>{
      e.preventDefault();
      stepSelect(selectId,e.deltaY>0?1:-1);
      dial.style.transform=`rotate(${(parseFloat(dial.dataset.rot)||0)+(e.deltaY>0?12:-12)}deg)`;
      dial.dataset.rot=String((parseFloat(dial.dataset.rot)||0)+(e.deltaY>0?12:-12));
    },{passive:false});
    dial.addEventListener("pointerdown",e=>{startY=e.clientY;dial.setPointerCapture(e.pointerId)});
    dial.addEventListener("pointermove",e=>{
      if(startY===null)return;
      const diff=e.clientY-startY;
      if(Math.abs(diff)>18){stepSelect(selectId,diff>0?1:-1);startY=e.clientY}
    });
    dial.addEventListener("pointerup",()=>startY=null);
    dial.addEventListener("keydown",e=>{
      if(["ArrowUp","ArrowLeft"].includes(e.key))stepSelect(selectId,-1);
      if(["ArrowDown","ArrowRight"].includes(e.key))stepSelect(selectId,1);
    });
  }

  function init(){
    document.body.classList.add("pro-stage1");

    $("proPowerSwitch")?.addEventListener("click",()=>{
      state.powered=!state.powered;
      $("proPowerSwitch").classList.toggle("off",!state.powered);
      $("proPowerSwitch").setAttribute("aria-pressed",String(state.powered));
      document.body.classList.toggle("pro-camera-off",!state.powered);
    });

    $("proViewfinderButton")?.addEventListener("click",()=>{
      if(!state.powered)return;
      sync();
      $("proViewfinder").classList.add("open");
      $("proViewfinder").setAttribute("aria-hidden","false");
    });
    $("proCloseViewfinder")?.addEventListener("click",()=>{
      $("proViewfinder").classList.remove("open");
      $("proViewfinder").setAttribute("aria-hidden","true");
    });

    $("proQuickControlButton")?.addEventListener("click",()=>{
      if(!state.powered)return;
      sync();
      $("proQuickPanel").classList.add("open");
      $("proQuickPanel").setAttribute("aria-hidden","false");
    });
    $("proCloseQuick")?.addEventListener("click",()=>{
      $("proQuickPanel").classList.remove("open");
      $("proQuickPanel").setAttribute("aria-hidden","true");
    });

    document.querySelectorAll("[data-pro-focus]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const target=$(btn.dataset.proFocus);
        $("proQuickPanel").classList.remove("open");
        if(target){target.focus();target.classList.add("v16-highlight");setTimeout(()=>target.classList.remove("v16-highlight"),1800)}
      });
    });

    wireDial("proFrontDial","v11ShutterSelect");
    wireDial("proRearDial","v11ApertureSelect");

    ["v11ShutterSelect","v11ApertureSelect","v11IsoSelect","v11AfMode","v12WhiteBalance","v12DriveMode"].forEach(id=>{
      $(id)?.addEventListener("change",sync);
      $(id)?.addEventListener("input",sync);
    });

    const scene=$("v11SceneImage");
    if(scene){
      new MutationObserver(sync).observe(scene,{attributes:true,attributeFilter:["src"]});
    }
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"){
        $("proViewfinder")?.classList.remove("open");
        $("proQuickPanel")?.classList.remove("open");
      }
      if(e.key.toLowerCase()==="q" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)){
        $("proQuickControlButton")?.click();
      }
    });
    sync();
  }

  document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",init) : init();
})();
