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

const BUILD_STORAGE_KEY =
    "aniimo_team_builder_builds_v1";


let savedLevels = {};
let savedForms = {};
let savedBuilds = {};


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


try {

    savedBuilds =
        JSON.parse(
            localStorage.getItem(
                BUILD_STORAGE_KEY
            ) || "{}"
        );

} catch (error) {

    savedBuilds = {};

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

function isUsefulObject(value) {

    return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length > 0
    );

}


function isUsefulArray(value) {

    return Array.isArray(value) && value.length > 0;

}


function normalizeRole(value) {

    if (!value) {
        return "";
    }

    const text =
        String(value)
            .trim()
            .toLowerCase();

    const map = {
        dps: "DPS",
        heal: "Heal",
        support: "Support",
        break: "Break",
        regen: "Regen",
        "regeneration": "Regen"
    };

    return map[text] || String(value).trim();

}


/*
   Estimated in-game stat growth.

   Official per-level curves are not fully published.
   Attribute Score on the wiki equals the sum of the
   six base stats (HP + BREAK + ATK + M.DEF + P.DEF + REGEN).

   We use a mild linear growth so higher levels matter
   in team comparison without inventing a fake formula:

       scaled = base * (1 + (level - 1) * 0.02)

   At level 50 that is about +98% over base.
   This is an estimate for planning only.
*/
function scaleStat(baseValue, level) {

    const base =
        Number(baseValue);

    if (!Number.isFinite(base)) {
        return baseValue;
    }

    const lvl =
        Math.max(
            1,
            Number(level) || 1
        );

    return Math.round(
        base * (1 + (lvl - 1) * 0.02)
    );

}


function scaleStats(stats, level) {

    if (!isUsefulObject(stats)) {
        return {};
    }

    const out = {};

    Object.entries(stats).forEach(
        function ([key, value]) {

            out[key] =
                scaleStat(
                    value,
                    level
                );

        }
    );

    return out;

}


function getAttributeScore(stats) {

    if (!isUsefulObject(stats)) {
        return null;
    }

    let total = 0;
    let count = 0;

    [
        "HP",
        "BREAK",
        "ATK",
        "M.DEF",
        "P.DEF",
        "REGEN"
    ].forEach(
        function (key) {

            const value =
                Number(
                    stats[key]
                );

            if (Number.isFinite(value)) {

                total += value;
                count += 1;

            }

        }
    );

    return count ? total : null;

}



/* =====================================================
   BUILD SYSTEM — IP / AP / Personality / Capability / Resonance
   Sources:
   - https://aniimotools.dev/systems/potential/
   - https://aniimotools.dev/guides/perfect-your-aniimo/
   - https://fextralife.com/wiki/aniimo/Aniimo_Stats
   - AniDex radar UI: https://aniidex.com/aniimo

   IP + AP per stat cannot exceed 20.
   Personality: one letter per MBTI axis, strength 3/6/10%.
   Capability points: flat + milestone % bonuses.
   Resonance: star rank 0–6 (unlock tiers Lv 20–60).
   ===================================================== */

const STAT_ORDER = [
    "HP",
    "BREAK",
    "ATK",
    "M.DEF",
    "P.DEF",
    "REGEN"
];


const PERSONALITY_AXES = [
    {
        id: "ei",
        label: "E / I — Energy",
        options: [
            {
                letter: "E",
                name: "Outgoing",
                effect: "P.ATK / ATK",
                stat: "ATK"
            },
            {
                letter: "I",
                name: "Introverted",
                effect: "M.ATK / magic side",
                stat: "ATK"
            }
        ]
    },
    {
        id: "sn",
        label: "S / N — Information",
        options: [
            {
                letter: "S",
                name: "Practical",
                effect: "Damage",
                stat: "ATK"
            },
            {
                letter: "N",
                name: "Intuitive",
                effect: "Critical Rate",
                stat: null
            }
        ]
    },
    {
        id: "tf",
        label: "T / F — Decisions",
        options: [
            {
                letter: "T",
                name: "Rational",
                effect: "P.DEF",
                stat: "P.DEF"
            },
            {
                letter: "F",
                name: "Emotional",
                effect: "M.DEF",
                stat: "M.DEF"
            }
        ]
    },
    {
        id: "jp",
        label: "J / P — Structure",
        options: [
            {
                letter: "J",
                name: "Methodical",
                effect: "HP",
                stat: "HP"
            },
            {
                letter: "P",
                name: "Spontaneous",
                effect: "Gusto / REGEN",
                stat: "REGEN"
            }
        ]
    }
];


const PERSONALITY_STRENGTHS = [
    { value: 0, label: "None", pct: 0 },
    { value: 3, label: "Somewhat (+3%)", pct: 0.03 },
    { value: 6, label: "Relatively (+6%)", pct: 0.06 },
    { value: 10, label: "Very (+10%)", pct: 0.10 }
];


const CAPABILITY_DEFS = {
    constitution: {
        label: "Constitution",
        perPoint: { HP: 40 },
        milestoneEvery: 5,
        milestonePct: { HP: 0.08 }
    },
    might: {
        label: "Might",
        perPoint: { ATK: 2 },
        milestoneEvery: 5,
        milestonePct: { ATK: 0.08 }
    },
    endurance: {
        label: "Endurance",
        perPoint: { "P.DEF": 3 },
        milestoneEvery: 5,
        milestonePct: { "P.DEF": 0.08 }
    },
    spirit: {
        label: "Spirit",
        perPoint: { "M.DEF": 3 },
        milestoneEvery: 5,
        milestonePct: { "M.DEF": 0.08 }
    },
    gusto: {
        label: "Gusto",
        perPoint: { REGEN: 3 },
        milestoneEvery: 5,
        milestonePct: {}
    },
    penetration: {
        label: "Penetration",
        perPoint: { BREAK: 4 },
        milestoneEvery: 5,
        milestonePct: {}
    }
};


const RESONANCE_TIERS = [
    { star: 0, label: "None", levelGate: 1 },
    { star: 1, label: "★1 (Lv 20)", levelGate: 20 },
    { star: 2, label: "★★2 (Lv 30)", levelGate: 30 },
    { star: 3, label: "★★★3 (Lv 40)", levelGate: 40 },
    { star: 4, label: "★★★★4 (Lv 50)", levelGate: 50 },
    { star: 5, label: "★★★★★5 (Lv 54)", levelGate: 54 },
    { star: 6, label: "★★★★★★6 (Lv 60)", levelGate: 60 }
];


function emptyPotentialMap() {

    const map = {};

    STAT_ORDER.forEach(
        function (stat) {
            map[stat] = 0;
        }
    );

    return map;

}


function emptyCapabilityMap() {

    return {
        constitution: 0,
        might: 0,
        endurance: 0,
        spirit: 0,
        gusto: 0,
        penetration: 0
    };

}


