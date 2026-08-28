const state = {
  aniimo: [],
  team: [null, null, null, null]
};

const elementChart = {
  Fire: {
    Fire: .625,
    Water: .625,
    Grass: 1.6,
    Lightning: 1,
    Earth: .625,
    Wind: 1,
    Dark: 1,
    Ice: 1.6,
    Light: .625
  },

  Water: {
    Fire: 1.6,
    Water: .625,
    Grass: .625,
    Lightning: 1,
    Earth: 1.6,
    Wind: 1,
    Dark: 1,
    Ice: .625,
    Light: .625
  },

  Grass: {
    Fire: .625,
    Water: 1.6,
    Grass: .625,
    Lightning: 1,
    Earth: 1.6,
    Wind: 1,
    Dark: .625,
    Ice: 1,
    Light: .625
  },

  Lightning: {
    Fire: 1,
    Water: 1.6,
    Grass: 1,
    Lightning: .625,
    Earth: .625,
    Wind: 1.6,
    Dark: 1,
    Ice: .625,
    Light: 1
  },

  Earth: {
    Fire: 1,
    Water: .625,
    Grass: .625,
    Lightning: 1.6,
    Earth: .625,
    Wind: 1,
    Dark: .625,
    Ice: 1.6,
    Light: 1
  },

  Wind: {
    Fire: 1,
    Water: 1,
    Grass: 1.6,
    Lightning: .625,
    Earth: 1,
    Wind: .625,
    Dark: 1.6,
    Ice: 1,
    Light: 1
  },

  Dark: {
    Fire: 1.6,
    Water: .625,
    Grass: 1.6,
    Lightning: 1,
    Earth: 1,
    Wind: .625,
    Dark: 1,
    Ice: 1,
    Light: 1.6
  },

  Ice: {
    Fire: .625,
    Water: 1.6,
    Grass: 1,
    Lightning: 1.6,
    Earth: .625,
    Wind: .625,
    Dark: 1,
    Ice: .625,
    Light: 1
  },

  Light: {
    Fire: 1,
    Water: 1,
    Grass: 1,
    Lightning: .625,
    Earth: 1,
    Wind: 1.6,
    Dark: 1.6,
    Ice: 1,
    Light: .625
  }
};

const tagRules = [
  [
    "attack_up",
    /increase.*(attack|damage)|increases.*damage|increased.*damage|damage.*increase/i
  ],
  [
    "defense_down",
    /reduce.*defen|defense.*down|defence.*down|damage taken.*increase/i
  ],
  [
    "debuff",
    /debuff|curse|mark|weakness|reduc.*healing|paraly|silence|stun/i
  ],
  ["fire_synergy", /fire damage|fire debuff/i],
  ["water_synergy", /water damage|water debuff/i],
  ["ice_synergy", /ice damage|ice debuff/i],
  ["dark_synergy", /dark damage|dark debuff/i],
  ["grass_synergy", /grass damage|grass debuff/i],
  ["wind_synergy", /wind damage|wind debuff/i],
  [
    "lightning_synergy",
    /lightning damage|lightning debuff|electric damage/i
  ],
  ["earth_synergy", /earth damage|earth debuff|rock damage/i],
  ["light_synergy", /light damage|holy damage|light debuff/i],
  [
    "break_support",
    /break damage|increases.*break|break.*damage|stagger|break.*taken/i
  ],
  ["heal", /heal|healing|restores hp|restore hp/i],
  ["regen", /regen|energy|ep cost|restor.*energy|restor.*ep/i],
  ["shield", /shield|damage reduction/i],
  [
    "control",
    /stun|silence|paraly|pull|slow|freeze|immobil/i
  ],
  ["burst", /ultimate|massive|heavy|extra damage|bonus damage/i],
  ["self_scaling", /stacks?|stacking|each hit|critical/i]
];

