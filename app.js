/* =========================================================
   ANIIMO TEAM BUILDER
   Main application
========================================================= */

const state = {
  aniimo: [],
  team: [null, null, null, null]
};


/* =========================================================
   BASIC HELPERS
========================================================= */

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


/*
 * Convert almost anything into an array.
 *
 * Supports:
 *   ["DPS", "Support"]
 *   "DPS"
 *   "DPS, Support"
 *   "DPS / Support"
 */
function normalizeArray(value) {

  if (Array.isArray(value)) {
    return value
      .flatMap(item => normalizeArray(item))
      .filter(Boolean);
  }

  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (typeof value === "string") {

    return value
      .split(/[,/|;]/)
      .map(item =>
        item
          .trim()
      )
      .filter(Boolean);
  }

  return [String(value)];
}


/*
 * Normalise a role so filtering doesn't care
 * about capitalization or minor naming differences.
 */
function normalizeRole(value) {

  const text =
    String(value ?? "")
      .trim()
      .toLowerCase();

  if (!text) {
    return "";
  }

  if (
    text === "dps" ||
    text === "damage" ||
    text === "damage dealer" ||
    text === "attacker" ||
    text === "offense" ||
    text === "offensive"
  ) {
    return "DPS";
  }

  if (
    text === "support" ||
    text === "buffer" ||
    text === "debuffer" ||
    text === "utility"
  ) {
    return "Support";
  }

  if (
    text === "regen" ||
    text === "regeneration" ||
    text === "recovery"
  ) {
    return "Regen";
  }

  if (
    text === "break" ||
    text === "breaker" ||
    text === "break damage"
  ) {
    return "Break";
  }

  if (
    text === "heal" ||
    text === "healer" ||
    text === "healing"
  ) {
    return "Heal";
  }

  /*
   * If the database contains something
   * unexpected, preserve it in a readable
   * format rather than throwing it away.
   */
  return String(value)
    .trim()
    .replace(/\b\w/g, letter =>
      letter.toUpperCase()
    );
}


/*
 * Normalise elements.
 */
function normalizeElement(value) {

  const text =
    String(value ?? "")
      .trim()
      .toLowerCase();

  if (!text) {
    return "";
  }

  const known = {
    fire: "Fire",
    water: "Water",
    grass: "Grass",
    lightning: "Lightning",
    electric: "Lightning",
    earth: "Earth",
    wind: "Wind",
    dark: "Dark",
    ice: "Ice",
    light: "Light"
  };

  return (
    known[text] ||
    String(value)
      .trim()
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      )
  );
}


/*
 * Determines whether a filter means
 * "show everything".
 */
function isAllFilter(value) {

  const text =
    String(value ?? "")
      .trim()
      .toLowerCase();

  return (
    text === "" ||
    text === "all" ||
    text === "all roles" ||
    text === "all role" ||
    text === "all elements" ||
    text === "all element" ||
    text === "*" ||
    text === "any"
  );
}


/* =========================================================
   NORMALISE ANIIMO DATA
========================================================= */

