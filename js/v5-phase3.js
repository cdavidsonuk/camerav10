
(() => {
  const $ = id => document.getElementById(id);
  const KEY = "photographyCoursesV5Phase3Progress";
  const missions = [
    {
      id:"portrait-separation", module:1, title:"Portrait subject separation",
      description:"Create a flattering portrait with a sharp subject and visibly soft background.",
      scene:"portrait", setup:{scene:"portrait",mode:"A",shutter:"1/250",aperture:2.8,iso:200,focalLength:85,focusDistance:42},
      requirements:[["Aperture","f/4 or wider"],["Lens","70mm or longer"],["Focus","Sharp subject"]],
      score:s=> scoreRange(s.aperture,1.4,4,35)+scoreMin(s.focalLength,70,25)+scoreFocus(s,25)+scoreExposure(s,15)
    },
    {
      id:"freeze-action", module:2, title:"Freeze fast action",
      description:"Stop the cyclist sharply while maintaining a usable exposure.",
      scene:"cyclist", setup:{scene:"cyclist",mode:"S",shutter:"1/1000",aperture:4,iso:800,focalLength:135,focusDistance:46},
      requirements:[["Shutter","1/500 or faster"],["AF mode","AF-C"],["Exposure","Within ±1 EV"]],
      score:s=> scoreShutter(s.shutter,1/500,40)+((state.afMode==="AF-C")?25:5)+scoreExposure(s,25)+scoreFocus(s,10)
    },
    {
      id:"night-control", module:3, title:"Night exposure control",
      description:"Preserve atmosphere in the night scene without severe clipping or camera shake.",
      scene:"night", setup:{scene:"night",mode:"M",shutter:"1/30",aperture:2,iso:1600,focalLength:35,focusDistance:70,whiteBalance:"tungsten"},
      requirements:[["Exposure","Between -1 and +0.5 EV"],["Aperture","f/2.8 or wider"],["White balance","Tungsten"]],
      score:s=> scoreExposureBand(s,-1,.5,40)+scoreRange(s.aperture,1.4,2.8,25)+(s.whiteBalance==="tungsten"?20:5)+scoreFocus(s,15)
    },
    {
      id:"landscape-depth", module:4, title:"Landscape depth of field",
      description:"Keep the landscape detailed from foreground to background at a clean ISO.",
      scene:"landscape", setup:{scene:"landscape",mode:"A",shutter:"1/125",aperture:8,iso:100,focalLength:24,focusDistance:62},
      requirements:[["Aperture","f/8–f/11"],["ISO","400 or lower"],["Lens","35mm or wider"]],
      score:s=> scoreRange(s.aperture,8,11,35)+(s.iso<=400?25:5)+(s.focalLength<=35?25:5)+scoreExposure(s,15)
    },
    {
      id:"creative-motion", module:5, title:"Creative motion blur",
      description:"Use a deliberately slower shutter speed to show movement while retaining intent.",
      scene:"cyclist", setup:{scene:"cyclist",mode:"S",shutter:"1/30",aperture:8,iso:100,focalLength:50,focusDistance:46},
      requirements:[["Shutter","1/15–1/60"],["Drive","Continuous"],["Exposure","Within ±1 EV"]],
      score:s=> scoreShutterBand(s.shutter,1/60,1/15,40)+(state.driveMode.includes("continuous")?25:5)+scoreExposure(s,25)+scoreFocus(s,10)
    },
    {
      id:"manual-mastery", module:6, title:"Manual mode mastery",
      description:"Balance shutter speed, aperture and ISO manually for a technically controlled result.",
      scene:"portrait", setup:{scene:"portrait",mode:"M",shutter:"1/125",aperture:4,iso:400,focalLength:50,focusDistance:42},
      requirements:[["Mode","Manual"],["Exposure","Within ±0.5 EV"],["Focus","Confirmed"]],
      score:s=> (s.mode==="M"?30:0)+scoreExposureBand(s,-.5,.5,40)+scoreFocus(s,30)
    }
  ];

  const achievements = [
    {id:"first-shot",icon:"📸",title:"First photograph",desc:"Capture your first Phase 3 photo",test:p=>p.photos>=1},
    {id:"bronze",icon:"🥉",title:"Bronze standard",desc:"Earn a bronze medal",test:p=>Object.values(p.scores).some(x=>x>=60)},
    {id:"gold",icon:"🥇",title:"Gold standard",desc:"Earn a gold medal",test:p=>Object.values(p.scores).some(x=>x>=90)},
    {id:"three-complete",icon:"🎯",title:"Committed learner",desc:"Complete three missions",test:p=>Object.values(p.scores).filter(x=>x>=60).length>=3},
    {id:"course-complete",icon:"🏆",title:"Camera graduate",desc:"Complete all six missions",test:p=>Object.values(p.scores).filter(x=>x>=60).length===missions.length}
  ];

  let progress = load();
  let activeMission = missions.find(m=>!progress.scores[m.id] || progress.scores[m.id]<60) || missions[0];
  let latestCapture = null;
  const state = window.V5_PHASE3_STATE = {
    afMode: progress.controls?.afMode || "AF-S",
    driveMode: progress.controls?.driveMode || "single",
    exposureComp: progress.controls?.exposureComp || 0
  };

  function load(){
    try{
      const p=JSON.parse(localStorage.getItem(KEY)||"null");
      return p || {xp:0,photos:0,scores:{},unlocked:[],lastDate:null,streak:1,controls:{}};
    }catch{return {xp:0,photos:0,scores:{},unlocked:[],lastDate:null,streak:1,controls:{}}}
  }
  function save(){
    progress.controls={...state};
    localStorage.setItem(KEY,JSON.stringify(progress));
  }
  function shutterSeconds(v){
    if(!v)return 1/125;
    if(v.endsWith("s"))return parseFloat(v);
    const a=v.split("/"); return a.length===2?+a[0]/+a[1]:+v;
  }
  function clamp(n){return Math.max(0,Math.min(100,Math.round(n)))}
  function scoreRange(v,min,max,points){return v>=min&&v<=max?points:Math.max(0,points-Math.min(points,Math.abs(v-(v<min?min:max))*6))}
  function scoreMin(v,min,points){return v>=min?points:Math.max(0,points*(v/min))}
  function scoreFocus(s,points){return Math.max(0,points*(1-Math.min(1,(s.simulation?.focus||0)*2.5)))}
  function adjustedEV(s){return (s.simulation?.e||0)+state.exposureComp}
  function scoreExposure(s,points){return Math.max(0,points*(1-Math.min(1,Math.abs(adjustedEV(s))/2)))}
  function scoreExposureBand(s,min,max,points){const e=adjustedEV(s);return e>=min&&e<=max?points:Math.max(0,points-Math.min(points,Math.abs(e-(e<min?min:max))*points))}
  function scoreShutter(v,maxSeconds,points){return shutterSeconds(v)<=maxSeconds?points:Math.max(0,points*(maxSeconds/shutterSeconds(v)))}
  function scoreShutterBand(v,minSeconds,maxSeconds,points){const x=shutterSeconds(v);return x>=minSeconds&&x<=maxSeconds?points:Math.max(0,points*.25)}
  function medal(score){return score>=90?"🥇":score>=75?"🥈":score>=60?"🥉":"—"}
  function medalName(score){return score>=90?"Gold":score>=75?"Silver":score>=60?"Bronze":"—"}

  function updateStreak(){
    const today=new Date().toISOString().slice(0,10);
    if(!progress.lastDate){progress.lastDate=today;progress.streak=1;return}
    if(progress.lastDate===today)return;
    const prev=new Date(progress.lastDate+"T12:00:00"), now=new Date(today+"T12:00:00");
    const days=Math.round((now-prev)/86400000);
    progress.streak=days===1?(progress.streak||1)+1:1;
    progress.lastDate=today;
  }

  function renderMissions(){
    const list=$("v5p3MissionList"); list.innerHTML="";
    missions.forEach((m,i)=>{
      const score=progress.scores[m.id]||0;
      const b=document.createElement("button");
      b.className="v5p3-mission"+(m.id===activeMission.id?" active":"")+(score>=60?" done":"");
      b.innerHTML=`<span class="v5p3-mission-number">${i+1}</span><span><strong>${m.title}</strong><small>Module ${m.module}</small></span><span class="v5p3-mission-score">${score?score+"%":"—"}</span>`;
      b.onclick=()=>{activeMission=m;renderAll()};
      list.appendChild(b);
    });
  }

  function renderMission(){
    $("v5p3ModuleLabel").textContent=`MODULE ${activeMission.module}`;
    $("v5p3MissionTitle").textContent=activeMission.title;
    $("v5p3MissionDescription").textContent=activeMission.description;
    const score=progress.scores[activeMission.id]||0;
    $("v5p3MissionMedal").textContent=medal(score);
    $("v5p3Requirements").innerHTML=activeMission.requirements.map(([a,b])=>`<div class="v5p3-requirement"><span>${a}</span><strong>${b}</strong></div>`).join("");
  }

  function renderAchievements(){
    const wrap=$("v5p3AchievementList"); wrap.innerHTML="";
    achievements.forEach(a=>{
      const unlocked=progress.unlocked.includes(a.id);
      wrap.innerHTML+=`<div class="v5p3-achievement ${unlocked?"unlocked":""}"><span class="v5p3-achievement-icon">${a.icon}</span><span><strong>${a.title}</strong><small>${a.desc}</small></span></div>`;
    });
  }

  function renderStats(){
    const complete=Object.values(progress.scores).filter(x=>x>=60).length;
    const level=Math.floor(progress.xp/250)+1;
    const levelXp=progress.xp%250;
    const best=Math.max(0,...Object.values(progress.scores));
    $("v5p3Level").textContent=level;
    $("v5p3XpText").textContent=`${levelXp} / 250 XP`;
    $("v5p3XpBar").style.width=`${(levelXp/250)*100}%`;
    $("v5p3Xp").textContent=progress.xp;
    $("v5p3Streak").textContent=`${progress.streak||1} day${progress.streak===1?"":"s"}`;
    $("v5p3BestMedal").textContent=medalName(best);
    $("v5p3Photos").textContent=progress.photos;
    $("v5p3MissionCount").textContent=`${complete}/${missions.length}`;
  }

  function unlockAchievements(){
    achievements.forEach(a=>{
      if(!progress.unlocked.includes(a.id)&&a.test(progress)){
        progress.unlocked.push(a.id);
        progress.xp+=50;
        $("v5p3CoachTitle").textContent=`Achievement unlocked: ${a.title}`;
        $("v5p3CoachText").textContent=a.desc+" You earned 50 bonus XP.";
      }
    });
  }

  function renderAll(){
    renderMissions();renderMission();renderStats();renderAchievements();save();
  }

  function evaluate(){
    if(!latestCapture){
      $("v5p3CoachTitle").textContent="Take a photograph first";
      $("v5p3CoachText").textContent="Use the virtual shutter, then return here to evaluate the captured settings.";
      return;
    }
    const shot={...latestCapture.state,simulation:latestCapture.simulation};
    const raw=clamp(activeMission.score(shot));
    const old=progress.scores[activeMission.id]||0;
    if(raw>old){
      progress.scores[activeMission.id]=raw;
      progress.xp+=Math.max(10,raw-old);
    }
    const e=adjustedEV(shot);
    $("v5p3CoachTitle").textContent=`${raw}% · ${medalName(raw)} result`;
    let text=raw>=90?"Excellent control. Your settings satisfy the assignment at a professional standard.":
      raw>=75?"Strong result. Refine one small technical choice to reach gold.":
      raw>=60?"Assignment passed. Review the requirements and improve the weakest area.":
      "Not passed yet. Compare your settings with the assignment requirements and try again.";
    if(Math.abs(e)>1)text+=` Exposure is ${e>0?"too bright":"too dark"} by about ${Math.abs(e).toFixed(1)} EV.`;
    if((shot.simulation?.focus||0)>.2)text+=" Focus accuracy also needs attention.";
    $("v5p3CoachText").textContent=text;
    unlockAchievements();renderAll();
  }

  function setControls(values={}){
    if(values.autofocusMode)state.afMode=values.autofocusMode;
    if(values.driveMode)state.driveMode=values.driveMode;
    if(values.exposureComp!==undefined)state.exposureComp=+values.exposureComp;
    if($("v5p3AfMode"))$("v5p3AfMode").value=state.afMode;
    if($("v5p3DriveMode"))$("v5p3DriveMode").value=state.driveMode;
    if($("v5p3ExposureComp"))$("v5p3ExposureComp").value=state.exposureComp;
    if($("v5p3ExposureCompOut"))$("v5p3ExposureCompOut").textContent=`${state.exposureComp>=0?"+":""}${state.exposureComp.toFixed(1)} EV`;
  }
  window.V5_PHASE3_SET_CONTROLS=setControls;

  function init(){
    updateStreak();
    setControls();
    $("v5p3AfMode").onchange=e=>{state.afMode=e.target.value;save()};
    $("v5p3DriveMode").onchange=e=>{state.driveMode=e.target.value;save()};
    $("v5p3ExposureComp").oninput=e=>{state.exposureComp=+e.target.value;setControls();save()};
    $("v5p3LoadMission").onclick=()=>window.VIRTUAL_CAMERA_V5?.setState(activeMission.setup);
    $("v5p3Evaluate").onclick=evaluate;
    $("v5p3Reset").onclick=()=>{
      if(confirm("Reset all Phase 3 mission scores, XP and achievements?")){
        localStorage.removeItem(KEY);progress=load();latestCapture=null;activeMission=missions[0];updateStreak();renderAll();
      }
    };
    window.addEventListener("camera:capture",e=>{
      latestCapture=e.detail;
      progress.photos+=1;
      unlockAchievements();
      $("v5p3CoachTitle").textContent="Photograph ready for evaluation";
      $("v5p3CoachText").textContent="Select Evaluate latest photo to compare it with the active mission.";
      renderAll();
    });
    renderAll();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();
