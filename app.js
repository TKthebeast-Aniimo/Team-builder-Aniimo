"use strict";

/*
=========================================================
ANIIMO TEAM BUILDER
STABLE ROSTER VERSION
=========================================================

This version:
- Loads aniimo.json immediately
- Never waits forever for data
- Uses AniDex portraits as a fallback
- Keeps team slots working
- Keeps filters working
- Keeps Aniimo details working
- Falls back to Emberpup/test data if the JSON fails
=========================================================
*/


/* =========================================================
   FALLBACK DATA
   ========================================================= */

const FALLBACK_ANIIMO = [
    {
        id: 1,
        number: "001",
        name: "Emberpup",

        elements: ["fire", "rock"],
        roles: ["DPS"],

        image:
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_10051.png",

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
                name: "Fire Bolt",
                element: "Fire",
                type: "Magic",
                cost: 10,
                power: 30,
                description:
                    "Launches a fireball at the target and applies 2 stacks of Fire Debuff for 5 seconds."
            },

            {
                name: "Fire Kick",
                element: "Physical",
                type: "Physical",
                cost: 0,
                power: 72,
                description:
                    "Jumps up to dodge an attack before delivering a dive-kick. A successful dodge increases damage by 20% for 20 seconds."
            },

            {
                name: "Pebble Kick",
                element: "Physical",
                type: "Physical",
                cost: 0,
                power: 72,
                description:
                    "Jumps up to dodge an attack before delivering a dive-kick."
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

    {
        id: 2,
        number: "002",
        name: "Flameruff",
        elements: ["fire"],
        roles: ["DPS"],
        image:
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_10052.png",
        stats: {},
        trait: null,
        skills: [],
        notes: []
    },

    {
        id: 3,
        number: "003",
        name: "Scorchhowl",
        elements: ["fire"],
        roles: ["DPS"],
        image:
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_10053.png",
        stats: {},
        trait: null,
        skills: [],
        notes: []
    },

    {
        id: 4,
        number: "004",
        name: "Inferlupa",
        elements: ["fire"],
        roles: ["DPS"],
        image:
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_10054.png",
        stats: {},
        trait: null,
        skills: [],
        notes: []
    },

    {
        id: 5,
        number: "005",
        name: "Celestis",
        elements: ["light"],
        roles: ["Support"],
        image:
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_10055.png",
        stats: {},
        trait: null,
        skills: [],
        notes: []
    },

    {
        id: 6,
        number: "006",
        name: "Stellarys",
        elements: ["light"],
        roles: ["DPS"],
        image:
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_10056.png",
        stats: {},
        trait: null,
        skills: [],
        notes: []
    }
];


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let ANIIMO = [...FALLBACK_ANIIMO];

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
   START
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    /*
    IMPORTANT:

    Render the fallback roster FIRST.

    This means the user sees Aniimo immediately.
    We do NOT wait for the JSON file.
    */

    renderRoster();
    renderTeam();
    renderAnalysis();

    setupEvents();

    /*
    Now try to load the real roster.

    If it works, replace the fallback.
    If it doesn't, keep the fallback.
    */

    loadRoster();

});


/* =========================================================
   LOAD ROSTER
========================================================= */

async function loadRoster() {

    try {

        const response = await fetch(
            "aniimo.json?cache=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "aniimo.json returned HTTP " +
                response.status
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "aniimo.json is not an array"
            );
        }

        if (data.length === 0) {
            throw new Error(
                "aniimo.json is empty"
            );
        }

        /*
        Normalize the database.

        This prevents missing fields from
        crashing the website.
        */

        const normalized = data.map(
            normalizeAniimo
        );

        /*
        Only replace the fallback if
        we actually received Aniimo.
        */

        if (normalized.length > 0) {

            ANIIMO = normalized;

            renderRoster();
            renderTeam();
            renderAnalysis();

        }

        console.log(
            "Loaded " +
            ANIIMO.length +
            " Aniimo from aniimo.json"
        );

    } catch (error) {

        console.warn(
            "Could not load aniimo.json.",
            error
        );

        /*
        IMPORTANT:

        Do NOT show an infinite loader.

        The fallback roster remains visible.
        */

        if (rosterStatus) {

            rosterStatus.textContent =
                `${ANIIMO.length} Aniimo available`;

        }

    }

}


