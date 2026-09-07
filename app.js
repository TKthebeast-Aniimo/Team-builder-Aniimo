"use strict";

/*
=========================================================
ANIIMO TEAM BUILDER
STABLE FRONT-END DATABASE VERSION
=========================================================

THIS VERSION ADDS:

✓ Canonical 94-Aniimo roster
✓ Protected Aniimo names/numbers
✓ AniDex portrait fallback
✓ Stats / elements / roles / skills / traits
✓ Multiple Aniimo forms
✓ Individual level input
✓ Level persistence with localStorage
✓ Form persistence with localStorage
✓ Live Squad Diagnostics
✓ Elemental Coverage
✓ Defensive Vulnerability Tracking
✓ High Vulnerability warnings
✓ Counter Coverage
✓ Elemental Matrix
✓ Automatic scroll to Aniimo details
✓ No external refresh workflow required

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
   ELEMENTAL MATCHUP MATRIX
   =====================================================

   Rows = attacking element
   Columns = defending element

   1.6   = Super Effective
   1     = Neutral
   0.625 = Resisted

===================================================== */

const ELEMENTS = [
    "ice",
    "light",
    "fire",
    "dark",
    "lightning",
    "wind",
    "earth",
    "water",
    "grass"
];

const ELEMENT_LABELS = {
    ice: "Ice",
    light: "Light",
    fire: "Fire",
    dark: "Dark",
    lightning: "Lightning",
    wind: "Wind",
    earth: "Earth",
    water: "Water",
    grass: "Grass"
};


/*
   This matrix follows the current AniDex elemental chart.
*/

const ELEMENT_MATRIX = {

    ice: {
        ice: 0.625,
        light: 1,
        fire: 0.625,
        dark: 1,
        lightning: 1.6,
        wind: 0.625,
        earth: 0.625,
        water: 1.6,
        grass: 1
    },

    light: {
        ice: 1,
        light: 0.625,
        fire: 1,
        dark: 1.6,
        lightning: 0.625,
        wind: 1.6,
        earth: 1,
        water: 1,
        grass: 1
    },

    fire: {
        ice: 1.6,
        light: 0.625,
        fire: 0.625,
        dark: 1,
        lightning: 1,
        wind: 1,
        earth: 0.625,
        water: 0.625,
        grass: 1.6
    },

    dark: {
        ice: 1,
        light: 1.6,
        fire: 1.6,
        dark: 1,
        lightning: 1,
        wind: 0.625,
        earth: 1,
        water: 0.625,
        grass: 1.6
    },

    lightning: {
        ice: 0.625,
        light: 1,
        fire: 1,
        dark: 1,
        lightning: 0.625,
        wind: 1.6,
        earth: 0.625,
        water: 1.6,
        grass: 1
    },

    wind: {
        ice: 1,
        light: 1,
        fire: 1,
        dark: 1.6,
        lightning: 0.625,
        wind: 0.625,
        earth: 1,
        water: 1,
        grass: 1.6
    },

    earth: {
        ice: 1.6,
        light: 1,
        fire: 1,
        dark: 0.625,
        lightning: 1.6,
        wind: 1,
        earth: 0.625,
        water: 0.625,
        grass: 0.625
    },

    water: {
        ice: 0.625,
        light: 0.625,
        fire: 1.6,
        dark: 1,
        lightning: 1,
        wind: 1,
        earth: 1.6,
        water: 0.625,
        grass: 0.625
    },

    grass: {
        ice: 1,
        light: 0.625,
        fire: 0.625,
        dark: 1,
        lightning: 1,
        wind: 1,
        earth: 1.6,
        water: 1.6,
        grass: 0.625
    }

};


/* =====================================================
   STATE
   ===================================================== */

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

let activeTeamSlot = 0;


/*
   Browser persistence.

   This means your manually entered levels/forms survive
   page refreshes.
*/

const LEVEL_STORAGE_KEY =
    "aniimo_team_builder_levels_v2";

const FORM_STORAGE_KEY =
    "aniimo_team_builder_forms_v2";


let savedLevels = {};
let savedForms = {};


try {

    savedLevels =
        JSON.parse(
            localStorage.getItem(
                LEVEL_STORAGE_KEY
            ) || "{}"
        );

} catch (error) {

    savedLevels = {};

}


try {

    savedForms =
        JSON.parse(
            localStorage.getItem(
                FORM_STORAGE_KEY
            ) || "{}"
        );

} catch (error) {

    savedForms = {};

}


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
    document.querySelectorAll(
        ".role-button"
    );

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

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Build the canonical roster immediately.
        */

        ANIIMO =
            CANONICAL_ROSTER.map(
                function (entry) {

                    const savedLevel =
                        getSavedLevel(
                            entry[1]
                        );

                    const savedForm =
                        getSavedForm(
                            entry[1]
                        );

                    return {

                        id: entry[0],

                        number: entry[1],

                        name: entry[2],

                        sourceUrl: null,

                        imageUrl:
                            createAniDexImage(
                                entry[0]
                            ),

                        elements: [],

                        roles: [],

                        stats: {},

                        forms: [],

                        selectedFormIndex:
                            savedForm,

                        level:
                            savedLevel,

                        trait: null,

                        traits: [],

                        skills: [],

                        analysis: {
                            tags: [],
                            notes: []
                        }

                    };

                }
            );


        renderRoster();

        renderTeam();

        renderAnalysis();

        setupEvents();

        /*
           Load the database after the page is already
           usable.
        */

        loadDatabase();

        /*
           Create the new diagnostics panel automatically.
        */

        ensureDiagnosticsPanel();

    }
);


/* =====================================================
   LEVEL STORAGE
   ===================================================== */

function getSavedLevel(number) {

    const value =
        Number(
            savedLevels[
                String(number)
            ]
        );

    if (
        Number.isFinite(value) &&
        value >= 1
    ) {

        return value;

    }

    return 1;

}


function saveAniimoLevel(aniimo, level) {

    const numericLevel =
        Math.max(
            1,
            Math.min(
                999,
                Number(level) || 1
            )
        );


    aniimo.level =
        numericLevel;


    savedLevels[
        String(aniimo.number)
    ] =
        numericLevel;


    try {

        localStorage.setItem(
            LEVEL_STORAGE_KEY,
            JSON.stringify(
                savedLevels
            )
        );

    } catch (error) {

        console.warn(
            "Could not save Aniimo level.",
            error
        );

    }

}


