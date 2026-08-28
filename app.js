/* =========================================================
   ANIIMO TEAM BUILDER
   app.js

   This version is designed to be very defensive:
   - Team slots render immediately
   - JSON errors cannot leave the page loading forever
   - Empty fields are handled safely
   - Roles and elements are normalized
   - Emberpup has an official-data fallback
   - Images have fallbacks
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let aniimo = [];

let team = [
    null,
    null,
    null,
    null
];


/* =========================================================
   OFFICIAL EMBERPUP FALLBACK
=========================================================

   This is based on the official Aniimo Wiki entry.

   It means Emberpup will still display even while the
   larger data-generation pipeline is being fixed.
========================================================= */

const EMBERPUP_FALLBACK = {

    id: 1,

    name: "Emberpup",

    number: "001",

    sourceUrl:
        "https://wiki.aniimo.com/item/10002771",

    imageUrl:
        "https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005101.png",

    elements: [
        "fire",
        "rock"
    ],

    roles: [
        "DPS"
    ],

    stats: {

        HP: 67,

        BREAK: 38,

        ATK: 86,

        "M.DEF": 53,

        "P.DEF": 60,

        REGEN: 67

    },

    forms: [
        "Basic Form",
        "Highland Form",
        "Mountain Woods Form"
    ],

    trait: {

        name: "Scorching Flames",

        description:
            "Increases damage dealt to enemies weak to your element by 15%."

    },

    skills: [

        {

            name: "Fire Kick",

            element: "fire",

            type: "Physical",

            cost: 0,

            power: 72,

            description:
                "Jumps up to dodge an attack, allowing flames to encircle itself before delivering a dive-kick, dealing damage to all targets near the kick. A successful dodge will also deal 120% damage and increase damage by 20% for 20s."

        },

        {

            name: "Pebble Kick",

            element: "rock",

            type: "Physical",

            cost: 0,

            power: 72,

            description:
                "Jumps up to dodge an attack, allowing broken stones to encircle itself before delivering a dive-kick, dealing damage to all targets near the kick. A successful dodge will also deal 120% damage and increase damage by 20% for 20s."

        },

        {

            name: "Fire Bolt",

            element: "fire",

            type: "Magic",

            cost: 10,

            power: 30,

            description:
                "Launches a fireball at the target and applies 2 stacks of Fire Debuff for 5s. Hold the skill button to aim."

        },

        {

            name: "ATK",

            element: "fire",

            type: "Physical",

            cost: 0,

            power: 6,

            description:
                "Wields the power of fire to attack targets at close range."

        }

    ],

    analysis: {

        tags: [
            "DPS",
            "Fire",
            "Rock",
            "Fire Debuff",
            "Dodge",
            "Damage Boost"
        ],

        notes: [
            "Strong offensive role.",
            "Benefits from enemies weak to Fire.",
            "Fire Bolt applies Fire Debuff.",
            "Successful dodge attacks increase damage for 20 seconds.",
            "Works particularly well with teammates that improve offensive uptime, damage, or debuff interactions."
        ]

    }

};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}


function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   NORMALIZATION
========================================================= */

function arrayValue(value) {

    if (Array.isArray(value)) {

        return value;

    }

    if (value === null || value === undefined) {

        return [];

    }

    if (typeof value === "string") {

        return value
            .split(/[\/,|]/)
            .map(x => x.trim())
            .filter(Boolean);

    }

    return [];

}


function normalizeElement(value) {

    if (!value) {

        return "";

    }

    return String(value)

        .trim()

        .toLowerCase()

        .replace(/\s+/g, "");

}


function displayElement(value) {

    const element =
        normalizeElement(value);

    if (!element) {

        return "Unknown";

    }

    return element.charAt(0).toUpperCase()
        + element.slice(1);

}


function normalizeRole(value) {

    if (!value) {

        return "";

    }

    const role =
        String(value)
            .trim()
            .toLowerCase();

    if (role === "dps") {

        return "DPS";

    }

    if (
        role === "support"
        ||
        role === "sup"
    ) {

        return "Support";

    }

    if (
        role === "regen"
        ||
        role === "regeneration"
    ) {

        return "Regen";

    }

    if (
        role === "break"
        ||
        role === "breaker"
    ) {

        return "Break";

    }

    if (
        role === "heal"
        ||
        role === "healer"
    ) {

        return "Heal";

    }

    return String(value).trim();

}


