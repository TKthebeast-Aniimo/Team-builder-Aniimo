const state = { aniimo: [], team: [null,null,null,null] };

const elementChart = {
  Fire:{Fire:.625,Water:.625,Grass:1.6,Lightning:1,Earth:.625,Wind:1,Dark:1,Ice:1.6,Light:.625},
  Water:{Fire:1.6,Water:.625,Grass:.625,Lightning:1,Earth:1.6,Wind:1,Dark:1,Ice:.625,Light:.625},
  Grass:{Fire:.625,Water:1.6,Grass:.625,Lightning:1,Earth:1.6,Wind:1,Dark:.625,Ice:1,Light:.625},
  Lightning:{Fire:1,Water:1.6,Grass:1,Lightning:.625,Earth:.625,Wind:1.6,Dark:1,Ice:.625,Light:1},
  Earth:{Fire:1,Water:.625,Grass:.625,Lightning:1.6,Earth:.625,Wind:1,Dark:.625,Ice:1.6,Light:1},
  Wind:{Fire:1,Water:1,Grass:1.6,Lightning:.625,Earth:1,Wind:.625,Dark:1.6,Ice:1,Light:1},
  Dark:{Fire:1.6,Water:.625,Grass:1.6,Lightning:1,Earth:1,Wind:.625,Dark:1,Ice:1,Light:1.6},
  Ice:{Fire:.625,Water:1.6,Grass:1,Lightning:1.6,Earth:.625,Wind:.625,Dark:1,Ice:.625,Light:1},
  Light:{Fire:1,Water:1,Grass:1,Lightning:.625,Earth:1,Wind:1.6,Dark:1.6,Ice:1,Light:.625}
};

const tagRules = [
  ["attack_up", /increase.*(attack|damage)|increases.*damage|increased.*damage|damage.*increase/i],
  ["defense_down", /reduce.*defen|defense.*down|defence.*down|damage taken.*increase/i],
  ["debuff", /debuff|curse|mark|weakness|reduc.*healing|paraly|silence|stun/i],
  ["fire_synergy", /fire damage|fire debuff/i],
  ["water_synergy", /water damage|water debuff/i],
  ["ice_synergy", /ice damage|ice debuff/i],
  ["dark_synergy", /dark damage|dark debuff/i],
  ["grass_synergy", /grass damage|grass debuff/i],
  ["wind_synergy", /wind damage|wind debuff/i],
  ["lightning_synergy", /lightning damage|lightning debuff|electric damage/i],
  ["earth_synergy", /earth damage|earth debuff|rock damage/i],
  ["light_synergy", /light damage|holy damage|light debuff/i],
  ["break_support", /break damage|increases.*break|break.*damage|stagger|break.*taken/i],
  ["heal", /heal|healing|restores hp|restore hp/i],
  ["regen", /regen|energy|ep cost|restor.*energy|restor.*ep/i],
  ["shield", /shield|damage reduction|damage reduction/i],
  ["control", /stun|silence|paraly|pull|slow|freeze|immobil/i],
  ["burst", /ultimate|massive|heavy|extra damage|bonus damage/i],
  ["self_scaling", /stacks?|stacking|each hit|critical/i]
];

function normalize(a){
  a = {...a};
  a.elements = Array.isArray(a.elements) ? a.elements : (a.element ? [a.element] : []);
  a.roles = Array.isArray(a.roles) ? a.roles : (a.role ? [a.role] : []);
  a.stats = a.stats || {};
  a.skills = a.skills || [];
  const text = [
    a.trait?.name || "", a.trait?.description || "",
    ...(a.skills||[]).flatMap(s => [s.name||"",s.description||"",s.element||"",s.type||""])
  ].join(" ");
  const tags = new Set(a.analysis?.tags || []);
  for(const [tag,re] of tagRules) if(re.test(text)) tags.add(tag);
  a.analysis = a.analysis || {};
  a.analysis.tags = [...tags];
  return a;
}