/* =========================================================
   NORMALIZE ANIIMO
========================================================= */

function normalizeAniimo(item) {

    const id =
        Number(item.id) || 0;

    const number =
        String(
            item.number ||
            String(id).padStart(3, "0")
        );

    const name =
        item.name ||
        "Unknown Aniimo";

    let elements =
        Array.isArray(item.elements)
            ? item.elements
            : [];

    let roles =
        Array.isArray(item.roles)
            ? item.roles
            : [];

    /*
    Normalize role capitalization.
    */

    roles = roles.map(function (role) {

        const value =
            String(role).trim();

        const upper =
            value.toUpperCase();

        if (upper === "DPS")
            return "DPS";

        if (upper === "SUPPORT")
            return "Support";

        if (upper === "HEAL")
            return "Heal";

        if (upper === "BREAK")
            return "BREAK";

        if (upper === "REGEN")
            return "REGEN";

        return value;

    });


    /*
    Normalize elements.
    */

    elements = elements.map(function (element) {

        return String(element)
            .trim()
            .toLowerCase();

    });


    /*
    Create an AniDex portrait fallback.

    AniDex currently exposes Aniimo portraits
    through its image system.
    */

    let image =
        item.imageUrl ||
        item.image ||
        "";

    if (!image) {

        /*
        Standard AniDex portrait pattern.

        Example:
        Emberpup -> UI_PetHead_10051.png
        */

        const imageNumber =
            10000 + id + 50;

        image =
            "https://aniidex.com/_ipx/q_95%26fit_inside%26s_260x260/images/aniimo/UI_PetHead_" +
            imageNumber +
            ".png";

    }


    /*
    Stats
    */

    const stats =
        item.stats &&
        typeof item.stats === "object"
            ? item.stats
            : {};


    /*
    Skills
    */

    const skills =
        Array.isArray(item.skills)
            ? item.skills
            : [];


    /*
    Analysis
    */

    const analysis =
        item.analysis &&
        typeof item.analysis === "object"
            ? item.analysis
            : {};


    return {

        id: id,

        number: number,

        name: name,

        elements: elements,

        roles: roles,

        image: image,

        stats: stats,

        forms:
            Array.isArray(item.forms)
                ? item.forms
                : [],

        trait:
            item.trait || null,

        skills: skills,

        notes:
            Array.isArray(analysis.notes)
                ? analysis.notes
                : []

    };

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    /*
    Search
    */

    if (searchInput) {

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

    }


    /*
    Element filter
    */

    if (elementFilter) {

        elementFilter.addEventListener(
            "change",
            function (event) {

                selectedElement =
                    event.target.value
                        .trim()
                        .toLowerCase();

                renderRoster();

            }
        );

    }


    /*
    Role buttons
    */

    roleButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    roleButtons.forEach(
                        function (other) {

                            other.classList.remove(
                                "active"
                            );

                        }
                    );

                    button.classList.add(
                        "active"
                    );

                    selectedRole =
                        button.dataset.role ||
                        "all";

                    renderRoster();

                }
            );

        }
    );


    /*
    Clear team
    */

    if (clearTeamButton) {

        clearTeamButton.addEventListener(
            "click",
            function () {

                selectedTeam =
                    [null, null, null, null];

                renderTeam();

                renderAnalysis();

            }
        );

    }


    /*
    Team slots
    */

    document
        .querySelectorAll(".team-slot")
        .forEach(
            function (slot) {

                slot.addEventListener(
                    "click",
                    function () {

                        const slotIndex =
                            Number(
                                slot.dataset.slot
                            );

                        if (
                            Number.isInteger(
                                slotIndex
                            )
                        ) {

                            selectedTeam[
                                slotIndex
                            ] = null;

                            renderTeam();

                            renderAnalysis();

                        }

                    }
                );

            }
        );


    /*
    Roster card clicks
    */

    document.addEventListener(
        "click",
        function (event) {

            const card =
                event.target.closest(
                    ".aniimo-card"
                );

            if (!card)
                return;

            const id =
                Number(card.dataset.id);

            const aniimo =
                ANIIMO.find(
                    function (item) {
                        return item.id === id;
                    }
                );

            if (aniimo) {

                showAniimoDetails(
                    aniimo
                );

            }

        }
    );


    /*
    Add-to-team button
    */

    if (details) {

        details.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-add-team]"
                    );

                if (!button)
                    return;

                const id =
                    Number(
                        button.dataset.addTeam
                    );

                addAniimoToTeam(id);

            }
        );

    }

}