function normalizeAniimo(a, index) {

  const aniimo = {
    ...a
  };


  /*
   * ID
   */
  aniimo.id =
    aniimo.id ??
    aniimo.number ??
    aniimo.no ??
    index + 1;


  /*
   * Name
   */
  aniimo.name =
    aniimo.name ??
    aniimo.title ??
    `Aniimo ${index + 1}`;


  /*
   * Number
   */
  aniimo.number =
    aniimo.number ??
    aniimo.no ??
    index + 1;


  /*
   * Roles
   *
   * The database may call this:
   *   role
   *   roles
   */
  const rawRoles =
    aniimo.roles ??
    aniimo.role ??
    aniimo.type ??
    [];

  aniimo.roles =
    normalizeArray(
      rawRoles
    )
      .map(normalizeRole)
      .filter(Boolean);


  /*
   * Elements
   *
   * The database may call this:
   *   element
   *   elements
   */
  const rawElements =
    aniimo.elements ??
    aniimo.element ??
    [];

  aniimo.elements =
    normalizeArray(
      rawElements
    )
      .map(normalizeElement)
      .filter(Boolean);


  /*
   * Skills
   */
  aniimo.skills =
    Array.isArray(
      aniimo.skills
    )
      ? aniimo.skills
      : [];


  /*
   * Forms
   */
  aniimo.forms =
    Array.isArray(
      aniimo.forms
    )
      ? aniimo.forms
      : [];


  /*
   * Stats
   */
  aniimo.stats =
    aniimo.stats &&
    typeof aniimo.stats === "object"
      ? aniimo.stats
      : {};


  /*
   * Analysis data
   */
  aniimo.analysis =
    aniimo.analysis &&
    typeof aniimo.analysis === "object"
      ? aniimo.analysis
      : {};


  aniimo.analysis.tags =
    Array.isArray(
      aniimo.analysis.tags
    )
      ? aniimo.analysis.tags
      : [];


  /*
   * Automatically create useful tags
   * from the skill descriptions.
   */
  const searchableText = [

    aniimo.name,

    ...(aniimo.roles || []),

    ...(aniimo.elements || []),

    aniimo.trait?.name || "",
    aniimo.trait?.description || "",

    ...(aniimo.traits || [])
      .flatMap(trait => [
        trait.name || "",
        trait.description || ""
      ]),

    ...(aniimo.skills || [])
      .flatMap(skill => [
        skill.name || "",
        skill.description || "",
        skill.element || "",
        skill.type || ""
      ])

  ].join(" ");


  const tags = [

    [
      "attack_up",
      /increase.*attack|attack.*increase|increase.*damage|damage.*increase|damage.*up/i
    ],

    [
      "defense_down",
      /reduce.*defen|defen.*down|defence.*down|damage taken.*increase/i
    ],

    [
      "debuff",
      /debuff|curse|mark|weakness|reduce.*healing|silence|stun|paraly/i
    ],

    [
      "break_support",
      /break damage|increase.*break|break.*damage|break.*taken|stagger/i
    ],

    [
      "heal",
      /heal|healing|restore.*hp|restores hp/i
    ],

    [
      "regen",
      /regen|regeneration|restore.*energy|energy.*restore|recovery/i
    ],

    [
      "shield",
      /shield|damage reduction/i
    ],

    [
      "control",
      /stun|silence|paraly|pull|slow|freeze|immobil/i
    ],

    [
      "burst",
      /ultimate|massive damage|heavy damage|bonus damage|extra damage/i
    ],

    [
      "self_scaling",
      /stack|stacking|critical|crit/i
    ]

  ];


  for (
    const [tag, regex]
    of tags
  ) {

    if (
      regex.test(
        searchableText
      )
    ) {

      if (
        !aniimo.analysis.tags.includes(
          tag
        )
      ) {

        aniimo.analysis.tags.push(
          tag
        );

      }

    }

  }


  return aniimo;
}


/* =========================================================
   PORTRAITS
========================================================= */

function getPortraitCandidates(a) {

  const candidates = [];

  const possibleFields = [

    a.imageUrl,
    a.image,
    a.image_url,

    a.portrait,
    a.portraitUrl,
    a.portrait_url,

    a.icon,
    a.iconUrl,
    a.icon_url,

    a.avatar,
    a.sprite

  ];


  for (
    const value
    of possibleFields
  ) {

    if (
      typeof value === "string" &&
      value.trim()
    ) {

      candidates.push(
        value.trim()
      );

    }

  }


  /*
   * Support image arrays.
   */
  if (
    Array.isArray(
      a.images
    )
  ) {

    for (
      const image
      of a.images
    ) {

      if (
        typeof image ===
        "string"
      ) {

        candidates.push(
          image
        );

      }


      if (
        image &&
        typeof image ===
          "object"
      ) {

        for (
          const key
          of [
            "url",
            "src",
            "imageUrl",
            "portrait"
          ]
        ) {

          if (
            typeof image[key] ===
              "string" &&
            image[key].trim()
          ) {

            candidates.push(
              image[key].trim()
            );

          }

        }

      }

    }

  }


  return [
    ...new Set(
      candidates
    )
  ];
}


/*
 * Placeholder if an Aniimo doesn't
 * have a working image.
 */
function placeholderImage(
  name
) {

  const first =
    String(name || "?")
      .trim()
      .charAt(0)
      .toUpperCase();


  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="500"
        height="500"
        viewBox="0 0 500 500"
      >

        <rect
          width="500"
          height="500"
          rx="40"
          fill="#18232d"
        />

        <circle
          cx="250"
          cy="205"
          r="100"
          fill="#263746"
        />

        <text
          x="250"
          y="235"
          text-anchor="middle"
          font-family="Arial,sans-serif"
          font-size="110"
          font-weight="bold"
          fill="#8fb8d8"
        >
          ${first}
        </text>

        <text
          x="250"
          y="390"
          text-anchor="middle"
          font-family="Arial,sans-serif"
          font-size="28"
          fill="#9eacb8"
        >
          ANIIMO
        </text>

      </svg>

    `)
  );
}


function imageHTML(
  a,
  className = ""
) {

  const candidates =
    getPortraitCandidates(
      a
    );

  const fallback =
    placeholderImage(
      a.name
    );


  if (
    candidates.length
  ) {

    return `

      <img
        class="${esc(className)}"
        src="${esc(candidates[0])}"
        data-image-candidates="${esc(
          JSON.stringify(
            candidates
          )
        )}"
        data-image-index="0"
        alt="${esc(a.name)}"
        loading="lazy"
        onerror="handleImageError(this)"
      >

    `;

  }


  return `

    <img
      class="${esc(className)}"
      src="${fallback}"
      alt="${esc(a.name)}"
      loading="lazy"
    >

  `;
}


window.handleImageError =
  function(img) {

    let candidates = [];

    try {

      candidates =
        JSON.parse(
          img.dataset
            .imageCandidates ||
          "[]"
        );

    } catch {

      candidates = [];

    }


    let index =
      Number(
        img.dataset
          .imageIndex ||
        0
      );


    index++;


    if (
      index <
      candidates.length
    ) {

      img.dataset.imageIndex =
        index;

      img.src =
        candidates[index];

      return;

    }


    /*
     * Nothing worked.
     */
    img.onerror =
      null;

    img.src =
      placeholderImage(
        img.alt ||
        "Aniimo"
      );

  };


/* =========================================================
   DATA LOADING
========================================================= */

async function loadData() {

  const response =
    await fetch(
      `aniimo.json?v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );


  if (
    !response.ok
  ) {

    throw new Error(
      `aniimo.json could not be loaded. HTTP ${response.status}`
    );

  }


  const raw =
    await response.json();


  if (
    !Array.isArray(raw)
  ) {

    throw new Error(
      "aniimo.json was loaded but it does not contain an array."
    );

  }


  state.aniimo =
    raw.map(
      normalizeAniimo
    );


  updateRosterCount();

  populateFilters();

  renderRoster();

  renderSlots();

}