async function loadData(){
  const r = await fetch("data/aniimo.json?"+Date.now());
  if(!r.ok) throw new Error("Could not load data/aniimo.json");
  state.aniimo = (await r.json()).map(normalize);
  document.getElementById("rosterCount").textContent = state.aniimo.length;
  renderRoster();
  renderSlots();
}

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function imgFor(a){
  return a.imageUrl || "";
}
function fallback(name){
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#1a232e"/><text x="50%" y="50%" fill="#9eacb8" font-size="80" text-anchor="middle" dominant-baseline="middle">${(name||"?").slice(0,1)}</text></svg>`);
}
function role(a){return (a.roles||[])[0]||"Unclassified"}
function elements(a){return a.elements?.length ? a.elements : ["Unknown"]}

function renderRoster(){
  const q = document.getElementById("search").value.trim().toLowerCase();
  const rf = document.getElementById("roleFilter").value;
  const ef = document.getElementById("elementFilter").value;
  const box = document.getElementById("roster");
  const list = state.aniimo.filter(a =>
    (!q || a.name.toLowerCase().includes(q) || String(a.number).includes(q)) &&
    (!rf || a.roles.includes(rf)) &&
    (!ef || a.elements.includes(ef))
  );
  box.innerHTML = list.map(a => {
    const selected = state.team.some(x=>x?.id===a.id);
    return `<article class="card ${selected?'selected':''}" data-id="${a.id}">
      <img loading="lazy" src="${esc(imgFor(a)||fallback(a.name))}" onerror="this.src='${fallback(a.name)}'" alt="${esc(a.name)}">
      <div class="card-body">
        <div class="card-name">#${esc(a.number)} ${esc(a.name)}</div>
        <div class="chips">
          ${a.roles.map(x=>`<span class="chip role">${esc(x)}</span>`).join("")}
          ${a.elements.map(x=>`<span class="chip element">${esc(x)}</span>`).join("")}
        </div>
      </div>
    </article>`;
  }).join("") || `<p style="color:var(--muted)">No Aniimo match your filters.</p>`;
  box.querySelectorAll(".card").forEach(c=>c.onclick=()=>addToTeam(Number(c.dataset.id)));
}

function renderSlots(){
  const box = document.getElementById("teamSlots");
  box.innerHTML = state.team.map((a,i)=>{
    if(!a) return `<div class="slot empty"><div><b>Slot ${i+1}</b><br>Choose an Aniimo below</div></div>`;
    return `<div class="slot">
      <span class="slot-number">Slot ${i+1}</span>
      <button class="remove" aria-label="Remove" data-index="${i}">×</button>
      <img src="${esc(imgFor(a)||fallback(a.name))}" onerror="this.src='${fallback(a.name)}'" alt="${esc(a.name)}">
      <div class="slot-content"><div class="slot-name">${esc(a.name)}</div><div class="slot-meta">${esc(role(a))} · ${esc(elements(a).join(" / "))}</div></div>
    </div>`;
  }).join("");
  box.querySelectorAll(".remove").forEach(b=>b.onclick=()=>{state.team[Number(b.dataset.index)]=null;renderSlots();renderRoster();renderAnalysis();});
  renderAnalysis();
}

function addToTeam(id){
  const a=state.aniimo.find(x=>x.id===id);
  if(!a) return;
  const existing=state.team.findIndex(x=>x?.id===id);
  if(existing>=0){state.team[existing]=null;}
  else {
    const empty=state.team.findIndex(x=>!x);
    if(empty<0){ alert("Your team already has four Aniimo. Remove one first."); return; }
    state.team[empty]=a;
  }
  renderSlots();renderRoster();renderAnalysis();
}

function avg(nums){const x=nums.filter(n=>Number.isFinite(n));return x.length?x.reduce((a,b)=>a+b,0)/x.length:0}
function stat(a,k){const n=Number(a.stats?.[k]);return Number.isFinite(n)?n:0}
function hasTag(a,t){return a.analysis?.tags?.includes(t)}
function teamText(){return state.team.filter(Boolean).map(a=>a.name).join(" + ")}