function normalizeAniimo(raw) {

    if (!raw || typeof raw !== "object") {

        return null;

    }


    const item = {

        ...raw

    };


    item.name =
        item.name
        ||
        item.Name
        ||
        "Unknown Aniimo";


    item.number =
        item.number
        ||
        item.no
        ||
        item.id
        ||
        "";


    item.id =
        item.id
        ||
        item.number
        ||
        Math.random();


    item.elements =
        arrayValue(
            item.elements
            ||
            item.element
        )

        .map(normalizeElement)

        .filter(Boolean);


    item.roles =
        arrayValue(
            item.roles
            ||
            item.role
        )

        .map(normalizeRole)

        .filter(Boolean);


    item.stats =
        (
            item.stats
            &&
            typeof item.stats === "object"
        )
            ?
            item.stats
            :
            {};


    item.skills =
        Array.isArray(item.skills)
            ?
            item.skills
            :
            [];


    item.forms =
        Array.isArray(item.forms)
            ?
            item.forms
            :
            [];


    return item;

}


/* =========================================================
   MERGE EMBERPUP FALLBACK
========================================================= */

function mergeFallbackData(list) {

    const result = [];

    let emberFound = false;


    for (const item of list) {

        if (!item) {

            continue;

        }


        const normalized =
            normalizeAniimo(item);


        if (!normalized) {

            continue;

        }


        if (
            normalized.name
                .toLowerCase()
                ===
            "emberpup"
        ) {

            emberFound = true;

            result.push(

                mergeAniimo(
                    EMBERPUP_FALLBACK,
                    normalized
                )

            );

        }

        else {

            result.push(normalized);

        }

    }


    if (!emberFound) {

        result.unshift(
            normalizeAniimo(
                EMBERPUP_FALLBACK
            )
        );

    }


    return result;

}


function mergeAniimo(base, current) {

    const merged = {

        ...base,

        ...current

    };


    if (
        !current.elements
        ||
        current.elements.length === 0
    ) {

        merged.elements =
            base.elements;

    }


    if (
        !current.roles
        ||
        current.roles.length === 0
    ) {

        merged.roles =
            base.roles;

    }


    if (
        !current.stats
        ||
        Object.keys(current.stats).length === 0
    ) {

        merged.stats =
            base.stats;

    }


    if (
        !current.skills
        ||
        current.skills.length === 0
    ) {

        merged.skills =
            base.skills;

    }


    if (!current.trait) {

        merged.trait =
            base.trait;

    }


    if (
        !current.imageUrl
        ||
        current.imageUrl === null
    ) {

        merged.imageUrl =
            base.imageUrl;

    }


    return merged;

}


/* =========================================================
   IMAGE HANDLING
========================================================= */

function imageFor(item) {

    if (
        item
        &&
        item.imageUrl
    ) {

        return item.imageUrl;

    }


    if (
        item
        &&
        item.image
    ) {

        return item.image;

    }


    if (
        item
        &&
        item.portrait
    ) {

        return item.portrait;

    }


    if (
        item
        &&
        item.name
            .toLowerCase()
            ===
        "emberpup"
    ) {

        return EMBERPUP_FALLBACK.imageUrl;

    }


    return "";

}


function imageHTML(item, className) {

    const src =
        imageFor(item);


    if (!src) {

        return `
            <div class="${className} image-placeholder">
                <span>?</span>
            </div>
        `;

    }


    return `
        <img
            class="${className}"
            src="${escapeHTML(src)}"
            alt="${escapeHTML(item.name)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >

        <div
            class="${className} image-placeholder"
            style="display:none;"
        >
            <span>${escapeHTML(
                item.name
                    .charAt(0)
            )}</span>
        </div>
    `;

}


/* =========================================================
   TEAM SLOTS
========================================================= */