/* =========================================================
   FILTER
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
                    Array.isArray(
                        aniimo.roles
                    ) &&

                    aniimo.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                String(selectedRole)
                                    .toLowerCase()
                            );

                        }
                    )
                );


            const matchesElement =
                selectedElement === "all" ||

                (
                    Array.isArray(
                        aniimo.elements
                    ) &&

                    aniimo.elements.some(
                        function (element) {

                            return (
                                String(element)
                                    .toLowerCase() ===
                                String(selectedElement)
                                    .toLowerCase()
                            );

                        }
                    )
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

    if (!rosterElement)
        return;


    const list =
        getFilteredAniimo();


    rosterElement.innerHTML = "";


    if (rosterStatus) {

        rosterStatus.textContent =
            `${list.length} Aniimo found`;

    }


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

            card.dataset.id =
                aniimo.id;


            const imageHTML =
                aniimo.image
                    ?

                    `

                    <img
                        src="${escapeHtml(
                            aniimo.image
                        )}"
                        alt="${escapeHtml(
                            aniimo.name
                        )}"
                        loading="lazy"
                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='flex';
                        "
                    >

                    <div
                        class="aniimo-image-fallback"
                        style="
                            display:none;
                            height:150px;
                            align-items:center;
                            justify-content:center;
                            font-size:55px;
                        "
                    >
                        🐾
                    </div>

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

                    `;


            const elements =
                Array.isArray(
                    aniimo.elements
                )
                    ?

                    aniimo.elements
                        .map(
                            function (element) {

                                return `
                                    <span class="badge">
                                        ${capitalize(
                                            element
                                        )}
                                    </span>
                                `;

                            }
                        )
                        .join("")

                    :

                    "";


            const roles =
                Array.isArray(
                    aniimo.roles
                )
                    ?

                    aniimo.roles
                        .map(
                            function (role) {

                                return `
                                    <span class="badge">
                                        ${escapeHtml(
                                            role
                                        )}
                                    </span>
                                `;

                            }
                        )
                        .join("")

                    :

                    "";


            card.innerHTML = `

                ${imageHTML}

                <div class="aniimo-number">
                    NO.${escapeHtml(
                        aniimo.number
                    )}
                </div>

                <div class="aniimo-name">
                    ${escapeHtml(
                        aniimo.name
                    )}
                </div>

                <div class="badges">

                    ${elements}

                    ${roles}

                </div>

            `;


            rosterElement.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DETAILS
========================================================= */