function defaultBuild() {

    return {
        ip: emptyPotentialMap(),
        ap: emptyPotentialMap(),
        personality: {
            ei: "",
            sn: "",
            tf: "",
            jp: "",
            strength: 0
        },
        capability: emptyCapabilityMap(),
        resonance: 0,
        elementAffinity: {
            enabled: false,
            tier: 0
        }
    };

}


function getBuild(number) {

    const key =
        String(number);

    const raw =
        savedBuilds[key];

    const base =
        defaultBuild();

    if (!raw || typeof raw !== "object") {
        return base;
    }

    const ip =
        Object.assign(
            emptyPotentialMap(),
            raw.ip || {}
        );

    const ap =
        Object.assign(
            emptyPotentialMap(),
            raw.ap || {}
        );

    STAT_ORDER.forEach(
        function (stat) {

            ip[stat] =
                clampPotential(
                    ip[stat]
                );

            ap[stat] =
                clampPotential(
                    ap[stat]
                );

            // Enforce IP + AP <= 20
            if (ip[stat] + ap[stat] > 20) {
                ap[stat] =
                    Math.max(
                        0,
                        20 - ip[stat]
                    );
            }

        }
    );

    const personality =
        Object.assign(
            {
                ei: "",
                sn: "",
                tf: "",
                jp: "",
                strength: 0
            },
            raw.personality || {}
        );

    const capability =
        Object.assign(
            emptyCapabilityMap(),
            raw.capability || {}
        );

    Object.keys(capability).forEach(
        function (key) {
            capability[key] =
                Math.max(
                    0,
                    Math.min(
                        99,
                        Number(capability[key]) || 0
                    )
                );
        }
    );

    return {
        ip: ip,
        ap: ap,
        personality: personality,
        capability: capability,
        resonance:
            Math.max(
                0,
                Math.min(
                    6,
                    Number(raw.resonance) || 0
                )
            ),
        elementAffinity:
            Object.assign(
                {
                    enabled: false,
                    tier: 0
                },
                raw.elementAffinity || {}
            )
    };

}


function saveBuild(number, build) {

    savedBuilds[
        String(number)
    ] = build;

    try {

        localStorage.setItem(
            BUILD_STORAGE_KEY,
            JSON.stringify(
                savedBuilds
            )
        );

    } catch (error) {

        console.warn(
            "Could not save Aniimo build.",
            error
        );

    }

}


function clampPotential(value) {

    const n =
        Number(value);

    if (!Number.isFinite(n)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            20,
            Math.round(n)
        )
    );

}


/*
   Potential multiplier (IP + AP).

   Guidelines:
   - Species baseline template (wiki base stats)
   - IP (hatch/catch) + AP (Omnosaurus upgrades), max 20 per stat
   - Combined potential is a direct multiplier on the baseline

   Missing IP/AP → treat as 0 potential points, multiplier floor 1
   so blank builds still show the species baseline (never ×0).

       mult = 1 + (IP + AP) / 20

   Perfect 20/20 ⇒ ×2.0 on that stat's baseline template.
*/
function potentialMultiplier(ip, ap) {

    const total =
        clampPotential(ip) +
        clampPotential(ap);

    const mult =
        1 + (total / 20);

    return mult > 0 ? mult : 1;

}


function resonanceFlatBonus(star) {

    /*
       Approximate flat resonance investment.
       Real values vary by star path; this keeps
       planning usable without inventing tables.
    */

    const s =
        Math.max(
            0,
            Math.min(
                6,
                Number(star) || 0
            )
        );

    return {
        HP: s * 12,
        BREAK: s * 3,
        ATK: s * 4,
        "M.DEF": s * 3,
        "P.DEF": s * 3,
        REGEN: s * 3
    };

}


function capabilityBonuses(capability) {

    const flat = emptyPotentialMap();
    const pct = emptyPotentialMap();

    Object.keys(CAPABILITY_DEFS).forEach(
        function (key) {

            const def =
                CAPABILITY_DEFS[key];

            const points =
                Math.max(
                    0,
                    Number(
                        capability[key]
                    ) || 0
                );

            Object.entries(
                def.perPoint
            ).forEach(
                function ([stat, amount]) {
                    flat[stat] =
                        (flat[stat] || 0) +
                        points * amount;
                }
            );

            const milestones =
                Math.floor(
                    points /
                    def.milestoneEvery
                );

            Object.entries(
                def.milestonePct
            ).forEach(
                function ([stat, amount]) {
                    pct[stat] =
                        (pct[stat] || 0) +
                        milestones * amount;
                }
            );

        }
    );

    return {
        flat: flat,
        pct: pct
    };

}


function personalityBonuses(personality) {

    const pct =
        emptyPotentialMap();

    const strength =
        PERSONALITY_STRENGTHS.find(
            function (item) {
                return (
                    item.value ===
                    Number(
                        personality.strength
                    )
                );
            }
        ) ||
        PERSONALITY_STRENGTHS[0];

    if (!strength.pct) {
        return pct;
    }

    PERSONALITY_AXES.forEach(
        function (axis) {

            const chosen =
                String(
                    personality[axis.id] ||
                    ""
                )
                .toUpperCase();

            const option =
                axis.options.find(
                    function (item) {
                        return (
                            item.letter ===
                            chosen
                        );
                    }
                );

            if (
                option &&
                option.stat
            ) {

                pct[option.stat] =
                    (pct[option.stat] || 0) +
                    strength.pct;

            }

        }
    );

    return pct;

}


function computeFinalStats(aniimo, activeData) {

    const build =
        getBuild(
            aniimo.number
        );

    const level =
        aniimo.level || 1;

    const base =
        isUsefulObject(
            activeData.baseStats
        )
            ?
            activeData.baseStats
            :
            (
                isUsefulObject(
                    activeData.stats
                )
                    ?
                    activeData.stats
                    :
                    {}
            );

    const cap =
        capabilityBonuses(
            build.capability
        );

    const personalityPct =
        personalityBonuses(
            build.personality
        );

    const resonance =
        resonanceFlatBonus(
            build.resonance
        );

    const out = {};

    STAT_ORDER.forEach(
        function (stat) {

            const baseVal =
                Number(
                    base[stat]
                ) || 0;

            // Undo prior crude level scale if present;
            // recompute from true base.
            const trueBase =
                Number(
                    (
                        activeData.baseStats &&
                        activeData.baseStats[stat]
                    ) ??
                    baseVal
                ) || 0;

            const potMult =
                potentialMultiplier(
                    build.ip[stat],
                    build.ap[stat]
                );

            /*
               Step 1: species baseline template (trueBase)
               Step 2: IP+AP direct multiplier on baseline
               Step 3: mild level growth on top (planning estimate)
                        — official level curves not fully public
            */
            let value =
                trueBase *
                potMult *
                (
                    1 +
                    (level - 1) * 0.02
                );

            value +=
                resonance[stat] || 0;

            value +=
                cap.flat[stat] || 0;

            const pctTotal =
                (cap.pct[stat] || 0) +
                (personalityPct[stat] || 0);

            value *=
                1 + pctTotal;

            out[stat] =
                Math.round(value);

        }
    );

    return {
        stats: out,
        build: build,
        total:
            STAT_ORDER.reduce(
                function (sum, stat) {
                    return sum + (out[stat] || 0);
                },
                0
            )
    };

}