/* =====================================================
   FORM STORAGE
   ===================================================== */

function getSavedForm(number) {

    const value =
        Number(
            savedForms[
                String(number)
            ]
        );

    if (
        Number.isInteger(value) &&
        value >= 0
    ) {

        return value;

    }

    return 0;

}


function saveAniimoForm(aniimo, index) {

    const formIndex =
        Math.max(
            0,
            Number(index) || 0
        );


    aniimo.selectedFormIndex =
        formIndex;


    savedForms[
        String(aniimo.number)
    ] =
        formIndex;


    try {

        localStorage.setItem(
            FORM_STORAGE_KEY,
            JSON.stringify(
                savedForms
            )
        );

    } catch (error) {

        console.warn(
            "Could not save Aniimo form.",
            error
        );

    }

}


/* =====================================================
   ANIIDEX PORTRAIT
   ===================================================== */

function createAniDexImage(id) {

    /*
       Keep the working AniDex portrait system.

       Special 9997/9998 entries do not use this formula.
    */

    if (!id || id >= 1000) {

        return "";

    }


    return (
        "https://aniidex.com/" +
        "_ipx/q_95%26fit_inside%26s_260x260/" +
        "images/aniimo/UI_PetHead_" +
        (
            10000 +
            Number(id) +
            50
        ) +
        ".png"
    );

}


/* =====================================================
   BAD PORTRAIT DETECTION
   ===================================================== */

function isBadPortrait(url) {

    if (!url) {

        return true;

    }


    const value =
        String(url)
            .toLowerCase();


    if (
        value.includes(
            "undefinedimages"
        )
    ) {

        return true;

    }


    if (
        value.includes(
            "ogimage"
        )
    ) {

        return true;

    }


    if (
        value.includes(
            "placeholder"
        )
    ) {

        return true;

    }


    if (
        value.includes(
            "wik_pethead"
        )
    ) {

        return true;

    }


    if (
        value.includes(
            "wiki_pethead"
        )
    ) {

        return true;

    }


    return false;

}


/* =====================================================
   ELEMENT NORMALISATION
   ===================================================== */

function normalizeElement(value) {

    if (!value) {

        return "";

    }


    let text =
        String(value)
            .trim()
            .toLowerCase();


    /*
       Old naming aliases.
    */

    const aliases = {

        electric: "lightning",

        electricity: "lightning",

        thunder: "lightning",

        rock: "earth",

        holy: "light",

        sun: "light"

    };


    if (
        aliases[text]
    ) {

        text =
            aliases[text];

    }


    return ELEMENTS.includes(
        text
    )
        ?
        text
        :
        text;

}


/* =====================================================
   NORMALISE ARRAY
   ===================================================== */

function safeArray(value) {

    if (Array.isArray(value)) {

        return value;

    }


    if (
        value &&
        typeof value === "object"
    ) {

        return Object.values(
            value
        );

    }


    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value
            .split(",")
            .map(
                function (item) {
                    return item.trim();
                }
            )
            .filter(Boolean);

    }


    return [];

}


/* =====================================================
   DATABASE LOADER
   ===================================================== */

async function loadDatabase() {

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
                "aniimo.json returned HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "aniimo.json is not an array"
            );

        }


        const databaseByNumber =
            new Map();


        data.forEach(
            function (item) {

                if (!item) {

                    return;

                }


                const rawNumber =
                    item.number ??
                    item.no ??
                    item.idNumber ??
                    item.id;


                if (
                    rawNumber === undefined ||
                    rawNumber === null
                ) {

                    return;

                }


                const number =
                    String(
                        rawNumber
                    )
                    .replace(
                        /^NO\.\s*/i,
                        ""
                    )
                    .padStart(
                        3,
                        "0"
                    );


                databaseByNumber.set(
                    number,
                    item
                );

            }
        );


        /*
           Merge into canonical roster.

           DATABASE CANNOT CHANGE:

           - name
           - number
           - roster membership
        */

        ANIIMO =
            CANONICAL_ROSTER.map(
                function (entry) {

                    const id =
                        entry[0];

                    const number =
                        entry[1];

                    const canonicalName =
                        entry[2];


                    const databaseItem =
                        databaseByNumber.get(
                            number
                        );


                    const oldAniimo =
                        ANIIMO.find(
                            function (item) {
                                return (
                                    item.number ===
                                    number
                                );
                            }
                        );


                    const rawElements =
                        databaseItem
                            ?
                            (
                                databaseItem.elements ??
                                databaseItem.element ??
                                []
                            )
                            :
                            [];


                    const elements =
                        safeArray(
                            rawElements
                        )
                        .map(
                            function (element) {

                                return normalizeElement(
                                    element
                                );

                            }
                        )
                        .filter(Boolean);


                    const roles =
                        databaseItem
                            ?
                            safeArray(
                                databaseItem.roles ??
                                databaseItem.role ??
                                []
                            )
                            :
                            [];


                    const forms =
                        databaseItem
                            ?
                            normalizeForms(
                                databaseItem
                            )
                            :
                            [];


                    let selectedFormIndex =
                        oldAniimo &&
                        Number.isInteger(
                            oldAniimo.selectedFormIndex
                        )
                            ?
                            oldAniimo.selectedFormIndex
                            :
                            getSavedForm(
                                number
                            );


                    if (
                        selectedFormIndex >=
                        forms.length
                    ) {

                        selectedFormIndex = 0;

                    }


                    const merged = {

                        id: id,

                        number: number,

                        /*
                           CANONICAL NAME.
                        */

                        name:
                            canonicalName,


                        sourceUrl:
                            databaseItem &&
                            databaseItem.sourceUrl
                                ?
                                databaseItem.sourceUrl
                                :
                                (
                                    databaseItem &&
                                    databaseItem.url
                                        ?
                                        databaseItem.url
                                        :
                                        null
                                ),


                        elements: elements,


                        roles: roles,


                        stats:
                            databaseItem &&
                            databaseItem.stats &&
                            typeof databaseItem.stats === "object"
                                ?
                                databaseItem.stats
                                :
                                {},


                        forms: forms,


                        selectedFormIndex:
                            selectedFormIndex,


                        level:
                            oldAniimo &&
                            oldAniimo.level
                                ?
                                oldAniimo.level
                                :
                                getSavedLevel(
                                    number
                                ),


                        trait:
                            databaseItem &&
                            databaseItem.trait
                                ?
                                databaseItem.trait
                                :
                                null,


                        traits:
                            databaseItem
                                ?
                                safeArray(
                                    databaseItem.traits ??
                                    []
                                )
                                :
                                [],


                        skills:
                            databaseItem
                                ?
                                safeArray(
                                    databaseItem.skills ??
                                    []
                                )
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
                           Always use the working AniDex
                           portrait system first.
                        */

                        imageUrl:
                            createAniDexImage(
                                id
                            )

                    };


                    /*
                       Allow a verified image from the
                       database only if it does NOT look
                       like the broken Wiki_PetHead data.
                    */

                    if (
                        databaseItem &&
                        databaseItem.imageUrl &&
                        !isBadPortrait(
                            databaseItem.imageUrl
                        ) &&
                        String(
                            databaseItem.imageUrl
                        )
                        .toLowerCase()
                        .includes(
                            "wiki_aniimo_"
                        )
                    ) {

                        merged.imageUrl =
                            databaseItem.imageUrl;

                    }


                    return merged;

                }
            );


        if (
            ANIIMO.length !==
            CANONICAL_ROSTER.length
        ) {

            throw new Error(
                "Canonical roster merge failed."
            );

        }


        renderRoster();

        renderTeam();

        renderAnalysis();

        updateDiagnostics();


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


        updateDiagnostics();

    }

}


