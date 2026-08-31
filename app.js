"use strict";

/*
=========================================================
ANIIMO TEAM BUILDER
STABLE ROSTER VERSION
=========================================================
*/

const FALLBACK_ROSTER = [
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
    [13,"013","Irisalis"],
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


/*
=========================================================
STATE
=========================================================
*/

let ANIIMO = [];

let selectedTeam = [
    null,
    null,
    null,
    null
];

let selectedRole = "all";
let selectedElement = "all";
let searchText = "";


/*
=========================================================
DOM
=========================================================
*/

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


/*
=========================================================
HELPERS
=========================================================
*/

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function capitalize(value) {

    if (!value) return "";

    return String(value)
        .charAt(0)
        .toUpperCase() +
        String(value).slice(1);

}


/*
=========================================================
CORRECT NAMES
=========================================================
*/

const NAME_BY_ID = {};

FALLBACK_ROSTER.forEach(function(entry) {

    NAME_BY_ID[String(entry[0])] = entry[2];

});


/*
=========================================================
ANIIDEX IMAGE FALLBACK
=========================================================

Only used when the database does not contain a usable
portrait.

The previous version generated an image number that
was incorrect for many Aniimo. We therefore do NOT
invent a portrait when we don't know the correct one.
=========================================================
*/

function getUsableImage(item) {

    const image =
        item.imageUrl ||
        item.image ||
        "";

    if (!image) {
        return "";
    }

    if (
        image.includes("undefinedimages") ||
        image.includes("ogImage.png")
    ) {
        return "";
    }

    return image;

}


/*
=========================================================
CREATE FALLBACK ANIIMO
=========================================================
*/

function createFallbackAniimo(entry) {

    return {

        id: entry[0],

        number: entry[1],

        name: entry[2],

        sourceUrl: null,

        imageUrl: "",

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

}


/*
=========================================================
NORMALIZE DATABASE RECORD
=========================================================
*/

function normalizeAniimo(item) {

    const id =
        Number(item.id) || 0;

    const fallbackName =
        NAME_BY_ID[String(id)] ||
        ("Aniimo #" + id);

    const name =
        NAME_BY_ID[String(id)] ||
        (
            item.name &&
            !String(item.name)
                .toLowerCase()
                .includes("official aniimo wiki")
                ?
            item.name
            :
            fallbackName
        );

    return {

        id: id,

        number:
            String(
                item.number ||
                String(id).padStart(3, "0")
            ),

        name: name,

        sourceUrl:
            item.sourceUrl ||
            null,

        imageUrl:
            getUsableImage(item),

        elements:
            Array.isArray(item.elements)
                ?
                item.elements.map(function(x) {
                    return String(x)
                        .toLowerCase();
                })
                :
                [],

        roles:
            Array.isArray(item.roles)
                ?
                item.roles
                :
                [],

        stats:
            item.stats &&
            typeof item.stats === "object"
                ?
                item.stats
                :
                {},

        forms:
            Array.isArray(item.forms)
                ?
                item.forms
                :
                [],

        trait:
            item.trait ||
            null,

        traits:
            Array.isArray(item.traits)
                ?
                item.traits
                :
                [],

        skills:
            Array.isArray(item.skills)
                ?
                item.skills
                :
                [],

        analysis:
            item.analysis &&
            typeof item.analysis === "object"
                ?
                item.analysis
                :
                {
                    tags: [],
                    notes: []
                }

    };

}


/*
=========================================================
LOAD DATABASE
=========================================================
*/

async function loadDatabase() {

    /*
    FIRST:
    immediately display the complete fallback roster.
    */

    ANIIMO =
        FALLBACK_ROSTER.map(
            createFallbackAniimo
        );

    renderRoster();
    renderTeam();
    renderAnalysis();


    /*
    THEN:
    load the detailed JSON.
    */

    try {

        const response =
            await fetch(
                "aniimo.json?v=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "aniimo.json HTTP " +
                response.status
            );

        }

        const data =
            await response.json();

        if (
            !Array.isArray(data) ||
            data.length < 80
        ) {

            throw new Error(
                "Database contains too few Aniimo."
            );

        }


        /*
        Create a lookup of the detailed records.
        */

        const databaseById = {};

        data.forEach(function(item) {

            const id =
                Number(item.id);

            if (id) {

                databaseById[String(id)] =
                    item;

            }

        });


        /*
        MERGE detailed data INTO the known roster.

        This is the important fix.

        The JSON can no longer replace the correct
        roster names.
        */

        ANIIMO =
            FALLBACK_ROSTER.map(
                function(entry) {

                    const id =
                        entry[0];

                    const databaseRecord =
                        databaseById[String(id)];

                    if (!databaseRecord) {

                        return createFallbackAniimo(
                            entry
                        );

                    }

                    return normalizeAniimo(
                        databaseRecord
                    );

                }
            );


        /*
        Make sure the database cannot accidentally
        remove Aniimo from the roster.
        */

        renderRoster();
        renderTeam();
        renderAnalysis();


        if (rosterStatus) {

            rosterStatus.textContent =
                ANIIMO.length +
                " Aniimo";

        }

        console.log(
            "Loaded merged Aniimo database:",
            ANIIMO.length
        );


    } catch (error) {

        console.warn(
            "Detailed database unavailable. " +
            "Using complete fallback roster.",
            error
        );

        if (rosterStatus) {

            rosterStatus.textContent =
                ANIIMO.length +
                " Aniimo";

        }

    }

}


/*
=========================================================
FILTER
=========================================================
*/

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
                aniimo.roles.some(
                    function(role) {

                        return (
                            String(role)
                                .toLowerCase()
                                ===
                            selectedRole
                        );

                    }
                );


            const elementMatch =
                selectedElement === "all" ||
                aniimo.elements.some(
                    function(element) {

                        return (
                            String(element)
                                .toLowerCase()
                                ===
                            selectedElement
                        );

                    }
                );


            return (
                searchMatch &&
                roleMatch &&
                elementMatch
            );

        }
    );

}