function radarPolygonPoints(stats, size, maxByStat) {

    const cx =
        size / 2;

    const cy =
        size / 2;

    const radius =
        size * 0.36;

    const points = [];

    STAT_ORDER.forEach(
        function (stat, index) {

            const angle =
                (
                    -Math.PI / 2
                ) +
                (
                    index *
                    2 *
                    Math.PI /
                    STAT_ORDER.length
                );

            const max =
                maxByStat[stat] || 1;

            const ratio =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (Number(stats[stat]) || 0) /
                        max
                    )
                );

            const x =
                cx +
                Math.cos(angle) *
                radius *
                ratio;

            const y =
                cy +
                Math.sin(angle) *
                radius *
                ratio;

            points.push(
                x.toFixed(1) +
                "," +
                y.toFixed(1)
            );

        }
    );

    return points.join(" ");

}


function radarFramePoints(size) {

    const cx =
        size / 2;

    const cy =
        size / 2;

    const radius =
        size * 0.36;

    const points = [];

    STAT_ORDER.forEach(
        function (stat, index) {

            const angle =
                (
                    -Math.PI / 2
                ) +
                (
                    index *
                    2 *
                    Math.PI /
                    STAT_ORDER.length
                );

            const x =
                cx +
                Math.cos(angle) *
                radius;

            const y =
                cy +
                Math.sin(angle) *
                radius;

            points.push(
                x.toFixed(1) +
                "," +
                y.toFixed(1)
            );

        }
    );

    return points.join(" ");

}



/*
   Combat Power (CP) — aligned to in-game guidelines:

   Step 1 (The Base):
       Species baseline stat template (wiki base stats).

   Step 2 (The Potential Multiplier):
       IP (hatch/catch) + AP (Omnosaurus Crystal upgrades),
       capped at 20 per stat. Combined potential is a
       direct multiplier on the baseline:

           mult = 1 + (IP + AP) / 20
           (missing IP/AP → 0 points → mult 1, never 0)

   Step 3 (The CP Output):
       Resulting per-stat totals (after potential, level,
       capability flats/milestones, resonance, personality %)
       are aggregated into the visual CP number.

   Capability Points map to the six investment tracks
   (Constitution / Might / Endurance / Spirit / Gusto /
   Penetration) and add into the same pool before aggregate.
*/
function computeCombatPower(aniimo) {

    const activeData =
        getActiveData(
            aniimo
        );

    const computed =
        computeFinalStats(
            aniimo,
            activeData
        );

    const build =
        computed.build;

    const finalStats =
        computed.stats || {};

    /*
       Aggregate final primary stats into CP.
       Missing stat → contribute 0 to the sum only after
       multipliers have already floored at 1 on baselines.
    */
    let aggregate = 0;

    STAT_ORDER.forEach(
        function (stat) {

            const v =
                Number(
                    finalStats[stat]
                );

            aggregate +=
                Number.isFinite(v)
                    ?
                    v
                    :
                    0;

        }
    );

    /*
       Personality is already folded into finalStats via
       computeFinalStats. If no personality data was set,
       multipliers stayed at 1.
    */
    const cp =
        Math.max(
            1,
            Math.round(
                aggregate
            )
        );

    // Diagnostic breakdown for UI
    const base =
        activeData.baseStats || {};

    let baseSum = 0;

    STAT_ORDER.forEach(
        function (stat) {

            const v =
                Number(base[stat]);

            baseSum +=
                Number.isFinite(v)
                    ?
                    v
                    :
                    0;

        }
    );

    let potScale = 0;
    let potCount = 0;

    STAT_ORDER.forEach(
        function (stat) {

            potScale +=
                potentialMultiplier(
                    build.ip[stat],
                    build.ap[stat]
                );

            potCount += 1;

        }
    );

    const avgPot =
        potCount
            ?
            potScale / potCount
            :
            1;

    const strength =
        PERSONALITY_STRENGTHS.find(
            function (item) {
                return (
                    item.value ===
                    Number(
                        build.personality.strength
                    )
                );
            }
        );

    const persPct =
        strength && strength.pct
            ?
            strength.pct
            :
            0;

    let axisCount = 0;

    ["ei", "sn", "tf", "jp"].forEach(
        function (axis) {

            if (
                build.personality[axis]
            ) {
                axisCount += 1;
            }

        }
    );

    const personalityMult =
        1 +
        (
            axisCount
                ?
                persPct * axisCount
                :
                0
        );

    let capPoints = 0;

    Object.keys(
        build.capability || {}
    ).forEach(
        function (key) {

            capPoints +=
                Number(
                    build.capability[key]
                ) || 0;

        }
    );

    return {
        cp: cp,
        baseSum: baseSum,
        avgPot: avgPot > 0 ? avgPot : 1,
        personalityMult:
            personalityMult > 0
                ?
                personalityMult
                :
                1,
        capPoints: capPoints,
        level:
            Math.max(
                1,
                Number(aniimo.level) || 1
            ),
        resonance:
            Math.max(
                0,
                Number(build.resonance) || 0
            ),
        aggregate: aggregate
    };

}


function buildRadarSVG(stats) {

    const size =
        280;

    const maxByStat = {
        HP: 600,
        BREAK: 120,
        ATK: 200,
        "M.DEF": 160,
        "P.DEF": 160,
        REGEN: 160
    };

    const frame =
        radarFramePoints(
            size
        );

    const poly =
        radarPolygonPoints(
            stats,
            size,
            maxByStat
        );

    const labels = [];

    const cx =
        size / 2;

    const cy =
        size / 2;

    const labelR =
        size * 0.46;

    STAT_ORDER.forEach(
        function (stat, index) {

            const angle =
                (
                    -Math.PI / 2
                ) +
                (
                    index *
                    2 *
                    Math.PI /
                    STAT_ORDER.length
                );

            const x =
                cx +
                Math.cos(angle) *
                labelR;

            const y =
                cy +
                Math.sin(angle) *
                labelR;

            labels.push(
                `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="radar-label">${escapeHtml(stat)}\\n${escapeHtml(String(stats[stat] || 0))}</text>`
            );

            // Use two tspans via foreignObject-free approach
        }
    );

    // Rebuild labels with tspans
    const labelNodes = [];

    STAT_ORDER.forEach(
        function (stat, index) {

            const angle =
                (
                    -Math.PI / 2
                ) +
                (
                    index *
                    2 *
                    Math.PI /
                    STAT_ORDER.length
                );

            const x =
                cx +
                Math.cos(angle) *
                labelR;

            const y =
                cy +
                Math.sin(angle) *
                labelR;

            labelNodes.push(`
                <text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" text-anchor="middle" class="radar-label-name">${escapeHtml(stat)}</text>
                <text x="${x.toFixed(1)}" y="${(y + 10).toFixed(1)}" text-anchor="middle" class="radar-label-value">${escapeHtml(String(stats[stat] || 0))}</text>
            `);

        }
    );

    return `
        <svg class="stat-radar" viewBox="0 0 ${size} ${size}" width="100%" height="auto" aria-label="Stat radar">
            <polygon points="${frame}" class="radar-frame"></polygon>
            <polygon points="${poly}" class="radar-fill"></polygon>
            ${labelNodes.join("")}
        </svg>
    `;

}


