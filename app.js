"use strict";

/*
=========================================================
ANIIMO TEAM BUILDER
STABLE FRONT-END DATABASE VERSION
=========================================================

IMPORTANT:

The website has a built-in canonical Aniimo roster.

aniimo.json supplies:
- stats
- elements
- roles
- skills
- traits
- analysis

The JSON is NEVER allowed to overwrite:
- Aniimo names
- Aniimo numbers
- canonical roster membership

This prevents a broken scraper/database refresh from
turning names into "Official Aniimo Wiki..." or mixing
portraits.

=========================================================
*/


/* =====================================================
   CANONICAL ANIIMO ROSTER
   ===================================================== */

const CANONICAL_ROSTER = [
    [1,"001","Emberpup"],
    [2,"002","Flameruff"],
    [3,"003","Scorchhowl"],
    [4,"004","Inferlupa"],
    [5,"005","Celestis"],
    [6,"006","Stellarys"],
    [7,"007","Chirpi"],
    [8,"008","Tromber"],
    [9,"009","Cornet"],
    [10,"010","Tubster"],
    [11,"011","Iris"],
    [12,"012","Irisal"],
    [14,"014","Skippy"],
    [15,"015","Pranky"],
    [16,"016","Glacy"],
    [17,"017","Leafy"],
    [18,"018","Nimbi"],
    [19,"019","Turbo"],
    [20,"020","Dreaple"],
    [21,"021","Hummin"],
    [22,"022","Witchin"],
    [23,"023","Tuckin"],
    [24,"024","Budclaw"],
    [25,"025","Shrubclaw"],
    [26,"026","Geoclaw"],
    [27,"027","Sparki"],
    [28,"028","Flamerion"],
    [29,"029","Flutternym"],
    [30,"030","Gracewing"],
    [31,"031","Somniwing"],
    [32,"032","Eko"],
    [33,"033","Eklue"],
    [34,"034","Budsquire"],
    [35,"035","Thornblade"],
    [36,"036","Melloblum"],
    [37,"037","Pomegg"],
    [38,"038","Dazmand"],
    [39,"039","Pomawk"],
    [40,"040","Dewy"],
    [41,"041","Fragrancier"],
    [42,"042","Wisptis"],
    [43,"043","Ignitis"],
    [44,"044","Fulmintis"],
    [45,"045","Bonesky"],
    [46,"046","Fenrier"],
    [47,"047","Glynsera"],
    [48,"048","Bolty"],
    [49,"049","Blazen"],
    [50,"050","Susuta"],
    [51,"051","Popota"],
    [52,"052","Piopiota"],
    [53,"053","Panpanta"],
    [54,"054","Shelly"],
    [55,"055","Sheldon"],
    [56,"056","Sherro"],
    [57,"057","Baleetle"],
    [58,"058","Waleetle"],
    [59,"059","Bouldus"],
    [60,"060","Fentuft"],
    [61,"061","Fenmane"],
    [62,"062","Helmut"],
    [63,"063","Pawney"],
    [64,"064","Rookey"],
    [65,"065","Jawling"],
    [66,"066","Helmwhelp"],
    [67,"067","Helgon"],
    [68,"068","Infergon"],
    [69,"069","Cubbo"],
    [70,"070","Grizbo"],
    [71,"071","Pebbling"],
    [72,"072","Lavazar"],
    [73,"073","Magmarex"],
    [74,"074","Geodeback"],
    [75,"075","Minespine"],
    [76,"076","Cozite"],
    [77,"077","Bailite"],
    [78,"078","Bulbly"],
    [79,"079","Veilfloat"],
    [80,"080","Luminelle"],
    [81,"081","Fahloo"],
    [82,"082","Erlath"],
    [83,"083","Besauce"],
    [84,"084","Reefish"],
    [85,"085","Coraliz"],
    [86,"086","Cheekie"],
    [87,"087","Wavwal"],
    [88,"088","Bubbeep"],
    [89,"089","Glameep"],
    [90,"090","Popapus"],
    [91,"091","Gachapus"],
    [92,"092","Malangel"],
    [93,"093","Malevsera"],
    [9997,"9997","Fennelun"],
    [9998,"9998","Helion"]
];


/* =====================================================
   STATE
   ===================================================== */

let ANIIMO = [];
let selectedTeam = [null,null,null,null];

let selectedRole = "all";
let selectedElement = "all";
let searchText = "";


/* =====================================================
   DOM
   ===================================================== */

