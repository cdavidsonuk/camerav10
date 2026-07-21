
(()=>{
const $=id=>document.getElementById(id);
function addDetail(){
  const body=document.querySelector(".dslr");
  if(!body||body.querySelector(".v61-status-strip"))return;
  const strip=document.createElement("div");
  strip.className="v61-status-strip";
  strip.innerHTML="<span>DUAL SLOT</span><span>WEATHER SEALED</span><span>PRO BODY</span>";
  body.appendChild(strip);

  const hotspots=[
    {label:"Mode dial",style:"left:10%;top:-7%;width:110px;height:54px",action:()=>$("bodyMode")?.click()},
    {label:"Front wheel",style:"right:1%;top:8%;width:110px;height:55px",action:()=>$("bodyWheel")?.click()},
    {label:"Shutter",style:"right:8%;top:-8%;width:105px;height:55px",action:()=>$("bodyShutter")?.click()},
    {label:"Rear dial",style:"right:2%;top:45%;width:145px;height:145px",action:()=>$("bodyRearDial")?.click()}
  ];
  hotspots.forEach(h=>{
    const b=document.createElement("button");
    b.className="v61-hotspot";
    b.style.cssText=h.style;
    b.setAttribute("aria-label",h.label);
    b.title=h.label;
    b.onclick=h.action;
    body.appendChild(b);
  });
}
function pulse(){
  const body=document.querySelector(".dslr");
  if(!body)return;
  body.animate([{filter:"brightness(1)"},{filter:"brightness(1.045)"},{filter:"brightness(1)"}],{duration:220});
}
function init(){
  addDetail();
  window.addEventListener("camera:capture",pulse);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