function getActiveData(aniimo) {

    const form =
        getActiveForm(
            aniimo
        );


    const level =
        aniimo.level || 1;


    const baseImage =
        aniimo.imageUrl;

    const baseStats =
        isUsefulObject(aniimo.stats)
            ?
            aniimo.stats
            :
            {};

    const baseElements =
        isUsefulArray(aniimo.elements)
            ?
            aniimo.elements
            :
            [];

    const baseRoles =
        isUsefulArray(aniimo.roles)
            ?
            aniimo.roles
            :
            [];

    const baseSkills =
        isUsefulArray(aniimo.skills)
            ?
            aniimo.skills
            :
            [];

    const baseTraits =
        isUsefulArray(aniimo.traits)
            ?
            aniimo.traits
            :
            [];

    const baseTrait =
        aniimo.trait || null;

    const baseAnalysis =
        aniimo.analysis || {
            tags: [],
            notes: []
        };


    if (!form) {

        const stats =
            scaleStats(
                baseStats,
                level
            );

        return {

            imageUrl:
                baseImage,

            baseStats:
                baseStats,

            stats:
                stats,

            attributeScore:
                getAttributeScore(
                    stats
                ),

            baseAttributeScore:
                getAttributeScore(
                    baseStats
                ),

            elements:
                baseElements
                    .map(normalizeElement)
                    .filter(Boolean),

            roles:
                baseRoles
                    .map(normalizeRole)
                    .filter(Boolean),

            skills:
                baseSkills,

            traits:
                baseTraits,

            trait:
                baseTrait,

            analysis:
                baseAnalysis,

            level:
                level

        };

    }


    /*
       Forms often ship with empty {} / [] fields from the
       wiki scraper. Never let empty form data wipe the
       parent Aniimo stats / elements / roles.
    */

    const formStats =
        isUsefulObject(form.stats)
            ?
            form.stats
            :
            baseStats;

    const formElements =
        isUsefulArray(form.elements)
            ?
            form.elements
            :
            baseElements;

    const formRoles =
        isUsefulArray(form.roles)
            ?
            form.roles
            :
            baseRoles;

    const formSkills =
        isUsefulArray(form.skills)
            ?
            form.skills
            :
            baseSkills;

    const formTraits =
        isUsefulArray(form.traits)
            ?
            form.traits
            :
            baseTraits;

    const formTrait =
        form.trait ||
        baseTrait;

    const formAnalysis =
        (
            form.analysis &&
            typeof form.analysis === "object"
        )
            ?
            form.analysis
            :
            baseAnalysis;


    const stats =
        scaleStats(
            formStats,
            level
        );


    return {

        imageUrl:
            form.imageUrl ||
            form.image ||
            form.portrait ||
            baseImage,

        baseStats:
            formStats,

        stats:
            stats,

        attributeScore:
            getAttributeScore(
                stats
            ),

        baseAttributeScore:
            getAttributeScore(
                formStats
            ),

        elements:
            safeArray(
                formElements
            )
            .map(
                function (element) {
                    return normalizeElement(
                        element
                    );
                }
            )
            .filter(Boolean),

        roles:
            safeArray(
                formRoles
            )
            .map(normalizeRole)
            .filter(Boolean),

        skills:
            formSkills,

        traits:
            formTraits,

        trait:
            formTrait,

        analysis:
            formAnalysis,

        level:
            level

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


            /*
               Refresh details so scaled stats / attribute
               score update immediately with the level.
            */

            showAniimoDetails(
                aniimo
            );


            renderRoster();

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


    /*
       Build controls: IP / AP / Personality / Capability / Resonance
    */

    document.addEventListener(
        "input",
        function (event) {

            const target =
                event.target;

            if (
                !target.matches(
                    "[data-build-field]"
                )
            ) {
                return;
            }

            const number =
                target.dataset.number;

            const field =
                target.dataset.buildField;

            if (!number || !field) {
                return;
            }

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

            const build =
                getBuild(
                    number
                );

            if (
                field === "ip" ||
                field === "ap"
            ) {

                const stat =
                    target.dataset.stat;

                let value =
                    clampPotential(
                        target.value === ""
                            ?
                            0
                            :
                            target.value
                    );

                const otherKey =
                    field === "ip"
                        ?
                        "ap"
                        :
                        "ip";

                const other =
                    clampPotential(
                        build[otherKey][stat]
                    );

                if (value + other > 20) {
                    value =
                        Math.max(
                            0,
                            20 - other
                        );
                    target.value =
                        value || "";
                }

                build[field][stat] =
                    value;

            } else if (
                field === "capability"
            ) {

                const cap =
                    target.dataset.cap;

                build.capability[cap] =
                    Math.max(
                        0,
                        Math.min(
                            99,
                            Number(
                                target.value
                            ) || 0
                        )
                    );

            }

            saveBuild(
                number,
                build
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


    document.addEventListener(
        "change",
        function (event) {

            const target =
                event.target;

            if (
                !target.matches(
                    "[data-build-field]"
                )
            ) {
                return;
            }

            const number =
                target.dataset.number;

            const field =
                target.dataset.buildField;

            if (!number || !field) {
                return;
            }

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

            const build =
                getBuild(
                    number
                );

            if (
                field === "personality"
            ) {

                build.personality[
                    target.dataset.axis
                ] =
                    String(
                        target.value ||
                        ""
                    )
                    .toUpperCase();

            } else if (
                field ===
                "personality-strength"
            ) {

                build.personality.strength =
                    Number(
                        target.value
                    ) || 0;

            } else if (
                field === "resonance"
            ) {

                build.resonance =
                    Math.max(
                        0,
                        Math.min(
                            6,
                            Number(
                                target.value
                            ) || 0
                        )
                    );

            } else {
                return;
            }

            saveBuild(
                number,
                build
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


    document.addEventListener(
        "click",
        function (event) {

            const btn =
                event.target.closest(
                    ".ap-btn"
                );

            if (!btn) {
                return;
            }

            const number =
                btn.dataset.number;

            const stat =
                btn.dataset.stat;

            const field =
                btn.dataset.buildField;

            const aniimo =
                ANIIMO.find(
                    function (item) {
                        return (
                            item.number ===
                            number
                        );
                    }
                );

            if (!aniimo || !stat) {
                return;
            }

            const build =
                getBuild(
                    number
                );

            let ap =
                clampPotential(
                    build.ap[stat]
                );

            const ip =
                clampPotential(
                    build.ip[stat]
                );

            if (
                field === "ap-plus"
            ) {

                if (ip + ap < 20) {
                    ap += 1;
                }

            } else if (
                field === "ap-minus"
            ) {

                if (ap > 0) {
                    ap -= 1;
                }

            }

            build.ap[stat] =
                ap;

            saveBuild(
                number,
                build
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


    /*
       Roster hide / show toggle.
    */

    const toggleRosterBtn =
        document.getElementById("toggleRoster");

    const rosterPanel =
        document.getElementById("rosterPanel");

    if (toggleRosterBtn && rosterPanel) {

        const collapsed =
            localStorage.getItem(
                "aniimo_roster_collapsed"
            ) === "1";

        if (collapsed) {

            rosterPanel.classList.add(
                "collapsed"
            );

            toggleRosterBtn.textContent =
                "Show Roster";

            toggleRosterBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        }

        toggleRosterBtn.addEventListener(
            "click",
            function () {

                const isCollapsed =
                    rosterPanel.classList.toggle(
                        "collapsed"
                    );

                toggleRosterBtn.textContent =
                    isCollapsed
                        ?
                        "Show Roster"
                        :
                        "Hide Roster";

                toggleRosterBtn.setAttribute(
                    "aria-expanded",
                    String(!isCollapsed)
                );

                localStorage.setItem(
                    "aniimo_roster_collapsed",
                    isCollapsed ? "1" : "0"
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

                            const normalized =
                                normalizeRole(
                                    role
                                )
                                .toLowerCase();

                            const selected =
                                normalizeRole(
                                    selectedRole
                                )
                                .toLowerCase();

                            return (
                                normalized ===
                                selected
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
                                normalizeElement(
                                    selectedElement
                                )
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


            const s =
                activeData.stats || {};

            const statsLine = `

                <div class="card-stats">

                    <span>HP ${escapeHtml(
                        String(s.HP ?? "–")
                    )}</span>

                    <span>ATK ${escapeHtml(
                        String(s.ATK ?? "–")
                    )}</span>

                    <span>BRK ${escapeHtml(
                        String(s.BREAK ?? "–")
                    )}</span>

                    <span>M.DEF ${escapeHtml(
                        String(s["M.DEF"] ?? "–")
                    )}</span>

                    <span>P.DEF ${escapeHtml(
                        String(s["P.DEF"] ?? "–")
                    )}</span>

                    <span>REG ${escapeHtml(
                        String(s.REGEN ?? "–")
                    )}</span>

                </div>

            `;


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


                ${statsLine}

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


            const activeData =
                getActiveData(
                    aniimo
                );


            const imageUrl =
                activeData.imageUrl ||
                aniimo.imageUrl ||
                "";


            const imageHTML =
                imageUrl
                    ?
                    `
                        <img
                            src="${escapeHtml(imageUrl)}"
                            alt="${escapeHtml(aniimo.name)}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >
                    `
                    :
                    `
                        <div class="portrait-fallback" style="font-size:28px;">
                            🐾
                        </div>
                    `;


            slot.innerHTML = `

                ${imageHTML}


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


    let planParts = [];


    /*
       TOP-1 oriented game plan from roles, skills, tags.
    */

    planParts.push(
        "TOP-1 GOAL: Play for clean BREAK windows, zero downtime swaps, and full elemental pressure every fight."
    );


    if (breakUnits.length) {

        planParts.push(
            "OPENER — BREAK: Lead with " +
            breakUnits.map(function (a) { return a.name; }).join(" / ") +
            " to shatter the enemy BREAK bar. Hold DPS ults until BREAK drops."
        );

    } else {

        planParts.push(
            "OPENER — RISK: No dedicated BREAK unit. Prioritize high BREAK skills on whoever carries BREAK tags, or you will lose boss windows."
        );

    }


    if (dps.length) {

        planParts.push(
            "DAMAGE — DPS: " +
            dps.map(function (a) { return a.name; }).join(" / ") +
            " is your main damage. Twine them during BREAK for maximum burst."
        );

    } else {

        planParts.push(
            "DAMAGE — GAP: No clear DPS role. Assign your highest ATK Aniimo as carry and stack Support around them."
        );

    }


    if (support.length) {

        planParts.push(
            "SETUP — SUPPORT: " +
            support.map(function (a) { return a.name; }).join(" / ") +
            " applies buffs/debuffs before the DPS burst. Cast Support first, then swap to carry."
        );

    }


    if (heal.length || regen.length) {

        const sustain = []
            .concat(heal, regen)
            .map(function (a) { return a.name; });

        const unique = [];

        sustain.forEach(
            function (name) {
                if (unique.indexOf(name) === -1) {
                    unique.push(name);
                }
            }
        );

        planParts.push(
            "SUSTAIN: " +
            unique.join(" / ") +
            " keeps the squad alive through long PvE and Egg Heist extracts. Do not burn heals on trash packs."
        );

    } else {

        planParts.push(
            "SUSTAIN — GAP: No Heal/Regen. Favor defensive play, carry more recovery items, avoid prolonged multi-wave fights."
        );

    }


    /*
       Per-Aniimo micro plan from cleaned skills + tags.
    */

    team.forEach(
        function (aniimo) {

            const data =
                getActiveData(
                    aniimo
                );

            const skills =
                cleanSkills(
                    data.skills
                );

            const tags =
                (
                    data.analysis &&
                    Array.isArray(
                        data.analysis.tags
                    )
                )
                    ?
                    data.analysis.tags
                    :
                    [];

            const skillNames =
                skills
                    .slice(0, 3)
                    .map(
                        function (s) {
                            return s.name;
                        }
                    );

            let line =
                aniimo.name +
                ": ";

            if (skillNames.length) {

                line +=
                    "key skills " +
                    skillNames.join(", ") +
                    ". ";

            } else {

                line +=
                    "use signature kit from AniDex/wiki. ";

            }

            if (tags.length) {

                line +=
                    "Tags [" +
                    tags.join(", ") +
                    "] — lean into those patterns.";

            } else {

                line +=
                    "No synergy tags yet; play to role.";

            }

            planParts.push(line);

        }
    );


    /*
       Single-target vs group classification.
    */

    let aoeScore = 0;
    let stScore = 0;


    team.forEach(
        function (aniimo) {

            const data =
                getActiveData(
                    aniimo
                );

            const skills =
                cleanSkills(
                    data.skills
                );

            const blob =
                skills
                    .map(
                        function (s) {
                            return (
                                (
                                    s.name ||
                                    ""
                                ) +
                                " " +
                                (
                                    s.description ||
                                    ""
                                )
                            )
                            .toLowerCase();
                        }
                    )
                    .join(" ");

            const tags =
                (
                    data.analysis &&
                    Array.isArray(
                        data.analysis.tags
                    )
                )
                    ?
                    data.analysis.tags
                        .join(" ")
                        .toLowerCase()
                    :
                    "";

            const textBlob =
                blob + " " + tags;


            if (
                /all targets|nearby|area|aoe|wave|blast|around|group|splash|circle|enemies near/.test(
                    textBlob
                )
            ) {
                aoeScore += 2;
            }

            if (
                /single|target|lance|pierce|focus|strike|stab|shot/.test(
                    textBlob
                )
            ) {
                stScore += 1;
            }

            const roles =
                safeArray(
                    data.roles
                )
                .map(
                    function (r) {
                        return String(r).toLowerCase();
                    }
                );

            if (
                roles.indexOf("break") !== -1
            ) {
                stScore += 1;
            }

            if (
                roles.indexOf("support") !== -1 ||
                roles.indexOf("heal") !== -1
            ) {
                aoeScore += 1;
            }

        }
    );


    let targetVerdict = "";


    if (
        aoeScore > stScore + 1
    ) {

        targetVerdict =
            "BEST VS GROUPS: This squad leans AoE / multi-target. Strong for packs, Group Appearances, and chaotic Egg Heist scrambles. Weaker if every fight is a single armored boss unless BREAK is handled first.";

    } else if (
        stScore > aoeScore + 1
    ) {

        targetVerdict =
            "BEST VS SINGLE TARGETS: This squad leans focused damage and BREAK pressure. Ideal for bosses, Alphas/Omegas, and isolated elites. Clear trash carefully or bring an AoE swap for dense packs.";

    } else {

        targetVerdict =
            "FLEXIBLE (ST ≈ AoE): Balanced for both isolated bosses and groups. Prioritize BREAK → burst on bosses; spread Support/AoE skills on packs.";

    }


    planParts.push(
        targetVerdict
    );


    planParts.push(
        "ROTATION TEMPLATE: Support setup → BREAK bar → Twine DPS burst → Sustain refresh → repeat. Never waste BREAK windows."
    );


    const plan =
        planParts.join(" ");


    /*
       Synergy indicator breakdown.
    */

    let synergyDetail = [];

    team.forEach(
        function (aniimo) {

            const data =
                getActiveData(
                    aniimo
                );

            const tags =
                (
                    data.analysis &&
                    Array.isArray(
                        data.analysis.tags
                    )
                )
                    ?
                    data.analysis.tags
                    :
                    [];

            if (tags.length) {

                synergyDetail.push(
                    aniimo.name +
                    " (" +
                    tags.join(", ") +
                    ")"
                );

            }

        }
    );


    const roleCount =
        Object.keys(roles).length;

    const elementCount =
        Object.keys(elements).length;


    /*
       Team CP board.
    */

    const cpRows =
        team.map(
            function (aniimo) {

                const power =
                    computeCombatPower(
                        aniimo
                    );

                return {

                    name: aniimo.name,
                    cp: power.cp,
                    level: power.level,
                    pot: power.avgPot,
                    pers: power.personalityMult

                };

            }
        )
        .sort(
            function (a, b) {
                return b.cp - a.cp;
            }
        );


    const teamCP =
        cpRows.reduce(
            function (sum, row) {
                return sum + row.cp;
            },
            0
        );


    const cpHTML =
        cpRows.map(
            function (row) {

                return `

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            padding:6px 0;
                            border-bottom:1px solid rgba(255,255,255,.06);
                        "
                    >

                        <span>
                            ${escapeHtml(row.name)}
                            <span style="opacity:.6;font-size:12px;">
                                LVL ${row.level}
                            </span>
                        </span>

                        <strong>
                            CP ${escapeHtml(String(row.cp))}
                        </strong>

                    </div>

                `;

            }
        ).join("");


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
                Combat Power (CP)
            </h3>

            <p style="opacity:.75;font-size:0.9rem;">

                <strong>Step 1</strong> — Species baseline template.
                <strong>Step 2</strong> — IP + AP (max 20/stat) as a direct multiplier: 1 + (IP+AP)/20 (missing → ×1).
                <strong>Step 3</strong> — Final stats (incl. Capability tracks + Resonance + Personality %) aggregate into CP.
                Capability Points feed Constitution / Might / Endurance / Spirit / Gusto / Penetration.

            </p>

            ${cpHTML}

            <p style="margin-top:10px;">

                <strong>
                    Team CP:
                    ${escapeHtml(String(teamCP))}
                </strong>

            </p>

        </div>


        <div class="detail-section">

            <h3>
                Synergy Indicators
            </h3>

            <p>

                Score:
                <strong>
                    ${synergyPoints}
                </strong>

            </p>

            <p style="opacity:.8;font-size:0.9rem;">

                Synergy indicators count analysis tags on your squad
                (examples: attack_up, debuff, break, burst, regen, self_scaling).
                Higher means more overlapping combat patterns you can chain.
                This is <em>not</em> an official in-game rating — it is a planner
                signal for how well kits combine.

            </p>

            <p style="opacity:.85;font-size:0.9rem;">

                Role diversity: ${roleCount} role type(s).
                Element diversity: ${elementCount} element(s).

            </p>

            ${
                synergyDetail.length
                    ?
                    `<p style="opacity:.85;font-size:0.9rem;">
                        Tagged units:
                        ${escapeHtml(synergyDetail.join(" · "))}
                    </p>`
                    :
                    `<p style="opacity:.7;font-size:0.9rem;">
                        No synergy tags on this squad yet. Tags appear when wiki analysis data is present.
                    </p>`
            }

        </div>


        <div class="detail-section">

            <h3>
                Target Profile
            </h3>

            <p>

                ${escapeHtml(targetVerdict)}

            </p>

        </div>


        <div class="detail-section">

            <h3>
                Suggested Game Plan (Top-1 focus)
            </h3>

            <div class="analysis-box analysis-good">

                ${
                    planParts.map(
                        function (part) {

                            return `
                                <p style="margin:0 0 10px;">
                                    ${escapeHtml(part)}
                                </p>
                            `;

                        }
                    ).join("")
                }

            </div>

        </div>

    `;

}


/* =====================================================
   ANIIMO DETAILS
   ===================================================== */


function cleanSkills(skills) {

    if (!Array.isArray(skills)) {
        return [];
    }

    const junkNames = {
        physical: true,
        magic: true,
        magical: true,
        support: true,
        cost: true,
        "cost:": true,
        atk: true,
        break: true,
        hp: true,
        regen: true,
        type: true,
        power: true,
        ep: true
    };

    const cleaned = [];

    skills.forEach(
        function (skill) {

            if (!skill) {
                return;
            }

            if (typeof skill === "string") {

                const name =
                    skill.trim();

                if (
                    !name ||
                    junkNames[name.toLowerCase()] ||
                    /^\d+$/.test(name)
                ) {
                    return;
                }

                cleaned.push({
                    name: name,
                    description: "",
                    type: "",
                    cost: "",
                    power: "",
                    element: "",
                    imageUrl: null
                });

                return;

            }

            const name =
                String(
                    skill.name ||
                    ""
                )
                .trim();

            const description =
                String(
                    skill.description ||
                    ""
                )
                .trim();

            if (
                !name ||
                junkNames[name.toLowerCase()] ||
                /^\d+$/.test(name)
            ) {
                return;
            }

            // Skip rows that are only "Cost:" meta noise
            if (
                description === "Cost:" ||
                description.toLowerCase() === "cost"
            ) {
                return;
            }

            cleaned.push({
                name: name,
                description: description,
                type:
                    String(
                        skill.type ||
                        ""
                    )
                    .trim(),
                cost:
                    skill.cost !== undefined &&
                    skill.cost !== ""
                        ?
                        skill.cost
                        :
                        "",
                power:
                    skill.power !== undefined &&
                    skill.power !== ""
                        ?
                        skill.power
                        :
                        "",
                element:
                    String(
                        skill.element ||
                        ""
                    )
                    .trim(),
                imageUrl:
                    skill.imageUrl ||
                    null
            });

        }
    );

    // Deduplicate by name
    const seen = {};
    const unique = [];

    cleaned.forEach(
        function (skill) {

            const key =
                skill.name.toLowerCase();

            if (seen[key]) {
                return;
            }

            seen[key] = true;
            unique.push(skill);

        }
    );

    return unique;

}


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


    const computed =
        computeFinalStats(
            aniimo,
            activeData
        );


    const build =
        computed.build;


    const finalStats =
        computed.stats;


    let potentialRows =
        STAT_ORDER.map(
            function (stat) {

                const ipVal =
                    build.ip[stat] || 0;

                const apVal =
                    build.ap[stat] || 0;

                const remaining =
                    Math.max(
                        0,
                        20 - ipVal - apVal
                    );

                return `

                    <tr>

                        <td>
                            ${escapeHtml(stat)}
                        </td>

                        <td>
                            <input
                                type="number"
                                min="0"
                                max="20"
                                step="1"
                                class="build-input"
                                data-build-field="ip"
                                data-stat="${escapeHtml(stat)}"
                                data-number="${escapeHtml(aniimo.number)}"
                                value="${ipVal || ""}"
                                placeholder="0"
                            >
                        </td>

                        <td>
                            <div class="ap-stepper">

                                <button
                                    type="button"
                                    class="ap-btn"
                                    data-build-field="ap-minus"
                                    data-stat="${escapeHtml(stat)}"
                                    data-number="${escapeHtml(aniimo.number)}"
                                >
                                    −
                                </button>

                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="1"
                                    class="build-input"
                                    data-build-field="ap"
                                    data-stat="${escapeHtml(stat)}"
                                    data-number="${escapeHtml(aniimo.number)}"
                                    value="${apVal || ""}"
                                    placeholder="0"
                                >

                                <button
                                    type="button"
                                    class="ap-btn"
                                    data-build-field="ap-plus"
                                    data-stat="${escapeHtml(stat)}"
                                    data-number="${escapeHtml(aniimo.number)}"
                                >
                                    +
                                </button>

                            </div>
                        </td>

                        <td>
                            ${ipVal + apVal}/20
                            <span style="opacity:.6;font-size:11px;">
                                (${remaining} left)
                            </span>
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(String(finalStats[stat] || 0))}
                            </strong>
                        </td>

                    </tr>

                `;

            }
        ).join("");


    let personalityHTML =
        PERSONALITY_AXES.map(
            function (axis) {

                const current =
                    String(
                        build.personality[axis.id] ||
                        ""
                    )
                    .toUpperCase();

                const options =
                    axis.options.map(
                        function (opt) {

                            const selected =
                                current ===
                                opt.letter
                                    ?
                                    "selected"
                                    :
                                    "";

                            return `
                                <option
                                    value="${escapeHtml(opt.letter)}"
                                    ${selected}
                                >
                                    ${escapeHtml(opt.letter)} — ${escapeHtml(opt.name)} (${escapeHtml(opt.effect)})
                                </option>
                            `;

                        }
                    ).join("");

                return `

                    <label class="build-label">

                        ${escapeHtml(axis.label)}

                        <select
                            class="build-select"
                            data-build-field="personality"
                            data-axis="${escapeHtml(axis.id)}"
                            data-number="${escapeHtml(aniimo.number)}"
                        >

                            <option value="">
                                — leave blank —
                            </option>

                            ${options}

                        </select>

                    </label>

                `;

            }
        ).join("");


    let strengthOptions =
        PERSONALITY_STRENGTHS.map(
            function (item) {

                const selected =
                    Number(
                        build.personality.strength
                    ) ===
                    item.value
                        ?
                        "selected"
                        :
                        "";

                return `
                    <option
                        value="${item.value}"
                        ${selected}
                    >
                        ${escapeHtml(item.label)}
                    </option>
                `;

            }
        ).join("");


    let capabilityHTML =
        Object.keys(
            CAPABILITY_DEFS
        ).map(
            function (key) {

                const def =
                    CAPABILITY_DEFS[key];

                const val =
                    build.capability[key] || 0;

                return `

                    <label class="build-label">

                        ${escapeHtml(def.label)}

                        <input
                            type="number"
                            min="0"
                            max="99"
                            step="1"
                            class="build-input"
                            data-build-field="capability"
                            data-cap="${escapeHtml(key)}"
                            data-number="${escapeHtml(aniimo.number)}"
                            value="${val || ""}"
                            placeholder="0"
                        >

                    </label>

                `;

            }
        ).join("");


    let resonanceOptions =
        RESONANCE_TIERS.map(
            function (tier) {

                const selected =
                    Number(
                        build.resonance
                    ) ===
                    tier.star
                        ?
                        "selected"
                        :
                        "";

                return `
                    <option
                        value="${tier.star}"
                        ${selected}
                    >
                        ${escapeHtml(tier.label)}
                    </option>
                `;

            }
        ).join("");


    const elementsList =
        (
            Array.isArray(
                activeData.elements
            )
                ?
                activeData.elements
                :
                []
        )
        .map(
            function (el) {
                return capitalize(
                    normalizeElement(el)
                );
            }
        )
        .filter(Boolean)
        .join(", ") ||
        "Unknown";


    let statsHTML = `

        <div class="detail-section">

            <h3>
                Stat Radar
                <span style="font-weight:normal;opacity:.7;font-size:0.85rem;">
                    (live · AniDex-style)
                </span>
            </h3>

            <p style="opacity:.75;margin:0 0 10px;font-size:0.9rem;">
                Radar updates from Level, IP, AP, Capability, Resonance and Personality.
                Leave IP/AP blank if unknown. Per-stat IP+AP cannot exceed 20.
                Growth formulas are planning estimates — official curves are not fully public.
            </p>

            <div class="radar-wrap">

                ${buildRadarSVG(finalStats)}

                <div class="radar-total">
                    TOTAL
                    <strong>
                        ${escapeHtml(String(computed.total))}
                    </strong>
                    &nbsp;·&nbsp; CP
                    <strong>
                        ${escapeHtml(String(computeCombatPower(aniimo).cp))}
                    </strong>
                </div>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Element Affinity
            </h3>

            <p style="opacity:.8;margin:0 0 8px;">
                Species elements:
                <strong>
                    ${escapeHtml(elementsList)}
                </strong>
            </p>

            <p style="opacity:.7;font-size:0.85rem;margin:0;">
                Element-affinity traits (HP / damage / DR / crit / crit dmg / gusto
                at +5/10/15% tiers) are separate from the MBTI personality axes.
                Source:
                <a href="https://aniimotools.dev/systems/potential/" target="_blank" rel="noopener">
                    aniimotools.dev Potential
                </a>
            </p>

        </div>


        <div class="detail-section">

            <h3>
                Innate (IP) &amp; Acquired (AP) Potential
            </h3>

            <p style="opacity:.75;font-size:0.9rem;">
                IP is rolled at catch/hatch. AP is raised afterward.
                Cap is 20 combined per stat. Higher potential increases
                attribute growth with level.
            </p>

            <div class="table-wrap">

                <table class="build-table">

                    <thead>

                        <tr>
                            <th>Stat</th>
                            <th>IP</th>
                            <th>AP (− / +)</th>
                            <th>Total</th>
                            <th>Final</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${potentialRows}

                    </tbody>

                </table>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Personality (pick 1 per axis)
            </h3>

            <div class="build-grid">

                ${personalityHTML}

                <label class="build-label">

                    Trait strength

                    <select
                        class="build-select"
                        data-build-field="personality-strength"
                        data-number="${escapeHtml(aniimo.number)}"
                    >

                        ${strengthOptions}

                    </select>

                </label>

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Capability Points
            </h3>

            <p style="opacity:.75;font-size:0.9rem;">
                Earned from leveling and Resonance. Values from community wiki:
                Constitution +40 HP, Might +2 ATK, Endurance +3 P.DEF,
                Spirit +3 M.DEF, Gusto +3 REGEN, Penetration +4 BREAK
                (plus milestone % every 5 ranks).
            </p>

            <div class="build-grid">

                ${capabilityHTML}

            </div>

        </div>


        <div class="detail-section">

            <h3>
                Resonance
            </h3>

            <label class="build-label">

                Resonance star rank

                <select
                    class="build-select"
                    data-build-field="resonance"
                    data-number="${escapeHtml(aniimo.number)}"
                >

                    ${resonanceOptions}

                </select>

            </label>

            <p style="opacity:.7;font-size:0.85rem;margin-top:8px;">
                Official tiers unlock at Lv 20 / 30 / 40 / 50 / 54 / 60
                (Basic → Standard → Advanced Astranite).
            </p>

        </div>


        <div class="detail-section">

            <h3>
                Final Stats @ LVL ${escapeHtml(String(aniimo.level || 1))}
            </h3>

            <div class="stats">

                ${
                    STAT_ORDER.map(
                        function (key) {

                            const value =
                                finalStats[key] || 0;

                            const baseVal =
                                (
                                    activeData.baseStats &&
                                    activeData.baseStats[key] !==
                                        undefined
                                )
                                    ?
                                    activeData.baseStats[key]
                                    :
                                    "–";

                            return `

                                <div class="stat">

                                    <div class="stat-name">

                                        ${escapeHtml(key)}

                                    </div>

                                    <div class="stat-value">

                                        ${escapeHtml(String(value))}

                                    </div>

                                    <div class="stat-name" style="margin-top:4px;">

                                        Base ${escapeHtml(String(baseVal))}

                                    </div>

                                </div>

                            `;

                        }
                    ).join("")
                }

            </div>

        </div>

    `;



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


    const cleanedSkills =
        cleanSkills(
            activeData.skills
        );


    if (
        cleanedSkills.length
    ) {

        skillsHTML = `

            <div class="detail-section">

                <h3>
                    Combat Skills &amp; Basic Attacks
                </h3>

                <p style="opacity:.7;font-size:0.85rem;margin:0 0 10px;">
                    From wiki / AniDex data. Scraped skill rows are cleaned for display.
                    <a href="https://aniidex.com/aniimo/" target="_blank" rel="noopener">AniDex</a>
                    ·
                    <a href="https://wiki.aniimo.com/" target="_blank" rel="noopener">Official Wiki</a>
                </p>

                ${
                    cleanedSkills.map(
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
       Place under Team Analysis when possible.
    */

    const analysisPanel =
        document.getElementById(
            "analysis"
        );

    if (
        analysisPanel &&
        analysisPanel.parentElement
    ) {

        analysisPanel.parentElement.insertAdjacentElement(
            "afterend",
            panel
        );

    } else {

        document.body.appendChild(
            panel
        );

    }


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

    const defensiveWeaknessMembers = {};

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


                                if (
                                    !defensiveWeaknessMembers[
                                        attackerElement
                                    ]
                                ) {

                                    defensiveWeaknessMembers[
                                        attackerElement
                                    ] = [];

                                }


                                if (
                                    defensiveWeaknessMembers[
                                        attackerElement
                                    ].indexOf(
                                        aniimo.name
                                    ) === -1
                                ) {

                                    defensiveWeaknessMembers[
                                        attackerElement
                                    ].push(
                                        aniimo.name
                                    );

                                }

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

        defensiveWeaknessMembers,

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


                const members =
                    (
                        diagnostics.defensiveWeaknessMembers &&
                        diagnostics.defensiveWeaknessMembers[
                            element
                        ]
                    ) ||
                    [];


                const memberList =
                    members.length
                        ?
                        members.join(", ")
                        :
                        "unknown";


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
                                display:flex;
                                justify-content:space-between;
                                gap:12px;
                            "
                        >

                            <span>

                                <strong>
                                    ${escapeHtml(
                                        ELEMENT_LABELS[
                                            element
                                        ]
                                    )}
                                </strong>

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

                            </strong>

                        </div>


                        <div
                            style="
                                margin-top:4px;
                                opacity:.8;
                                font-size:0.9rem;
                            "
                        >

                            Weak:
                            ${escapeHtml(memberList)}

                        </div>

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