const rosterElement = document.getElementById("roster");
const rosterStatus = document.getElementById("rosterStatus");

const searchInput = document.getElementById("searchInput");
const elementFilter = document.getElementById("elementFilter");

const roleButtons =
    document.querySelectorAll(".role-button");

const clearTeamButton =
    document.getElementById("clearTeam");

const analysis =
    document.getElementById("analysis");

const detailsPanel =
    document.getElementById("detailsPanel");

const details =
    document.getElementById("details");


/* =====================================================
   START
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /*
       IMPORTANT:
       Render the canonical roster FIRST.
       This means the website is usable immediately.
    */

    ANIIMO = CANONICAL_ROSTER.map(function(entry) {

        return {
            id: entry[0],
            number: entry[1],
            name: entry[2],

            sourceUrl: null,

            imageUrl: createAniDexImage(entry[0]),

            elements: [],
            roles: [],
            stats: {},

            forms: [],

            trait: null,
            traits: [],

            skills: [],

            analysis: {
                tags: [],
                notes: []
            }
        };

    });

    renderRoster();
    renderTeam();
    renderAnalysis();

    setupEvents();

    /*
       Load additional data afterwards.
    */

    loadDatabase();

});


/* =====================================================
   ANIIDEX PORTRAIT
   ===================================================== */

function createAniDexImage(id) {

    /*
       Do not use the broken Wiki_PetHead images.

       AniDex uses the Aniimo number for these portraits.
    */

    if (!id || id >= 1000) {
        return "";
    }

    return (
        "https://aniidex.com/" +
        "_ipx/q_95%26fit_inside%26s_260x260/" +
        "images/aniimo/UI_PetHead_" +
        (10000 + Number(id) + 50) +
        ".png"
    );
}


/* =====================================================
   IMAGE VALIDATION
   ===================================================== */

function isBadPortrait(url) {

    if (!url) {
        return true;
    }

    const value = String(url).toLowerCase();

    /*
       The current JSON contains many of these incorrect
       Wiki_PetHead images.

       Ignore them.
    */

    if (value.includes("undefinedimages")) {
        return true;
    }

    if (value.includes("ogimage")) {
        return true;
    }

    if (value.includes("placeholder")) {
        return true;
    }

    if (value.includes("wik_pethead")) {
        return true;
    }

    if (value.includes("wiki_pethead")) {
        return true;
    }

    return false;
}


/* =====================================================
   DATABASE LOADER
   ===================================================== */

