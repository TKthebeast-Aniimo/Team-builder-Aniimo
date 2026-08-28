"use strict";

/*
    ANIIMO TEAM BUILDER
    Simple stable version.

    IMPORTANT:
    This version intentionally does NOT load aniimo.json.

    We are getting the website working first.
    We can connect the full database afterward.
*/


/* =========================================================
   TEST ROSTER
   ========================================================= */

const ANIIMO = [

    {
        id: 1,
        number: "001",
        name: "Emberpup",

        elements: ["fire", "rock"],

        roles: ["DPS"],

        image:
            "https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005101.png",

        stats: {
            HP: 67,
            BREAK: 38,
            ATK: 86,
            "M.DEF": 53,
            "P.DEF": 60,
            REGEN: 67
        },

        trait: {
            name: "Scorching Flames",

            description:
                "Increases damage dealt to enemies weak to your element by 15%."
        },

        mobility: {
            name: "Hustle",

            description:
                "Enters Hustle state, increasing movement speed by consuming stamina."
        },

        skills: [

            {
                name: "Fire Kick",
                element: "Physical",
                type: "Physical",
                cost: 0,
                power: 72,

                description:
                    "Jumps up to dodge an attack, allowing flames to encircle itself before delivering a dive-kick, dealing damage to all targets near the kick. A successful dodge also deals 120% damage and increases damage by 20% for 20 seconds."
            },

            {
                name: "Pebble Kick",
                element: "Physical",
                type: "Physical",
                cost: 0,
                power: 72,

                description:
                    "Jumps up to dodge an attack, allowing broken stones to encircle itself before delivering a dive-kick, dealing damage to all targets near the kick. A successful dodge also deals 120% damage and increases damage by 20% for 20 seconds."
            },

            {
                name: "Fire Bolt",
                element: "Fire",
                type: "Magic",
                cost: 10,
                power: 30,

                description:
                    "Launches a fireball at the target and applies 2 stacks of Fire Debuff for 5 seconds."
            },

            {
                name: "ATK",
                element: "Physical",
                type: "Physical",
                cost: 0,
                power: 6,

                description:
                    "Wields the power of fire to attack targets at close range."
            }

        ],

        notes: [
            "Fire DPS.",
            "Strong against enemies weak to Fire.",
            "Fire Bolt applies Fire Debuff stacks.",
            "Fire Kick rewards successful dodges.",
            "Works well with teammates that increase damage or exploit Fire Debuffs."
        ]

    },


    /*
        Temporary test entries.

        These allow us to test:
        - filtering
        - team slots
        - four-person teams
        - role combinations
        - search

        We will replace these with the full official
        roster after the basic website is confirmed working.
    */

    {
        id: 2,
        number: "002",
        name: "Flameruff",

        elements: ["fire"],

        roles: ["DPS"],

        image: "",

        stats: {
            HP: 0,
            BREAK: 0,
            ATK: 0,
            "M.DEF": 0,
            "P.DEF": 0,
            REGEN: 0
        },

        trait: {
            name: "Scorching Flames",

            description:
                "Increases damage dealt to enemies weak to Fire by 15%."
        },

        skills: []
    },


    {
        id: 3,
        number: "007",
        name: "Chirpi",

        elements: ["wind"],

        roles: ["Support"],

        image: "",

        stats: {},

        trait: {
            name: "Band Member",

            description:
                "Supports team members through switching interactions."
        },

        skills: []
    },


    {
        id: 4,
        number: "027",
        name: "Sparki",

        elements: ["electric"],

        roles: ["REGEN"],

        image: "",

        stats: {},

        trait: {
            name: "Roasting",

            description:
                "Skills can apply effects that reduce Fire resistance."
        },

        skills: []
    },


    {
        id: 5,
        number: "068",
        name: "Infergon",

        elements: ["fire"],

        roles: ["BREAK"],

        image: "",

        stats: {},

        trait: {
            name: "Break Specialist",

            description:
                "Designed around BREAK pressure."
        },

        skills: []
    },


    {
        id: 6,
        number: "040",
        name: "Dewy",

        elements: ["water"],

        roles: ["Heal"],

        image: "",

        stats: {},

        trait: {
            name: "Healing Support",

            description:
                "Provides team sustain."
        },

        skills: []
    }

];


/* =========================================================
   STATE
   ========================================================= */

let selectedTeam = [null, null, null, null];

let selectedRole = "all";

let selectedElement = "all";

let searchText = "";


/* =========================================================
   DOM
   ========================================================= */

const rosterElement =
    document.getElementById("roster");

const rosterStatus =
    document.getElementById("rosterStatus");

const searchInput =
    document.getElementById("searchInput");

