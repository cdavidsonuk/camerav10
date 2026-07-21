
(()=>{
const $=id=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shutterSeconds=v=>String(v).includes("/")?1/parseFloat(String(v).split("/")[1]):parseFloat(v)||1;
const log2=x=>Math.log(x)/Math.log(2);

const challenges=[
 {title:"Freeze the action",text:"Use a shutter speed fast enough to freeze a moving subject while keeping noise under control.",
  targets:["Shutter 1/1000s or faster","ISO 3200 or lower","AF-C or tracking"],
  score:v=>{let s=0;if(v.sec<=1/1000)s+=45;if(v.iso<=3200)s+=25;if(/AF-C|Tracking/i.test(v.af))s+=30;return s}},
 {title:"Silky waterfall",text:"Create visible water movement without overexposing the scene.",
  targets:["Shutter 1/2s or slower","ISO 100–200","Aperture f/8 or smaller"],
  score:v=>{let s=0;if(v.sec>=.5)s+=45;if(v.iso<=200)s+=20;if(v.ap>=8)s+=35;return s}},
 {title:"Portrait separation",text:"Produce shallow depth of field while keeping the subject's eye sharp.",
  targets:["Aperture f/2.8 or wider","Focal length 70mm or longer","Focus accuracy above 80%"],
  score:v=>{let s=0;if(v.ap<=2.8)s+=40;if(v.focal>=70)s+=30;if(v.focus>=80)s+=30;return s}},
 {title:"Clean landscape",text:"Maximise detail and dynamic range for a landscape photograph.",
  targets:["ISO 100–200","Aperture f/8–f/11","Low motion risk"],
  score:v=>{let s=0;if(v.iso<=200)s+=35;if(v.ap>=8&&v.ap<=11)s+=35;if(v.motionRisk<35)s+=30;return s}},
 {title:"Night city balance",text:"Capture a bright night scene while protecting highlights.",
  targets:["Highlight clipping below 20%","Exposure between -1 and +1 EV","Noise below high"],
  score:v=>{let s=0;if(v.clipping<20)s+=40;if(Math.abs(v.ev)<=1)s+=35;if(v.noise<70)s+=25;return s}}
];
let challengeIndex=0;
let captureHooked=false;

function currentValues(){
 const sh=$("v11ShutterSelect")?.value||"1/125";
 const ap=parseFloat($("v11ApertureSelect")?.value||5.6);
 const iso=parseFloat($("v11IsoSelect")?.value||100);
 const focal=parseFloat($("v11FocalLength")?.value||50);
 const af=$("v11AfMode")?.value||"AF-S";
 const sec=shutterSeconds(sh);
 const sensor=$("proSensorSize")?.value||"full";
 const crop=sensor==="apsc"?1.5:sensor==="mft"?2:1;
 const stab=parseFloat($("proStabilisation")?.value||0);
 const subject=parseFloat($("proSubjectSpeed")?.value||20);
 const focus=parseFloat($("proFocusAccuracy")?.value||92);
 const dynamic=parseFloat($("proDynamicRange")?.value||12);
 const light=parseFloat($("proLightDirection")?.value||15);
 const focusDistance=parseFloat($("proFocusDistance")?.value||45);
 const baseEV=log2((ap*ap)/sec)-log2(iso/100);
 const targetEV=11.5;
 const ev=targetEV-baseEV;
 const handhold=1/(Math.max(1,focal*crop)*Math.pow(2,stab));
 const cameraMotion=sec>handhold?clamp((sec/handhold-1)*24,0,100):0;
 const subjectMotion=clamp(subject*sec*2.7,0,100);
 const motionRisk=clamp(Math.max(cameraMotion,subjectMotion),0,100);
 const noise=clamp(log2(iso/100)*15+(sensor==="apsc"?8:sensor==="mft"?16:0),0,100);
 const clipping=clamp(Math.max(0,ev*16)+(12-dynamic)*4+Math.abs(light)*.07,0,100);
 const dofScore=clamp((ap/16)*55+(focusDistance/100)*20-(focal/200)*28+(crop-1)*10,0,100);
 return {sh,ap,iso,focal,af,sec,sensor,crop,stab,subject,focus,dynamic,light,focusDistance,ev,motionRisk,noise,clipping,dofScore};
}

function classify(n,cuts,labels){
 for(let i=0;i<cuts.length;i++)if(n<cuts[i])return labels[i];
 return labels[labels.length-1];
}
function setClass(id,bad){
 const el=$(id);if(!el)return;el.classList.toggle("pro-engine-warning",bad);el.classList.toggle("pro-engine-good",!bad);
}

function updateEngine(){
 const v=currentValues();
 const lcd=$("v11Lcd"),img=$("v11SceneImage");
 const dof=classify(v.dofScore,[25,55,80],["Very shallow","Shallow","Medium","Deep"]);
 const motion=classify(v.motionRisk,[20,45,75],["Low","Moderate","High","Severe"]);
 const noise=classify(v.noise,[25,50,75],["Low","Moderate","High","Very high"]);
 const clip=classify(v.clipping,[8,20,45],["None","Minor","Moderate","Severe"]);
 if($("proEvReadout"))$("proEvReadout").textContent=`${v.ev>=0?"+":""}${v.ev.toFixed(1)} EV`;
 if($("proDofReadout"))$("proDofReadout").textContent=dof;
 if($("proMotionReadout"))$("proMotionReadout").textContent=motion;
 if($("proNoiseReadout"))$("proNoiseReadout").textContent=noise;
 if($("proClipReadout"))$("proClipReadout").textContent=clip;
 setClass("proMotionReadout",v.motionRisk>=45);setClass("proNoiseReadout",v.noise>=50);setClass("proClipReadout",v.clipping>=20);
 if(lcd){
   lcd.style.setProperty("--pro-bokeh-blur",`${clamp((4-v.ap)*1.2,1,7)}px`);
   lcd.style.setProperty("--pro-bokeh-scale",String(clamp(1+(4-v.ap)*.07,.95,1.35)));
   lcd.style.setProperty("--pro-motion-angle",`${90+v.light*.25}deg`);
   lcd.style.setProperty("--pro-light-angle",`${90+v.light*.8}deg`);
   lcd.style.setProperty("--pro-light-strength",String(clamp(Math.abs(v.light)/500+.03,.03,.22)));
   lcd.style.setProperty("--pro-vignette",String(clamp((v.focal-35)/500+.05,.04,.24)));
   lcd.style.setProperty("--pro-focus-x",`${clamp(v.focusDistance,12,88)}%`);
 }
 if(img){
   const exposure=clamp(1+v.ev*.13,.42,1.8);
   const contrast=clamp(1+(v.dynamic-10)*.03-.08, .75,1.35);
   const sat=v.sensor==="mft"?.96:v.sensor==="apsc"?.99:1.03;
   const atmosphere=$("proAtmosphere")?.value||"clear";
   const atmos=atmosphere==="mist"?"blur(.3px) contrast(.86) brightness(1.08)":atmosphere==="rain"?"contrast(1.08) saturate(.82)":atmosphere==="dust"?"sepia(.18) saturate(.9)":"";
   img.style.filter=`brightness(${exposure}) contrast(${contrast}) saturate(${sat}) ${atmos}`;
   img.style.transform=`scale(${1+(v.crop-1)*.06}) translateX(${v.light*.015}px)`;
 }
 const motionLayer=$("v15MotionLayer"),noiseLayer=$("v15NoiseLayer"),depth=$("v15DepthLayer"),bokeh=$("v15BokehLayer");
 if(motionLayer)motionLayer.style.opacity=(v.motionRisk/100*.72).toFixed(2);
 if(noiseLayer)noiseLayer.style.opacity=(v.noise/100*.68).toFixed(2);
 if(depth)depth.style.setProperty("--v15-blur",`${clamp((100-v.dofScore)/10,0,9)}px`);
 if(bokeh)bokeh.style.opacity=clamp((4-v.ap)/4,0,.8);
 updateChallengeProgress(v);
}

function showChallenge(){
 const c=challenges[challengeIndex];
 $("proChallengeTitle").textContent=c.title;
 $("proChallengeText").textContent=c.text;
 $("proChallengeTargets").innerHTML=c.targets.map(t=>`<span>□ ${t}</span>`).join("");
 $("proChallengeStatus").textContent="Adjust the camera, then take a photo.";
 $("proChallengeProgress").style.width="0%";
}
function updateChallengeProgress(v){
 const s=clamp(challenges[challengeIndex].score(v),0,100);
 $("proChallengeProgress").style.width=`${s}%`;
 $("proChallengeStatus").textContent=s>=85?"Ready to capture":s>=55?"Almost there":"Keep adjusting the camera";
}

function technicalScore(v){
 let score=100;
 score-=Math.max(0,Math.abs(v.ev)-.5)*17;
 score-=v.motionRisk*.28;
 score-=v.noise*.18;
 score-=v.clipping*.25;
 score-=Math.max(0,75-v.focus)*.32;
 return Math.round(clamp(score,0,100));
}
function feedback(v,tech,challenge){
 const points=[];
 if(Math.abs(v.ev)>1)points.push(v.ev>0?"The image is likely overexposed. Reduce light with a faster shutter, smaller aperture or lower ISO.":"The image is likely underexposed. Open the aperture, slow the shutter or raise ISO.");
 if(v.motionRisk>=45)points.push("Motion blur is a significant risk at these settings.");
 if(v.noise>=50)points.push("High ISO is reducing image quality and dynamic range.");
 if(v.clipping>=20)points.push("Important highlights may be clipped.");
 if(v.focus<75)points.push("Autofocus accuracy is too low for a dependable result.");
 if(!points.length)points.push("The technical balance is strong. Concentrate now on composition, timing and subject placement.");
 if(challenge>=85)points.push("You successfully met the current challenge.");
 else points.push("The challenge targets have not all been met yet.");
 return points.join(" ");
}
function drawHistogram(v){
 const c=$("proHistogramCanvas");if(!c)return;
 const ctx=c.getContext("2d"),w=c.width,h=c.height;
 ctx.clearRect(0,0,w,h);ctx.fillStyle="rgba(0,0,0,.75)";ctx.fillRect(0,0,w,h);
 ctx.strokeStyle="rgba(255,255,255,.18)";ctx.beginPath();
 for(let x=0;x<w;x+=50){ctx.moveTo(x,0);ctx.lineTo(x,h)}ctx.stroke();
 const centre=clamp(.5+v.ev*.1,.1,.9)*w;
 ctx.beginPath();ctx.moveTo(0,h);
 for(let x=0;x<w;x++){
   const main=Math.exp(-Math.pow((x-centre)/(w*.18),2))*h*.78;
   const shadows=Math.exp(-Math.pow((x-w*.18)/(w*.12),2))*h*.22;
   const highlights=Math.exp(-Math.pow((x-w*.85)/(w*.08),2))*h*(v.clipping/100*.5);
   const y=h-clamp(main+shadows+highlights,0,h-3);
   ctx.lineTo(x,y);
 }
 ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle="rgba(230,235,238,.72)";ctx.fill();
}
function captureReview(){
 const v=currentValues(),tech=technicalScore(v),challenge=Math.round(clamp(challenges[challengeIndex].score(v),0,100));
 const overall=Math.round(tech*.62+challenge*.38);
 $("proReviewImage").src=$("v11SceneImage")?.src||"";
 $("proReviewImage").style.cssText=$("v11SceneImage")?.style.cssText||"";
 $("proTechnicalScore").textContent=tech;
 $("proChallengeScore").textContent=challenge;
 $("proOverallScore").textContent=overall;
 $("proReviewFeedback").textContent=feedback(v,tech,challenge);
 drawHistogram(v);
 $("proCaptureReview").classList.add("open");
 $("proCaptureReview").setAttribute("aria-hidden","false");
}
function hookCapture(){
 if(captureHooked)return;
 const candidates=["v11Shutter","v11CaptureButton","captureButton"];
 for(const id of candidates){
   const el=$(id);if(el){
     el.addEventListener("click",()=>setTimeout(captureReview,180));
     captureHooked=true;break;
   }
 }
}

function init(){
 document.body.classList.add("pro-stage2");
 $("proEngineToggle").onclick=()=>{$("proEnginePanel").classList.add("open");$("proEnginePanel").setAttribute("aria-hidden","false")};
 $("proEngineClose").onclick=()=>{$("proEnginePanel").classList.remove("open");$("proEnginePanel").setAttribute("aria-hidden","true")};
 $("proNewChallenge").onclick=()=>{challengeIndex=(challengeIndex+1)%challenges.length;showChallenge();updateEngine()};
 $("proCaptureClose").onclick=$("proRetakeButton").onclick=()=>{$("proCaptureReview").classList.remove("open");$("proCaptureReview").setAttribute("aria-hidden","true")};
 const ids=["proSensorSize","proStabilisation","proSubjectSpeed","proBladeCount","proFocusDistance","proFocusAccuracy","proDynamicRange","proLightDirection","proAtmosphere",
 "v11ShutterSelect","v11ApertureSelect","v11IsoSelect","v11FocalLength","v11AfMode"];
 ids.forEach(id=>{$(id)?.addEventListener("input",updateEngine);$(id)?.addEventListener("change",updateEngine)});
 showChallenge();hookCapture();updateEngine();
 setTimeout(hookCapture,1200);
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