function calc(){
  const t=state.team.filter(Boolean);
  if(t.length<2) return null;
  const dps=t.filter(a=>role(a)==="DPS");
  const br=t.filter(a=>role(a)==="Break");
  const su=t.filter(a=>role(a)==="Support");
  const re=t.filter(a=>role(a)==="Regen");
  const he=t.filter(a=>role(a)==="Heal");

  let synergy=45;
  const reasons=[];
  const warnings=[];

  // Explicit role interactions, with no composition restriction.
  if(dps.length){synergy+=Math.min(12,dps.length*4); reasons.push(`${dps.length} DPS slot${dps.length>1?"s":""} provide the team's damage payload.`);}
  if(br.length){synergy+=Math.min(10,br.length*5); reasons.push(`${br.length} Break unit${br.length>1?"s":""} can create damage windows.`);}
  if(su.length){synergy+=Math.min(10,su.length*5); reasons.push(`${su.length} Support unit${su.length>1?"s":""} can add utility/buffs/debuffs.`);}
  if(re.length){synergy+=Math.min(8,re.length*4); reasons.push(`${re.length} Regen unit${re.length>1?"s":""} improve sustained resource/survival value.`);}
  if(he.length){synergy+=Math.min(8,he.length*4); reasons.push(`${he.length} Heal unit${he.length>1?"s":""} improve HP recovery.`);}

  // Tag interactions.
  for(const a of t){
    for(const b of t){
      if(a===b) continue;
      if(hasTag(a,"attack_up") && role(b)==="DPS"){synergy+=3; reasons.push(`${a.name} has offensive buff evidence that can benefit ${b.name}.`);}
      if(hasTag(a,"defense_down") && (role(b)==="DPS"||role(b)==="Break")){synergy+=3; reasons.push(`${a.name} applies a defense/down-type effect that can amplify ${b.name}'s damage.`);}
      if(hasTag(a,"break_support") && role(b)==="DPS"){synergy+=3; reasons.push(`${a.name} has Break-related effects that can help ${b.name} capitalize on openings.`);}
      if(hasTag(a,"heal") && role(b)==="DPS"){synergy+=1;}
      if(hasTag(a,"debuff") && hasTag(b,"burst")){synergy+=2; reasons.push(`${a.name} provides debuff/control evidence while ${b.name} has burst-oriented skill evidence.`);}
      for(const el of elements(b)){
        if(hasTag(a,`${el.toLowerCase()}_synergy`)){synergy+=3; reasons.push(`${a.name} has ${el}-specific synergy evidence for ${b.name}.`);}
      }
    }
  }

  // Elemental coverage: reward having multiple offensive elements, penalize one-element dependence.
  const offensiveElements=[...new Set(t.flatMap(elements).filter(e=>elementChart[e]))];
  if(offensiveElements.length>=3){synergy+=5;reasons.push(`The team has ${offensiveElements.length} distinct elements for broader coverage.`);}
  if(offensiveElements.length===1){synergy-=6;warnings.push(`The team is heavily dependent on ${offensiveElements[0]} coverage.`);}

  // Stats.
  const attack=avg(t.map(a=>stat(a,"ATK")));
  const brk=avg(t.map(a=>stat(a,"BREAK")));
  const hp=avg(t.map(a=>stat(a,"HP")));
  const regen=avg(t.map(a=>stat(a,"REGEN")));

  const damage=Math.max(0,Math.min(100,Math.round(35 + (dps.length*18) + Math.min(25,attack/6))));
  const breakScore=Math.max(0,Math.min(100,Math.round(30 + br.length*18 + brk/5)));
  const sustain=Math.max(0,Math.min(100,Math.round(25 + he.length*20 + re.length*15 + (regen/10) + (hp/20))));
  const score=Math.max(0,Math.min(100,Math.round((synergy+damage+breakScore+sustain)/4)));

  // Weakness exposure: which enemy elements get 1.6x against any team element?
  const exposure={};
  for(const enemy of Object.keys(elementChart)){
    let best=0;
    for(const def of offensiveElements) best=Math.max(best, elementChart[enemy]?.[def]||1);
    if(best>1) exposure[enemy]=best;
  }
  const weak=[...Object.entries(exposure)].sort((a,b)=>b[1]-a[1]).map(([e])=>e);
  if(weak.length) warnings.push(`Enemy ${weak.slice(0,3).join(", ")} teams have at least one favourable elemental matchup into your roster.`);

  const primary=[...dps].sort((a,b)=>stat(b,"ATK")-stat(a,"ATK"))[0] || [...t].sort((a,b)=>stat(b,"ATK")-stat(a,"ATK"))[0];

  const steps=[];
  if(br.length) steps.push(`Open with ${br[0].name} when practical and build Break pressure.`);
  if(su.length) steps.push(`Use ${su[0].name}'s buff/debuff/utility effects before the main damage window where their descriptions support doing so.`);
  if(primary) steps.push(`Use ${primary.name} as the main damage payload and spend high-impact skills during favourable windows.`);
  if(re.length) steps.push(`Cycle ${re[0].name} when the fight needs sustained resource or recovery value.`);
  if(he.length) steps.push(`Hold ${he[0].name} for recovery when HP pressure makes continued DPS unsafe.`);
  if(!br.length) steps.unshift("No Break role is present; the team may need to create damage windows through raw pressure/control instead.");
  if(!he.length && !re.length) warnings.push("There is no Heal or Regen role, so sustained recovery may be limited.");
  if(dps.length===0) warnings.push("There is no DPS role; damage must come from other roles and skill kits.");

  return {t,score,damage,breakScore,sustain,synergy:Math.max(0,Math.min(100,Math.round(synergy))),reasons:[...new Set(reasons)].slice(0,10),warnings:[...new Set(warnings)],steps,weak:weak.slice(0,5)};
}