function renderSlots() {

    const container =
        $("teamSlots");


    if (!container) {

        console.error(
            "teamSlots element was not found."
        );

        return;

    }


    let html = "";


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const item =
            team[i];


        if (!item) {

            html += `

                <button
                    type="button"
                    class="slot empty"
                    data-slot="${i}"
                >

                    <span
                        class="empty-slot-icon"
                    >
                        +
                    </span>

                    <span>
                        <strong>
                            Slot ${i + 1}
                        </strong>

                        <small>
                            Choose an Aniimo
                        </small>
                    </span>

                </button>

            `;

        }

        else {

            const role =
                item.roles.length
                    ?
                    item.roles.join(" / ")
                    :
                    "Role unknown";


            html += `

                <div
                    class="slot filled"
                >

                    <span class="slot-number">
                        Slot ${i + 1}
                    </span>

                    <button
                        type="button"
                        class="remove"
                        data-remove="${i}"
                        aria-label="Remove ${escapeHTML(item.name)}"
                    >
                        ×
                    </button>

                    ${imageHTML(
                        item,
                        "slot-image"
                    )}

                    <div class="slot-content">

                        <div class="slot-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="slot-meta">
                            ${escapeHTML(role)}
                        </div>

                    </div>

                </div>

            `;

        }

    }


    container.innerHTML =
        html;


    container
        .querySelectorAll(
            ".slot.empty"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const slot =
                        Number(
                            button.dataset.slot
                        );

                    selectForSlot(slot);

                }

            );

        });


    container
        .querySelectorAll(
            "[data-remove]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const slot =
                        Number(
                            button.dataset.remove
                        );

                    team[slot] =
                        null;

                    renderSlots();

                    renderRoster();

                    renderAnalysis();

                }

            );

        });

}


/* =========================================================
   SELECT ANIIMO
========================================================= */

function selectForSlot(slot) {

    const selected =
        aniimo.find(
            item =>
                item
                &&
                item.id
                ===
                slot
        );


    /*
       We don't use the above result.
       The roster card tells us which Aniimo
       should be selected.
    */

    openSelectionHint();

}


