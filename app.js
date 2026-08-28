"use strict";

/*
=========================================================
ANIIMO TEAM BUILDER
FULL ROSTER VERSION
=========================================================

Uses the complete aniimo.json from the repository.

IMPORTANT:
We do NOT use a 6-Aniimo test roster anymore.

The JSON database is the source for the roster.

If the JSON temporarily fails, the complete roster
names are used as a fallback so the page never becomes
an infinite loading screen.
=========================================================
*/


/* =====================================================
   COMPLETE CURRENT PROJECT ROSTER
   ===================================================== */

const COMPLETE_ROSTER = [
    [1, "001", "Emberpup"],
    [2, "002", "Flameruff"],
    [3, "003", "Scorchhowl"],
    [4, "004", "Inferlupa"],
    [5, "005", "Celestis"],
    [6, "006", "Stellarys"],
    [7, "007", "Chirpi"],
    [8, "008", "Tromber"],
    [9, "009", "Cornet"],
    [10, "010", "Tubster"],
    [11, "011", "Iris"],
    [12, "012", "Irisal"],

    [14, "014", "Skippy"],
    [15, "015", "Pranky"],
    [16, "016", "Glacy"],
    [17, "017", "Leafy"],
    [18, "018", "Nimbi"],
    [19, "019", "Turbo"],
    [20, "020", "Dreaple"],
    [21, "021", "Hummin"],
    [22, "022", "Witchin"],
    [23, "023", "Tuckin"],
    [24, "024", "Budclaw"],
    [25, "025", "Shrubclaw"],
    [26, "026", "Geoclaw"],
    [27, "027", "Sparki"],
    [28, "028", "Flamerion"],
    [29, "029", "Flutternym"],
    [30, "030", "Gracewing"],
    [31, "031", "Somniwing"],
    [32, "032", "Eko"],
    [33, "033", "Eklue"],
    [34, "034", "Budsquire"],
    [35, "035", "Thornblade"],
    [36, "036", "Melloblum"],
    [37, "037", "Pomegg"],
    [38, "038", "Dazmand"],
    [39, "039", "Pomawk"],
    [40, "040", "Dewy"],
    [41, "041", "Fragrancier"],
    [42, "042", "Wisptis"],
    [43, "043", "Ignitis"],
    [44, "044", "Fulmintis"],
    [45, "045", "Bonesky"],
    [46, "046", "Fenrier"],
    [47, "047", "Glynsera"],
    [48, "048", "Bolty"],
    [49, "049", "Blazen"],
    [50, "050", "Susuta"],
    [51, "051", "Popota"],
    [52, "052", "Piopiota"],
    [53, "053", "Panpanta"],
    [54, "054", "Shelly"],
    [55, "055", "Sheldon"],
    [56, "056", "Sherro"],
    [57, "057", "Baleetle"],
    [58, "058", "Waleetle"],
    [59, "059", "Bouldus"],
    [60, "060", "Fentuft"],
    [61, "061", "Fenmane"],
    [62, "062", "Helmut"],
    [63, "063", "Pawney"],
    [64, "064", "Rookey"],
    [65, "065", "Jawling"],
    [66, "066", "Helmwhelp"],
    [67, "067", "Helgon"],
    [68, "068", "Infergon"],
    [69, "069", "Cubbo"],
    [70, "070", "Grizbo"],
    [71, "071", "Pebbling"],
    [72, "072", "Lavazar"],
    [73, "073", "Magmarex"],
    [74, "074", "Geodeback"],
    [75, "075", "Minespine"],
    [76, "076", "Cozite"],
    [77, "077", "Bailite"],
    [78, "078", "Bulbly"],
    [79, "079", "Veilfloat"],
    [80, "080", "Luminelle"],
    [81, "081", "Fahloo"],
    [82, "082", "Erlath"],
    [83, "083", "Besauce"],
    [84, "084", "Reefish"],
    [85, "085", "Coraliz"],
    [86, "086", "Cheekie"],
    [87, "087", "Wavwal"],
    [88, "088", "Bubbeep"],
    [89, "089", "Glameep"],
    [90, "090", "Popapus"],
    [91, "091", "Gachapus"],
    [92, "092", "Malangel"],
    [93, "093", "Malevsera"],

    [9997, "9997", "Fennelun"],
    [9998, "9998", "Helion"]
];


/* =====================================================
   STATE
   ===================================================== */

let ANIIMO = COMPLETE_ROSTER.map(function (item) {

    return {
        id: item[0],
        number: item[1],
        name: item[2],
        sourceUrl: null,
        imageUrl: null,
        elements: [],
        roles: [],
        stats: {},
        forms: [],
        trait: null,
        skills: [],
        analysis: {
            tags: [],
            notes: []
        }
    };

});