const elementFilter =
    document.getElementById("elementFilter");

const roleButtons =
    document.querySelectorAll(".role-button");

const clearTeamButton =
    document.getElementById("clearTeam");

const detailsPanel =
    document.getElementById("detailsPanel");

const details =
    document.getElementById("details");

const analysis =
    document.getElementById("analysis");


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupEvents();

        renderRoster();

        renderTeam();

        renderAnalysis();

        console.log(
            "Aniimo Team Builder loaded successfully."
        );

    }
);


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    searchInput.addEventListener(
        "input",
        function (event) {

            searchText =
                event.target.value
                    .trim()
                    .toLowerCase();

            renderRoster();

        }
    );


    elementFilter.addEventListener(
        "change",
        function (event) {

            selectedElement =
                event.target.value;

            renderRoster();

        }
    );


    roleButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    roleButtons.forEach(
                        function (b) {
                            b.classList.remove("active");
                        }
                    );

                    button.classList.add("active");

                    selectedRole =
                        button.dataset.role;

                    renderRoster();

                }
            );

        }
    );


    clearTeamButton.addEventListener(
        "click",
        function () {

            selectedTeam =
                [null, null, null, null];

            renderTeam();

            renderAnalysis();

        }
    );


    document
        .querySelectorAll(".team-slot")
        .forEach(
            function (slot) {

                slot.addEventListener(
                    "click",
                    function () {

                        const slotIndex =
                            Number(slot.dataset.slot);

                        selectedTeam[slotIndex] =
                            null;

                        renderTeam();

                        renderAnalysis();

                    }
                );

            }
        );

}


/* =========================================================
   FILTER ROSTER
   ========================================================= */

function getFilteredAniimo() {

    return ANIIMO.filter(
        function (aniimo) {

            const matchesSearch =
                !searchText ||

                aniimo.name
                    .toLowerCase()
                    .includes(searchText) ||

                aniimo.number
                    .includes(searchText);


            const matchesRole =
                selectedRole === "all" ||

                (
                    Array.isArray(aniimo.roles) &&
                    aniimo.roles.includes(selectedRole)
                );


            const matchesElement =
                selectedElement === "all" ||

                (
                    Array.isArray(aniimo.elements) &&
                    aniimo.elements.includes(selectedElement)
                );


            return (
                matchesSearch &&
                matchesRole &&
                matchesElement
            );

        }
    );

}


/* =========================================================
   RENDER ROSTER
   ========================================================= */