/* =========================================================
   ROSTER COUNT
========================================================= */

function updateRosterCount() {

  const count =
    document.getElementById(
      "rosterCount"
    );


  if (count) {

    count.textContent =
      state.aniimo.length;

  }

}


/* =========================================================
   FILTER DROPDOWNS
========================================================= */

function populateFilters() {

  const roleFilter =
    document.getElementById(
      "roleFilter"
    );


  const elementFilter =
    document.getElementById(
      "elementFilter"
    );


  /*
   * Keep the user's current
   * selection if possible.
   */
  const currentRole =
    roleFilter?.value || "";


  const currentElement =
    elementFilter?.value || "";


  /*
   * Build roles directly from
   * the loaded Aniimo data.
   */
  const roles = [
    "DPS",
    "Support",
    "Regen",
    "Break",
    "Heal"
  ];


  if (roleFilter) {

    roleFilter.innerHTML = `

      <option value="">
        All roles
      </option>

      ${roles
        .map(
          role => `
            <option
              value="${role}"
            >
              ${role}
            </option>
          `
        )
        .join("")}

    `;


    /*
     * Restore selection if
     * it still exists.
     */
    if (
      !isAllFilter(
        currentRole
      ) &&
      roles.includes(
        normalizeRole(
          currentRole
        )
      )
    ) {

      roleFilter.value =
        normalizeRole(
          currentRole
        );

    } else {

      roleFilter.value =
        "";

    }

  }


  /*
   * Elements found in actual data.
   */
  const elements = [
    ...new Set(
      state.aniimo
        .flatMap(
          a =>
            a.elements
        )
        .filter(Boolean)
    )
  ].sort();


  if (elementFilter) {

    elementFilter.innerHTML = `

      <option value="">
        All elements
      </option>

      ${elements
        .map(
          element => `
            <option
              value="${esc(element)}"
            >
              ${esc(element)}
            </option>
          `
        )
        .join("")}

    `;


    if (
      !isAllFilter(
        currentElement
      ) &&
      elements.includes(
        normalizeElement(
          currentElement
        )
      )
    ) {

      elementFilter.value =
        normalizeElement(
          currentElement
        );

    } else {

      elementFilter.value =
        "";

    }

  }

}


/* =========================================================
   FILTER MATCHING
========================================================= */

function aniimoMatchesRole(
  aniimo,
  selectedRole
) {

  /*
   * "All roles" means don't
   * filter anything.
   */
  if (
    isAllFilter(
      selectedRole
    )
  ) {

    return true;

  }


  const wanted =
    normalizeRole(
      selectedRole
    );


  if (!wanted) {
    return true;
  }


  const aniimoRoles =
    normalizeArray(
      aniimo.roles
    )
      .map(
        normalizeRole
      );


  /*
   * This is the important fix.
   *
   * We compare NORMALISED values,
   * not the original strings.
   */
  return aniimoRoles.some(
    role =>
      role === wanted
  );

}


function aniimoMatchesElement(
  aniimo,
  selectedElement
) {

  if (
    isAllFilter(
      selectedElement
    )
  ) {

    return true;

  }


  const wanted =
    normalizeElement(
      selectedElement
    );


  if (!wanted) {
    return true;
  }


  const aniimoElements =
    normalizeArray(
      aniimo.elements
    )
      .map(
        normalizeElement
      );


  return aniimoElements.some(
    element =>
      element === wanted
  );

}


/* =========================================================
   ROSTER
========================================================= */