let selectedTeam = [null, null, null, null];

let selectedRole = "all";

let selectedElement = "all";

let searchText = "";


/* =====================================================
   DOM
   ===================================================== */

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


/* =====================================================
   START IMMEDIATELY
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
        FIRST:
        Show the COMPLETE roster immediately.

        No spinner.
        No waiting.
        No API.
        */

        renderRoster();

        renderTeam();

        renderAnalysis();

        setupEvents();

        /*
        SECOND:
        Load the richer information from aniimo.json.
        */

        loadAniimoDatabase();

    }
);


/* =====================================================
   LOAD THE REAL DATABASE
   ===================================================== */

async function loadAniimoDatabase() {

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
                "Could not load aniimo.json: HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "aniimo.json does not contain an array."
            );

        }


        /*
        Merge the detailed JSON data with the
        complete roster.

        This is important because the JSON contains
        all the current project entries, while the
        fallback guarantees the names never disappear.
        */

        const database =
            new Map();


        data.forEach(
            function (item) {

                database.set(
                    Number(item.id),
                    item
                );

            }
        );


        ANIIMO =
            COMPLETE_ROSTER.map(
                function (entry) {

                    const id =
                        entry[0];

                    const number =
                        entry[1];

                    const name =
                        entry[2];

                    const databaseItem =
                        database.get(id);


                    if (!databaseItem) {

                        return {

                            id: id,

                            number: number,

                            name: name,

                            sourceUrl: null,

                            imageUrl: null,

                            elements: [],

                            roles: [],

                            stats: {},

                            forms: [],

                            trait: null,

                            skills: [],

                            analysis: {
                                tags: [],
                                notes: []
                            }

                        };

                    }


                    return normalizeAniimo(
                        databaseItem,
                        number,
                        name
                    );

                }
            );


        /*
        Render AGAIN after the database loads.
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
            "FULL ANIIMO ROSTER LOADED:",
            ANIIMO.length
        );


    } catch (error) {

        console.error(
            "Aniimo database error:",
            error
        );


        /*
        IMPORTANT:

        We DO NOT clear the roster.

        The complete roster remains visible.
        */

        if (rosterStatus) {

            rosterStatus.textContent =
                ANIIMO.length +
                " Aniimo";

        }

    }

}


/* =====================================================
   NORMALIZE DATA
   ===================================================== */

function normalizeAniimo(
    item,
    fallbackNumber,
    fallbackName
) {

    return {

        id:
            Number(item.id) ||
            0,

        number:
            item.number ||
            fallbackNumber,

        name:
            item.name ||
            fallbackName,

        sourceUrl:
            item.sourceUrl ||
            null,

        imageUrl:
            item.imageUrl ||
            null,

        elements:
            Array.isArray(item.elements)
                ? item.elements
                : [],

        roles:
            Array.isArray(item.roles)
                ? item.roles
                : [],

        stats:
            item.stats &&
            typeof item.stats === "object"
                ? item.stats
                : {},

        forms:
            Array.isArray(item.forms)
                ? item.forms
                : [],

        trait:
            item.trait ||
            null,

        skills:
            Array.isArray(item.skills)
                ? item.skills
                : [],

        analysis:
            item.analysis &&
            typeof item.analysis === "object"
                ? item.analysis
                : {
                    tags: [],
                    notes: []
                }

    };

}


/* =====================================================
   EVENTS
   ===================================================== */

function setupEvents() {


    /* SEARCH */

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


    /* ELEMENT FILTER */

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


    /* ROLE FILTER */

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
                        (
                            button.dataset.role ||
                            "all"
                        ).toLowerCase();


                    renderRoster();

                }
            );

        }
    );


    /* CLEAR TEAM */

    if (clearTeamButton) {

        clearTeamButton.addEventListener(
            "click",
            function () {

                selectedTeam =
                    [
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


    /* TEAM SLOTS */

    document
        .querySelectorAll(
            ".team-slot"
        )
        .forEach(
            function (slot) {

                slot.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                slot.dataset.slot
                            );


                        if (
                            Number.isInteger(
                                index
                            )
                        ) {

                            selectedTeam[index] =
                                null;

                            renderTeam();

                            renderAnalysis();

                        }

                    }
                );

            }
        );


    /* ROSTER CARD */

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
                Number(
                    card.dataset.id
                );


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


    /* ADD TO TEAM */

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


                addAniimoToTeam(
                    Number(
                        button.dataset.addTeam
                    )
                );

            }
        );

    }

}


/* =====================================================
   FILTERING
   ===================================================== */

