
(()=>{
const $=id=>document.getElementById(id);
const missions=[
{id:"exposure-1",title:"Balance the Exposure",level:"beginner",icon:"☀",category:"Exposure",minutes:5,scene:"landscape",brief:"Create a correctly exposed landscape in Manual mode.",objectives:["Set the exposure meter close to zero","Use ISO 100 or 200","Keep enough depth of field"],guidance:"Start with ISO 100, choose f/8 or f/11, then adjust shutter speed until the meter is centred.",skill:"exposure"},
{id:"focus-1",title:"Focus on the Eyes",level:"beginner",icon:"◎",category:"Focus",minutes:5,scene:"portrait",brief:"Create a portrait with accurate eye focus and soft background separation.",objectives:["Move the AF point onto the subject","Lock focus before capture","Use f/2.8 or wider"],guidance:"Use single-point autofocus, place the point over the nearest eye and press AF-ON before taking the photograph.",skill:"focus"},
{id:"motion-1",title:"Freeze the Cyclist",level:"beginner",icon:"⚡",category:"Motion",minutes:6,scene:"cyclist",brief:"Freeze a fast-moving subject without severe noise.",objectives:["Use 1/1000s or faster","Use tracking autofocus","Keep ISO under control"],guidance:"Set shutter priority or manual mode. Start at 1/1000s and increase ISO only as much as needed.",skill:"motion"},
{id:"composition-1",title:"Rule of Thirds",level:"beginner",icon:"▦",category:"Composition",minutes:5,scene:"landscape",brief:"Place the main visual interest away from the centre.",objectives:["Turn on the grid","Move the focus point off-centre","Create balanced visual spacing"],guidance:"Use the grid intersections to place the strongest subject and leave visual breathing room.",skill:"composition"},
{id:"water-1",title:"Silky Waterfall",level:"intermediate",icon:"≈",category:"Long exposure",minutes:8,scene:"waterfall",brief:"Create smooth water while preserving surrounding detail.",objectives:["Use 1/4s or slower","Use ISO 100","Protect bright highlights"],guidance:"Select a small aperture and a slow shutter speed. Watch the exposure meter and histogram.",skill:"exposure"},
{id:"night-1",title:"Night City Balance",level:"intermediate",icon:"☾",category:"Low light",minutes:8,scene:"night",brief:"Capture a sharp night photograph with manageable noise.",objectives:["Use a wide aperture","Avoid camera shake","Keep highlight detail"],guidance:"Use the widest useful aperture, then choose the slowest safe shutter speed before raising ISO.",skill:"exposure"},
{id:"wildlife-1",title:"Bird in Flight",level:"advanced",icon:"⌁",category:"Wildlife",minutes:10,scene:"wildlife",brief:"Track and freeze an unpredictable moving subject.",objectives:["Use 1/1600s or faster","Use 135–200mm","Use subject tracking"],guidance:"Choose a fast shutter, long focal length and tracking AF. Keep enough ISO to maintain exposure.",skill:"motion"},
{id:"portrait-2",title:"Environmental Portrait",level:"intermediate",icon:"◉",category:"Portrait",minutes:8,scene:"portrait",brief:"Balance subject separation with enough environmental context.",objectives:["Use 50–85mm","Use f/4 to f/5.6","Keep the eyes sharp"],guidance:"Do not blur the background completely. Retain enough detail to explain the location.",skill:"composition"},
{id:"landscape-2",title:"Hyperfocal Landscape",level:"advanced",icon:"△",category:"Landscape",minutes:10,scene:"landscape",brief:"Maximise front-to-back sharpness without excessive diffraction.",objectives:["Use f/8 to f/16","Focus beyond the foreground","Avoid very high ISO"],guidance:"Use a moderate wide-angle lens and focus roughly one-third into the scene.",skill:"focus"}
];
const careers=[
{name:"Landscape Photographer",icon:"△",missionIds:["exposure-1","composition-1","water-1","landscape-2"],skills:["Exposure control","Composition","Long exposure","Depth of field"]},
{name:"Portrait Photographer",icon:"◉",missionIds:["focus-1","portrait-2"],skills:["Eye autofocus","Background control","Lens choice","Subject direction"]},
{name:"Sports Photographer",icon:"⚡",missionIds:["motion-1","wildlife-1"],skills:["Fast shutter control","Tracking autofocus","Timing","High ISO"]},
{name:"Low-Light Photographer",icon:"☾",missionIds:["night-1","water-1"],skills:["Noise control","Stability","Dynamic range","Ambient light"]},
{name:"Wildlife Photographer",icon:"⌁",missionIds:["wildlife-1","motion-1"],skills:["Long lenses","Tracking","Action timing","Exposure"]},
{name:"Commercial Photographer",icon:"◆",missionIds:["focus-1","portrait-2","composition-1"],skills:["Precision","Consistency","Lighting decisions","Composition"]}
];
const achievements=[
{id:"first-shot",title:"First Academy Shot",text:"Capture your first photograph",test:p=>p.gallery.length>=1},
{id:"first-mission",title:"Mission Complete",text:"Complete one practical mission",test:p=>p.completed.length>=1},
{id:"three-missions",title:"Building Momentum",text:"Complete three missions",test:p=>p.completed.length>=3},
{id:"exposure-80",title:"Exposure Specialist",text:"Reach 80% exposure skill",test:p=>p.skills.exposure>=80},
{id:"focus-80",title:"Focus Specialist",text:"Reach 80% focus skill",test:p=>p.skills.focus>=80},
{id:"assessment-pass",title:"Certified Camera User",text:"Pass the practical assessment",test:p=>p.assessmentBest>=75}
];
let progress={xp:0,completed:[],skills:{exposure:15,focus:10,motion:10,composition:10},gallery:[],attempts:0,assessmentBest:0,activeMission:null,assessment:null,lastFeedback:null,streak:1};
let selectedMission=null;
const load=()=>{try{progress={...progress,...JSON.parse(localStorage.getItem("photographyAcademyV8")||"{}")};progress.skills={exposure:15,focus:10,motion:10,composition:10,...progress.skills}}catch{}};
const save=()=>localStorage.setItem("photographyAcademyV8",JSON.stringify(progress));
function switchTab(name){document.querySelectorAll("[data-v8-tab]").forEach(b=>b.classList.toggle("active",b.dataset.v8Tab===name));document.querySelectorAll("[data-v8-view]").forEach(v=>v.classList.toggle("active",v.dataset.v8View===name));if(name==="progress")drawProgress()}
function missionCard(m){
 const done=progress.completed.includes(m.id);
 return `<article class="v8-card v8-mission-card ${done?"completed":""}" data-mission="${m.id}"><div class="v8-mission-thumb"><span>${m.level.toUpperCase()}</span>${m.icon}</div><div class="v8-mission-body"><div class="v8-mission-meta"><span>${m.category}</span><span>${m.minutes} min</span></div><h3>${m.title}</h3><p>${m.brief}</p><button>${done?"Completed · Practise again":"View mission"}</button></div></article>`;
}
function renderMissions(){
 const filter=$("v8MissionFilter").value;const list=missions.filter(m=>filter==="all"||m.level===filter);$("v8MissionGrid").innerHTML=list.map(missionCard).join("");
 $("v8RecommendedMissions").innerHTML=missions.filter(m=>!progress.completed.includes(m.id)).slice(0,3).map(missionCard).join("");
 document.querySelectorAll("[data-mission]").forEach(card=>card.onclick=()=>openMission(card.dataset.mission));
}
function openMission(id){selectedMission=missions.find(m=>m.id===id);if(!selectedMission)return;$("v8MissionLevel").textContent=selectedMission.level.toUpperCase();$("v8MissionTitle").textContent=selectedMission.title;$("v8MissionDescription").textContent=selectedMission.brief;$("v8MissionObjectives").innerHTML=selectedMission.objectives.map(x=>`<li>${x}</li>`).join("");$("v8CoachGuidance").textContent=selectedMission.guidance;$("v8MissionDialog").showModal()}
function launchMission(m=selectedMission){if(!m)return;progress.activeMission=m.id;save();document.body.classList.add("v8-camera-mode");window.VIRTUAL_CAMERA_V5?.setState?.({scene:m.scene});setTimeout(()=>{document.getElementById("v7SceneList")?.querySelectorAll(".v7-scene").forEach((b,i)=>{if(["landscape","portrait","waterfall","cyclist","night","wildlife"][i]===m.scene)b.click()})},200);$("v8MissionDialog").close()}
function completeMission(score){
 const m=missions.find(x=>x.id===progress.activeMission);if(!m)return;
 if(score>=65&&!progress.completed.includes(m.id)){progress.completed.push(m.id);progress.xp+=150;progress.skills[m.skill]=Math.min(100,progress.skills[m.skill]+Math.round(score/8))}
 progress.lastFeedback={title:score>=80?"Strong mission result":"Keep practising",text:score>=80?`You completed ${m.title} with confident camera control.`:`Review the coach feedback and repeat ${m.title}.`};
 progress.gallery.unshift({id:Date.now(),scene:m.scene,title:m.title,score,date:new Date().toLocaleDateString(),image:document.getElementById("v7ReviewImage")?.src||document.getElementById("v7SceneImage")?.src||""});
 progress.gallery=progress.gallery.slice(0,24);
 if(progress.assessment)handleAssessmentShot(score);
 progress.activeMission=null;save();renderAll();
}
function renderCareers(){
 $("v8CareerGrid").innerHTML=careers.map(c=>{const done=c.missionIds.filter(id=>progress.completed.includes(id)).length,pct=Math.round(done/c.missionIds.length*100);return `<article class="v8-card v8-career-card"><span class="v8-label">${c.icon} CAREER PATH</span><h2>${c.name}</h2><p>${done} of ${c.missionIds.length} required missions completed</p><div class="v8-career-progress"><em style="width:${pct}%"></em></div><ul>${c.skills.map(s=>`<li>${s}</li>`).join("")}</ul></article>`}).join("");
}
function renderGallery(){
 $("v8GalleryEmpty").style.display=progress.gallery.length?"none":"block";$("v8GalleryGrid").innerHTML=progress.gallery.map(g=>`<article class="v8-card v8-gallery-item"><img src="${g.image}" alt="${g.title}"><div class="v8-gallery-copy"><strong>${g.title}</strong><span>Score ${g.score}% · ${g.date}</span></div></article>`).join("")
}
function renderAchievements(){$("v8AchievementGrid").innerHTML=achievements.map(a=>`<article class="v8-achievement ${a.test(progress)?"unlocked":""}"><strong>${a.test(progress)?"✓ ":""}${a.title}</strong><span>${a.text}</span></article>`).join("")}
function renderSummary(){
 const level=Math.floor(progress.xp/500)+1;$("v8Level").textContent=level;$("v8Xp").textContent=progress.xp;$("v8MissionCount").textContent=`${progress.completed.length}/${missions.length}`;$("v8Streak").textContent=`${progress.streak} day${progress.streak===1?"":"s"}`;
 const pct=progress.completed.length?100:0;$("v8GoalPercent").textContent=pct+"%";$("v8GoalPercent").parentElement.style.setProperty("--goal",pct+"%");
 Object.entries(progress.skills).forEach(([k,v])=>{const cap=k[0].toUpperCase()+k.slice(1);$(`v8Strength${cap}`).style.width=v+"%";$(`v8Strength${cap}Text`).textContent=v+"%"});
 const next=missions.find(m=>!progress.completed.includes(m.id))||missions[0];$("v8ContinueTitle").textContent=next.title;$("v8ContinueText").textContent=next.brief;
 if(progress.lastFeedback){$("v8LatestFeedbackTitle").textContent=progress.lastFeedback.title;$("v8LatestFeedbackText").textContent=progress.lastFeedback.text}
 $("v8AssessmentAttempts").textContent=progress.attempts;$("v8AssessmentBest").textContent=progress.assessmentBest?progress.assessmentBest+"%":"—";const passed=progress.assessmentBest>=75;$("v8CertificateStatus").textContent=passed?"Unlocked":"Locked";$("v8PrintCertificate").disabled=!passed
}
function renderAll(){renderSummary();renderMissions();renderCareers();renderGallery();renderAchievements()}
function startAssessment(){
 progress.attempts++;progress.assessment={index:0,scores:[],missions:["exposure-1","motion-1","focus-1"]};save();showExamBrief()
}
function showExamBrief(){
 const a=progress.assessment;if(!a)return;const m=missions.find(x=>x.id===a.missions[a.index]);$("v8ExamTitle").textContent=`Challenge ${a.index+1} of ${a.missions.length}: ${m.title}`;$("v8ExamBrief").textContent=m.brief;$("v8ExamProgress").style.width=(a.index/a.missions.length*100)+"%";$("v8ExamProgressText").textContent=`${a.index}/${a.missions.length} completed`;$("v8AssessmentDialog").showModal()
}
function handleAssessmentShot(score){
 const a=progress.assessment;if(!a)return;a.scores.push(score);a.index++;if(a.index>=a.missions.length){const avg=Math.round(a.scores.reduce((x,y)=>x+y,0)/a.scores.length);progress.assessmentBest=Math.max(progress.assessmentBest,avg);progress.assessment=null;save();renderAll();setTimeout(()=>{alert(avg>=75?`Assessment passed with ${avg}%`:`Assessment result: ${avg}%. You need 75% to pass.`)},250)}else{save();setTimeout(showExamBrief,350)}
}
function drawProgress(){
 const c=$("v8ProgressChart"),x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.fillStyle="#0c1014";x.fillRect(0,0,w,h);const vals=Object.entries(progress.skills),max=100;
 x.strokeStyle="#323b44";x.fillStyle="#9ca5af";x.font="14px sans-serif";
 vals.forEach(([k,v],i)=>{const y=55+i*65;x.fillText(k[0].toUpperCase()+k.slice(1),25,y+8);x.fillStyle="#222a31";x.fillRect(150,y-10,w-200,22);x.fillStyle="#ffc400";x.fillRect(150,y-10,(w-200)*v/max,22);x.fillStyle="#e7eaed";x.fillText(v+"%",w-42,y+7);x.fillStyle="#9ca5af"})
}
function exportProgress(){const blob=new Blob([JSON.stringify(progress,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="photography-academy-progress.json";a.click();URL.revokeObjectURL(a.href)}
function importProgress(file){const r=new FileReader();r.onload=()=>{try{progress={...progress,...JSON.parse(r.result)};save();renderAll();alert("Progress imported successfully.")}catch{alert("That progress file could not be read.")}};r.readAsText(file)}
function showCertificate(){$("v8CertificateScore").textContent=progress.assessmentBest+"%";$("v8CertificateDate").textContent=new Date().toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});$("v8CertificateDialog").showModal()}
function init(){
 document.body.classList.add("v8-active");load();renderAll();
 document.querySelectorAll("[data-v8-tab]").forEach(b=>b.onclick=()=>switchTab(b.dataset.v8Tab));document.querySelectorAll("[data-v8-jump]").forEach(b=>b.onclick=()=>switchTab(b.dataset.v8Jump));
 $("v8MissionFilter").onchange=renderMissions;$("v8ContinueButton").onclick=()=>openMission((missions.find(m=>!progress.completed.includes(m.id))||missions[0]).id);
 $("v8CloseMission").onclick=$("v8CancelMission").onclick=()=>$("v8MissionDialog").close();$("v8LaunchMission").onclick=()=>launchMission();
 $("v8StartAssessment").onclick=startAssessment;$("v8CloseAssessment").onclick=()=>$("v8AssessmentDialog").close();$("v8LaunchExamShot").onclick=()=>{const a=progress.assessment,m=missions.find(x=>x.id===a.missions[a.index]);progress.activeMission=m.id;save();$("v8AssessmentDialog").close();launchMission(m)};
 $("v8PrintCertificate").onclick=showCertificate;$("v8CloseCertificate").onclick=()=>$("v8CertificateDialog").close();$("v8PrintCertificateNow").onclick=()=>window.print();
 $("v8ClearGallery").onclick=()=>{if(confirm("Clear all gallery photographs?")){progress.gallery=[];save();renderGallery()}};
 $("v8ExportProgress").onclick=exportProgress;$("v8ImportProgress").onchange=e=>e.target.files[0]&&importProgress(e.target.files[0]);
 const reviewObserver=new MutationObserver(()=>{const d=$("v7ReviewDialog");if(d?.open&&progress.activeMission){const score=parseInt($("v7ReviewScore")?.textContent)||0;const btn=$("v7TryAgain");if(btn&&!btn.dataset.v8bound){btn.dataset.v8bound="1";btn.addEventListener("click",()=>{completeMission(score);document.body.classList.remove("v8-camera-mode");setTimeout(()=>switchTab("dashboard"),100)})}}});
 const review=$("v7ReviewDialog");if(review)reviewObserver.observe(review,{attributes:true,attributeFilter:["open"]});
 const legacyBtn=$("v7LegacyToggle");if(legacyBtn)legacyBtn.insertAdjacentHTML("beforebegin",'<button id="v8ReturnAcademy" class="v7-reset">Return to academy</button>');document.addEventListener("click",e=>{if(e.target.id==="v8ReturnAcademy"){document.body.classList.remove("v8-camera-mode");switchTab("dashboard")}});
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
