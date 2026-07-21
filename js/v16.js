
(()=>{
const $=id=>document.getElementById(id);
const sec=v=>v.includes("/")?1/+v.split("/")[1]:parseFloat(v)||1;
function sceneName(){return document.querySelector(".v11-scene-card.active strong")?.textContent||"current scene"}
function values(){return{sh:$("v11ShutterSelect").value,ap:+$("v11ApertureSelect").value,iso:+$("v11IsoSelect").value,af:$("v11AfMode").value,focal:+$("v11FocalLength").value,scene:sceneName()}}
function say(text){$("v16CoachMessage").textContent=text}
function suggest(){
 const v=values();
 if(v.scene.includes("Mountain"))say("For this landscape, start at ISO 100, f/8 and around 1/125s. Focus roughly one-third into the scene.");
 else if(v.scene.includes("Portrait"))say("For the portrait, try 85mm, f/2.8, ISO 100–400 and at least 1/125s. Place the focus point on the nearest eye.");
 else if(v.scene.includes("Waterfall"))say("For silky water, try ISO 100, f/11 and a shutter around 1/2 second. A tripod would be recommended in real life.");
 else if(v.scene.includes("Cyclist"))say("Use AF-C, tracking, 1/1000s or faster and raise ISO until exposure is balanced.");
 else if(v.scene.includes("Night"))say("Open the aperture, use the slowest safe shutter speed and only then increase ISO. Watch bright signs for clipping.");
 else say("Use AF-C, 135–200mm and at least 1/1600s for the bird. Raise ISO as required.");
}
function explain(){
 const v=values(),s=sec(v.sh);let parts=[];
 parts.push(`${v.sh} controls motion`);
 parts.push(`f/${v.ap} controls depth of field`);
 parts.push(`ISO ${v.iso} controls sensitivity and noise`);
 if(s>=1/30)parts.push("your shutter may show camera or subject movement");
 if(v.ap<=2.8)parts.push("your aperture should create a shallow depth of field");
 if(v.iso>=3200)parts.push("high ISO will add visible noise");
 say(`Current setup: ${parts.join("; ")}.`);
}
function challenge(){
 const list=[
  "Freeze the subject while keeping ISO below 1600.",
  "Create the shallowest depth of field you can while keeping the subject sharp.",
  "Centre the exposure meter using ISO 100.",
  "Use back-button focus, then recompose before taking the photograph.",
  "Create a technically correct shot using Manual mode only."
 ];
 say("Challenge: "+list[Math.floor(Math.random()*list.length)]);
}
function ask(q){
 const t=q.toLowerCase();
 if(t.includes("shutter"))say("Shutter speed controls how long light reaches the sensor. Fast speeds freeze action; slow speeds show motion and risk camera shake.");
 else if(t.includes("aperture")||t.includes("f stop"))say("Aperture controls the lens opening. Small f-numbers let in more light and reduce depth of field.");
 else if(t.includes("iso"))say("ISO brightens the image electronically. Higher ISO is useful in low light but creates more noise and less dynamic range.");
 else if(t.includes("focus"))say("Use AF-S for static subjects and AF-C or tracking for moving subjects. Place the focus point on the most important detail.");
 else if(t.includes("exposure"))say("Balance exposure by adjusting shutter speed, aperture and ISO. Try to protect important highlights while retaining enough shadow detail.");
 else suggest();
}
function init(){
 document.body.classList.add("v16-active");
 const panel=$("v16CoachPanel");
 $("v16CoachToggle").onclick=()=>{panel.classList.add("open");panel.setAttribute("aria-hidden","false");suggest()};
 $("v16CoachClose").onclick=()=>{panel.classList.remove("open");panel.setAttribute("aria-hidden","true")};
 document.querySelectorAll("[data-v16-action]").forEach(b=>b.onclick=()=>({suggest,explain,challenge}[b.dataset.v16Action]()));
 $("v16CoachSend").onclick=()=>{ask($("v16CoachInput").value);$("v16CoachInput").value=""};
 $("v16CoachInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("v16CoachSend").click()});
 ["v11ShutterSelect","v11ApertureSelect","v11IsoSelect","v11AfMode","v11FocalLength"].forEach(id=>$(id)?.addEventListener("change",()=>{if(panel.classList.contains("open"))explain()}));
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