/* =====================================================
   FORM NORMALISATION
   ===================================================== */

function normalizeForms(item) {

    let forms =
        item.forms ??
        item.variants ??
        item.form ??
        [];


    forms =
        safeArray(
            forms
        );


    /*
       If the database explicitly has a basic form
       but no forms array, create one from the base item.
    */

    if (!forms.length) {

        return [];

    }


    return forms.map(
        function (form, index) {

            if (
                !form ||
                typeof form !== "object"
            ) {

                return {

                    name:
                        String(form),

                    index:
                        index

                };

            }


            return {

                ...form,

                name:
                    form.name ??
                    form.formName ??
                    form.title ??
                    (
                        index === 0
                            ?
                            "Basic Form"
                            :
                            "Form " +
                            (index + 1)
                    ),

                index: index

            };

        }
    );

}


/* =====================================================
   GET ACTIVE FORM
   ===================================================== */

function getActiveForm(aniimo) {

    if (
        !aniimo ||
        !Array.isArray(
            aniimo.forms
        ) ||
        !aniimo.forms.length
    ) {

        return null;

    }


    const index =
        Math.max(
            0,
            Math.min(
                aniimo.selectedFormIndex || 0,
                aniimo.forms.length - 1
            )
        );


    return aniimo.forms[index] || null;

}


/* =====================================================
   GET ACTIVE DATA
   ===================================================== */

function getActiveData(aniimo) {

    const form =
        getActiveForm(
            aniimo
        );


    if (!form) {

        return {

            imageUrl:
                aniimo.imageUrl,

            stats:
                aniimo.stats,

            elements:
                aniimo.elements,

            roles:
                aniimo.roles,

            skills:
                aniimo.skills,

            traits:
                aniimo.traits,

            trait:
                aniimo.trait,

            analysis:
                aniimo.analysis

        };

    }


    return {

        imageUrl:
            form.imageUrl ??
            form.image ??
            form.portrait ??
            aniimo.imageUrl,


        stats:
            form.stats ??
            aniimo.stats,


        elements:
            safeArray(
                form.elements ??
                aniimo.elements
            )
            .map(
                function (element) {
                    return normalizeElement(
                        element
                    );
                }
            ),


        roles:
            safeArray(
                form.roles ??
                aniimo.roles
            ),


        skills:
            safeArray(
                form.skills ??
                aniimo.skills
            ),


        traits:
            safeArray(
                form.traits ??
                aniimo.traits
            ),


        trait:
            form.trait ??
            aniimo.trait,


        analysis:
            form.analysis ??
            aniimo.analysis

    };

}


/* =====================================================
   EVENTS
   ===================================================== */