function normalize(a) {
  a = { ...a };

  a.elements = Array.isArray(a.elements)
    ? a.elements
    : a.element
      ? [a.element]
      : [];

  a.roles = Array.isArray(a.roles)
    ? a.roles
    : a.role
      ? [a.role]
      : [];

  a.stats = a.stats || {};
  a.skills = a.skills || [];

  const text = [
    a.trait?.name || "",
    a.trait?.description || "",
    ...(a.skills || []).flatMap(s => [
      s.name || "",
      s.description || "",
      s.element || "",
      s.type || ""
    ])
  ].join(" ");

  const tags = new Set(a.analysis?.tags || []);

  for (const [tag, re] of tagRules) {
    if (re.test(text)) {
      tags.add(tag);
    }
  }

  a.analysis = a.analysis || {};
  a.analysis.tags = [...tags];

  return a;
}

async function loadData() {
  const response = await fetch("aniimo.json?" + Date.now());

  if (!response.ok) {
    throw new Error(
      "Could not load aniimo.json. Check that the file exists in the repository."
    );
  }

  state.aniimo = (await response.json()).map(normalize);

  document.getElementById("rosterCount").textContent =
    state.aniimo.length;

  renderRoster();
  renderSlots();
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}

function imgFor(a) {
  return a.imageUrl || "";
}

function fallback(name) {
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg"
           width="500"
           height="500">
        <rect width="100%" height="100%" fill="#1a232e"/>
        <text x="50%"
              y="50%"
              fill="#9eacb8"
              font-size="80"
              text-anchor="middle"
              dominant-baseline="middle">
          ${(name || "?").slice(0, 1)}
        </text>
      </svg>
    `)
  );
}

function role(a) {
  return (a.roles || [])[0] || "Unclassified";
}

function elements(a) {
  return a.elements?.length ? a.elements : ["Unknown"];
}

function renderRoster() {
  const q = document
    .getElementById("search")
    .value
    .trim()
    .toLowerCase();

  const roleFilter =
    document.getElementById("roleFilter").value;

  const elementFilter =
    document.getElementById("elementFilter").value;

  const box = document.getElementById("roster");

  const list = state.aniimo.filter(a =>
    (!q ||
      a.name.toLowerCase().includes(q) ||
      String(a.number).includes(q)) &&
    (!roleFilter || a.roles.includes(roleFilter)) &&
    (!elementFilter || a.elements.includes(elementFilter))
  );

  box.innerHTML =
    list
      .map(a => {
        const selected = state.team.some(
          x => x?.id === a.id
        );

        return `
          <article
            class="card ${selected ? "selected" : ""}"
            data-id="${a.id}"
          >
            <img
              loading="lazy"
              src="${esc(imgFor(a) || fallback(a.name))}"
              onerror="this.src='${fallback(a.name)}'"
              alt="${esc(a.name)}"
            >

            <div class="card-body">
              <div class="card-name">
                #${esc(a.number)} ${esc(a.name)}
              </div>

              <div class="chips">
                ${a.roles
                  .map(
                    x =>
                      `<span class="chip role">${esc(x)}</span>`
                  )
                  .join("")}

                ${a.elements
                  .map(
                    x =>
                      `<span class="chip element">${esc(x)}</span>`
                  )
                  .join("")}
              </div>
            </div>
          </article>
        `;
      })
      .join("") ||
    `<p style="color:var(--muted)">
      No Aniimo match your filters.
    </p>`;

  box
    .querySelectorAll(".card")
    .forEach(card => {
      card.onclick = () =>
        addToTeam(Number(card.dataset.id));
    });
}

function renderSlots() {
  const box = document.getElementById("teamSlots");

  box.innerHTML = state.team
    .map((a, index) => {
      if (!a) {
        return `
          <div class="slot empty">
            <div>
              <b>Slot ${index + 1}</b><br>
              Choose an Aniimo below
            </div>
          </div>
        `;
      }

      return `
        <div class="slot">
          <span class="slot-number">
            Slot ${index + 1}
          </span>

          <button
            class="remove"
            aria-label="Remove"
            data-index="${index}"
          >
            ×
          </button>

          <img
            src="${esc(imgFor(a) || fallback(a.name))}"
            onerror="this.src='${fallback(a.name)}'"
            alt="${esc(a.name)}"
          >

          <div class="slot-content">
            <div class="slot-name">
              ${esc(a.name)}
            </div>

            <div class="slot-meta">
              ${esc(role(a))} ·
              ${esc(elements(a).join(" / "))}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  box
    .querySelectorAll(".remove")
    .forEach(button => {
      button.onclick = () => {
        state.team[
          Number(button.dataset.index)
        ] = null;

        renderSlots();
        renderRoster();
        renderAnalysis();
      };
    });

  renderAnalysis();
}