function renderRoster() {

  const roster =
    document.getElementById(
      "roster"
    );


  if (!roster) {
    return;
  }


  const searchInput =
    document.getElementById(
      "search"
    );


  const roleFilter =
    document.getElementById(
      "roleFilter"
    );


  const elementFilter =
    document.getElementById(
      "elementFilter"
    );


  const search =
    searchInput?.value
      ?.trim()
      .toLowerCase() ||
    "";


  const selectedRole =
    roleFilter?.value ||
    "";


  const selectedElement =
    elementFilter?.value ||
    "";


  const results =
    state.aniimo.filter(
      aniimo => {

        /*
         * Search.
         */
        const searchText = [

          aniimo.name,

          aniimo.number,

          ...(aniimo.roles || []),

          ...(aniimo.elements || [])

        ]
          .join(" ")
          .toLowerCase();


        const matchesSearch =
          !search ||
          searchText.includes(
            search
          );


        /*
         * Role.
         */
        const matchesRole =
          aniimoMatchesRole(
            aniimo,
            selectedRole
          );


        /*
         * Element.
         */
        const matchesElement =
          aniimoMatchesElement(
            aniimo,
            selectedElement
          );


        return (
          matchesSearch &&
          matchesRole &&
          matchesElement
        );

      }
    );


  /*
   * No results.
   */
  if (
    results.length === 0
  ) {

    const roleText =
      isAllFilter(
        selectedRole
      )
        ? "all roles"
        : normalizeRole(
            selectedRole
          );


    const elementText =
      isAllFilter(
        selectedElement
      )
        ? "all elements"
        : normalizeElement(
            selectedElement
          );


    roster.innerHTML = `

      <div class="report-box">

        <h3>
          No Aniimo match your filters
        </h3>

        <p>
          Role:
          <b>
            ${esc(roleText)}
          </b>
        </p>

        <p>
          Element:
          <b>
            ${esc(elementText)}
          </b>
        </p>

        <button
          type="button"
          id="resetFilters"
          class="reset-button"
        >
          Clear filters
        </button>

      </div>

    `;


    document
      .getElementById(
        "resetFilters"
      )
      ?.addEventListener(
        "click",
        () => {

          if (searchInput) {
            searchInput.value =
              "";
          }

          if (roleFilter) {
            roleFilter.value =
              "";
          }

          if (elementFilter) {
            elementFilter.value =
              "";
          }

          renderRoster();

        }
      );


    return;

  }


  /*
   * Build cards.
   */
  roster.innerHTML =
    results
      .map(
        aniimo => {

          const selected =
            state.team.some(
              member =>
                member &&
                String(
                  member.id
                ) ===
                  String(
                    aniimo.id
                  )
            );


          const roles =
            aniimo.roles
              .map(
                role => `

                  <span
                    class="chip role"
                  >
                    ${esc(role)}
                  </span>

                `
              )
              .join("");


          const elements =
            aniimo.elements
              .map(
                element => `

                  <span
                    class="chip element"
                  >
                    ${esc(element)}
                  </span>

                `
              )
              .join("");


          return `

            <button
              type="button"
              class="card ${
                selected
                  ? "selected"
                  : ""
              }"
              data-id="${esc(
                aniimo.id
              )}"
              aria-label="${
                selected
                  ? `Remove ${aniimo.name}`
                  : `Add ${aniimo.name}`
              }"
            >

              ${imageHTML(
                aniimo,
                "card-image"
              )}


              <div class="card-body">

                <div class="card-name">

                  #${esc(
                    aniimo.number
                  )}

                  ${esc(
                    aniimo.name
                  )}

                </div>


                <div class="chips">

                  ${
                    roles ||
                    `
                      <span class="chip">
                        Role unknown
                      </span>
                    `
                  }

                  ${
                    elements ||
                    `
                      <span class="chip">
                        Element unknown
                      </span>
                    `
                  }

                </div>


                <div class="add-hint">

                  ${
                    selected
                      ? "✓ In team — tap to remove"
                      : "＋ Tap to add"
                  }

                </div>

              </div>

            </button>

          `;

        }
      )
      .join("");


  /*
   * Make every card clickable.
   */
  roster
    .querySelectorAll(
      ".card"
    )
    .forEach(
      card => {

        card.addEventListener(
          "click",
          event => {

            event.preventDefault();


            const id =
              card.dataset.id;


            addToTeam(
              id
            );

          }
        );

      }
    );

}


/* =========================================================
   TEAM SLOTS
========================================================= */