function getFilteredAniimo() {

    return ANIIMO.filter(
        function (aniimo) {


            const name =
                String(
                    aniimo.name || ""
                ).toLowerCase();


            const number =
                String(
                    aniimo.number || ""
                ).toLowerCase();


            const matchesSearch =
                !searchText ||
                name.includes(searchText) ||
                number.includes(searchText);


            /*
            IMPORTANT:

            If an Aniimo currently has no role data,
            it must STILL appear under "All".
            */

            const matchesRole =
                selectedRole === "all" ||

                (
                    Array.isArray(
                        aniimo.roles
                    ) &&

                    aniimo.roles.some(
                        function (role) {

                            return String(role)
                                .toLowerCase() ===
                                selectedRole;

                        }
                    )
                );


            /*
            Same logic for elements.
            */

            const matchesElement =
                selectedElement === "all" ||

                (
                    Array.isArray(
                        aniimo.elements
                    ) &&

                    aniimo.elements.some(
                        function (element) {

                            return String(element)
                                .toLowerCase() ===
                                selectedElement;

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


/* =====================================================
   RENDER ROSTER
   ===================================================== */

function renderRoster() {

    if (!rosterElement)
        return;


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
        function (aniimo) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "aniimo-card";


            card.dataset.id =
                aniimo.id;


            /*
            Use the stored image if available.

            If it isn't available yet, show a clean
            Aniimo placeholder instead of a broken image.
            */

            let imageHTML =
                `

                <div class="aniimo-placeholder">

                    🐾

                </div>

                `;


            if (aniimo.imageUrl) {

                imageHTML =
                    `

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
                        class="aniimo-placeholder"
                        style="display:none;"
                    >
                        🐾
                    </div>

                    `;

            }


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


/* =====================================================
   DETAILS
   ===================================================== */

function showAniimoDetails(
    aniimo
) {

    if (!detailsPanel || !details)
        return;


    detailsPanel.classList.remove(
        "hidden"
    );


    let statsHTML =
        "";


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
                                    key,
                                    value
                                ]
                            ) {

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


    let skillsHTML =
        "";


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
                                                    ?
                                                    escapeHtml(
                                                        skill.element
                                                    )
                                                    :
                                                    ""
                                            }

                                            ${
                                                skill.type
                                                    ?
                                                    " • " +
                                                    escapeHtml(
                                                        skill.type
                                                    )
                                                    :
                                                    ""
                                            }

                                            ${
                                                skill.cost !==
                                                undefined
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
                                                skill.power !==
                                                undefined
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


    const notes =
        Array.isArray(
            aniimo.analysis?.notes
        )
            ?
            aniimo.analysis.notes
            :
            [];


    const notesHTML =
        notes.length

            ?

            `

                <ul>

                    ${
                        notes
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

                    Detailed synergy information
                    will be added as the Aniimo
                    database is verified.

                </p>

            `;


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

                    `

                    <div
                        class="aniimo-placeholder"
                        style="
                            width:160px;
                            height:160px;
                            font-size:70px;
                        "
                    >

                        🐾

                    </div>

                    `
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

                            ""
                    }


                    ${
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

                            ""
                    }

                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>Trait</h3>

            <div class="analysis-box">

                <strong>

                    ${
                        typeof aniimo.trait ===
                        "object"

                            ?

                            escapeHtml(
                                aniimo.trait.name ||
                                "Trait"
                            )

                            :

                            "Trait information"
                    }

                </strong>


                <p>

                    ${
                        typeof aniimo.trait ===
                        "object"

                            ?

                            escapeHtml(
                                aniimo.trait.description ||
                                ""
                            )

                            :

                            "Detailed trait information has not yet been entered."
                    }

                </p>

            </div>

        </div>


        ${statsHTML}


        ${skillsHTML}


        <div class="detail-section">

            <h3>
                Team Building Notes
            </h3>

            ${notesHTML}

        </div>

    `;


    detailsPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =====================================================
   TEAM
   ===================================================== */

function renderTeam() {

    document
        .querySelectorAll(
            ".team-slot"
        )
        .forEach(
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

                            `<div
                                class="aniimo-placeholder"
                                style="
                                    width:60px;
                                    height:60px;
                                    font-size:30px;
                                "
                            >
                                🐾
                            </div>`
                    }


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


/* =====================================================
   ADD ANIIMO TO TEAM
   ===================================================== */

function addAniimoToTeam(
    id
) {

    const aniimo =
        ANIIMO.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!aniimo)
        return;


    const emptySlot =
        selectedTeam.findIndex(
            function (slot) {

                return slot === null;

            }
        );


    if (emptySlot === -1) {

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


/* =====================================================
   TEAM ANALYSIS
   ===================================================== */

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
                    role +
                    ": " +
                    count
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
                    capitalize(
                        element
                    ) +
                    ": " +
                    count
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


/* =====================================================
   HELPERS
   ===================================================== */

function capitalize(
    value
) {

    if (!value)
        return "";


    const text =
        String(value);


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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