function addToTeam(id) {
  const aniimo = state.aniimo.find(
    x => x.id === id
  );

  if (!aniimo) return;

  const existing = state.team.findIndex(
    x => x?.id === id
  );

  if (existing >= 0) {
    state.team[existing] = null;
  } else {
    const empty = state.team.findIndex(
      x => !x
    );

    if (empty < 0) {
      alert(
        "Your team already has four Aniimo. Remove one first."
      );
      return;
    }

    state.team[empty] = aniimo;
  }

  renderSlots();
  renderRoster();
  renderAnalysis();
}

function avg(numbers) {
  const valid = numbers.filter(
    n => Number.isFinite(n)
  );

  return valid.length
    ? valid.reduce((a, b) => a + b, 0) /
        valid.length
    : 0;
}

function stat(a, key) {
  const number = Number(a.stats?.[key]);

  return Number.isFinite(number)
    ? number
    : 0;
}

function hasTag(a, tag) {
  return a.analysis?.tags?.includes(tag);
}

function teamText() {
  return state.team
    .filter(Boolean)
    .map(a => a.name)
    .join(" + ");
}

function calc() {
  const team = state.team.filter(Boolean);

  if (team.length < 2) {
    return null;
  }

  const dps = team.filter(
    a => role(a) === "DPS"
  );

  const breakers = team.filter(
    a => role(a) === "Break"
  );

  const supports = team.filter(
    a => role(a) === "Support"
  );

  const regen = team.filter(
    a => role(a) === "Regen"
  );

  const healers = team.filter(
    a => role(a) === "Heal"
  );

  let synergy = 45;

  const reasons = [];
  const warnings = [];

  if (dps.length) {
    synergy += Math.min(12, dps.length * 4);

    reasons.push(
      `${dps.length} DPS slot${
        dps.length > 1 ? "s" : ""
      } provide the team's damage payload.`
    );
  }

  if (breakers.length) {
    synergy += Math.min(
      10,
      breakers.length * 5
    );

    reasons.push(
      `${breakers.length} Break unit${
        breakers.length > 1 ? "s" : ""
      } can create damage windows.`
    );
  }

  if (supports.length) {
    synergy += Math.min(
      10,
      supports.length * 5
    );

    reasons.push(
      `${supports.length} Support unit${
        supports.length > 1 ? "s" : ""
      } can add utility, buffs or debuffs.`
    );
  }

  if (regen.length) {
    synergy += Math.min(
      8,
      regen.length * 4
    );

    reasons.push(
      `${regen.length} Regen unit${
        regen.length > 1 ? "s" : ""
      } improve sustained resource/survival value.`
    );
  }

  if (healers.length) {
    synergy += Math.min(
      8,
      healers.length * 4
    );

    reasons.push(
      `${healers.length} Heal unit${
        healers.length > 1 ? "s" : ""
      } improve HP recovery.`
    );
  }

  for (const a of team) {
    for (const b of team) {
      if (a === b) continue;

      if (
        hasTag(a, "attack_up") &&
        role(b) === "DPS"
      ) {
        synergy += 3;

        reasons.push(
          `${a.name} has offensive buff evidence that can benefit ${b.name}.`
        );
      }

      if (
        hasTag(a, "defense_down") &&
        (
          role(b) === "DPS" ||
          role(b) === "Break"
        )
      ) {
        synergy += 3;

        reasons.push(
          `${a.name} applies a defense/down-type effect that can amplify ${b.name}'s damage.`
        );
      }

      if (
        hasTag(a, "break_support") &&
        role(b) === "DPS"
      ) {
        synergy += 3;

        reasons.push(
          `${a.name} has Break-related effects that can help ${b.name} capitalize on openings.`
        );
      }

      if (
        hasTag(a, "heal") &&
        role(b) === "DPS"
      ) {
        synergy += 1;
      }

      if (
        hasTag(a, "debuff") &&
        hasTag(b, "burst")
      ) {
        synergy += 2;

        reasons.push(
          `${a.name} provides debuff/control evidence while ${b.name} has burst-oriented skill evidence.`
        );
      }

      for (const element of elements(b)) {
        if (
          hasTag(
            a,
            `${element.toLowerCase()}_synergy`
          )
        ) {
          synergy += 3;

          reasons.push(
            `${a.name} has ${element}-specific synergy evidence for ${b.name}.`
          );
        }
      }
    }
  }

  const offensiveElements = [
    ...new Set(
      team
        .flatMap(elements)
        .filter(e => elementChart[e])
    )
  ];

  if (offensiveElements.length >= 3) {
    synergy += 5;

    reasons.push(
      `The team has ${offensiveElements.length} distinct elements for broader coverage.`
    );
  }

  if (offensiveElements.length === 1) {
    synergy -= 6;

    warnings.push(
      `The team is heavily dependent on ${offensiveElements[0]} coverage.`
    );
  }

  const attack = avg(
    team.map(a => stat(a, "ATK"))
  );

  const breakStat = avg(
    team.map(a => stat(a, "BREAK"))
  );

  const hp = avg(
    team.map(a => stat(a, "HP"))
  );

  const regenStat = avg(
    team.map(a => stat(a, "REGEN"))
  );

  const damage = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        35 +
        dps.length * 18 +
        Math.min(25, attack / 6)
      )
    )
  );

  const breakScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        30 +
        breakers.length * 18 +
        breakStat / 5
      )
    )
  );

  const sustain = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        25 +
        healers.length * 20 +
        regen.length * 15 +
        regenStat / 10 +
        hp / 20
      )
    )
  );

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (
          synergy +
          damage +
          breakScore +
          sustain
        ) / 4
      )
    )
  );

  const exposure = {};

  for (
    const enemy of Object.keys(elementChart)
  ) {
    let best = 0;

    for (
      const defense of offensiveElements
    ) {
      best = Math.max(
        best,
        elementChart[enemy]?.[defense] || 1
      );
    }

    if (best > 1) {
      exposure[enemy] = best;
    }
  }

  const weak = Object.entries(exposure)
    .sort((a, b) => b[1] - a[1])
    .map(([element]) => element);

  if (weak.length) {
    warnings.push(
      `Enemy ${weak
        .slice(0, 3)
        .join(", ")} teams have at least one favourable elemental matchup into your roster.`
    );
  }

  const primary =
    [...dps].sort(
      (a, b) =>
        stat(b, "ATK") -
        stat(a, "ATK")
    )[0] ||
    [...team].sort(
      (a, b) =>
        stat(b, "ATK") -
        stat(a, "ATK")
    )[0];

  const steps = [];

  if (breakers.length) {
    steps.push(
      `Open with ${breakers[0].name} when practical and build Break pressure.`
    );
  }

  if (supports.length) {
    steps.push(
      `Use ${supports[0].name}'s buff, debuff or utility effects before the main damage window where their descriptions support doing so.`
    );
  }

  if (primary) {
    steps.push(
      `Use ${primary.name} as the main damage payload and spend high-impact skills during favourable windows.`
    );
  }

  if (regen.length) {
    steps.push(
      `Cycle ${regen[0].name} when the fight needs sustained resource or recovery value.`
    );
  }

  if (healers.length) {
    steps.push(
      `Hold ${healers[0].name} for recovery when HP pressure makes continued DPS unsafe.`
    );
  }

  if (!breakers.length) {
    steps.unshift(
      "No Break role is present; the team may need to create damage windows through raw pressure or control instead."
    );
  }

  if (!healers.length && !regen.length) {
    warnings.push(
      "There is no Heal or Regen role, so sustained recovery may be limited."
    );
  }

  if (!dps.length) {
    warnings.push(
      "There is no DPS role; damage must come from other roles and skill kits."
    );
  }

  return {
    team,
    score,
    damage,
    breakScore,
    sustain,
    synergy: Math.max(
      0,
      Math.min(
        100,
        Math.round(synergy)
      )
    ),
    reasons: [
      ...new Set(reasons)
    ].slice(0, 10),
    warnings: [
      ...new Set(warnings)
    ],
    steps,
    weak: weak.slice(0, 5)
  };
}