function renderSlots() {

  const container =
    document.getElementById(
      "teamSlots"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    state.team
      .map(
        (aniimo, index) => {

          /*
           * Empty slot.
           */
          if (!aniimo) {

            return `

              <button
                type="button"
                class="slot empty"
                data-slot="${index}"
              >

                <div
                  class="empty-slot-icon"
                >
                  ＋
                </div>


                <div>

                  <b>
                    Slot ${index + 1}
                  </b>

                  <small>
                    Tap an Aniimo below
                    to add one
                  </small>

                </div>

              </button>

            `;

          }


          /*
           * Filled slot.
           */
          return `

            <div
              class="slot filled"
              data-slot="${index}"
            >

              <span
                class="slot-number"
              >
                Slot ${index + 1}
              </span>


              <button
                type="button"
                class="remove"
                data-index="${index}"
                aria-label="Remove ${esc(
                  aniimo.name
                )}"
              >
                ×
              </button>


              ${imageHTML(
                aniimo,
                "slot-image"
              )}


              <div
                class="slot-content"
              >

                <div
                  class="slot-name"
                >
                  ${esc(
                    aniimo.name
                  )}
                </div>


                <div
                  class="slot-meta"
                >

                  ${esc(
                    aniimo.roles.join(
                      " / "
                    ) ||
                    "Role unknown"
                  )}

                  ·

                  ${esc(
                    aniimo.elements.join(
                      " / "
                    ) ||
                    "Element unknown"
                  )}

                </div>

              </div>

            </div>

          `;

        }
      )
      .join("");


  /*
   * Empty slots scroll down to
   * the Aniimo roster.
   */
  container
    .querySelectorAll(
      ".slot.empty"
    )
    .forEach(
      slot => {

        slot.addEventListener(
          "click",
          () => {

            document
              .getElementById(
                "roster"
              )
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });

          }
        );

      }
    );


  /*
   * Remove buttons.
   */
  container
    .querySelectorAll(
      ".remove"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            event.stopPropagation();


            const index =
              Number(
                button.dataset.index
              );


            state.team[
              index
            ] = null;


            renderSlots();
            renderRoster();

          }
        );

      }
    );


  renderAnalysis();

}


/* =========================================================
   ADD ANIIMO
========================================================= */

function addToTeam(
  id
) {

  const aniimo =
    state.aniimo.find(
      item =>
        String(
          item.id
        ) ===
          String(id)
    );


  if (!aniimo) {

    console.error(
      "Aniimo not found:",
      id
    );

    return;

  }


  /*
   * If already in team,
   * remove it.
   */
  const existingIndex =
    state.team.findIndex(
      member =>
        member &&
        String(
          member.id
        ) ===
          String(
            aniimo.id
          )
    );


  if (
    existingIndex !== -1
  ) {

    state.team[
      existingIndex
    ] = null;


    renderSlots();
    renderRoster();

    return;

  }


  /*
   * Four total Aniimo.
   *
   * NO role restriction.
   */
  const emptyIndex =
    state.team.findIndex(
      member =>
        !member
    );


  if (
    emptyIndex === -1
  ) {

    alert(
      "Your team already has 4 Aniimo. Tap × on a team member first."
    );

    return;

  }


  state.team[
    emptyIndex
  ] = aniimo;


  renderSlots();
  renderRoster();


  /*
   * Scroll to the team.
   */
  document
    .getElementById(
      "teamSlots"
    )
    ?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

}


/* =========================================================
   ELEMENT EFFECTIVENESS
========================================================= */

const elementChart = {

  Fire: {
    Fire: 0.625,
    Water: 0.625,
    Grass: 1.6,
    Lightning: 1,
    Earth: 0.625,
    Wind: 1,
    Dark: 1,
    Ice: 1.6,
    Light: 0.625
  },

  Water: {
    Fire: 1.6,
    Water: 0.625,
    Grass: 0.625,
    Lightning: 1,
    Earth: 1.6,
    Wind: 1,
    Dark: 1,
    Ice: 0.625,
    Light: 0.625
  },

  Grass: {
    Fire: 0.625,
    Water: 1.6,
    Grass: 0.625,
    Lightning: 1,
    Earth: 1.6,
    Wind: 1,
    Dark: 0.625,
    Ice: 1,
    Light: 0.625
  },

  Lightning: {
    Fire: 1,
    Water: 1.6,
    Grass: 1,
    Lightning: 0.625,
    Earth: 0.625,
    Wind: 1.6,
    Dark: 1,
    Ice: 0.625,
    Light: 1
  },

  Earth: {
    Fire: 1,
    Water: 0.625,
    Grass: 0.625,
    Lightning: 1.6,
    Earth: 0.625,
    Wind: 1,
    Dark: 0.625,
    Ice: 1.6,
    Light: 1
  },

  Wind: {
    Fire: 1,
    Water: 1,
    Grass: 1.6,
    Lightning: 0.625,
    Earth: 1,
    Wind: 0.625,
    Dark: 1.6,
    Ice: 1,
    Light: 1
  },

  Dark: {
    Fire: 1.6,
    Water: 0.625,
    Grass: 1.6,
    Lightning: 1,
    Earth: 1,
    Wind: 0.625,
    Dark: 1,
    Ice: 1,
    Light: 1.6
  },

  Ice: {
    Fire: 0.625,
    Water: 1.6,
    Grass: 1,
    Lightning: 1.6,
    Earth: 0.625,
    Wind: 0.625,
    Dark: 1,
    Ice: 0.625,
    Light: 1
  },

  Light: {
    Fire: 1,
    Water: 1,
    Grass: 1,
    Lightning: 0.625,
    Earth: 1,
    Wind: 1.6,
    Dark: 1.6,
    Ice: 1,
    Light: 0.625
  }

};


