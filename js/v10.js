
(()=>{
const $=id=>document.getElementById(id);
let state={
 profile:{name:"Photography Student",experience:"Complete beginner",interest:"General photography",weeklyGoal:3},
 preferences:{adaptive:true,hints:true,requireFocus:true,celebrations:true},
 plan:"free",
 lessons:[],
 course:{title:"Master Your Camera",description:"Learn to move from Auto mode to confident Manual photography.",difficulty:"Beginner",price:49},
 bridge:{siteUrl:"https://photographycourses.com",provider:"LearnDash",courseId:"master-your-camera",enabled:false},
 events:[],
 sessions:1,
 settings:{textSize:"normal",contrast:"standard",reduceMotion:false,largeTargets:false}
};
let deferredInstall=null;
const load=()=>{try{state={...state,...JSON.parse(localStorage.getItem("photographyPlatformV10")||"{}")};state.profile={...state.profile,...(state.profile||{})};state.preferences={...state.preferences,...(state.preferences||{})};state.course={...state.course,...(state.course||{})};state.bridge={...state.bridge,...(state.bridge||{})};state.settings={...state.settings,...(state.settings||{})};state.sessions=(state.sessions||0)+1}catch{}};
const save=()=>localStorage.setItem("photographyPlatformV10",JSON.stringify(state));
function academy(){try{return JSON.parse(localStorage.getItem("photographyAcademyV8")||"{}")}catch{return{}}}
function switchTab(name){document.querySelectorAll("[data-v10-tab]").forEach(b=>b.classList.toggle("active",b.dataset.v10Tab===name));document.querySelectorAll("[data-v10-view]").forEach(v=>v.classList.toggle("active",v.dataset.v10View===name));if(name==="analytics")renderAnalytics()}
function route(name){
 document.body.classList.remove("v10-v9-mode","v10-academy-mode","v10-camera-mode","v9-active","v9-academy-mode","v9-camera-mode","v8-active","v8-camera-mode");
 if(name==="realism"){document.body.classList.add("v10-v9-mode","v9-active")}
 if(name==="academy"){document.body.classList.add("v10-academy-mode","v8-active")}
 if(name==="camera"){document.body.classList.add("v10-camera-mode","v8-active","v8-camera-mode")}
}
function renderOverview(){
 const a=academy(),completed=(a.completed||[]).length,xp=a.xp||0,level=Math.floor(xp/500)+1;
 $("v10StudentName").textContent=state.profile.name;$("v10StudentPlan").textContent=state.plan==="pro"?"Pro plan":"Free plan";
 $("v10Avatar").textContent=state.profile.name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()||"PS";
 $("v10ProfileLevel").textContent=level;$("v10ProfileXp").textContent=xp;$("v10ProfileCompleted").textContent=completed;
 const checklist=[
  ["Student profile configured",state.profile.name!=="Photography Student"],
  ["At least one course lesson created",state.lessons.length>0],
  ["Pro/free access preview selected",!!state.plan],
  ["WordPress bridge settings saved",!!state.bridge.siteUrl],
  ["First academy mission completed",completed>0]
 ];
 $("v10LaunchChecklist").innerHTML=checklist.map(([t,d])=>`<li class="${d?"done":""}">${t}</li>`).join("");
 $("v10BridgeStatus").textContent=state.bridge.enabled?"Enabled":"Preview";
}
function renderProfile(){
 $("v10NameInput").value=state.profile.name;$("v10Experience").value=state.profile.experience;$("v10Interest").value=state.profile.interest;$("v10WeeklyGoal").value=String(state.profile.weeklyGoal);
 $("v10Adaptive").checked=state.preferences.adaptive;$("v10Hints").checked=state.preferences.hints;$("v10RequireFocus").checked=state.preferences.requireFocus;$("v10Celebrations").checked=state.preferences.celebrations;
 const a=academy(),skills=a.skills||{},lowest=Object.entries(skills).sort((x,y)=>x[1]-y[1])[0];
 $("v10Recommendation").textContent=lowest?`Recommended focus: improve ${lowest[0]} through a guided mission.`:"Recommended next: Balance the Exposure.";
}
function renderLessons(){
 $("v10LessonCount").textContent=`${state.lessons.length} lesson${state.lessons.length===1?"":"s"}`;
 $("v10LessonList").innerHTML=state.lessons.length?state.lessons.map((l,i)=>`<div class="v10-lesson"><div><strong>${i+1}. ${l.title}</strong><span>${l.type} · ${l.duration} min · ${l.scene}</span></div><button data-up="${i}">↑</button><button data-remove="${i}">Remove</button></div>`).join(""):'<div class="v10-recommendation">No lessons yet. Add the first lesson above.</div>';
 document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{state.lessons.splice(+b.dataset.remove,1);save();renderLessons();renderOverview()});
 document.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{const i=+b.dataset.up;if(i>0){[state.lessons[i-1],state.lessons[i]]=[state.lessons[i],state.lessons[i-1]];save();renderLessons()}});
}
function renderAccess(){
 const access=state.plan==="pro"?[
  ["All scenes",true],["Career paths",true],["Certificates",true],["Realism lab",true],["Studio lighting",true],["Advanced feedback",true]
 ]:[
  ["Three scenes",true],["Five missions",true],["Career paths",false],["Certificates",false],["Realism lab",false],["Studio lighting",false]
 ];
 $("v10AccessList").innerHTML=access.map(([t,yes])=>`<span>${t}<b class="${yes?"yes":"no"}">${yes?"Included":"Locked"}</b></span>`).join("");
 renderOverview();
}
function renderBridge(){
 $("v10SiteUrl").value=state.bridge.siteUrl;$("v10LmsProvider").value=state.bridge.provider;$("v10CourseId").value=state.bridge.courseId;$("v10BridgeEnabled").checked=state.bridge.enabled;
 $("v10EventLog").innerHTML=state.events.length?state.events.slice().reverse().map(e=>`<div class="v10-event"><b>${e.type}</b> · ${e.time}<br>${JSON.stringify(e.payload)}</div>`).join(""):'<div class="v10-recommendation">No integration events yet.</div>';
}
function sendEvent(type,payload={}){
 const event={type,time:new Date().toLocaleString(),payload:{courseId:state.bridge.courseId,user:state.profile.name,...payload}};
 state.events.push(event);state.events=state.events.slice(-50);save();$("v10EventPreview").textContent=JSON.stringify(event,null,2);renderBridge();
 window.dispatchEvent(new CustomEvent("photographycourses:lms",{detail:event}));
}
function renderAnalytics(){
 const a=academy(),skills=a.skills||{exposure:0,focus:0,motion:0,composition:0},completed=(a.completed||[]).length,total=9;
 const avg=Math.round(Object.values(skills).reduce((x,y)=>x+y,0)/Math.max(1,Object.keys(skills).length));
 $("v10MetricSessions").textContent=state.sessions;$("v10MetricCompletion").textContent=Math.round(completed/total*100)+"%";$("v10MetricSkill").textContent=avg+"%";$("v10MetricGallery").textContent=(a.gallery||[]).length;
 const weakest=Object.entries(skills).sort((x,y)=>x[1]-y[1])[0];$("v10AnalyticsRecommendation").textContent=weakest?`Your weakest current skill is ${weakest[0]} at ${weakest[1]}%. Complete a matching practical mission next.`:"Complete your first mission to begin personalised analysis.";
 const c=$("v10SkillChart"),x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.fillStyle="#0c1014";x.fillRect(0,0,w,h);
 Object.entries(skills).forEach(([k,v],i)=>{const y=55+i*68;x.fillStyle="#9ca5af";x.font="15px sans-serif";x.fillText(k[0].toUpperCase()+k.slice(1),24,y+8);x.fillStyle="#252c33";x.fillRect(145,y-10,w-195,24);x.fillStyle="#ffc400";x.fillRect(145,y-10,(w-195)*v/100,24);x.fillStyle="#eef0f2";x.fillText(v+"%",w-42,y+8)});
}
function applySettings(){
 document.body.classList.toggle("v10-text-large",state.settings.textSize==="large");document.body.classList.toggle("v10-text-largest",state.settings.textSize==="largest");document.body.classList.toggle("v10-high-contrast",state.settings.contrast==="high");document.body.classList.toggle("v10-reduce-motion",state.settings.reduceMotion);document.body.classList.toggle("v10-large-targets",state.settings.largeTargets);
}
function exportCourse(){
 state.course={title:$("v10CourseTitle").value,description:$("v10CourseDescription").value,difficulty:$("v10CourseDifficulty").value,price:+$("v10CoursePrice").value};
 save();const data={version:"10.0",course:state.course,lessons:state.lessons},blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="photography-course.json";a.click();URL.revokeObjectURL(a.href);
}
function init(){
 document.body.classList.add("v10-active");document.body.classList.remove("v9-active","v8-active");
 load();save();renderOverview();renderProfile();renderLessons();renderAccess();renderBridge();applySettings();
 document.querySelectorAll("[data-v10-tab]").forEach(b=>b.onclick=()=>switchTab(b.dataset.v10Tab));document.querySelectorAll("[data-v10-tab-jump]").forEach(b=>b.onclick=()=>switchTab(b.dataset.v10TabJump));document.querySelectorAll("[data-v10-route]").forEach(b=>b.onclick=()=>route(b.dataset.v10Route));
 $("v10LaunchAcademy").onclick=$("v10OpenAcademy").onclick=()=>route("academy");$("v10LaunchCamera").onclick=()=>route("camera");$("v10OpenV9").onclick=()=>route("realism");
 $("v10SaveProfile").onclick=()=>{state.profile={name:$("v10NameInput").value||"Photography Student",experience:$("v10Experience").value,interest:$("v10Interest").value,weeklyGoal:+$("v10WeeklyGoal").value};state.preferences={adaptive:$("v10Adaptive").checked,hints:$("v10Hints").checked,requireFocus:$("v10RequireFocus").checked,celebrations:$("v10Celebrations").checked};save();renderProfile();renderOverview();alert("Student profile saved.")};
 $("v10AddLesson").onclick=()=>{const title=$("v10LessonTitle").value.trim();if(!title){alert("Enter a lesson title.");return}state.lessons.push({title,type:$("v10LessonType").value,duration:+$("v10LessonDuration").value,scene:$("v10LessonScene").value});$("v10LessonTitle").value="";save();renderLessons();renderOverview()};
 $("v10ExportCourse").onclick=exportCourse;
 $("v10ActivateFree").onclick=()=>{state.plan="free";save();renderAccess()};$("v10ActivatePro").onclick=()=>{state.plan="pro";save();renderAccess()};
 $("v10SaveBridge").onclick=()=>{state.bridge={siteUrl:$("v10SiteUrl").value,provider:$("v10LmsProvider").value,courseId:$("v10CourseId").value,enabled:$("v10BridgeEnabled").checked};save();renderBridge();renderOverview();alert("Bridge preview settings saved.")};
 $("v10SendTestEvent").onclick=()=>sendEvent($("v10TestEvent").value,{source:"version-10-preview"});$("v10ClearEvents").onclick=()=>{state.events=[];save();renderBridge();$("v10EventPreview").textContent="No event sent yet."};
 $("v10TextSize").value=state.settings.textSize;$("v10Contrast").value=state.settings.contrast;$("v10ReduceMotion").checked=state.settings.reduceMotion;$("v10LargeTargets").checked=state.settings.largeTargets;
 ["v10TextSize","v10Contrast","v10ReduceMotion","v10LargeTargets"].forEach(id=>$(id).oninput=()=>{state.settings={textSize:$("v10TextSize").value,contrast:$("v10Contrast").value,reduceMotion:$("v10ReduceMotion").checked,largeTargets:$("v10LargeTargets").checked};save();applySettings()});
 $("v10ClearAllData").onclick=()=>{if(confirm("Reset all Version 10 local data?")){localStorage.removeItem("photographyPlatformV10");location.reload()}};
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("v10InstallApp").disabled=false;$("v10OfflineStatus").textContent="Installable app available.";});
 $("v10InstallApp").onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("v10InstallApp").disabled=true}};
 if("serviceWorker" in navigator){navigator.serviceWorker.register("./service-worker.js").then(()=>$("v10OfflineStatus").textContent="Offline support enabled.").catch(()=>$("v10OfflineStatus").textContent="Offline support unavailable on this host.")}else{$("v10OfflineStatus").textContent="This browser does not support offline installation."}
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