/*
=========================================================
ROSTER
=========================================================
*/

function renderRoster() {

    if (!rosterElement) {
        return;
    }

    const list =
        getFilteredAniimo();


    rosterElement.innerHTML =
        "";


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


    list.forEach(
        function(aniimo) {

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
                aniimo.elements
                    .map(
                        function(element) {

                            return `
                                <span class="badge">
                                    ${capitalize(
                                        element
                                    )}
                                </span>
                            `;

                        }
                    )
                    .join("");


            const roles =
                aniimo.roles
                    .map(
                        function(role) {

                            return `
                                <span class="badge">
                                    ${escapeHtml(
                                        role
                                    )}
                                </span>
                            `;

                        }
                    )
                    .join("");


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

        }
    );

}


/*
=========================================================
DETAILS
=========================================================
*/

function showAniimoDetails(aniimo) {

    if (
        !details ||
        !detailsPanel
    ) {
        return;
    }


    detailsPanel.classList.remove(
        "hidden"
    );


    let statsHTML = "";


    if (
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
                            function([
                                key,
                                value
                            ]) {

                                return `

                                    <div class="stat">

                                        <div class="stat-name">
                                            ${escapeHtml(
                                                key
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


    const traits =
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

                <h3>Traits & Passives</h3>

                ${
                    traits
                        .map(
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
                        )
                        .join("")
                }

            </div>

        `;

    }


    let skillsHTML = "";


    if (aniimo.skills.length) {

        skillsHTML = `

            <div class="detail-section">

                <h3>Skills & Abilities</h3>

                ${
                    aniimo.skills
                        .map(
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
                                                skill.cost !== undefined &&
                                                skill.cost !== ""
                                                    ?
                                                    " • Cost " +
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
                                                    " • Power " +
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
                        )
                        .join("")
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


    details.innerHTML = `

        <button
            class="role-button"
            data-add-team="${aniimo.id}"
        >
            ➕ Add to Team
        </button>


        <div class="detail-header">

            ${
                aniimo.imageUrl
                    ?
                    `
                    <img
                        src="${escapeHtml(
                            aniimo.imageUrl
                        )}"
                        alt="${escapeHtml(
                            aniimo.name
                        )}"
                        onerror="
                            this.style.display='none';
                        "
                    >
                    `
                    :
                    ""
            }


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

                    ${
                        aniimo.elements
                            .map(
                                function(element) {

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
                    }


                    ${
                        aniimo.roles
                            .map(
                                function(role) {

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
                    }

                </div>

            </div>

        </div>


        ${statsHTML}

        ${traitsHTML}

        ${skillsHTML}


        ${
            tags.length
                ?
                `
                <div class="detail-section">

                    <h3>Synergy Tags</h3>

                    <div class="badges">

                        ${
                            tags
                                .map(
                                    function(tag) {

                                        return `
                                            <span class="badge">
                                                ${escapeHtml(
                                                    tag
                                                )}
                                            </span>
                                        `;

                                    }
                                )
                                .join("")
                        }

                    </div>

                </div>
                `
                :
                ""
        }

    `;

}


/*
=========================================================
TEAM
=========================================================
*/

function addAniimoToTeam(id) {

    const aniimo =
        ANIIMO.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!aniimo) {
        return;
    }


    const emptyIndex =
        selectedTeam.findIndex(
            function(item) {

                return !item;

            }
        );


    if (emptyIndex === -1) {

        alert(
            "Your team already has 4 Aniimo."
        );

        return;

    }


    selectedTeam[emptyIndex] =
        aniimo;


    renderTeam();
    renderAnalysis();

}


/*
=========================================================
RENDER TEAM
=========================================================
*/

function renderTeam() {

    document
        .querySelectorAll(
            ".team-slot"
        )
        .forEach(
            function(slot, index) {

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
                        aniimo.imageUrl
                            ?
                            `
                            <img
                                src="${escapeHtml(
                                    aniimo.imageUrl
                                )}"
                                alt="${escapeHtml(
                                    aniimo.name
                                )}"
                            >
                            `
                            :
                            "🐾"
                    }

                    <strong>
                        ${escapeHtml(
                            aniimo.name
                        )}
                    </strong>

                    <small>
                        ${escapeHtml(
                            aniimo.roles.join(
                                " / "
                            )
                        )}
                    </small>

                `;

            }
        );

}