/* =========================================================
   STAT HELPERS
========================================================= */

function getStat(
  aniimo,
  names
) {

  for (
    const name
    of names
  ) {

    const value =
      Number(
        aniimo.stats?.[
          name
        ]
      );


    if (
      Number.isFinite(
        value
      )
    ) {

      return value;

    }

  }


  return 0;

}


function average(
  values
) {

  const valid =
    values.filter(
      value =>
        Number.isFinite(
          value
        )
    );


  if (
    !valid.length
  ) {

    return 0;

  }


  return (
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    valid.length
  );

}


/* =========================================================
   TAG CHECKING
========================================================= */

function hasTag(
  aniimo,
  tag
) {

  return Boolean(
    aniimo.analysis?.tags?.includes(
      tag
    )
  );

}


/* =========================================================
   TEAM ANALYSIS
========================================================= */

function calculateTeam() {

  const team =
    state.team.filter(
      Boolean
    );


  if (
    team.length < 2
  ) {

    return null;

  }


  /*
   * Roles.
   *
   * These are NOT exclusive.
   */
  const dps =
    team.filter(
      a =>
        a.roles.includes(
          "DPS"
        )
    );


  const supports =
    team.filter(
      a =>
        a.roles.includes(
          "Support"
        )
    );


  const breakers =
    team.filter(
      a =>
        a.roles.includes(
          "Break"
        )
    );


  const regens =
    team.filter(
      a =>
        a.roles.includes(
          "Regen"
        )
    );


  const healers =
    team.filter(
      a =>
        a.roles.includes(
          "Heal"
        )
    );


  let synergy = 45;


  const reasons = [];
  const warnings = [];


  /*
   * Role contributions.
   */
  if (
    dps.length
  ) {

    synergy +=
      dps.length * 4;


    reasons.push(
      `${dps.length} DPS provide the team's damage pressure.`
    );

  }


  if (
    supports.length
  ) {

    synergy +=
      supports.length * 5;


    reasons.push(
      `${supports.length} Support unit${supports.length === 1 ? "" : "s"} provide buff/debuff/utility potential.`
    );

  }


  if (
    breakers.length
  ) {

    synergy +=
      breakers.length * 5;


    reasons.push(
      `${breakers.length} Break unit${breakers.length === 1 ? "" : "s"} provide Break pressure and potential damage windows.`
    );

  }


  if (
    regens.length
  ) {

    synergy +=
      regens.length * 4;


    reasons.push(
      `${regens.length} Regen unit${regens.length === 1 ? "" : "s"} provide recovery/resource sustain.`
    );

  }


  if (
    healers.length
  ) {

    synergy +=
      healers.length * 4;


    reasons.push(
      `${healers.length} Heal unit${healers.length === 1 ? "" : "s"} provide HP recovery.`
    );

  }


  /*
   * Ability interactions.
   */
  for (
    const source
    of team
  ) {

    for (
      const target
      of team
    ) {

      if (
        source === target
      ) {

        continue;

      }


      if (
        hasTag(
          source,
          "attack_up"
        ) &&
        target.roles.includes(
          "DPS"
        )
      ) {

        synergy += 3;


        reasons.push(
          `${source.name} has offensive-buff evidence that may benefit ${target.name}.`
        );

      }


      if (
        hasTag(
          source,
          "defense_down"
        ) &&
        (
          target.roles.includes(
            "DPS"
          ) ||
          target.roles.includes(
            "Break"
          )
        )
      ) {

        synergy += 3;


        reasons.push(
          `${source.name} has defense-reduction/debuff evidence that may improve ${target.name}'s damage window.`
        );

      }


      if (
        hasTag(
          source,
          "break_support"
        ) &&
        target.roles.includes(
          "DPS"
        )
      ) {

        synergy += 3;


        reasons.push(
          `${source.name} has Break-related effects that may help ${target.name} capitalize on openings.`
        );

      }


      if (
        hasTag(
          source,
          "debuff"
        ) &&
        hasTag(
          target,
          "burst"
        )
      ) {

        synergy += 2;


        reasons.push(
          `${source.name}'s debuff/control effects may complement ${target.name}'s burst-oriented kit.`
        );

      }

    }

  }


  /*
   * Element coverage.
   */
  const teamElements =
    [
      ...new Set(
        team.flatMap(
          a =>
            a.elements
        )
      )
    ].filter(
      element =>
        elementChart[
          element
        ]
    );


  if (
    teamElements.length >= 3
  ) {

    synergy += 5;


    reasons.push(
      `The team covers ${teamElements.length} elements, giving it broader matchup coverage.`
    );

  }


  if (
    teamElements.length === 1
  ) {

    synergy -= 6;


    warnings.push(
      `The team is heavily dependent on ${teamElements[0]} elemental coverage.`
    );

  }


  /*
   * Stats.
   */
  const averageAttack =
    average(
      team.map(
        a =>
          getStat(
            a,
            [
              "ATK",
              "Attack",
              "attack"
            ]
          )
      )
    );


  const averageBreak =
    average(
      team.map(
        a =>
          getStat(
            a,
            [
              "BREAK",
              "Break",
              "break"
            ]
      )
    );


  const averageHP =
    average(
      team.map(
        a =>
          getStat(
            a,
            [
              "HP",
              "Hp",
              "hp"
            ]
          )
      )
    );


  const averageRegen =
    average(
      team.map(
        a =>
          getStat(
            a,
            [
              "REGEN",
              "Regen",
              "regen"
            ]
          )
      )
    );


  const damage =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          30 +
          dps.length * 18 +
          Math.min(
            30,
            averageAttack / 5
          )
        )
      )
    );


  const breakScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          30 +
          breakers.length * 20 +
          averageBreak / 4
        )
      )
    );


  const sustain =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          20 +
          healers.length * 22 +
          regens.length * 18 +
          averageRegen / 5 +
          averageHP / 25
        )
      )
    );


  /*
   * Enemy elemental threats.
   */
  const weaknesses = [];


  for (
    const enemyElement
    of Object.keys(
      elementChart
    )
  ) {

    let strongest =
      1;


    for (
      const ourElement
      of teamElements
    ) {

      const multiplier =
        elementChart[
          enemyElement
        ]?.[
          ourElement
        ] ?? 1;


      strongest =
        Math.max(
          strongest,
          multiplier
        );

    }


    if (
      strongest > 1
    ) {

      weaknesses.push({
        element:
          enemyElement,

        multiplier:
          strongest
      });

    }

  }


  weaknesses.sort(
    (a, b) =>
      b.multiplier -
      a.multiplier
  );


  /*
   * Warnings.
   */
  if (
    !healers.length &&
    !regens.length
  ) {

    warnings.push(
      "There is no Heal or Regen role, so sustained recovery may be limited."
    );

  }


  if (
    !dps.length
  ) {

    warnings.push(
      "There is no Aniimo classified as DPS. The team will rely on the other selected kits for damage."
    );

  }


  if (
    weaknesses.length
  ) {

    warnings.push(
      `Watch ${weaknesses
        .slice(0, 3)
        .map(
          item =>
            item.element
        )
        .join(", ")} enemy compositions because they have favourable elemental interactions against at least one element represented by this team.`
    );

  }


  /*
   * Overall score.
   */
  const overall =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (
            synergy +
            damage +
            breakScore +
            sustain
          ) /
          4
        )
      )
    );


  /*
   * Game plan.
   */
  const steps = [];


  if (
    breakers.length
  ) {

    steps.push(
      `Use ${breakers[0].name} to create Break pressure and look for the team's main damage window.`
    );

  }


  if (
    supports.length
  ) {

    steps.push(
      `Use ${supports[0].name}'s documented support effects before or during the team's main offensive window.`
    );

  }


  if (
    dps.length
  ) {

    const mainDPS =
      [...dps].sort(
        (a, b) =>
          getStat(
            b,
            [
              "ATK",
              "Attack",
              "attack"
            ]
          ) -
          getStat(
            a,
            [
              "ATK",
              "Attack",
              "attack"
            ]
          )
      )[0];


    steps.push(
      `${mainDPS.name} should be treated as the primary damage focus based on its DPS classification and available ATK data.`
    );

  }


  if (
    regens.length
  ) {

    steps.push(
      `Use ${regens[0].name} when sustained recovery or resource management becomes important.`
    );

  }


  if (
    healers.length
  ) {

    steps.push(
      `Use ${healers[0].name} to recover HP when necessary while preserving the team's main damage window.`
    );

  }


  if (
    !breakers.length
  ) {

    steps.unshift(
      "No Break role is present, so the team should rely more heavily on raw pressure, buffs, debuffs and individual skill effects."
    );

  }


  return {

    team,

    overall,

    synergy:
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            synergy
          )
        )
      ),

    damage,

    breakScore,

    sustain,

    reasons: [
      ...new Set(
        reasons
      )
    ].slice(
      0,
      12
    ),

    warnings: [
      ...new Set(
        warnings
      )
    ],

    weaknesses:
      weaknesses.slice(
        0,
        5
      ),

    steps

  };

}