function setupEvents() {

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


    if (elementFilter) {

        elementFilter.addEventListener(
            "change",
            function (event) {

                selectedElement =
                    event.target.value
                        .toLowerCase();

                renderRoster();

            }
        );

    }


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
                        )
                        .toLowerCase();


                    renderRoster();

                }
            );

        }
    );


    if (clearTeamButton) {

        clearTeamButton.addEventListener(
            "click",
            function () {

                selectedTeam = [
                    null,
                    null,
                    null,
                    null
                ];


                activeTeamSlot = 0;


                renderTeam();

                renderAnalysis();

                updateDiagnostics();

            }
        );

    }


    /*
       Team slots.
    */

    document.addEventListener(
        "click",
        function (event) {

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
            ).forEach(
                function (other) {

                    other.classList.remove(
                        "selected-slot"
                    );

                }
            );


            slot.classList.add(
                "selected-slot"
            );

        }
    );


    /*
       Roster card click.

       One handler performs both:

       1. Open details
       2. Add to active team slot
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


            const id =
                Number(
                    card.dataset.id
                );


            const aniimo =
                ANIIMO.find(
                    function (item) {

                        return (
                            item.id === id
                        );

                    }
                );


            if (!aniimo) {

                return;

            }


            /*
               Always show details.
            */

            showAniimoDetails(
                aniimo
            );


            /*
               Add to team.
            */

            let slotIndex =
                activeTeamSlot;


            if (
                selectedTeam[
                    slotIndex
                ]
            ) {

                const emptySlot =
                    selectedTeam.findIndex(
                        function (item) {

                            return item === null;

                        }
                    );


                if (
                    emptySlot !== -1
                ) {

                    slotIndex =
                        emptySlot;

                }

            }


            selectedTeam[
                slotIndex
            ] =
                aniimo;


            activeTeamSlot =
                slotIndex;


            renderTeam();

            renderAnalysis();

            updateDiagnostics();


            document.querySelectorAll(
                ".team-slot"
            ).forEach(
                function (slot) {

                    slot.classList.remove(
                        "selected-slot"
                    );

                }
            );


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


    /*
       Details panel controls.

       Level input.
    */

    document.addEventListener(
        "input",
        function (event) {

            if (
                !event.target.matches(
                    "#aniimoLevelInput"
                )
            ) {

                return;

            }


            const number =
                event.target.dataset.number;


            const aniimo =
                ANIIMO.find(
                    function (item) {
                        return (
                            item.number ===
                            number
                        );
                    }
                );


            if (!aniimo) {

                return;

            }


            saveAniimoLevel(
                aniimo,
                event.target.value
            );


            renderTeam();

            renderAnalysis();

            updateDiagnostics();

        }
    );


    /*
       Form selector.
    */

    document.addEventListener(
        "change",
        function (event) {

            if (
                !event.target.matches(
                    "#aniimoFormSelect"
                )
            ) {

                return;

            }


            const number =
                event.target.dataset.number;


            const aniimo =
                ANIIMO.find(
                    function (item) {

                        return (
                            item.number ===
                            number
                        );

                    }
                );


            if (!aniimo) {

                return;

            }


            saveAniimoForm(
                aniimo,
                event.target.value
            );


            showAniimoDetails(
                aniimo
            );


            renderRoster();

            renderTeam();

            renderAnalysis();

            updateDiagnostics();

        }
    );

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
                )
                .toLowerCase();


            const number =
                String(
                    aniimo.number || ""
                )
                .toLowerCase();


            const searchMatch =
                !searchText ||
                name.includes(
                    searchText
                ) ||
                number.includes(
                    searchText
                );


            const activeData =
                getActiveData(
                    aniimo
                );


            const roleMatch =
                selectedRole === "all" ||
                (
                    Array.isArray(
                        activeData.roles
                    ) &&
                    activeData.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                selectedRole
                            );

                        }
                    )
                );


            const elementMatch =
                selectedElement === "all" ||
                (
                    Array.isArray(
                        activeData.elements
                    ) &&
                    activeData.elements.some(
                        function (element) {

                            return (
                                normalizeElement(
                                    element
                                ) ===
                                selectedElement
                            );

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


            const activeData =
                getActiveData(
                    aniimo
                );


            let imageHTML = `

                <div
                    class="portrait-fallback"
                >
                    🐾
                </div>

            `;


            if (
                activeData.imageUrl
            ) {

                imageHTML = `

                    <img
                        src="${escapeHtml(
                            activeData.imageUrl
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
                Array.isArray(
                    activeData.elements
                )
                    ?
                    activeData.elements
                        .map(
                            function (element) {

                                return `

                                    <span class="badge">

                                        ${escapeHtml(
                                            capitalize(
                                                element
                                            )
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
                    activeData.roles
                )
                    ?
                    activeData.roles
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


                <div
                    class="aniimo-level-badge"
                    style="
                        margin-top:6px;
                        font-size:0.85rem;
                        opacity:0.85;
                    "
                >

                    LVL ${escapeHtml(
                        String(
                            aniimo.level || 1
                        )
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
   TEAM
   ===================================================== */

function renderTeam() {

    const slots =
        document.querySelectorAll(
            ".team-slot"
        );


    slots.forEach(
        function (slot, index) {

            const aniimo =
                selectedTeam[index];


            slot.innerHTML =
                "";


            if (!aniimo) {

                slot.classList.add(
                    "empty"
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


            const form =
                getActiveForm(
                    aniimo
                );


            slot.innerHTML = `

                <span class="slot-number">

                    ${index + 1}

                </span>


                <span class="slot-text">

                    ${escapeHtml(
                        aniimo.name
                    )}

                    <small
                        style="
                            display:block;
                            opacity:.7;
                            margin-top:3px;
                        "
                    >

                        LVL ${escapeHtml(
                            String(
                                aniimo.level || 1
                            )
                        )}

                        ${
                            form
                                ?
                                " • " +
                                escapeHtml(
                                    form.name
                                )
                                :
                                ""
                        }

                    </small>

                </span>

            `;

        }
    );

}


/* =====================================================
   TEAM ANALYSIS
   ===================================================== */

function renderAnalysis() {

    if (!analysis) {

        return;

    }


    const team =
        selectedTeam.filter(
            function (item) {

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


    team.forEach(
        function (aniimo) {

            const activeData =
                getActiveData(
                    aniimo
                );


            if (
                !Array.isArray(
                    activeData.roles
                )
            ) {

                return;

            }


            activeData.roles.forEach(
                function (role) {

                    const key =
                        String(role);


                    roles[key] =
                        (
                            roles[key] ||
                            0
                        ) + 1;

                }
            );

        }
    );


    const elements = {};


    team.forEach(
        function (aniimo) {

            const activeData =
                getActiveData(
                    aniimo
                );


            if (
                !Array.isArray(
                    activeData.elements
                )
            ) {

                return;

            }


            activeData.elements.forEach(
                function (element) {

                    const key =
                        capitalize(
                            normalizeElement(
                                element
                            )
                        );


                    elements[key] =
                        (
                            elements[key] ||
                            0
                        ) + 1;

                }
            );

        }
    );


    let roleHTML = "";


    Object.entries(
        roles
    ).forEach(
        function ([role, count]) {

            roleHTML += `

                <span class="badge">

                    ${escapeHtml(
                        role
                    )}

                    ×${count}

                </span>

            `;

        }
    );


    let elementHTML = "";


    Object.entries(
        elements
    ).forEach(
        function ([element, count]) {

            elementHTML += `

                <span class="badge">

                    ${escapeHtml(
                        element
                    )}

                    ×${count}

                </span>

            `;

        }
    );


    let synergyPoints = 0;


    team.forEach(
        function (aniimo) {

            const activeData =
                getActiveData(
                    aniimo
                );


            const tags =
                activeData.analysis &&
                Array.isArray(
                    activeData.analysis.tags
                )
                    ?
                    activeData.analysis.tags
                    :
                    [];


            synergyPoints +=
                tags.length;

        }
    );


    const dps =
        team.filter(
            function (aniimo) {

                const data =
                    getActiveData(
                        aniimo
                    );


                return (
                    Array.isArray(
                        data.roles
                    ) &&
                    data.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                "dps"
                            );

                        }
                    )
                );

            }
        );


    const support =
        team.filter(
            function (aniimo) {

                const data =
                    getActiveData(
                        aniimo
                    );


                return (
                    Array.isArray(
                        data.roles
                    ) &&
                    data.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                "support"
                            );

                        }
                    )
                );

            }
        );


    const regen =
        team.filter(
            function (aniimo) {

                const data =
                    getActiveData(
                        aniimo
                    );


                return (
                    Array.isArray(
                        data.roles
                    ) &&
                    data.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                "regen"
                            );

                        }
                    )
                );

            }
        );


    const breakUnits =
        team.filter(
            function (aniimo) {

                const data =
                    getActiveData(
                        aniimo
                    );


                return (
                    Array.isArray(
                        data.roles
                    ) &&
                    data.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                "break"
                            );

                        }
                    )
                );

            }
        );


    const heal =
        team.filter(
            function (aniimo) {

                const data =
                    getActiveData(
                        aniimo
                    );


                return (
                    Array.isArray(
                        data.roles
                    ) &&
                    data.roles.some(
                        function (role) {

                            return (
                                String(role)
                                    .toLowerCase() ===
                                "heal"
                            );

                        }
                    )
                );

            }
        );


    let plan = "";


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

        </div>


        <div class="detail-section">

            <h3>
                Suggested Game Plan
            </h3>

            <p>

                ${escapeHtml(
                    plan
                )}

            </p>

        </div>

    `;

}


/* =====================================================
   ANIIMO DETAILS
   ===================================================== */

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


    const activeData =
        getActiveData(
            aniimo
        );


    const activeForm =
        getActiveForm(
            aniimo
        );


    /*
       FORM SELECTOR
    */

    let formHTML = "";


    if (
        Array.isArray(
            aniimo.forms
        ) &&
        aniimo.forms.length
    ) {

        formHTML = `

            <div class="detail-section">

                <h3>
                    Form / Variant
                </h3>


                <select
                    id="aniimoFormSelect"
                    data-number="${escapeHtml(
                        aniimo.number
                    )}"
                    style="
                        width:100%;
                        padding:12px;
                        border-radius:10px;
                        margin-top:8px;
                    "
                >

                    ${
                        aniimo.forms
                            .map(
                                function (form, index) {

                                    return `

                                        <option
                                            value="${index}"
                                            ${
                                                index ===
                                                aniimo.selectedFormIndex
                                                    ?
                                                    "selected"
                                                    :
                                                    ""
                                            }
                                        >

                                            ${escapeHtml(
                                                form.name ||
                                                "Form " +
                                                (
                                                    index + 1
                                                )
                                            )}

                                        </option>

                                    `;

                                }
                            )
                            .join("")
                    }

                </select>

            </div>

        `;

    }


    /*
       LEVEL INPUT
    */

    const levelHTML = `

        <div class="detail-section">

            <h3>
                Your Aniimo Level
            </h3>

            <p
                style="
                    opacity:.75;
                    margin-bottom:8px;
                "
            >
                Enter the exact level of this Aniimo.
                It is saved automatically on this device.
            </p>


            <input
                id="aniimoLevelInput"
                data-number="${escapeHtml(
                    aniimo.number
                )}"
                type="number"
                min="1"
                max="999"
                step="1"
                value="${escapeHtml(
                    String(
                        aniimo.level || 1
                    )
                )}"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:12px;
                    border-radius:10px;
                    font-size:1rem;
                "
            />

        </div>

    `;


    let statsHTML = "";


    if (
        activeData.stats &&
        Object.keys(
            activeData.stats
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
                            activeData.stats
                        )
                        .map(
                            function ([key, value]) {

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
        activeData.traits &&
        activeData.traits.length
            ?
            activeData.traits
            :
            (
                activeData.trait
                    ?
                    [activeData.trait]
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
                        function (trait) {

                            if (
                                typeof trait ===
                                "string"
                            ) {

                                return `

                                    <div class="skill">

                                        ${escapeHtml(
                                            trait
                                        )}

                                    </div>

                                `;

                            }


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
        Array.isArray(
            activeData.skills
        ) &&
        activeData.skills.length
    ) {

        skillsHTML = `

            <div class="detail-section">

                <h3>
                    Skills & Abilities
                </h3>

                ${
                    activeData.skills.map(
                        function (skill) {

                            if (
                                typeof skill ===
                                "string"
                            ) {

                                return `

                                    <div class="skill">

                                        <div class="skill-name">

                                            ${escapeHtml(
                                                skill
                                            )}

                                        </div>

                                    </div>

                                `;

                            }


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
                                            skill.cost !==
                                            undefined
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
                                            skill.power !==
                                                undefined &&
                                            skill.power !==
                                                ""
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
        activeData.analysis &&
        Array.isArray(
            activeData.analysis.tags
        )
            ?
            activeData.analysis.tags
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
                                function (tag) {

                                    return `

                                        <span class="badge">

                                            ${escapeHtml(
                                                String(
                                                    tag
                                                )
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

                •

                LVL ${escapeHtml(
                    String(
                        aniimo.level || 1
                    )
                )}

            </p>


            ${
                activeForm
                    ?
                    `
                        <p
                            style="
                                opacity:.8;
                            "
                        >
                            ${escapeHtml(
                                activeForm.name ||
                                "Selected Form"
                            )}
                        </p>
                    `
                    :
                    ""
            }


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


        ${levelHTML}

        ${formHTML}

        ${statsHTML}

        ${traitsHTML}

        ${skillsHTML}

        ${tagsHTML}

    `;


    /*
       IMPORTANT:

       Automatically move the user to the details
       section after tapping a roster portrait/card.
    */

    setTimeout(
        function () {

            try {

                detailsPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            } catch (error) {

                detailsPanel.scrollIntoView();

            }

        },
        50
    );

}


/* =====================================================
   SQUAD DIAGNOSTICS PANEL
   ===================================================== */

function ensureDiagnosticsPanel() {

    /*
       Don't create duplicates.
    */

    let panel =
        document.getElementById(
            "squadDiagnostics"
        );


    if (panel) {

        updateDiagnostics();

        return;

    }


    panel =
        document.createElement(
            "section"
        );


    panel.id =
        "squadDiagnostics";


    panel.style.cssText = `

        margin:32px 0;
        padding:20px;
        border-radius:18px;
        background:#111827;
        border:1px solid rgba(255,255,255,.10);
        color:#fff;

    `;


    panel.innerHTML = `

        <div
            style="
                margin-bottom:18px;
            "
        >

            <h2
                style="
                    margin:0 0 6px 0;
                "
            >
                Squad Diagnostics
            </h2>

            <p
                style="
                    margin:0;
                    opacity:.7;
                "
            >
                Live analysis of your four active Aniimo.
            </p>

        </div>


        <div
            id="diagnosticsContent"
        ></div>

    `;


    /*
       Put it at the bottom of the main page.
    */

    document.body.appendChild(
        panel
    );


    updateDiagnostics();

}


/* =====================================================
   DIAGNOSTICS DATA
   ===================================================== */

function getTeamDiagnostics() {

    const team =
        selectedTeam.filter(
            function (item) {

                return item !== null;

            }
        );


    const offensiveCoverage = {};

    const defensiveWeaknesses = {};

    const defensiveResistances = {};

    const memberWeaknesses = {};

    const memberCounters = {};


    /*
       Count offensive elements represented
       by the team.
    */

    const offensiveElements = [];


    team.forEach(
        function (aniimo) {

            const data =
                getActiveData(
                    aniimo
                );


            const elements =
                safeArray(
                    data.elements
                )
                .map(
                    function (element) {

                        return normalizeElement(
                            element
                        );

                    }
                )
                .filter(
                    function (element) {

                        return ELEMENTS.includes(
                            element
                        );

                    }
                );


            elements.forEach(
                function (element) {

                    if (
                        !offensiveElements.includes(
                            element
                        )
                    ) {

                        offensiveElements.push(
                            element
                        );

                    }

                }
            );


            /*
               Each team member's defensive weaknesses.
            */

            const weaknesses = [];

            const resistances = [];


            elements.forEach(
                function (defenderElement) {

                    ELEMENTS.forEach(
                        function (attackerElement) {

                            const multiplier =
                                ELEMENT_MATRIX[
                                    attackerElement
                                ][
                                    defenderElement
                                ];


                            if (
                                multiplier >
                                1
                            ) {

                                if (
                                    !weaknesses.includes(
                                        attackerElement
                                    )
                                ) {

                                    weaknesses.push(
                                        attackerElement
                                    );

                                }


                                defensiveWeaknesses[
                                    attackerElement
                                ] =
                                    (
                                        defensiveWeaknesses[
                                            attackerElement
                                        ] ||
                                        0
                                    ) + 1;

                            }


                            if (
                                multiplier <
                                1
                            ) {

                                if (
                                    !resistances.includes(
                                        attackerElement
                                    )
                                ) {

                                    resistances.push(
                                        attackerElement
                                    );

                                }


                                defensiveResistances[
                                    attackerElement
                                ] =
                                    (
                                        defensiveResistances[
                                            attackerElement
                                        ] ||
                                        0
                                    ) + 1;

                            }

                        }
                    );

                }
            );


            memberWeaknesses[
                aniimo.number
            ] =
                weaknesses;


            /*
               Counter-capable elements for this member.
            */

            const counters = [];


            elements.forEach(
                function (attackerElement) {

                    const targets =
                        ELEMENTS.filter(
                            function (defenderElement) {

                                return (
                                    ELEMENT_MATRIX[
                                        attackerElement
                                    ][
                                        defenderElement
                                    ] > 1
                                );

                            }
                        );


                    targets.forEach(
                        function (target) {

                            if (
                                !counters.includes(
                                    target
                                )
                            ) {

                                counters.push(
                                    target
                                );

                            }

                        }
                    );

                }
            );


            memberCounters[
                aniimo.number
            ] =
                counters;

        }
    );


    /*
       Offensive coverage.

       For each enemy element, find the strongest
       attack available from the squad.
    */

    ELEMENTS.forEach(
        function (defenderElement) {

            let best =
                0;


            let bestAttackers = [];


            offensiveElements.forEach(
                function (attackerElement) {

                    const multiplier =
                        ELEMENT_MATRIX[
                            attackerElement
                        ][
                            defenderElement
                        ];


                    if (
                        multiplier >
                        best
                    ) {

                        best =
                            multiplier;

                        bestAttackers = [
                            attackerElement
                        ];

                    } else if (
                        multiplier ===
                        best
                    ) {

                        bestAttackers.push(
                            attackerElement
                        );

                    }

                }
            );


            offensiveCoverage[
                defenderElement
            ] = {

                multiplier: best,

                attackers:
                    bestAttackers

            };

        }
    );


    /*
       Number of elements the team can hit
       super-effectively.
    */

    const superEffectiveCoverage =
        ELEMENTS.filter(
            function (element) {

                return (
                    offensiveCoverage[
                        element
                    ].multiplier > 1
                );

            }
        );


    /*
       Overlapping weaknesses.

       This is exactly what the user asked for:

       if 3/4 share the same vulnerability,
       flag it.
    */

    const highVulnerabilities =
        Object.entries(
            defensiveWeaknesses
        )
        .filter(
            function ([element, count]) {

                return count >= 3;

            }
        )
        .sort(
            function (a, b) {

                return b[1] - a[1];

            }
        );


    /*
       Counter-capable members.

       A member counts as counter-capable if its
       element(s) can hit at least one element
       super-effectively.
    */

    let counterCapableMembers = 0;


    team.forEach(
        function (aniimo) {

            if (
                memberCounters[
                    aniimo.number
                ] &&
                memberCounters[
                    aniimo.number
                ].length
            ) {

                counterCapableMembers++;

            }

        }
    );


    /*
       Overall counter targets.
    */

    const counterTargets =
        ELEMENTS.filter(
            function (element) {

                return (
                    offensiveCoverage[
                        element
                    ].multiplier > 1
                );

            }
        );


    /*
       Coverage gaps.
    */

    const coverageGaps =
        ELEMENTS.filter(
            function (element) {

                return (
                    offensiveCoverage[
                        element
                    ].multiplier <= 1
                );

            }
        );


    return {

        team,

        offensiveCoverage,

        defensiveWeaknesses,

        defensiveResistances,

        memberWeaknesses,

        memberCounters,

        highVulnerabilities,

        counterCapableMembers,

        counterTargets,

        superEffectiveCoverage,

        coverageGaps

    };

}


/* =====================================================
   UPDATE DIAGNOSTICS
   ===================================================== */

function updateDiagnostics() {

    const container =
        document.getElementById(
            "diagnosticsContent"
        );


    if (!container) {

        return;

    }


    const diagnostics =
        getTeamDiagnostics();


    const team =
        diagnostics.team;


    if (!team.length) {

        container.innerHTML = `

            <div
                style="
                    padding:18px;
                    border-radius:12px;
                    background:rgba(255,255,255,.04);
                "
            >

                <strong>
                    No active squad yet.
                </strong>

                <p
                    style="
                        margin:6px 0 0;
                        opacity:.7;
                    "
                >
                    Select Aniimo above to activate
                    Squad Diagnostics.

                </p>

            </div>

        `;

        return;

    }


    /*
       HIGH VULNERABILITY WARNING
    */

    let warningHTML = "";


    if (
        diagnostics.highVulnerabilities.length
    ) {

        const warnings =
            diagnostics.highVulnerabilities
                .map(
                    function ([element, count]) {

                        return `

                            <li>

                                ${escapeHtml(
                                    ELEMENT_LABELS[
                                        element
                                    ]
                                )}

                                —

                                ${count}/${team.length}
                                members vulnerable

                            </li>

                        `;

                    }
                )
                .join("");


        warningHTML = `

            <div
                style="
                    margin-bottom:18px;
                    padding:16px;
                    border-radius:12px;
                    background:rgba(220,38,38,.16);
                    border:1px solid rgba(248,113,113,.55);
                "
            >

                <div
                    style="
                        font-size:1.1rem;
                        font-weight:800;
                        margin-bottom:6px;
                    "
                >

                    ⚠️ High Vulnerability Detected!

                </div>


                <div
                    style="
                        opacity:.85;
                        margin-bottom:8px;
                    "
                >

                    Multiple squad members share
                    the same elemental weakness.

                </div>


                <ul
                    style="
                        margin:0;
                        padding-left:20px;
                    "
                >

                    ${warnings}

                </ul>

            </div>

        `;

    } else {

        warningHTML = `

            <div
                style="
                    margin-bottom:18px;
                    padding:16px;
                    border-radius:12px;
                    background:rgba(34,197,94,.10);
                    border:1px solid rgba(74,222,128,.35);
                "
            >

                <strong>
                    ✓ No major 3+ member weakness detected
                </strong>

                <div
                    style="
                        margin-top:5px;
                        opacity:.75;
                    "
                >

                    Your squad does not currently have
                    a major overlapping elemental vulnerability.

                </div>

            </div>

        `;

    }


    /*
       TOP SUMMARY CARDS
    */

    const summaryHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(140px,1fr));
                gap:10px;
                margin-bottom:20px;
            "
        >

            ${diagnosticStat(
                "Squad Size",
                team.length + "/4"
            )}


            ${diagnosticStat(
                "SE Coverage",
                diagnostics.superEffectiveCoverage.length +
                "/" +
                ELEMENTS.length
            )}


            ${diagnosticStat(
                "Counter Units",
                diagnostics.counterCapableMembers +
                "/" +
                team.length
            )}


            ${diagnosticStat(
                "Coverage Gaps",
                diagnostics.coverageGaps.length
            )}

        </div>

    `;


    /*
       OFFENSIVE COVERAGE
    */

    const coverageHTML =
        ELEMENTS.map(
            function (element) {

                const result =
                    diagnostics.offensiveCoverage[
                        element
                    ];


                let state =
                    "Neutral";


                if (
                    result.multiplier >
                    1
                ) {

                    state =
                        "SUPER EFFECTIVE";

                } else if (
                    result.multiplier <
                    1
                ) {

                    state =
                        "RESISTED";

                }


                const attackers =
                    result.attackers
                        .map(
                            function (attacker) {

                                return ELEMENT_LABELS[
                                    attacker
                                ];

                            }
                        )
                        .join(
                            ", "
                        );


                return `

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:10px;
                            align-items:center;
                            padding:10px 0;
                            border-bottom:
                                1px solid
                                rgba(255,255,255,.06);
                        "
                    >

                        <div>

                            <strong>
                                ${escapeHtml(
                                    ELEMENT_LABELS[
                                        element
                                    ]
                                )}
                            </strong>

                            <div
                                style="
                                    font-size:.8rem;
                                    opacity:.6;
                                    margin-top:2px;
                                "
                            >

                                Best:
                                ${escapeHtml(
                                    attackers ||
                                    "None"
                                )}

                            </div>

                        </div>


                        <div
                            style="
                                text-align:right;
                                font-weight:800;
                            "
                        >

                            ${result.multiplier
                                ?
                                result.multiplier +
                                "×"
                                :
                                "—"
                            }

                            <div
                                style="
                                    font-size:.72rem;
                                    opacity:.65;
                                "
                            >

                                ${state}

                            </div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");


    /*
       DEFENSIVE WEAKNESS TABLE
    */

    const weaknessHTML =
        ELEMENTS.map(
            function (element) {

                const count =
                    diagnostics
                        .defensiveWeaknesses[
                            element
                        ] ||
                    0;


                if (!count) {

                    return "";

                }


                const isHigh =
                    count >= 3;


                return `

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:9px 0;
                            border-bottom:
                                1px solid
                                rgba(255,255,255,.06);
                        "
                    >

                        <span>

                            ${escapeHtml(
                                ELEMENT_LABELS[
                                    element
                                ]
                            )}

                        </span>


                        <strong
                            style="
                                ${
                                    isHigh
                                        ?
                                        "color:#f87171;"
                                        :
                                        ""
                                }
                            "
                        >

                            ${count}/${team.length}
                            vulnerable

                        </strong>

                    </div>

                `;

            }
        )
        .join("");


    /*
       MEMBER COUNTERS
    */

    const counterHTML =
        team.map(
            function (aniimo) {

                const counters =
                    diagnostics
                        .memberCounters[
                            aniimo.number
                        ] ||
                    [];


                return `

                    <div
                        style="
                            padding:10px 0;
                            border-bottom:
                                1px solid
                                rgba(255,255,255,.06);
                        "
                    >

                        <div
                            style="
                                font-weight:700;
                            "
                        >

                            ${escapeHtml(
                                aniimo.name
                            )}

                            <span
                                style="
                                    opacity:.6;
                                    font-size:.8rem;
                                "
                            >

                                LVL ${escapeHtml(
                                    String(
                                        aniimo.level || 1
                                    )
                                )}

                            </span>

                        </div>


                        <div
                            style="
                                margin-top:4px;
                                font-size:.85rem;
                                opacity:.75;
                            "
                        >

                            ${
                                counters.length
                                    ?
                                    "Counters: " +
                                    counters
                                        .map(
                                            function (target) {

                                                return ELEMENT_LABELS[
                                                    target
                                                ];

                                            }
                                        )
                                        .join(
                                            ", "
                                        )
                                    :
                                    "No elemental counter coverage"
                            }

                        </div>

                    </div>

                `;

            }
        )
        .join("");


    /*
       MATRIX
    */

    const matrixHTML = `

        <div
            style="
                overflow-x:auto;
                margin-top:12px;
            "
        >

            <table
                style="
                    width:100%;
                    min-width:700px;
                    border-collapse:collapse;
                    font-size:.78rem;
                "
            >

                <thead>

                    <tr>

                        <th
                            style="
                                padding:7px;
                                text-align:left;
                            "
                        >
                            ATK ↓ / DEF →
                        </th>

                        ${
                            ELEMENTS.map(
                                function (element) {

                                    return `

                                        <th
                                            style="
                                                padding:7px;
                                                text-align:center;
                                            "
                                        >

                                            ${escapeHtml(
                                                ELEMENT_LABELS[
                                                    element
                                                ]
                                            )}

                                        </th>

                                    `;

                                }
                            ).join("")
                        }

                    </tr>

                </thead>


                <tbody>

                    ${
                        ELEMENTS.map(
                            function (attacker) {

                                return `

                                    <tr>

                                        <th
                                            style="
                                                padding:7px;
                                                text-align:left;
                                                white-space:nowrap;
                                            "
                                        >

                                            ${escapeHtml(
                                                ELEMENT_LABELS[
                                                    attacker
                                                ]
                                            )}

                                        </th>


                                        ${
                                            ELEMENTS.map(
                                                function (defender) {

                                                    const value =
                                                        ELEMENT_MATRIX[
                                                            attacker
                                                        ][
                                                            defender
                                                        ];


                                                    let symbol =
                                                        "•";


                                                    if (
                                                        value >
                                                        1
                                                    ) {

                                                        symbol =
                                                            "1.6×";

                                                    } else if (
                                                        value <
                                                        1
                                                    ) {

                                                        symbol =
                                                            "0.625×";

                                                    } else {

                                                        symbol =
                                                            "1×";

                                                    }


                                                    return `

                                                        <td
                                                            style="
                                                                padding:7px;
                                                                text-align:center;
                                                                border-top:
                                                                    1px solid
                                                                    rgba(255,255,255,.05);
                                                            "
                                                        >

                                                            ${symbol}

                                                        </td>

                                                    `;

                                                }
                                            ).join("")
                                        }

                                    </tr>

                                `;

                            }
                        ).join("")
                    }

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML = `

        ${warningHTML}


        ${summaryHTML}


        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(280px,1fr));
                gap:18px;
            "
        >

            <div>

                <h3>
                    ⚔️ Offensive Coverage
                </h3>

                <p
                    style="
                        opacity:.65;
                        font-size:.85rem;
                    "
                >

                    Strongest available elemental attack
                    against each defending element.

                </p>

                ${coverageHTML}

            </div>


            <div>

                <h3>
                    🛡️ Defensive Vulnerabilities
                </h3>

                <p
                    style="
                        opacity:.65;
                        font-size:.85rem;
                    "
                >

                    How many active Aniimo are vulnerable
                    to each incoming element.

                </p>

                ${
                    weaknessHTML ||
                    `
                        <p
                            style="
                                opacity:.65;
                            "
                        >
                            No vulnerability data yet.
                        </p>
                    `
                }

            </div>

        </div>


        <div
            style="
                margin-top:24px;
            "
        >

            <h3>
                🎯 Counter Counters
            </h3>

            <p
                style="
                    opacity:.65;
                    font-size:.85rem;
                "
            >

                Shows which active Aniimo can provide
                super-effective elemental counter coverage.

            </p>

            ${counterHTML}

        </div>


        <div
            style="
                margin-top:24px;
            "
        >

            <h3>
                🧮 Elemental & Counter Matrix
            </h3>

            <p
                style="
                    opacity:.65;
                    font-size:.85rem;
                "
            >

                1.6× = Super Effective &nbsp;•
                1× = Neutral &nbsp;•
                0.625× = Resisted

            </p>

            ${matrixHTML}

        </div>


        <div
            style="
                margin-top:20px;
                padding:12px;
                border-radius:10px;
                background:rgba(255,255,255,.04);
                font-size:.8rem;
                opacity:.65;
            "
        >

            Coverage is calculated from the current
            elemental data assigned to your active
            Aniimo. Dual-element Aniimo are evaluated
            per element rather than assuming a stacking
            formula.

        </div>

    `;

}


/* =====================================================
   DIAGNOSTIC STAT CARD
   ===================================================== */

function diagnosticStat(
    label,
    value
) {

    return `

        <div
            style="
                padding:14px;
                border-radius:12px;
                background:rgba(255,255,255,.045);
                border:1px solid rgba(255,255,255,.07);
            "
        >

            <div
                style="
                    font-size:.78rem;
                    opacity:.6;
                    margin-bottom:5px;
                "
            >

                ${escapeHtml(
                    label
                )}

            </div>


            <div
                style="
                    font-size:1.35rem;
                    font-weight:800;
                "
            >

                ${escapeHtml(
                    value
                )}

            </div>

        </div>

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
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}