function renderRoster() {

    const list =
        getFilteredAniimo();


    rosterElement.innerHTML = "";


    rosterStatus.textContent =
        `${list.length} Aniimo found`;


    if (list.length === 0) {

        rosterElement.innerHTML = `
            <div class="empty-analysis">
                No Aniimo match these filters.
            </div>
        `;

        return;
    }


    list.forEach(
        function (aniimo) {

            const card =
                document.createElement("div");

            card.className =
                "aniimo-card";


            card.innerHTML = `

                ${
                    aniimo.image
                    ?
                    `
                    <img
                        src="${aniimo.image}"
                        alt="${escapeHtml(aniimo.name)}"
                        onerror="this.style.display='none'"
                    >
                    `
                    :
                    `
                    <div
                        style="
                            height:150px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:55px;
                        "
                    >
                        🐾
                    </div>
                    `
                }

                <div class="aniimo-number">
                    NO.${aniimo.number}
                </div>

                <div class="aniimo-name">
                    ${escapeHtml(aniimo.name)}
                </div>

                <div class="badges">

                    ${
                        aniimo.elements
                            .map(
                                element =>
                                    `<span class="badge">
                                        ${capitalize(element)}
                                    </span>`
                            )
                            .join("")
                    }

                    ${
                        aniimo.roles
                            .map(
                                role =>
                                    `<span class="badge">
                                        ${escapeHtml(role)}
                                    </span>`
                            )
                            .join("")
                    }

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    showAniimoDetails(
                        aniimo
                    );

                }
            );


            rosterElement.appendChild(card);

        }
    );

}


/* =========================================================
   DETAILS
   ========================================================= */

function showAniimoDetails(aniimo) {

    detailsPanel.classList.remove(
        "hidden"
    );


    let statsHtml = "";


    if (
        aniimo.stats &&
        Object.keys(aniimo.stats).length
    ) {

        statsHtml = `

            <div class="detail-section">

                <h3>Stats</h3>

                <div class="stats">

                    ${
                        Object.entries(
                            aniimo.stats
                        )
                        .map(
                            ([name, value]) => `

                                <div class="stat">

                                    <div class="stat-name">
                                        ${escapeHtml(name)}
                                    </div>

                                    <div class="stat-value">
                                        ${escapeHtml(String(value))}
                                    </div>

                                </div>

                            `
                        )
                        .join("")
                    }

                </div>

            </div>

        `;

    }


    let skillsHtml = "";


    if (
        Array.isArray(aniimo.skills) &&
        aniimo.skills.length
    ) {

        skillsHtml = `

            <div class="detail-section">

                <h3>Skills</h3>

                ${
                    aniimo.skills
                        .map(
                            skill => `

                                <div class="skill">

                                    <div class="skill-name">
                                        ${escapeHtml(skill.name)}
                                    </div>

                                    <div class="skill-meta">

                                        ${
                                            skill.element
                                            ?
                                            escapeHtml(skill.element)
                                            :
                                            ""
                                        }

                                        ${
                                            skill.type
                                            ?
                                            " • " +
                                            escapeHtml(skill.type)
                                            :
                                            ""
                                        }

                                        ${
                                            skill.cost !== undefined
                                            ?
                                            " • Cost " +
                                            escapeHtml(String(skill.cost))
                                            :
                                            ""
                                        }

                                        ${
                                            skill.power !== undefined
                                            ?
                                            " • Power " +
                                            escapeHtml(String(skill.power))
                                            :
                                            ""
                                        }

                                    </div>

                                    <div>
                                        ${escapeHtml(
                                            skill.description || ""
                                        )}
                                    </div>

                                </div>

                            `
                        )
                        .join("")
                }

            </div>

        `;

    }


    details.innerHTML = `

        <div class="detail-header">

            ${
                aniimo.image
                ?
                `
                <img
                    src="${aniimo.image}"
                    alt="${escapeHtml(aniimo.name)}"
                >
                `
                :
                `<div style="font-size:100px">🐾</div>`
            }


            <div class="detail-info">

                <div class="aniimo-number">
                    NO.${aniimo.number}
                </div>

                <h2>
                    ${escapeHtml(aniimo.name)}
                </h2>

                <div class="badges">

                    ${
                        aniimo.elements
                            .map(
                                element =>
                                    `<span class="badge">
                                        ${capitalize(element)}
                                    </span>`
                            )
                            .join("")
                    }

                    ${
                        aniimo.roles
                            .map(
                                role =>
                                    `<span class="badge">
                                        ${escapeHtml(role)}
                                    </span>`
                            )
                            .join("")
                    }

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>Trait</h3>

            <div class="analysis-box analysis-good">

                <strong>
                    ${escapeHtml(
                        aniimo.trait?.name ||
                        "Unknown"
                    )}
                </strong>

                <p>
                    ${escapeHtml(
                        aniimo.trait?.description ||
                        "No trait information available yet."
                    )}
                </p>

            </div>

        </div>


        ${statsHtml}

        ${skillsHtml}


        <div class="detail-section">

            <h3>Team Building Notes</h3>

            ${
                aniimo.notes
                ?
                `
                    <ul>
                        ${
                            aniimo.notes
                                .map(
                                    note =>
                                        `<li>
                                            ${escapeHtml(note)}
                                        </li>`
                                )
                                .join("")
                        }
                    </ul>
                `
                :
                `
                    <p>
                        Team-building information will be
                        added as the database is expanded.
                    </p>
                `
            }

        </div>

    `;


    detailsPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   TEAM SLOTS
   ========================================================= */

function renderTeam() {

    const slots =
        document.querySelectorAll(
            ".team-slot"
        );


    slots.forEach(
        function (slot, index) {

            const aniimo =
                selectedTeam[index];


            if (!aniimo) {

                slot.classList.add(
                    "empty"
                );

                slot.classList.remove(
                    "filled"
                );

                slot.innerHTML = `

                    <span class="slot-number">
                        ${index + 1}
                    </span>

                    <span class="slot-text">
                        Select Aniimo
                    </span>

                `;

                return;
            }


            slot.classList.remove(
                "empty"
            );

            slot.classList.add(
                "filled"
            );


            slot.innerHTML = `

                ${
                    aniimo.image
                    ?
                    `
                    <img
                        src="${aniimo.image}"
                        alt="${escapeHtml(
                            aniimo.name
                        )}"
                        onerror="this.style.display='none'"
                    >
                    `
                    :
                    `<div style="font-size:45px">🐾</div>`
                }

                <strong>
                    ${escapeHtml(aniimo.name)}
                </strong>

                <small>
                    ${aniimo.roles.join(" / ")}
                </small>

            `;

        }
    );

}


/* =========================================================
   TEAM SELECTION
   ========================================================= */

/*
    Because the roster cards are used to select Aniimo,
    clicking a roster card adds it to the first available slot.

    If all four slots are full, clicking an Aniimo does nothing.
*/

document.addEventListener(
    "click",
    function (event) {

        const card =
            event.target.closest(
                ".aniimo-card"
            );


        if (!card) {
            return;
        }


        /*
            Don't add it automatically if the user is
            clicking a nested element that opens details.

            Instead, roster card click currently opens details.
        */

    }
);


/*
    Add a dedicated "Add to team" behaviour
    when viewing the detail panel.
*/

details.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "[data-add-team]"
            );


        if (!button) {
            return;
        }


        const id =
            Number(
                button.dataset.addTeam
            );


        addAniimoToTeam(id);

    }
);


/* =========================================================
   ADD ANIIMO
   ========================================================= */

function addAniimoToTeam(id) {

    const aniimo =
        ANIIMO.find(
            item => item.id === id
        );


    if (!aniimo) {
        return;
    }


    const emptySlot =
        selectedTeam.findIndex(
            slot => slot === null
        );


    if (emptySlot === -1) {

        alert(
            "Your team already has 4 Aniimo."
        );

        return;
    }


    selectedTeam[emptySlot] =
        aniimo;


    renderTeam();

    renderAnalysis();

}


/* =========================================================
   MAKE DETAILS ADDABLE
   ========================================================= */

const originalShowDetails =
    showAniimoDetails;


/*
    Replace the function with an enhanced version.
*/

showAniimoDetails = function (aniimo) {

    originalShowDetails(aniimo);


    const addButton =
        document.createElement("button");


    addButton.textContent =
        "➕ Add to Team";


    addButton.className =
        "role-button";


    addButton.style.marginTop =
        "15px";


    addButton.dataset.addTeam =
        aniimo.id;


    details.prepend(
        addButton
    );

};


/* =========================================================
   TEAM ANALYSIS
   ========================================================= */

function renderAnalysis() {

    const team =
        selectedTeam.filter(
            Boolean
        );


    if (!team.length) {

        analysis.innerHTML = `

            <div class="empty-analysis">

                Select Aniimo to begin building
                your team.

            </div>

        `;

        return;
    }


    const roles = {};


    team.forEach(
        function (aniimo) {

            aniimo.roles.forEach(
                function (role) {

                    roles[role] =
                        (roles[role] || 0) + 1;

                }
            );

        }
    );


    const elements = {};


    team.forEach(
        function (aniimo) {

            aniimo.elements.forEach(
                function (element) {

                    elements[element] =
                        (elements[element] || 0) + 1;

                }
            );

        }
    );


    const roleText =
        Object.entries(roles)
            .map(
                ([role, count]) =>
                    `${role}: ${count}`
            )
            .join(" • ");


    const elementText =
        Object.entries(elements)
            .map(
                ([element, count]) =>
                    `${capitalize(element)}: ${count}`
            )
            .join(" • ");


    let synergyText =
        "Continue adding teammates to reveal more synergies.";


    /*
        Simple initial synergy detection.
        This will later become much more sophisticated.
    */

    const names =
        team.map(
            item =>
                item.name
        );


    if (
        names.includes("Emberpup") &&
        names.includes("Sparki")
    ) {

        synergyText =
            "Sparki-style Fire resistance reduction can potentially support Fire damage strategies. Verify the exact interaction when the final combat data is available.";

    }


    if (
        names.includes("Emberpup") &&
        names.includes("Infergon")
    ) {

        synergyText =
            "Emberpup provides Fire DPS while Infergon fills the BREAK role, giving the team a basic damage + BREAK structure.";

    }


    analysis.innerHTML = `

        <div class="analysis-box analysis-good">

            <h3>
                Team Composition
            </h3>

            <p>
                ${team.length} / 4 Aniimo
            </p>

            <p>
                ${escapeHtml(roleText)}
            </p>

        </div>


        <div class="analysis-box">

            <h3>
                Element Spread
            </h3>

            <p>
                ${escapeHtml(elementText)}
            </p>

        </div>


        <div class="analysis-box analysis-good">

            <h3>
                Synergy
            </h3>

            <p>
                ${escapeHtml(synergyText)}
            </p>

        </div>


        <div class="analysis-box analysis-warning">

            <h3>
                Weaknesses
            </h3>

            <p>
                Detailed enemy matchup analysis will be
                calculated once the full elemental interaction
                database is connected.
            </p>

        </div>


        <div class="analysis-box">

            <h3>
                Suggested Game Plan
            </h3>

            <p>
                Use your Support / Regen / Heal members to
                maintain the team while Break members create
                openings for your DPS Aniimo.
            </p>

        </div>

    `;

}


/* =========================================================
   HELPERS
   ========================================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
