
(()=>{
const $=id=>document.getElementById(id);
let frontRot=0,rearRot=0;
function step(id,dir){
 const el=$(id);if(!el)return;
 const next=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+dir));
 if(next!==el.selectedIndex){
   el.selectedIndex=next;
   el.dispatchEvent(new Event("change",{bubbles:true}));
 }
}
function bindDial(el,id,isRear){
 let lastY=0,dragging=false;
 el.addEventListener("wheel",e=>{
   e.preventDefault();
   const dir=e.deltaY>0?1:-1;
   step(id,dir);
   if(isRear){rearRot+=dir*12;el.style.transform=`rotate(${rearRot}deg)`}
   else{frontRot+=dir*12;el.style.transform=`rotate(${frontRot}deg)`}
 },{passive:false});
 el.addEventListener("pointerdown",e=>{
   dragging=true;lastY=e.clientY;el.setPointerCapture(e.pointerId);
 });
 el.addEventListener("pointermove",e=>{
   if(!dragging)return;
   const d=e.clientY-lastY;
   if(Math.abs(d)>12){
     const dir=d>0?1:-1;
     step(id,dir);
     lastY=e.clientY;
     if(isRear){rearRot+=dir*12;el.style.transform=`rotate(${rearRot}deg)`}
     else{frontRot+=dir*12;el.style.transform=`rotate(${frontRot}deg)`}
   }
 });
 el.addEventListener("pointerup",()=>dragging=false);
}
function createDial(cls){
 const d=document.createElement("div");
 d.className=`v13-integrated-dial ${cls}`;
 d.innerHTML='<span class="tick"></span><span class="tick"></span><span class="tick"></span><span class="tick"></span><span class="tick"></span><span class="tick"></span>';
 return d;
}
function init(){
 document.body.classList.add("v13-active");
 const shell=document.querySelector(".v11-camera-shell");
 if(!shell)return;
 document.querySelectorAll(".v13-integrated-dial").forEach(x=>x.remove());
 const front=createDial("front"),rear=createDial("rear");
 shell.append(front,rear);
 bindDial(front,"v11ShutterSelect",false);
 bindDial(rear,"v11ApertureSelect",true);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