function showAniimoDetails(aniimo) {

    if (!detailsPanel || !details)
        return;


    detailsPanel.classList.remove(
        "hidden"
    );


    let statsHTML = "";


    if (
        aniimo.stats &&
        Object.keys(
            aniimo.stats
        ).length
    ) {

        statsHTML = `

            <div class="detail-section">

                <h3>Stats</h3>

                <div class="stats">

                    ${
                        Object.entries(
                            aniimo.stats
                        )
                        .map(
                            function (
                                [
                                    name,
                                    value
                                ]
                            ) {

                                return `

                                    <div class="stat">

                                        <div class="stat-name">
                                            ${escapeHtml(
                                                name
                                            )}
                                        </div>

                                        <div class="stat-value">
                                            ${escapeHtml(
                                                String(
                                                    value
                                                )
                                            )}
                                        </div>

                                    </div>

                                `;

                            }
                        )
                        .join("")
                    }

                </div>

            </div>

        `;

    }


    let skillsHTML = "";


    if (
        Array.isArray(
            aniimo.skills
        ) &&
        aniimo.skills.length
    ) {

        skillsHTML = `

            <div class="detail-section">

                <h3>Skills</h3>

                ${
                    aniimo.skills
                        .map(
                            function (skill) {

                                return `

                                    <div class="skill">

                                        <div class="skill-name">

                                            ${escapeHtml(
                                                skill.name ||
                                                "Skill"
                                            )}

                                        </div>

                                        <div class="skill-meta">

                                            ${
                                                skill.element
                                                    ? escapeHtml(
                                                        skill.element
                                                    )
                                                    : ""
                                            }

                                            ${
                                                skill.type
                                                    ? " • " +
                                                      escapeHtml(
                                                          skill.type
                                                      )
                                                    : ""
                                            }

                                            ${
                                                skill.cost !==
                                                undefined
                                                    ? " • Cost " +
                                                      escapeHtml(
                                                          String(
                                                              skill.cost
                                                          )
                                                      )
                                                    : ""
                                            }

                                            ${
                                                skill.power !==
                                                undefined
                                                    ? " • Power " +
                                                      escapeHtml(
                                                          String(
                                                              skill.power
                                                          )
                                                      )
                                                    : ""
                                            }

                                        </div>

                                        <div>

                                            ${escapeHtml(
                                                skill.description ||
                                                ""
                                            )}

                                        </div>

                                    </div>

                                `;

                            }
                        )
                        .join("")
                }

            </div>

        `;

    }


    const image =
        aniimo.image
            ?

            `

            <img
                src="${escapeHtml(
                    aniimo.image
                )}"
                alt="${escapeHtml(
                    aniimo.name
                )}"
            >

            `

            :

            `<div style="font-size:100px">🐾</div>`;


    const elements =
        Array.isArray(
            aniimo.elements
        )
            ?

            aniimo.elements
                .map(
                    function (element) {

                        return `
                            <span class="badge">
                                ${capitalize(
                                    element
                                )}
                            </span>
                        `;

                    }
                )
                .join("")

            :

            "";


    const roles =
        Array.isArray(
            aniimo.roles
        )
            ?

            aniimo.roles
                .map(
                    function (role) {

                        return `
                            <span class="badge">
                                ${escapeHtml(
                                    role
                                )}
                            </span>
                        `;

                    }
                )
                .join("")

            :

            "";


    const notes =
        Array.isArray(
            aniimo.notes
        ) &&
        aniimo.notes.length

            ?

            `

                <ul>

                    ${
                        aniimo.notes
                            .map(
                                function (note) {

                                    return `
                                        <li>
                                            ${escapeHtml(
                                                note
                                            )}
                                        </li>
                                    `;

                                }
                            )
                            .join("")
                    }

                </ul>

            `

            :

            `

                <p>
                    Detailed team-building information
                    will appear as the database is verified.
                </p>

            `;


    details.innerHTML = `

        <button
            class="role-button"
            data-add-team="${aniimo.id}"
            style="margin-bottom:15px;"
        >
            ➕ Add to Team
        </button>


        <div class="detail-header">

            ${image}

            <div class="detail-info">

                <div class="aniimo-number">
                    NO.${escapeHtml(
                        aniimo.number
                    )}
                </div>

                <h2>
                    ${escapeHtml(
                        aniimo.name
                    )}
                </h2>

                <div class="badges">

                    ${elements}

                    ${roles}

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>Trait</h3>

            <div class="analysis-box analysis-good">

                <strong>

                    ${escapeHtml(
                        aniimo.trait?.name ||
                        "Information not yet verified"
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


        ${statsHTML}

        ${skillsHTML}


        <div class="detail-section">

            <h3>
                Team Building Notes
            </h3>

            ${notes}

        </div>

    `;


    detailsPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   TEAM
========================================================= */

function renderTeam() {

    const slots =
        document.querySelectorAll(
            ".team-slot"
        );


    slots.forEach(
        function (
            slot,
            index
        ) {

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


            const image =
                aniimo.image
                    ?

                    `

                    <img
                        src="${escapeHtml(
                            aniimo.image
                        )}"
                        alt="${escapeHtml(
                            aniimo.name
                        )}"
                        onerror="
                            this.style.display='none'
                        "
                    >

                    `

                    :

                    `<div style="font-size:45px">🐾</div>`;


            slot.innerHTML = `

                ${image}

                <strong>
                    ${escapeHtml(
                        aniimo.name
                    )}
                </strong>

                <small>

                    ${
                        Array.isArray(
                            aniimo.roles
                        )
                            ?
                            escapeHtml(
                                aniimo.roles.join(
                                    " / "
                                )
                            )
                            :
                            ""
                    }

                </small>

            `;

        }
    );

}


/* =========================================================
   ADD ANIIMO
========================================================= */

function addAniimoToTeam(id) {

    const aniimo =
        ANIIMO.find(
            function (item) {
                return item.id === id;
            }
        );


    if (!aniimo)
        return;


    /*
    Allow duplicate Aniimo for now.

    We are not imposing any unnecessary
    team-composition restrictions.
    */


    const emptySlot =
        selectedTeam.findIndex(
            function (slot) {
                return slot === null;
            }
        );


    if (
        emptySlot === -1
    ) {

        alert(
            "Your team already has 4 Aniimo."
        );

        return;

    }


    selectedTeam[
        emptySlot
    ] = aniimo;


    renderTeam();

    renderAnalysis();

}


/* =========================================================
   TEAM ANALYSIS
========================================================= */

function renderAnalysis() {

    if (!analysis)
        return;


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

    const elements = {};


    team.forEach(
        function (aniimo) {

            if (
                Array.isArray(
                    aniimo.roles
                )
            ) {

                aniimo.roles.forEach(
                    function (role) {

                        roles[role] =
                            (
                                roles[role] ||
                                0
                            ) + 1;

                    }
                );

            }


            if (
                Array.isArray(
                    aniimo.elements
                )
            ) {

                aniimo.elements.forEach(
                    function (element) {

                        elements[element] =
                            (
                                elements[element] ||
                                0
                            ) + 1;

                    }
                );

            }

        }
    );


    const roleText =
        Object.entries(
            roles
        )
        .map(
            function (
                [
                    role,
                    count
                ]
            ) {

                return (
                    `${role}: ${count}`
                );

            }
        )
        .join(" • ");


    const elementText =
        Object.entries(
            elements
        )
        .map(
            function (
                [
                    element,
                    count
                ]
            ) {

                return (
                    `${capitalize(
                        element
                    )}: ${count}`
                );

            }
        )
        .join(" • ");


    analysis.innerHTML = `

        <div class="analysis-box">

            <h3>
                Current Team
            </h3>

            <p>
                ${team.length} / 4 Aniimo selected.
            </p>

            ${
                roleText
                    ?

                    `<p>
                        <strong>Roles:</strong>
                        ${escapeHtml(
                            roleText
                        )}
                    </p>`

                    :

                    ""
            }

            ${
                elementText
                    ?

                    `<p>
                        <strong>Elements:</strong>
                        ${escapeHtml(
                            elementText
                        )}
                    </p>`

                    :

                    ""
            }

        </div>

    `;

}


/* =========================================================
   HELPERS
========================================================= */

function capitalize(value) {

    if (!value)
        return "";

    const text =
        String(value);

    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