async function loadDatabase() {

    try {

        const response = await fetch(
            "aniimo.json?v=" + Date.now(),
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

        /*
           Build lookup table using the Aniimo number.

           We deliberately do NOT use the scraped name as
           the identity.
        */

        const databaseByNumber = new Map();

        data.forEach(function(item) {

            if (!item) {
                return;
            }

            const number = String(
                item.number || ""
            ).padStart(3,"0");

            if (!number) {
                return;
            }

            databaseByNumber.set(number,item);

        });


        /*
           MERGE DATABASE INTO CANONICAL ROSTER.

           This is the critical fix.

           The database supplies detailed information.

           The canonical roster supplies the identity.
        */

        ANIIMO = CANONICAL_ROSTER.map(function(entry) {

            const id = entry[0];
            const number = entry[1];
            const canonicalName = entry[2];

            const databaseItem =
                databaseByNumber.get(number);


            const merged = {

                id: id,

                /*
                   NEVER use database name.
                */

                number: number,

                name: canonicalName,

                sourceUrl:
                    databaseItem &&
                    databaseItem.sourceUrl
                        ?
                        databaseItem.sourceUrl
                        :
                        null,

                elements:
                    databaseItem &&
                    Array.isArray(databaseItem.elements)
                        ?
                        databaseItem.elements.map(
                            function(element) {
                                return String(element)
                                    .toLowerCase();
                            }
                        )
                        :
                        [],

                roles:
                    databaseItem &&
                    Array.isArray(databaseItem.roles)
                        ?
                        databaseItem.roles
                        :
                        [],

                stats:
                    databaseItem &&
                    databaseItem.stats &&
                    typeof databaseItem.stats === "object"
                        ?
                        databaseItem.stats
                        :
                        {},

                forms:
                    databaseItem &&
                    Array.isArray(databaseItem.forms)
                        ?
                        databaseItem.forms
                        :
                        [],

                trait:
                    databaseItem &&
                    databaseItem.trait
                        ?
                        databaseItem.trait
                        :
                        null,

                traits:
                    databaseItem &&
                    Array.isArray(databaseItem.traits)
                        ?
                        databaseItem.traits
                        :
                        [],

                skills:
                    databaseItem &&
                    Array.isArray(databaseItem.skills)
                        ?
                        databaseItem.skills
                        :
                        [],

                analysis:
                    databaseItem &&
                    databaseItem.analysis &&
                    typeof databaseItem.analysis === "object"
                        ?
                        databaseItem.analysis
                        :
                        {
                            tags: [],
                            notes: []
                        },

                /*
                   Ignore the broken Wiki_PetHead URLs.

                   Use AniDex instead.
                */

                imageUrl: createAniDexImage(id)

            };


            /*
               If a future scraper gives us a proper
               Wiki_Aniimo main portrait, allow it.

               But NEVER accept Wiki_PetHead.
            */

            if (
                databaseItem &&
                databaseItem.imageUrl &&
                !isBadPortrait(
                    databaseItem.imageUrl
                ) &&
                String(databaseItem.imageUrl)
                    .toLowerCase()
                    .includes("wiki_aniimo_")
            ) {

                merged.imageUrl =
                    databaseItem.imageUrl;

            }


            return merged;

        });


        /*
           IMPORTANT:
           Only replace the roster if the merge succeeded.
        */

        if (ANIIMO.length !== CANONICAL_ROSTER.length) {

            throw new Error(
                "Canonical roster merge failed."
            );

        }


        renderRoster();
        renderTeam();
        renderAnalysis();


        if (rosterStatus) {

            rosterStatus.textContent =
                ANIIMO.length +
                " Aniimo";

        }


        console.log(
            "Aniimo database merged successfully:",
            ANIIMO.length
        );


    } catch (error) {

        /*
           NEVER destroy the working roster.

           If aniimo.json is broken, we simply keep the
           canonical roster.
        */

        console.warn(
            "Database merge failed. Keeping canonical roster.",
            error
        );

        if (rosterStatus) {

            rosterStatus.textContent =
                ANIIMO.length +
                " Aniimo";

        }

    }

}


/* =====================================================
   EVENTS
   ===================================================== */

function setupEvents() {

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function(event) {

                searchText =
                    event.target.value
                        .trim()
                        .toLowerCase();

                renderRoster();

            }
        );

    }


    if (elementFilter) {

        elementFilter.addEventListener(
            "change",
            function(event) {

                selectedElement =
                    event.target.value
                        .toLowerCase();

                renderRoster();

            }
        );

    }


    roleButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                roleButtons.forEach(
                    function(other) {

                        other.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add("active");

                selectedRole =
                    (
                        button.dataset.role ||
                        "all"
                    ).toLowerCase();

                renderRoster();

            }
        );

    });


    if (clearTeamButton) {

        clearTeamButton.addEventListener(
            "click",
            function() {

                selectedTeam = [
                    null,
                    null,
                    null,
                    null
                ];

                renderTeam();
                renderAnalysis();

            }
        );

    }


    document.addEventListener(
        "click",
        function(event) {

            const card =
                event.target.closest(
                    ".aniimo-card"
                );

            if (!card) {
                return;
            }

            const id =
                Number(card.dataset.id);

            const aniimo =
                ANIIMO.find(
                    function(item) {
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

}


/* =====================================================
   FILTERING
   ===================================================== */

function getFilteredAniimo() {

    return ANIIMO.filter(
        function(aniimo) {

            const name =
                String(
                    aniimo.name || ""
                ).toLowerCase();

            const number =
                String(
                    aniimo.number || ""
                ).toLowerCase();


            const searchMatch =
                !searchText ||
                name.includes(searchText) ||
                number.includes(searchText);


            const roleMatch =
                selectedRole === "all" ||
                (
                    Array.isArray(aniimo.roles) &&
                    aniimo.roles.some(
                        function(role) {

                            return String(role)
                                .toLowerCase()
                                === selectedRole;

                        }
                    )
                );


            const elementMatch =
                selectedElement === "all" ||
                (
                    Array.isArray(aniimo.elements) &&
                    aniimo.elements.some(
                        function(element) {

                            return String(element)
                                .toLowerCase()
                                === selectedElement;

                        }
                    )
                );


            return (
                searchMatch &&
                roleMatch &&
                elementMatch
            );

        }
    );

}


/* =====================================================
   ROSTER RENDER
   ===================================================== */

function renderRoster() {

    if (!rosterElement) {
        return;
    }


    const list =
        getFilteredAniimo();


    rosterElement.innerHTML = "";


    if (rosterStatus) {

        rosterStatus.textContent =
            list.length +
            " Aniimo";

    }


    if (!list.length) {

        rosterElement.innerHTML = `
            <div class="empty-analysis">
                No Aniimo match your filters.
            </div>
        `;

        return;

    }


    list.forEach(function(aniimo) {

        const card =
            document.createElement("div");

        card.className =
            "aniimo-card";

        card.dataset.id =
            aniimo.id;


        let imageHTML = `
            <div class="portrait-fallback">
                🐾
            </div>
        `;


        if (aniimo.imageUrl) {

            imageHTML = `
                <img
                    src="${escapeHtml(
                        aniimo.imageUrl
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
                    class="portrait-fallback"
                    style="display:none"
                >
                    🐾
                </div>
            `;

        }


        const elements =
            Array.isArray(aniimo.elements)
                ?
                aniimo.elements.map(
                    function(element) {

                        return `
                            <span class="badge">
                                ${escapeHtml(
                                    capitalize(element)
                                )}
                            </span>
                        `;

                    }
                ).join("")
                :
                "";


        const roles =
            Array.isArray(aniimo.roles)
                ?
                aniimo.roles.map(
                    function(role) {

                        return `
                            <span class="badge">
                                ${escapeHtml(
                                    role
                                )}
                            </span>
                        `;

                    }
                ).join("")
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


        rosterElement.appendChild(card);

    });

}


/* =====================================================
   TEAM
   ===================================================== */

function renderTeam() {

    const slots =
        document.querySelectorAll(
            ".team-slot"
        );


    slots.forEach(function(slot,index) {

        const aniimo =
            selectedTeam[index];


        slot.innerHTML = "";


        if (!aniimo) {

            slot.classList.add("empty");

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


        slot.classList.remove("empty");


        slot.innerHTML = `

            <span class="slot-number">
                ${index + 1}
            </span>

            <span class="slot-text">
                ${escapeHtml(
                    aniimo.name
                )}
            </span>

        `;

    });


    /*
       Clicking a team slot makes that slot active.
       The next roster Aniimo clicked goes into it.
    */

}


/* =====================================================
   TEAM SLOT SELECTION
   ===================================================== */

let activeTeamSlot = 0;


document.addEventListener(
    "click",
    function(event) {

        const slot =
            event.target.closest(
                ".team-slot"
            );

        if (!slot) {
            return;
        }


        activeTeamSlot =
            Number(
                slot.dataset.slot
            );


        document.querySelectorAll(
            ".team-slot"
        ).forEach(function(other) {

            other.classList.remove(
                "selected-slot"
            );

        });


        slot.classList.add(
            "selected-slot"
        );

    }
);


/*
   Clicking a roster card while a team slot is active
   adds that Aniimo to the selected slot.
*/

document.addEventListener(
    "click",
    function(event) {

        const card =
            event.target.closest(
                ".aniimo-card"
            );

        if (!card) {
            return;
        }


        /*
           Do not interfere with normal details behaviour
           unless the user is selecting a team.
        */

        const id =
            Number(
                card.dataset.id
            );


        const aniimo =
            ANIIMO.find(
                function(item) {
                    return item.id === id;
                }
            );


        if (!aniimo) {
            return;
        }


        /*
           If no slot has been deliberately selected,
           use the first empty slot.
        */

        let slotIndex =
            activeTeamSlot;


        if (
            selectedTeam[slotIndex]
        ) {

            slotIndex =
                selectedTeam.findIndex(
                    function(item) {
                        return item === null;
                    }
                );

            if (slotIndex === -1) {
                slotIndex = 0;
            }

        }


        selectedTeam[slotIndex] =
            aniimo;


        activeTeamSlot =
            slotIndex;


        renderTeam();
        renderAnalysis();


        /*
           Highlight selected slot.
        */

        document.querySelectorAll(
            ".team-slot"
        ).forEach(function(slot) {

            slot.classList.remove(
                "selected-slot"
            );

        });

        const activeSlot =
            document.querySelector(
                '.team-slot[data-slot="' +
                slotIndex +
                '"]'
            );

        if (activeSlot) {

            activeSlot.classList.add(
                "selected-slot"
            );

        }

    }
);


/* =====================================================
   TEAM ANALYSIS
   ===================================================== */

function renderAnalysis() {

    if (!analysis) {
        return;
    }


    const team =
        selectedTeam.filter(
            function(item) {
                return item !== null;
            }
        );


    if (!team.length) {

        analysis.innerHTML = `
            <div class="empty-analysis">
                Select Aniimo to begin building your team.
            </div>
        `;

        return;

    }


    const roles = {};


    team.forEach(function(aniimo) {

        if (!Array.isArray(aniimo.roles)) {
            return;
        }

        aniimo.roles.forEach(function(role) {

            const key =
                String(role);

            roles[key] =
                (roles[key] || 0) + 1;

        });

    });


    const elements = {};


    team.forEach(function(aniimo) {

        if (!Array.isArray(aniimo.elements)) {
            return;
        }

        aniimo.elements.forEach(function(element) {

            const key =
                capitalize(element);

            elements[key] =
                (elements[key] || 0) + 1;

        });

    });


    let roleHTML = "";

    Object.entries(roles).forEach(
        function([role,count]) {

            roleHTML += `
                <span class="badge">
                    ${escapeHtml(role)}
                    ×${count}
                </span>
            `;

        }
    );


    let elementHTML = "";

    Object.entries(elements).forEach(
        function([element,count]) {

            elementHTML += `
                <span class="badge">
                    ${escapeHtml(element)}
                    ×${count}
                </span>
            `;

        }
    );


    let synergyPoints = 0;

    team.forEach(function(aniimo) {

        const tags =
            aniimo.analysis &&
            Array.isArray(aniimo.analysis.tags)
                ?
                aniimo.analysis.tags
                :
                [];

        synergyPoints +=
            tags.length;

    });


    let plan = "";


    const dps =
        team.filter(function(aniimo) {

            return Array.isArray(aniimo.roles) &&
                aniimo.roles.some(
                    function(role) {
                        return String(role)
                            .toLowerCase() === "dps";
                    }
                );

        });


    const support =
        team.filter(function(aniimo) {

            return Array.isArray(aniimo.roles) &&
                aniimo.roles.some(
                    function(role) {
                        return String(role)
                            .toLowerCase() === "support";
                    }
                );

        });


    const regen =
        team.filter(function(aniimo) {

            return Array.isArray(aniimo.roles) &&
                aniimo.roles.some(
                    function(role) {
                        return String(role)
                            .toLowerCase() === "regen";
                    }
                );

        });


    const breakUnits =
        team.filter(function(aniimo) {

            return Array.isArray(aniimo.roles) &&
                aniimo.roles.some(
                    function(role) {
                        return String(role)
                            .toLowerCase() === "break";
                    }
                );

        });


    const heal =
        team.filter(function(aniimo) {

            return Array.isArray(aniimo.roles) &&
                aniimo.roles.some(
                    function(role) {
                        return String(role)
                            .toLowerCase() === "heal";
                    }
                );

        });


    if (dps.length) {

        plan +=
            "Use your DPS Aniimo as the primary damage source. ";

    }


    if (support.length) {

        plan +=
            "Use Support abilities to create openings and amplify the team's damage. ";

    }


    if (breakUnits.length) {

        plan +=
            "Use Break Aniimo to pressure enemy BREAK and create windows for your DPS. ";

    }


    if (regen.length) {

        plan +=
            "Use Regen abilities to maintain EP/resources and keep the team cycling. ";

    }


    if (heal.length) {

        plan +=
            "Keep your Heal Aniimo available for sustained encounters rather than wasting healing early. ";

    }


    if (!plan) {

        plan =
            "This team has no predefined role-based game plan yet. Use the individual skills and traits to determine the strongest rotation.";

    }


    analysis.innerHTML = `

        <div class="detail-section">

            <h3>
                Team Overview
            </h3>

            <p>
                <strong>
                    ${team.length}/4
                </strong>
                Aniimo selected.
            </p>

        </div>


        <div class="detail-section">

            <h3>
                Roles
            </h3>

            <div class="badges">
                ${roleHTML || "No role data"}
            </div>

        </div>


        <div class="detail-section">

            <h3>
                Elements
            </h3>

            <div class="badges">
                ${elementHTML || "No element data"}
            </div>

        </div>


        <div class="detail-section">

            <h3>
                Synergy
            </h3>

            <p>
                Current synergy indicators:
                <strong>
                    ${synergyPoints}
                </strong>
            </p>

            <p>
                This score is an analysis aid only and
                is not an official in-game rating.
            </p>

        </div>


        <div class="detail-section">

            <h3>
                Suggested Game Plan
            </h3>

            <p>
                ${escapeHtml(plan)}
            </p>

        </div>

    `;

}


/* =====================================================
   ANIIMO DETAILS
   ===================================================== */

function showAniimoDetails(aniimo) {

    if (!details || !detailsPanel) {
        return;
    }


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

                <h3>
                    Stats
                </h3>

                <div class="stats">

                    ${
                        Object.entries(
                            aniimo.stats
                        )
                        .map(
                            function([key,value]) {

                                return `

                                    <div class="stat">

                                        <div class="stat-name">
                                            ${escapeHtml(key)}
                                        </div>

                                        <div class="stat-value">
                                            ${escapeHtml(
                                                String(value)
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


    const traits =
        aniimo.traits &&
        aniimo.traits.length
            ?
            aniimo.traits
            :
            (
                aniimo.trait
                    ?
                    [aniimo.trait]
                    :
                    []
            );


    let traitsHTML = "";


    if (traits.length) {

        traitsHTML = `

            <div class="detail-section">

                <h3>
                    Traits & Passives
                </h3>

                ${
                    traits.map(
                        function(trait) {

                            return `

                                <div class="skill">

                                    <div class="skill-name">
                                        ${escapeHtml(
                                            trait.name ||
                                            "Trait"
                                        )}
                                    </div>

                                    <p>
                                        ${escapeHtml(
                                            trait.description ||
                                            ""
                                        )}
                                    </p>

                                </div>

                            `;

                        }
                    ).join("")
                }

            </div>

        `;

    }


    let skillsHTML = "";


    if (
        Array.isArray(aniimo.skills) &&
        aniimo.skills.length
    ) {

        skillsHTML = `

            <div class="detail-section">

                <h3>
                    Skills & Abilities
                </h3>

                ${
                    aniimo.skills.map(
                        function(skill) {

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
                                            skill.type
                                                ?
                                                escapeHtml(
                                                    skill.type
                                                )
                                                :
                                                ""
                                        }

                                        ${
                                            skill.cost !== undefined
                                                ?
                                                " • Cost: " +
                                                escapeHtml(
                                                    String(
                                                        skill.cost
                                                    )
                                                )
                                                :
                                                ""
                                        }

                                        ${
                                            skill.power !== undefined &&
                                            skill.power !== ""
                                                ?
                                                " • Power: " +
                                                escapeHtml(
                                                    String(
                                                        skill.power
                                                    )
                                                )
                                                :
                                                ""
                                        }

                                    </div>

                                    <p>
                                        ${escapeHtml(
                                            skill.description ||
                                            ""
                                        )}
                                    </p>

                                </div>

                            `;

                        }
                    ).join("")
                }

            </div>

        `;

    }


    const tags =
        aniimo.analysis &&
        Array.isArray(
            aniimo.analysis.tags
        )
            ?
            aniimo.analysis.tags
            :
            [];


    const tagsHTML =
        tags.length
            ?
            `
                <div class="detail-section">

                    <h3>
                        Synergy Tags
                    </h3>

                    <div class="badges">

                        ${
                            tags.map(
                                function(tag) {

                                    return `
                                        <span class="badge">
                                            ${escapeHtml(
                                                String(tag)
                                            )}
                                        </span>
                                    `;

                                }
                            ).join("")
                        }

                    </div>

                </div>
            `
            :
            "";


    details.innerHTML = `

        <div class="detail-section">

            <h2>
                ${escapeHtml(
                    aniimo.name
                )}
            </h2>

            <p>
                NO.${escapeHtml(
                    aniimo.number
                )}
            </p>

            ${
                aniimo.sourceUrl
                    ?
                    `
                        <p>
                            <a
                                href="${escapeHtml(
                                    aniimo.sourceUrl
                                )}"
                                target="_blank"
                                rel="noopener"
                            >
                                View Official Wiki Page
                            </a>
                        </p>
                    `
                    :
                    ""
            }

        </div>


        ${statsHTML}

        ${traitsHTML}

        ${skillsHTML}

        ${tagsHTML}

    `;

}


/* =====================================================
   UTILITIES
   ===================================================== */

function capitalize(value) {

    if (!value) {
        return "";
    }

    const text =
        String(value);

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}