function addToFirstAvailable(item) {

    if (!item) {

        return;

    }


    /*
       Don't add the same object more than
       once unless the user wants duplicates.
    */

    const firstEmpty =
        team.findIndex(
            slot => slot === null
        );


    if (firstEmpty === -1) {

        alert(
            "Your team already has 4 Aniimo. Remove one first."
        );

        return;

    }


    team[firstEmpty] =
        item;


    renderSlots();

    renderRoster();

    renderAnalysis();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


function openSelectionHint() {

    const roster =
        $("roster");


    if (!roster) {

        return;

    }


    roster.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================================
   ROSTER FILTERS
========================================================= */

function getFilters() {

    return {

        search:
            (
                $("search")
                ?
                $("search").value
                :
                ""
            )
            .trim()
            .toLowerCase(),

        role:
            (
                $("roleFilter")
                ?
                $("roleFilter").value
                :
                ""
            ),

        element:
            (
                $("elementFilter")
                ?
                $("elementFilter").value
                :
                ""
            )

    };

}


function matchesFilters(item) {

    const filters =
        getFilters();


    if (
        filters.search
        &&
        !item.name
            .toLowerCase()
            .includes(
                filters.search
            )
    ) {

        return false;

    }


    if (
        filters.role
        &&
        !item.roles
            .map(normalizeRole)
            .includes(
                normalizeRole(
                    filters.role
                )
            )
    ) {

        return false;

    }


    if (
        filters.element
        &&
        !item.elements
            .map(normalizeElement)
            .includes(
                normalizeElement(
                    filters.element
                )
            )
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   ELEMENT FILTER
========================================================= */

function populateElementFilter() {

    const select =
        $("elementFilter");


    if (!select) {

        return;

    }


    const current =
        select.value;


    const elements =
        new Set();


    for (const item of aniimo) {

        for (
            const element
            of
            item.elements
        ) {

            elements.add(
                normalizeElement(
                    element
                )
            );

        }

    }


    const ordered = [

        "holy",
        "fire",
        "ice",
        "dark",
        "electric",
        "grass",
        "water",
        "rock",
        "wind"

    ];


    const values =
        Array.from(elements)
            .sort(
                (a, b) => {

                    const ai =
                        ordered.indexOf(a);

                    const bi =
                        ordered.indexOf(b);

                    if (ai === -1) {

                        return 1;

                    }

                    if (bi === -1) {

                        return -1;

                    }

                    return ai - bi;

                }
            );


    select.innerHTML = `

        <option value="">
            All elements
        </option>

    `;


    for (
        const element
        of values
    ) {

        select.innerHTML += `

            <option
                value="${escapeHTML(element)}"
            >
                ${escapeHTML(
                    displayElement(element)
                )}
            </option>

        `;

    }


    if (
        values.includes(current)
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   RENDER ROSTER
========================================================= */

function renderRoster() {

    const roster =
        $("roster");


    if (!roster) {

        return;

    }


    const visible =
        aniimo.filter(
            matchesFilters
        );


    const count =
        $("rosterCount");


    if (count) {

        count.textContent =
            visible.length;

    }


    if (!visible.length) {

        roster.innerHTML = `

            <div class="loading">

                <strong>
                    No Aniimo match these filters.
                </strong>

                <br>

                <small>
                    Try "All roles" and "All elements".
                </small>

            </div>

        `;

        return;

    }


    roster.innerHTML =
        visible
            .map(
                renderCard
            )
            .join("");


    roster
        .querySelectorAll(
            "[data-aniimo-id]"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const id =
                        String(
                            card.dataset.aniimoId
                        );


                    const item =
                        aniimo.find(
                            x =>
                                String(x.id)
                                ===
                                id
                        );


                    if (item) {

                        addToFirstAvailable(
                            item
                        );

                    }

                }

            );

        });

}


function renderCard(item) {

    const roles =
        item.roles.length
            ?
            item.roles
            :
            ["Unknown"];


    const elements =
        item.elements.length
            ?
            item.elements
            :
            ["Unknown"];


    const selected =
        team.some(
            x =>
                x
                &&
                String(x.id)
                ===
                String(item.id)
        );


    return `

        <button
            type="button"
            class="card ${selected ? "selected" : ""}"
            data-aniimo-id="${escapeHTML(item.id)}"
        >

            ${imageHTML(
                item,
                "card-image"
            )}

            <div class="card-body">

                <div class="card-name">
                    ${escapeHTML(item.name)}
                </div>

                <div class="chips">

                    ${roles
                        .map(
                            role =>
                                `
                                <span class="chip role">
                                    ${escapeHTML(role)}
                                </span>
                                `
                        )
                        .join("")
                    }

                    ${elements
                        .map(
                            element =>
                                `
                                <span class="chip element">
                                    ${escapeHTML(
                                        displayElement(
                                            element
                                        )
                                    )}
                                </span>
                                `
                        )
                        .join("")
                    }

                </div>

                <div class="add-hint">

                    ${selected
                        ?
                        "Already in team"
                        :
                        "Tap to add to team"
                    }

                </div>

            </div>

        </button>

    `;

}


/* =========================================================
   TEAM ANALYSIS
========================================================= */

function renderAnalysis() {

    const analysis =
        $("analysis");


    if (!analysis) {

        return;

    }


    const members =
        team.filter(
            Boolean
        );


    if (!members.length) {

        analysis.classList.add(
            "hidden"
        );

        return;

    }


    analysis.classList.remove(
        "hidden"
    );


    const title =
        $("teamTitle");


    if (title) {

        title.textContent =
            members.length === 4
                ?
                "Team Analysis"
                :
                `Team Analysis — ${members.length}/4`;

    }


    const subtitle =
        $("teamSubtitle");


    if (subtitle) {

        subtitle.textContent =
            buildTeamSummary(
                members
            );

    }


    const score =
        calculateTeamScore(
            members
        );


    const scoreElement =
        $("overallScore");


    if (scoreElement) {

        scoreElement.textContent =
            score;

    }


    const body =
        $("analysisBody");


    if (!body) {

        return;

    }


    const roles =
        countRoles(
            members
        );


    const elements =
        countElements(
            members
        );


    const synergies =
        findSynergies(
            members
        );


    const weaknesses =
        findWeaknesses(
            members
        );


    const plan =
        buildGamePlan(
            members,
            synergies
        );


    body.innerHTML = `

        <div class="analysis-grid">

            <div class="report-box">

                <h3>
                    Team Composition
                </h3>

                <div class="bar-row">
                    <span>DPS</span>
                    <div class="bar">
                        <i style="width:${percentage(roles.DPS, 4)}%"></i>
                    </div>
                    <b>${roles.DPS}</b>
                </div>

                <div class="bar-row">
                    <span>Support</span>
                    <div class="bar">
                        <i style="width:${percentage(roles.Support, 4)}%"></i>
                    </div>
                    <b>${roles.Support}</b>
                </div>

                <div class="bar-row">
                    <span>Regen</span>
                    <div class="bar">
                        <i style="width:${percentage(roles.Regen, 4)}%"></i>
                    </div>
                    <b>${roles.Regen}</b>
                </div>

                <div class="bar-row">
                    <span>Break</span>
                    <div class="bar">
                        <i style="width:${percentage(roles.Break, 4)}%"></i>
                    </div>
                    <b>${roles.Break}</b>
                </div>

                <div class="bar-row">
                    <span>Heal</span>
                    <div class="bar">
                        <i style="width:${percentage(roles.Heal, 4)}%"></i>
                    </div>
                    <b>${roles.Heal}</b>
                </div>

            </div>


            <div class="report-box">

                <h3>
                    Elements
                </h3>

                <ul>

                    ${
                        Object.keys(elements)
                            .length
                            ?
                            Object.entries(elements)
                                .map(
                                    ([element, count]) =>
                                        `
                                        <li>
                                            <strong>
                                                ${escapeHTML(
                                                    displayElement(
                                                        element
                                                    )
                                                )}
                                            </strong>
                                            ×${count}
                                        </li>
                                        `
                                )
                                .join("")
                            :
                            "<li>No elements recorded.</li>"
                    }

                </ul>

            </div>


            <div class="report-box">

                <h3 class="good">
                    Synergies
                </h3>

                <ul>

                    ${
                        synergies.length
                            ?
                            synergies
                                .map(
                                    item =>
                                        `<li>${escapeHTML(item)}</li>`
                                )
                                .join("")
                            :
                            "<li>No strong documented synergy detected yet.</li>"
                    }

                </ul>

            </div>


            <div class="report-box">

                <h3 class="warn">
                    Potential Weaknesses
                </h3>

                <ul>

                    ${
                        weaknesses.length
                            ?
                            weaknesses
                                .map(
                                    item =>
                                        `<li>${escapeHTML(item)}</li>`
                                )
                                .join("")
                            :
                            "<li>No specific weakness can be established from the currently loaded data.</li>"
                    }

                </ul>

            </div>


            <div class="report-box">

                <h3>
                    Suggested Game Plan
                </h3>

                <div class="steps">

                    ${
                        plan
                            .map(
                                (step, index) =>
                                    `
                                    <div class="step">
                                        <b>${index + 1}.</b>
                                        ${escapeHTML(step)}
                                    </div>
                                    `
                            )
                            .join("")
                    }

                </div>

            </div>


            <div class="report-box">

                <h3>
                    Aniimo Details
                </h3>

                ${
                    members
                        .map(
                            renderDetailedMember
                        )
                        .join("")
                }

            </div>

        </div>

    `;

}


/* =========================================================
   ROLE COUNT
========================================================= */

function countRoles(members) {

    const result = {

        DPS: 0,

        Support: 0,

        Regen: 0,

        Break: 0,

        Heal: 0

    };


    for (const member of members) {

        for (
            const role
            of
            member.roles
        ) {

            const normalized =
                normalizeRole(role);


            if (
                Object.prototype.hasOwnProperty
                .call(
                    result,
                    normalized
                )
            ) {

                result[normalized]++;

            }

        }

    }


    return result;

}


/* =========================================================
   ELEMENT COUNT
========================================================= */

function countElements(members) {

    const result = {};


    for (const member of members) {

        for (
            const element
            of
            member.elements
        ) {

            const key =
                normalizeElement(
                    element
                );


            if (!key) {

                continue;

            }


            result[key] =
                (
                    result[key]
                    ||
                    0
                )
                + 1;

        }

    }


    return result;

}


/* =========================================================
   TEAM SCORE
========================================================= */

function calculateTeamScore(members) {

    let score = 50;


    const roles =
        countRoles(
            members
        );


    const elements =
        countElements(
            members
        );


    if (roles.DPS > 0) {

        score += 10;

    }


    if (
        roles.Support > 0
        ||
        roles.Regen > 0
    ) {

        score += 8;

    }


    if (
        roles.Heal > 0
    ) {

        score += 7;

    }


    if (
        roles.Break > 0
    ) {

        score += 7;

    }


    if (
        Object.keys(elements).length
        >=
        2
    ) {

        score += 5;

    }


    /*
       We deliberately do NOT punish teams for
       repeating roles.

       The user is allowed to build any four-person
       combination.
    */


    return Math.max(
        0,
        Math.min(
            100,
            score
        )
    );

}


/* =========================================================
   SYNERGY DETECTION
========================================================= */

function findSynergies(members) {

    const results = [];


    const hasDPS =
        members.some(
            item =>
                item.roles
                    .includes("DPS")
        );


    const hasSupport =
        members.some(
            item =>
                item.roles
                    .includes("Support")
        );


    const hasRegen =
        members.some(
            item =>
                item.roles
                    .includes("Regen")
        );


    const hasBreak =
        members.some(
            item =>
                item.roles
                    .includes("Break")
        );


    const hasHeal =
        members.some(
            item =>
                item.roles
                    .includes("Heal")
        );


    if (
        hasDPS
        &&
        hasSupport
    ) {

        results.push(
            "Your DPS can benefit from Support effects that improve damage, uptime, positioning or survivability."
        );

    }


    if (
        hasDPS
        &&
        hasBreak
    ) {

        results.push(
            "DPS + Break gives the team a natural damage-window strategy: pressure enemies, trigger Break, then concentrate damage during the opening."
        );

    }


    if (
        hasDPS
        &&
        hasRegen
    ) {

        results.push(
            "A Regen member can help maintain resource availability, allowing the DPS to use its skills more consistently."
        );

    }


    if (
        hasDPS
        &&
        hasHeal
    ) {

        results.push(
            "The Heal slot improves sustained DPS uptime by reducing the need to disengage for survival."
        );

    }


    /*
       Fire/debuff interaction.
    */

    const hasFireDPS =
        members.some(
            item =>
                item.name === "Emberpup"
                ||
                (
                    item.roles.includes("DPS")
                    &&
                    item.elements.includes("fire")
                )
        );


    const hasFireDebuff =
        members.some(
            item =>
                item.skills
                    .some(
                        skill =>
                            JSON.stringify(skill)
                                .toLowerCase()
                                .includes(
                                    "fire debuff"
                                )
                    )
        );


    if (
        hasFireDPS
        &&
        hasFireDebuff
    ) {

        results.push(
            "Fire-focused damage can benefit from Fire Debuff application when the relevant effects interact with the target."
        );

    }


    /*
       Emberpup-specific synergy.
    */

    const ember =
        members.find(
            item =>
                item.name
                    .toLowerCase()
                    ===
                "emberpup"
        );


    if (ember) {

        results.push(
            "Emberpup's Scorching Flames increases damage against enemies weak to its element by 15%, so identifying Fire-effective matchups is especially important."
        );


        if (
            members.length > 1
        ) {

            results.push(
                "Emberpup should generally be treated as an offensive centerpiece: teammates should help create safe damage windows, maintain uptime and/or amplify the value of its Fire pressure."
            );

        }

    }


    return results;

}


/* =========================================================
   WEAKNESSES
========================================================= */

function findWeaknesses(members) {

    const results = [];


    const roles =
        countRoles(
            members
        );


    if (
        roles.Heal === 0
        &&
        roles.Regen === 0
    ) {

        results.push(
            "No dedicated Heal or Regen role is present, so prolonged encounters may put pressure on team sustain."
        );

    }


    if (
        roles.Break === 0
    ) {

        results.push(
            "No dedicated Break Aniimo is present. Enemies that require frequent Break pressure may take longer to disrupt."
        );

    }


    if (
        roles.DPS === 0
    ) {

        results.push(
            "No Aniimo is currently tagged as DPS, so the team may lack a clear primary damage engine."
        );

    }


    const elements =
        countElements(
            members
        );


    if (
        Object.keys(elements).length === 1
    ) {

        const onlyElement =
            Object.keys(elements)[0];


        results.push(
            `The team is heavily concentrated around ${displayElement(onlyElement)}. Matchups that punish or resist that element may be more problematic.`
        );

    }


    const ember =
        members.some(
            item =>
                item.name
                    .toLowerCase()
                    ===
                "emberpup"
        );


    if (ember) {

        results.push(
            "Emberpup's bonus is strongest when fighting enemies weak to its element, so unfavorable elemental matchups reduce the value of its Scorching Flames trait."
        );

    }


    return results;

}


/* =========================================================
   GAME PLAN
========================================================= */

function buildGamePlan(
    members,
    synergies
) {

    const steps = [];


    const dps =
        members.find(
            item =>
                item.roles
                    .includes("DPS")
        );


    const breaker =
        members.find(
            item =>
                item.roles
                    .includes("Break")
        );


    const support =
        members.find(
            item =>
                item.roles
                    .includes("Support")
        );


    const regen =
        members.find(
            item =>
                item.roles
                    .includes("Regen")
        );


    const healer =
        members.find(
            item =>
                item.roles
                    .includes("Heal")
        );


    if (breaker) {

        steps.push(
            `${breaker.name} should focus on building Break pressure and creating the team's major damage windows.`
        );

    }


    if (support) {

        steps.push(
            `${support.name} should prioritize buffs, debuffs, utility or defensive effects that allow the team's main damage dealer to stay effective.`
        );

    }


    if (dps) {

        steps.push(
            `${dps.name} should capitalize on the openings created by the rest of the team rather than wasting major damage abilities outside useful windows.`
        );

    }


    if (regen) {

        steps.push(
            `${regen.name} should help maintain resource/regen uptime so the team can continue using its important abilities.`
        );

    }


    if (healer) {

        steps.push(
            `${healer.name} should maintain team health while avoiding unnecessary downtime from the main damage rotation.`
        );

    }


    if (!steps.length) {

        steps.push(
            "Select additional Aniimo to generate a more complete game plan."
        );

    }


    steps.push(
        "Adapt the rotation to the enemy's element, defensive mechanics and Break requirements."
    );


    return steps;

}


/* =========================================================
   MEMBER DETAILS
========================================================= */

function renderDetailedMember(item) {

    const stats =
        item.stats
        &&
        Object.keys(item.stats).length
            ?
            Object.entries(
                item.stats
            )
            :
            [];


    const skills =
        Array.isArray(item.skills)
            ?
            item.skills
            :
            [];


    return `

        <div
            style="
                margin-bottom:18px;
                padding-bottom:15px;
                border-bottom:1px solid #293744;
            "
        >

            <h4>
                ${escapeHTML(item.name)}
            </h4>

            <p>

                <strong>
                    Role:
                </strong>

                ${
                    escapeHTML(
                        item.roles.join(", ")
                        ||
                        "Unknown"
                    )
                }

                <br>

                <strong>
                    Element:
                </strong>

                ${
                    escapeHTML(
                        item.elements
                            .map(displayElement)
                            .join(" / ")
                        ||
                        "Unknown"
                    )
                }

            </p>


            ${
                stats.length
                    ?
                    `
                    <p>
                        <strong>Stats:</strong>

                        ${
                            stats
                                .map(
                                    ([key, value]) =>
                                        `${escapeHTML(key)} ${escapeHTML(value)}`
                                )
                                .join(" · ")
                        }

                    </p>
                    `
                    :
                    ""
            }


            ${
                item.trait
                    ?
                    `
                    <p>

                        <strong>
                            Trait:
                        </strong>

                        ${
                            escapeHTML(
                                typeof item.trait
                                    ===
                                "string"
                                    ?
                                    item.trait
                                    :
                                    (
                                        item.trait.name
                                        +
                                        (
                                            item.trait.description
                                                ?
                                                " — "
                                                +
                                                item.trait.description
                                                :
                                                ""
                                        )
                                    )
                            )
                        }

                    </p>
                    `
                    :
                    ""
            }


            ${
                skills.length
                    ?
                    `
                    <details>

                        <summary>
                            Skills (${skills.length})
                        </summary>

                        <ul>

                            ${
                                skills
                                    .map(
                                        skill => {

                                            if (
                                                typeof skill
                                                ===
                                                "string"
                                            ) {

                                                return `
                                                    <li>
                                                        ${escapeHTML(skill)}
                                                    </li>
                                                `;

                                            }


                                            return `
                                                <li>

                                                    <strong>
                                                        ${escapeHTML(
                                                            skill.name
                                                            ||
                                                            "Skill"
                                                        )}
                                                    </strong>

                                                    ${
                                                        skill.description
                                                            ?
                                                            `
                                                            — ${escapeHTML(
                                                                skill.description
                                                            )}
                                                            `
                                                            :
                                                            ""
                                                    }

                                                </li>
                                            `;

                                        }
                                    )
                                    .join("")
                            }

                        </ul>

                    </details>
                    `
                    :
                    ""
            }

        </div>

    `;

}


/* =========================================================
   SUMMARY
========================================================= */

function buildTeamSummary(members) {

    if (
        members.length === 1
    ) {

        return `${members[0].name} selected. Add up to 3 more Aniimo.`;

    }


    const names =
        members
            .map(
                item => item.name
            )
            .join(", ");


    return `${names} — ${members.length}/4 Aniimo selected.`;

}


/* =========================================================
   PERCENTAGE
========================================================= */

function percentage(
    value,
    maximum
) {

    if (
        !maximum
        ||
        !value
    ) {

        return 0;

    }


    return Math.min(
        100,
        Math.round(
            (
                value
                /
                maximum
            )
            *
            100
        )
    );

}


/* =========================================================
   CLEAR TEAM
========================================================= */

function clearTeam() {

    team = [
        null,
        null,
        null,
        null
    ];


    renderSlots();

    renderRoster();

    renderAnalysis();

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadAniimoData() {

    /*
       IMPORTANT:
       Render the team slots FIRST.

       Even if JSON fails, the user should still see
       four empty slots.
    */

    renderSlots();


    const roster =
        $("roster");


    if (roster) {

        roster.innerHTML = `

            <div class="loading">

                Loading Aniimo data...

            </div>

        `;

    }


    try {

        const response =
            await fetch(
                "aniimo.json?cache="
                +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const json =
            await response.json();


        let rawList =
            json;


        /*
           Support several possible JSON structures.
        */

        if (
            !Array.isArray(rawList)
            &&
            Array.isArray(
                json.aniimo
            )
        ) {

            rawList =
                json.aniimo;

        }


        if (
            !Array.isArray(rawList)
            &&
            Array.isArray(
                json.aniimos
            )
        ) {

            rawList =
                json.aniimos;

        }


        if (
            !Array.isArray(rawList)
        ) {

            throw new Error(
                "aniimo.json does not contain an Aniimo array."
            );

        }


        aniimo =
            mergeFallbackData(
                rawList
            );


    }

    catch (error) {

        console.error(
            "Could not load aniimo.json:",
            error
        );


        /*
           NEVER leave the user stuck at Loading.

           At minimum, show Emberpup.
        */

        aniimo = [

            normalizeAniimo(
                EMBERPUP_FALLBACK
            )

        ];


        if (roster) {

            roster.innerHTML = `

                <div class="loading">

                    <strong>
                        Aniimo database could not be loaded.
                    </strong>

                    <br><br>

                    <small>
                        Showing verified fallback data for Emberpup
                        while the database is being repaired.
                    </small>

                </div>

            `;

        }

    }


    populateElementFilter();

    renderRoster();

    renderSlots();

    renderAnalysis();

}


/* =========================================================
   FILTER EVENTS
========================================================= */

function setupFilters() {

    const search =
        $("search");


    const role =
        $("roleFilter");


    const element =
        $("elementFilter");


    if (search) {

        search.addEventListener(
            "input",
            renderRoster
        );

    }


    if (role) {

        role.addEventListener(
            "change",
            renderRoster
        );

    }


    if (element) {

        element.addEventListener(
            "change",
            renderRoster
        );

    }


    const clear =
        $("clearTeam");


    if (clear) {

        clear.addEventListener(
            "click",
            clearTeam
        );

    }

}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           Slots appear immediately.
        */

        renderSlots();


        /*
           Filters are initialized immediately.
        */

        setupFilters();


        /*
           Then load the database.
        */

        loadAniimoData();

    }
);