function bar(label,val){
  return `<div class="bar-row"><span>${label}</span><div class="bar"><i style="width:${val}%"></i></div><b>${val}</b></div>`;
}

function renderAnalysis(){
  const section=document.getElementById("analysis");
  const r=calc();
  if(!r){section.classList.add("hidden");return;}
  section.classList.remove("hidden");
  document.getElementById("teamTitle").textContent=teamText();
  document.getElementById("teamSubtitle").textContent=`${r.t.length}/4 selected · role stacking is allowed`;
  document.getElementById("overallScore").textContent=r.score;
  document.getElementById("analysisBody").innerHTML=`
    <div class="analysis-grid">
      <div class="report-box">
        <h3>Team profile</h3>
        <div class="bars">${bar("Overall",r.score)}${bar("Synergy",r.synergy)}${bar("Damage",r.damage)}${bar("Break",r.breakScore)}${bar("Sustain",r.sustain)}</div>
        <h3 style="margin-top:18px">Why this works</h3>
        <ul>${r.reasons.map(x=>`<li class="good">${esc(x)}</li>`).join("")||"<li>Not enough confirmed interaction data yet.</li>"}</ul>
      </div>
      <div class="report-box">
        <h3>Weaknesses / watch-outs</h3>
        <ul>${r.warnings.map(x=>`<li class="${x.includes("No ")||x.includes("no ")?"warn":"bad"}">${esc(x)}</li>`).join("")||"<li class='good'>No major heuristic warning.</li>"}</ul>
        <p><b>Enemy elements to watch:</b> ${r.weak.length?r.weak.map(x=>`<span class="chip element">${esc(x)}</span>`).join(" "):"No confirmed exposure from the current matrix."}</p>
      </div>
    </div>
    <div class="report-box" style="margin-top:14px">
      <h3>Suggested game plan</h3>
      <div class="steps">${r.steps.map(x=>`<div class="step">${esc(x)}</div>`).join("")}</div>
      <p style="margin-top:12px;color:var(--muted)">The strategy text is deliberately explainable: it is generated from the roles, stats and ability descriptions in the dataset rather than pretending to know an undocumented rotation.</p>
    </div>`;
}

document.getElementById("search").addEventListener("input",renderRoster);
document.getElementById("roleFilter").addEventListener("change",renderRoster);
document.getElementById("elementFilter").addEventListener("change",renderRoster);
document.getElementById("clearTeam").onclick=()=>{state.team=[null,null,null,null];renderSlots();renderRoster();};
loadData().catch(err=>{
  document.getElementById("roster").innerHTML=`<div class="report-box"><b>Data could not be loaded.</b><p>${esc(err.message)}</p><p>Run the included GitHub Action or open the repository locally after the data file has been generated.</p></div>`;
});