/* =========================================================
   ANALYSIS DISPLAY
========================================================= */

function progressBar(
  label,
  value
) {

  return `

    <div
      class="bar-row"
    >

      <span>
        ${esc(label)}
      </span>


      <div
        class="bar"
      >

        <i
          style="
            width:${value}%
          "
        ></i>

      </div>


      <b>
        ${value}
      </b>

    </div>

  `;

}


function renderAnalysis() {

  const section =
    document.getElementById(
      "analysis"
    );


  if (!section) {
    return;
  }


  const result =
    calculateTeam();


  if (!result) {

    section.classList.add(
      "hidden"
    );

    return;

  }


  section.classList.remove(
    "hidden"
  );


  const title =
    document.getElementById(
      "teamTitle"
    );


  const subtitle =
    document.getElementById(
      "teamSubtitle"
    );


  const score =
    document.getElementById(
      "overallScore"
    );


  if (title) {

    title.textContent =
      result.team
        .map(
          a =>
            a.name
        )
        .join(
          " + "
        );

  }


  if (subtitle) {

    subtitle.textContent =
      `${result.team.length}/4 selected · duplicate roles are allowed`;

  }


  if (score) {

    score.textContent =
      result.overall;

  }


  const body =
    document.getElementById(
      "analysisBody"
    );


  if (!body) {
    return;
  }


  body.innerHTML = `

    <div
      class="analysis-grid"
    >

      <div
        class="report-box"
      >

        <h3>
          Team profile
        </h3>


        <div
          class="bars"
        >

          ${progressBar(
            "Overall",
            result.overall
          )}

          ${progressBar(
            "Synergy",
            result.synergy
          )}

          ${progressBar(
            "Damage",
            result.damage
          )}

          ${progressBar(
            "Break",
            result.breakScore
          )}

          ${progressBar(
            "Sustain",
            result.sustain
          )}

        </div>


        <h3
          style="
            margin-top:20px
          "
        >
          Why this works
        </h3>


        <ul>

          ${
            result.reasons.length
              ? result.reasons
                  .map(
                    reason =>
                      `
                        <li
                          class="good"
                        >
                          ${esc(
                            reason
                          )}
                        </li>
                      `
                  )
                  .join("")
              :
              `
                <li>
                  Select more Aniimo to
                  generate interaction
                  analysis.
                </li>
              `
          }

        </ul>

      </div>


      <div
        class="report-box"
      >

        <h3>
          Weaknesses
        </h3>


        <ul>

          ${
            result.warnings.length
              ? result.warnings
                  .map(
                    warning =>
                      `
                        <li
                          class="warn"
                        >
                          ${esc(
                            warning
                          )}
                        </li>
                      `
                  )
                  .join("")
              :
              `
                <li
                  class="good"
                >
                  No major heuristic
                  warning detected.
                </li>
              `
          }

        </ul>


        <h3>
          Elements to watch
        </h3>


        <div
          class="chips"
        >

          ${
            result.weaknesses.length
              ? result.weaknesses
                  .map(
                    item =>
                      `
                        <span
                          class="chip element"
                        >
                          ${esc(
                            item.element
                          )}
                        </span>
                      `
                  )
                  .join("")
              :
              `
                <span>
                  No major elemental
                  exposure detected.
                </span>
              `
          }

        </div>

      </div>

    </div>


    <div
      class="report-box"
      style="
        margin-top:14px
      "
    >

      <h3>
        Suggested game plan
      </h3>


      <div
        class="steps"
      >

        ${
          result.steps
            .map(
              (step, index) =>
                `
                  <div
                    class="step"
                  >

                    <b>
                      ${index + 1}.
                    </b>

                    ${esc(
                      step
                    )}

                  </div>
                `
            )
            .join("")
        }

      </div>


      <p
        style="
          color:var(--muted);
          margin-top:14px
        "
      >

        Strategy recommendations are
        generated from the available
        role, stat, elemental and skill
        data.

      </p>

    </div>

  `;

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

  document
    .getElementById(
      "search"
    )
    ?.addEventListener(
      "input",
      renderRoster
    );


  document
    .getElementById(
      "roleFilter"
    )
    ?.addEventListener(
      "change",
      renderRoster
    );


  document
    .getElementById(
      "elementFilter"
    )
    ?.addEventListener(
      "change",
      renderRoster
    );


  document
    .getElementById(
      "clearTeam"
    )
    ?.addEventListener(
      "click",
      () => {

        state.team = [
          null,
          null,
          null,
          null
        ];


        renderSlots();
        renderRoster();

      }
    );

}


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showLoadError(
  error
) {

  console.error(
    "Aniimo Team Builder error:",
    error
  );


  const roster =
    document.getElementById(
      "roster"
    );


  if (!roster) {
    return;
  }


  roster.innerHTML = `

    <div
      class="report-box"
    >

      <h3>
        Could not load Aniimo data
      </h3>


      <p>
        ${esc(
          error.message
        )}
      </p>


      <p>
        Make sure
        <b>aniimo.json</b>
        is in the same folder as
        <b>index.html</b>.
      </p>

    </div>

  `;

}


/* =========================================================
   START APPLICATION
========================================================= */

async function startApp() {

  try {

    setupEventListeners();

    await loadData();

  } catch (
    error
  ) {

    showLoadError(
      error
    );

  }

}


/*
 * DOMContentLoaded makes this work
 * whether app.js is loaded in the
 * <head> or at the bottom of index.html.
 */
if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startApp
  );

} else {

  startApp();

}