function bar(label, value) {
  return `
    <div class="bar-row">
      <span>${label}</span>

      <div class="bar">
        <i style="width:${value}%"></i>
      </div>

      <b>${value}</b>
    </div>
  `;
}

function renderAnalysis() {
  const section =
    document.getElementById("analysis");

  const result = calc();

  if (!result) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");

  document.getElementById(
    "teamTitle"
  ).textContent = teamText();

  document.getElementById(
    "teamSubtitle"
  ).textContent =
    `${result.team.length}/4 selected · role stacking is allowed`;

  document.getElementById(
    "overallScore"
  ).textContent = result.score;

  document.getElementById(
    "analysisBody"
  ).innerHTML = `
    <div class="analysis-grid">

      <div class="report-box">

        <h3>Team profile</h3>

        <div class="bars">
          ${bar("Overall", result.score)}
          ${bar("Synergy", result.synergy)}
          ${bar("Damage", result.damage)}
          ${bar("Break", result.breakScore)}
          ${bar("Sustain", result.sustain)}
        </div>

        <h3 style="margin-top:18px">
          Why this works
        </h3>

        <ul>
          ${
            result.reasons
              .map(
                reason =>
                  `<li class="good">${esc(reason)}</li>`
              )
              .join("") ||
            "<li>Not enough confirmed interaction data yet.</li>"
          }
        </ul>

      </div>

      <div class="report-box">

        <h3>Weaknesses / watch-outs</h3>

        <ul>
          ${
            result.warnings
              .map(
                warning =>
                  `<li class="warn">${esc(warning)}</li>`
              )
              .join("") ||
            "<li class='good'>No major heuristic warning.</li>"
          }
        </ul>

        <p>
          <b>Enemy elements to watch:</b>
          ${
            result.weak.length
              ? result.weak
                  .map(
                    element =>
                      `<span class="chip element">${esc(element)}</span>`
                  )
                  .join(" ")
              : "No confirmed exposure from the current matrix."
          }
        </p>

      </div>

    </div>

    <div
      class="report-box"
      style="margin-top:14px"
    >

      <h3>Suggested game plan</h3>

      <div class="steps">
        ${
          result.steps
            .map(
              step =>
                `<div class="step">${esc(step)}</div>`
            )
            .join("")
        }
      </div>

      <p
        style="
          margin-top:12px;
          color:var(--muted)
        "
      >
        The strategy text is deliberately explainable:
        it is generated from the roles, stats and
        ability descriptions in the dataset rather
        than pretending to know an undocumented
        rotation.
      </p>

    </div>
  `;
}

document
  .getElementById("search")
  .addEventListener(
    "input",
    renderRoster
  );

document
  .getElementById("roleFilter")
  .addEventListener(
    "change",
    renderRoster
  );

document
  .getElementById("elementFilter")
  .addEventListener(
    "change",
    renderRoster
  );

document
  .getElementById("clearTeam")
  .onclick = () => {
    state.team = [
      null,
      null,
      null,
      null
    ];

    renderSlots();
    renderRoster();
  };

loadData().catch(error => {
  document.getElementById(
    "roster"
  ).innerHTML = `
    <div class="report-box">

      <b>Data could not be loaded.</b>

      <p>
        ${esc(error.message)}
      </p>

      <p>
        Check that <b>aniimo.json</b>
        is in the root of the repository.
      </p>

    </div>
  `;
});