/*
=========================================================
ANALYSIS
=========================================================
*/

function renderAnalysis() {

    if (!analysis) {
        return;
    }


    const team =
        selectedTeam.filter(
            Boolean
        );


    if (!team.length) {

        analysis.innerHTML = `

            <div class="empty-analysis">

                Select Aniimo to begin
                building your team.

            </div>

        `;

        return;

    }


    const roles = {};
    const elements = {};
    const tags = {};


    team.forEach(
        function(aniimo) {

            aniimo.roles.forEach(
                function(role) {

                    roles[role] =
                        (
                            roles[role] ||
                            0
                        ) + 1;

                }
            );


            aniimo.elements.forEach(
                function(element) {

                    elements[element] =
                        (
                            elements[element] ||
                            0
                        ) + 1;

                }
            );


            if (
                aniimo.analysis &&
                Array.isArray(
                    aniimo.analysis.tags
                )
            ) {

                aniimo.analysis.tags.forEach(
                    function(tag) {

                        tags[tag] =
                            (
                                tags[tag] ||
                                0
                            ) + 1;

                    }
                );

            }

        }
    );


    const roleText =
        Object.entries(roles)
            .map(
                function([role,count]) {

                    return `
                        <span class="badge">
                            ${escapeHtml(
                                role
                            )}: ${count}
                        </span>
                    `;

                }
            )
            .join("");


    const elementText =
        Object.entries(elements)
            .map(
                function([element,count]) {

                    return `
                        <span class="badge">
                            ${capitalize(
                                element
                            )}: ${count}
                        </span>
                    `;

                }
            )
            .join("");


    const tagText =
        Object.entries(tags)
            .map(
                function([tag,count]) {

                    return `
                        <span class="badge">
                            ${escapeHtml(
                                tag
                            )}: ${count}
                        </span>
                    `;

                }
            )
            .join("");


    analysis.innerHTML = `

        <div class="analysis-card">

            <h3>Team Composition</h3>

            <div class="badges">
                ${roleText}
            </div>

        </div>


        <div class="analysis-card">

            <h3>Elements</h3>

            <div class="badges">
                ${elementText}
            </div>

        </div>


        ${
            tagText
                ?
                `
                <div class="analysis-card">

                    <h3>Synergy Indicators</h3>

                    <div class="badges">
                        ${tagText}
                    </div>

                </div>
                `
                :
                ""
        }

        <div class="analysis-card">

            <h3>Team Size</h3>

            <p>
                ${team.length} / 4 Aniimo selected.
            </p>

            <p>
                There is no forced one-of-each-role
                restriction.
            </p>

        </div>

    `;

}


/*
=========================================================
EVENTS
=========================================================
*/

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


    roleButtons.forEach(
        function(button) {

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


                    button.classList.add(
                        "active"
                    );


                    selectedRole =
                        (
                            button.dataset.role ||
                            "all"
                        ).toLowerCase();


                    renderRoster();

                }
            );

        }
    );


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
                Number(
                    card.dataset.id
                );


            const aniimo =
                ANIIMO.find(
                    function(item) {

                        return (
                            item.id === id
                        );

                    }
                );


            if (aniimo) {

                showAniimoDetails(
                    aniimo
                );

            }

        }
    );


    if (details) {

        details.addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "[data-add-team]"
                    );


                if (!button) {
                    return;
                }


                addAniimoToTeam(
                    Number(
                        button.dataset.addTeam
                    )
                );

            }
        );

    }

}


/*
=========================================================
START
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadDatabase();

        setupEvents();

    }
);
