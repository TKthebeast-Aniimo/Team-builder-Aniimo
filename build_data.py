#!/usr/bin/env python3

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


# ============================================================
# ANIIMO TEAM BUILDER
# DATA BUILDER
#
# Official source:
# https://wiki.aniimo.com/
#
# IMPORTANT:
# Names and portraits are taken from the SAME individual
# Wiki page. We do NOT try to match portraits by AniDex
# position or by filename.
# ============================================================


ROOT = Path(__file__).resolve().parent

OUTPUT_FILE = ROOT / "aniimo.json"

WIKI_URL = "https://wiki.aniimo.com/"

HEADERS = {
    "User-Agent":
        "Mozilla/5.0 "
        "(compatible; AniimoTeamBuilder/1.0; "
        "+https://github.com/TKthebeast-Aniimo)"
}

TIMEOUT = 30

session = requests.Session()
session.headers.update(HEADERS)


# ============================================================
# HTTP
# ============================================================

def get_page(url):

    response = session.get(
        url,
        timeout=TIMEOUT
    )

    response.raise_for_status()

    return response.text


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(value):

    if value is None:
        return ""

    value = re.sub(
        r"\s+",
        " ",
        str(value)
    )

    return value.strip()


def page_lines(soup):

    text = soup.get_text(
        "\n"
    )

    result = []

    for line in text.splitlines():

        line = clean_text(line)

        if line:
            result.append(line)

    return result


# ============================================================
# NUMBER
# ============================================================

def extract_number(text):

    if not text:
        return None

    match = re.search(
        r"NO\.\s*(\d+)",
        text,
        re.IGNORECASE
    )

    if match:

        return int(
            match.group(1)
        )

    return None


# ============================================================
# NAME
# ============================================================

def extract_name(
    soup,
    roster_name=""
):

    # --------------------------------------------------------
    # FIRST CHOICE:
    # The individual Wiki page's H1.
    #
    # Emberpup's page has:
    #
    # NO.001
    # Emberpup
    #
    # and H1 is Emberpup.
    # --------------------------------------------------------

    h1 = soup.find("h1")

    if h1:

        name = clean_text(
            h1.get_text(
                " ",
                strip=True
            )
        )

        if name:

            # Never accept generic page titles.

            bad_names = {
                "Aniimo Wiki",
                "Official Aniimo Wiki",
                "Official Aniimo Index",
                "Complete Aniimo Index"
            }

            if name not in bad_names:

                if not re.match(
                    r"^NO\.?\s*\d+$",
                    name,
                    re.IGNORECASE
                ):

                    return name


    # --------------------------------------------------------
    # SECOND CHOICE:
    # Look through headings.
    # --------------------------------------------------------

    for heading in soup.find_all(
        ["h2", "h3", "h4"]
    ):

        name = clean_text(
            heading.get_text(
                " ",
                strip=True
            )
        )

        if not name:
            continue

        if re.match(
            r"^NO\.?\s*\d+$",
            name,
            re.IGNORECASE
        ):
            continue

        if name.lower() in {
            "basic info",
            "evolution",
            "habitats",
            "mobility",
            "trait",
            "skill details",
            "skill details combat innate"
        }:
            continue

        # Don't use obvious UI text.

        if len(name) > 60:
            continue

        return name


    # --------------------------------------------------------
    # THIRD CHOICE:
    # The roster supplied name.
    #
    # This is ONLY a fallback.
    # --------------------------------------------------------

    roster_name = clean_text(
        roster_name
    )

    if roster_name:

        roster_name = re.sub(
            r"^NO\.?\s*\d+\s*",
            "",
            roster_name,
            flags=re.IGNORECASE
        )

        if roster_name:

            return roster_name


    return "Unknown"


# ============================================================
# PORTRAIT
# ============================================================

def is_bad_image(url):

    if not url:
        return True

    lower = url.lower()

    bad_parts = [

        "undefinedimages",

        "ogimage",

        "favicon",

        "logo",

        "loading",

        "placeholder",

        "icon",

        "arrow",

        "search",

        "close",

        "menu",

        "button"

    ]

    return any(
        part in lower
        for part in bad_parts
    )


def extract_image_url(
    soup,
    page_url
):

    """
    IMPORTANT:

    The previous scraper tried to guess the portrait.

    That caused portraits to become mixed.

    On an individual Aniimo Wiki page, the first real
    Aniimo illustration is the primary portrait.

    Therefore we deliberately prefer the first usable
    image from the page instead of scoring arbitrary
    images against AniDex numbers.
    """


    candidates = []


    # --------------------------------------------------------
    # Collect IMG elements in document order.
    # --------------------------------------------------------

    for img in soup.find_all("img"):

        possible = [

            img.get("src"),

            img.get("data-src"),

            img.get("data-original"),

            img.get("data-lazy-src")

        ]


        # srcset

        srcset = img.get(
            "srcset"
        )

        if srcset:

            first_src = (
                srcset
                .split(",")[0]
                .strip()
                .split(" ")[0]
            )

            possible.append(
                first_src
            )


        for source in possible:

            if not source:
                continue

            source = source.strip()

            if source.startswith(
                "data:"
            ):
                continue

            absolute = urljoin(
                page_url,
                source
            )

            if is_bad_image(
                absolute
            ):
                continue

            if absolute not in candidates:

                candidates.append(
                    absolute
                )


    # --------------------------------------------------------
    # Prefer the first large-looking Aniimo image.
    #
    # The official Wiki page's main portrait appears before
    # the evolution/skill images.
    # --------------------------------------------------------

    for url in candidates:

        lower = url.lower()

        if any(
            lower.endswith(ext)
            for ext in [
                ".png",
                ".jpg",
                ".jpeg",
                ".webp"
            ]
        ):

            return url


    # --------------------------------------------------------
    # If extension isn't visible, still use first candidate.
    # --------------------------------------------------------

    if candidates:

        return candidates[0]


    return None


# ============================================================
# ELEMENTS
# ============================================================

KNOWN_ELEMENTS = {

    "fire": "Fire",

    "ice": "Ice",

    "dark": "Dark",

    "electric": "Electric",

    "grass": "Grass",

    "water": "Water",

    "rock": "Rock",

    "wind": "Wind",

    "holy": "Holy"

}


def extract_elements(
    soup,
    lines
):

    found = []


    # --------------------------------------------------------
    # Look at the early part of the individual page.
    # The Wiki puts the elements near the name.
    # --------------------------------------------------------

    for line in lines[:80]:

        value = line.lower().strip()

        if value in KNOWN_ELEMENTS:

            element = KNOWN_ELEMENTS[
                value
            ]

            if element not in found:

                found.append(
                    element
                )


    return found


# ============================================================
# ROLES
# ============================================================

KNOWN_ROLES = {

    "dps": "DPS",

    "heal": "Heal",

    "support": "Support",

    "break": "BREAK",

    "regen": "REGEN"

}


def extract_roles(
    lines
):

    found = []


    for line in lines[:100]:

        value = line.lower().strip()

        if value in KNOWN_ROLES:

            role = KNOWN_ROLES[
                value
            ]

            if role not in found:

                found.append(
                    role
                )


    return found


# ============================================================
# STATS
# ============================================================

STAT_NAMES = [

    "HP",

    "BREAK",

    "ATK",

    "M.DEF",

    "P.DEF",

    "REGEN"

]


def extract_stats(
    lines
):

    stats = {}


    for i, line in enumerate(
        lines
    ):

        current = (
            line
            .strip()
            .upper()
            .replace("：", ":")
        )


        # ----------------------------------------------------
        # Format:
        #
        # HP:
        # 67
        # ----------------------------------------------------

        for stat in STAT_NAMES:

            if current == (
                stat + ":"
            ):

                if i + 1 < len(lines):

                    match = re.search(
                        r"\d+(?:\.\d+)?",
                        lines[i + 1]
                    )

                    if match:

                        value = (
                            match.group(0)
                        )

                        if "." in value:

                            stats[stat] = float(
                                value
                            )

                        else:

                            stats[stat] = int(
                                value
                            )


        # ----------------------------------------------------
        # Format:
        #
        # HP: 67
        # ----------------------------------------------------

        for stat in STAT_NAMES:

            pattern = (
                r"^"
                + re.escape(stat)
                + r"\s*:\s*"
                r"(\d+(?:\.\d+)?)$"
            )

            match = re.match(
                pattern,
                current
            )

            if match:

                value = match.group(
                    1
                )

                if "." in value:

                    stats[stat] = float(
                        value
                    )

                else:

                    stats[stat] = int(
                        value
                    )


    return stats


# ============================================================
# TRAIT
# ============================================================

def extract_trait(
    lines
):

    for i, line in enumerate(
        lines
    ):

        if line.lower() == "trait":

            # Search forward for a useful title.

            for j in range(
                i + 1,
                min(
                    i + 8,
                    len(lines)
                )
            ):

                candidate = clean_text(
                    lines[j]
                )

                if not candidate:
                    continue

                if candidate.lower() in {
                    "skill details",
                    "combat",
                    "innate"
                }:
                    continue

                # Find description after title.

                if j + 1 < len(lines):

                    description = clean_text(
                        lines[j + 1]
                    )

                    if (
                        description
                        and len(description) > 10
                    ):

                        return {

                            "name":
                                candidate,

                            "description":
                                description

                        }


    return None


# ============================================================
# SKILLS
# ============================================================

def extract_skills(
    lines
):

    skills = []


    try:

        start = next(
            i
            for i, line in enumerate(
                lines
            )
            if line.lower() == "skill details"
        )

    except StopIteration:

        return skills


    # --------------------------------------------------------
    # Work through the skill section.
    # --------------------------------------------------------

    section = lines[
        start + 1:
    ]


    i = 0


    while i < len(section):

        line = section[i]


        # Stop before footer.

        if line.lower() in {
            "terms of use",
            "privacy policy"
        }:

            break


        # ----------------------------------------------------
        # We look for the repeated pattern:
        #
        # Skill Name
        # Description
        # Element:
        # Type: ...
        # Cost: ...
        # Power: ...
        # ----------------------------------------------------

        if (
            i + 1 < len(section)
            and len(line) < 100
            and len(section[i + 1]) > 10
        ):

            skill_name = line

            description = section[
                i + 1
            ]


            # Don't accidentally treat headings as skills.

            ignored = {

                "Combat",

                "Innate",

                "Element:",

                "Type:",

                "Cost:",

                "Power:"

            }


            if skill_name in ignored:

                i += 1

                continue


            element = ""

            skill_type = ""

            cost = ""

            power = ""


            # ------------------------------------------------
            # Look ahead for the skill metadata.
            # ------------------------------------------------

            j = i + 2


            while (
                j < len(section)
                and j < i + 12
            ):

                value = section[j]


                if value == "Element:":

                    if j + 1 < len(section):

                        element = clean_text(
                            section[j + 1]
                        )

                        j += 2

                        continue


                if value.startswith(
                    "Element:"
                ):

                    element = clean_text(
                        value.replace(
                            "Element:",
                            "",
                            1
                        )
                    )

                    j += 1

                    continue


                if value.startswith(
                    "Type:"
                ):

                    skill_type = clean_text(
                        value.replace(
                            "Type:",
                            "",
                            1
                        )
                    )

                    j += 1

                    continue


                if value.startswith(
                    "Cost:"
                ):

                    cost = clean_text(
                        value.replace(
                            "Cost:",
                            "",
                            1
                        )
                    )

                    j += 1

                    continue


                if value.startswith(
                    "Power:"
                ):

                    power = clean_text(
                        value.replace(
                            "Power:",
                            "",
                            1
                        )
                    )

                    j += 1

                    break


                # Another likely skill name means stop.

                if (
                    j > i + 2
                    and len(value) < 80
                ):

                    break


                j += 1


            skills.append({

                "name":
                    skill_name,

                "description":
                    description,

                "element":
                    element,

                "type":
                    skill_type,

                "cost":
                    cost,

                "power":
                    power

            })


            i = max(
                i + 2,
                j
            )

        else:

            i += 1


    return skills


# ============================================================
# ANALYSIS TAGS
# ============================================================

def make_analysis_tags(
    trait,
    skills
):

    text_parts = []


    if trait:

        text_parts.append(
            trait.get(
                "description",
                ""
            )
        )


    for skill in skills:

        text_parts.append(
            skill.get(
                "description",
                ""
            )
        )


    text = " ".join(
        text_parts
    ).lower()


    tags = []


    patterns = {

        "attack_up": [
            "increase attack",
            "increases attack",
            "attack increased",
            "attack is increased"
        ],

        "damage_up": [
            "increase damage",
            "increases damage",
            "damage increased"
        ],

        "debuff": [
            "debuff",
            "weakness",
            "mark",
            "curse"
        ],

        "break": [
            "break damage",
            "increase break",
            "break increased"
        ],

        "heal": [
            "heal",
            "healing",
            "restore hp",
            "restores hp"
        ],

        "regen": [
            "regen",
            "regeneration",
            "energy",
            "stamina"
        ],

        "shield": [
            "shield",
            "damage reduction"
        ],

        "control": [
            "stun",
            "freeze",
            "slow",
            "silence",
            "paraly"
        ],

        "critical": [
            "critical",
            "crit"
        ]

    }


    for tag, words in patterns.items():

        for word in words:

            if word in text:

                tags.append(
                    tag
                )

                break


    return tags


# ============================================================
# INDIVIDUAL ANIIMO
# ============================================================

def parse_aniimo(
    page_url,
    roster_name,
    roster_number
):

    print(
        "    Opening:",
        page_url
    )


    html = get_page(
        page_url
    )


    soup = BeautifulSoup(
        html,
        "html.parser"
    )


    lines = page_lines(
        soup
    )


    # --------------------------------------------------------
    # CRITICAL:
    # Name comes from the INDIVIDUAL PAGE.
    # --------------------------------------------------------

    name = extract_name(
        soup,
        roster_name
    )


    # --------------------------------------------------------
    # CRITICAL:
    # Number comes from the ROSTER LINK.
    # --------------------------------------------------------

    number = roster_number


    # --------------------------------------------------------
    # CRITICAL:
    # Portrait comes from THIS SAME PAGE.
    # --------------------------------------------------------

    image_url = extract_image_url(
        soup,
        page_url
    )


    elements = extract_elements(
        soup,
        lines
    )


    roles = extract_roles(
        lines
    )


    stats = extract_stats(
        lines
    )


    trait = extract_trait(
        lines
    )


    skills = extract_skills(
        lines
    )


    tags = make_analysis_tags(
        trait,
        skills
    )


    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if (
        not name
        or name == "Unknown"
        or re.match(
            r"^NO\.?\s*#?\s*\d+$",
            name,
            re.IGNORECASE
        )
    ):

        # This should never happen, but use the roster
        # name rather than storing NO#001 as the name.

        name = re.sub(
            r"^NO\.?\s*#?\s*\d+\s*",
            "",
            roster_name,
            flags=re.IGNORECASE
        ).strip()


    if not name:

        name = f"Aniimo #{number}"


    return {

        "id":
            number,

        "name":
            name,

        "number":
            (
                f"{number:03d}"
                if number < 1000
                else str(number)
            ),

        "sourceUrl":
            page_url,

        "imageUrl":
            image_url,

        "elements":
            elements,

        "roles":
            roles,

        "stats":
            stats,

        "forms":
            [],

        "trait":
            trait,

        "skills":
            skills,

        "analysis": {

            "tags":
                tags,

            "notes":
                []

        },

        "lastVerified":
            time.strftime(
                "%Y-%m-%d"
            )

    }


# ============================================================
# ROSTER DISCOVERY
# ============================================================

def discover_roster():

    print(
        "Downloading official Aniimo roster..."
    )


    html = get_page(
        WIKI_URL
    )


    soup = BeautifulSoup(
        html,
        "html.parser"
    )


    roster = []

    seen_urls = set()


    # --------------------------------------------------------
    # The official Wiki roster contains links like:
    #
    # NO.001 Emberpup
    #
    # We capture BOTH pieces here.
    # --------------------------------------------------------

    for link in soup.find_all(
        "a",
        href=True
    ):

        text = clean_text(
            link.get_text(
                " ",
                strip=True
            )
        )


        number = extract_number(
            text
        )


        if number is None:

            continue


        href = urljoin(
            WIKI_URL,
            link.get("href")
        )


        if "/item/" not in href:

            continue


        # ----------------------------------------------------
        # Remove NO.001 from the visible text.
        # ----------------------------------------------------

        name = re.sub(
            r"NO\.?\s*\d+\s*",
            "",
            text,
            flags=re.IGNORECASE
        ).strip()


        if not name:

            continue


        if href in seen_urls:

            continue


        seen_urls.add(
            href
        )


        roster.append({

            "number":
                number,

            "name":
                name,

            "url":
                href

        })


    # --------------------------------------------------------
    # Sort by actual Aniimo number.
    # --------------------------------------------------------

    roster.sort(
        key=lambda item: item["number"]
    )


    return roster


# ============================================================
# VALIDATION
# ============================================================

def validate_database(
    data
):

    if not data:

        raise RuntimeError(
            "No Aniimo were collected."
        )


    # Current official roster is well above 80.
    #
    # This prevents an accidental partial scrape from
    # destroying the database.

    if len(data) < 80:

        raise RuntimeError(
            f"Only {len(data)} Aniimo were collected. "
            "Database will NOT be overwritten."
        )


    names = set()

    bad_names = []


    for item in data:

        name = item.get(
            "name",
            ""
        )


        if not name:

            bad_names.append(
                item
            )

            continue


        if re.match(
            r"^NO\.?\s*#?\s*\d+$",
            name,
            re.IGNORECASE
        ):

            bad_names.append(
                item
            )


        if name in names:

            # Duplicate names aren't necessarily fatal,
            # but report them.

            print(
                "WARNING: duplicate name:",
                name
            )


        names.add(
            name
        )


    if bad_names:

        examples = [
            item.get(
                "name"
            )
            for item in bad_names[:5]
        ]


        raise RuntimeError(
            "Invalid Aniimo names detected: "
            + str(examples)
        )


    portrait_count = sum(
        1
        for item in data
        if item.get(
            "imageUrl"
        )
    )


    print(
        "Aniimo collected:",
        len(data)
    )


    print(
        "Portraits collected:",
        portrait_count
    )


    # --------------------------------------------------------
    # Do NOT destroy a good database if portraits disappear.
    # --------------------------------------------------------

    if portrait_count < 50:

        raise RuntimeError(
            f"Only {portrait_count} portraits were found. "
            "Database will NOT be overwritten."
        )


    # --------------------------------------------------------
    # Specific sanity check for Emberpup.
    # --------------------------------------------------------

    emberpup = next(
        (
            item
            for item in data
            if item.get(
                "number"
            ) == "001"
        ),
        None
    )


    if emberpup:

        print("")
        print(
            "Sanity check:"
        )

        print(
            "  #001 name:",
            emberpup.get(
                "name"
            )
        )

        print(
            "  #001 image:",
            emberpup.get(
                "imageUrl"
            )
        )


        if emberpup.get(
            "name"
        ).lower() != "emberpup":

            raise RuntimeError(
                "Sanity check failed: "
                "#001 is not Emberpup."
            )


# ============================================================
# MAIN
# ============================================================

def main():

    print("")
    print(
        "================================================"
    )
    print(
        "       ANIIMO TEAM BUILDER DATA BUILDER"
    )
    print(
        "================================================"
    )
    print("")


    # --------------------------------------------------------
    # DISCOVER
    # --------------------------------------------------------

    roster = discover_roster()


    print(
        "Official roster links found:",
        len(roster)
    )


    if len(roster) < 80:

        raise RuntimeError(
            "The official roster could not be read correctly. "
            "Existing aniimo.json was NOT changed."
        )


    data = []


    # --------------------------------------------------------
    # PROCESS EACH INDIVIDUAL PAGE
    # --------------------------------------------------------

    for index, entry in enumerate(
        roster,
        1
    ):

        print("")
        print(
            f"[{index}/{len(roster)}] "
            f"NO.{entry['number']:03d} "
            f"{entry['name']}"
        )


        try:

            item = parse_aniimo(

                page_url=
                    entry["url"],

                roster_name=
                    entry["name"],

                roster_number=
                    entry["number"]

            )


            # ------------------------------------------------
            # Print what we actually obtained.
            # ------------------------------------------------

            print(
                "    Name:",
                item["name"]
            )

            print(
                "    Portrait:",
                (
                    "YES"
                    if item.get(
                        "imageUrl"
                    )
                    else "NO"
                )
            )


            data.append(
                item
            )


        except Exception as error:

            print(
                "    ERROR:",
                str(error)
            )


            # ------------------------------------------------
            # Do NOT silently invent an Aniimo.
            #
            # Keep the correct name and source URL so the
            # record is still identifiable.
            # ------------------------------------------------

            data.append({

                "id":
                    entry["number"],

                "name":
                    entry["name"],

                "number":
                    (
                        f"{entry['number']:03d}"
                        if entry["number"] < 1000
                        else str(
                            entry["number"]
                        )
                    ),

                "sourceUrl":
                    entry["url"],

                "imageUrl":
                    None,

                "elements":
                    [],

                "roles":
                    [],

                "stats":
                    {},

                "forms":
                    [],

                "trait":
                    None,

                "skills":
                    [],

                "analysis": {

                    "tags":
                        [],

                    "notes": [
                        "Individual page could not be parsed."
                    ]

                },

                "lastVerified":
                    time.strftime(
                        "%Y-%m-%d"
                    )

            })


        # ----------------------------------------------------
        # Be polite to the official Wiki.
        # ----------------------------------------------------

        time.sleep(
            0.25
        )


    # --------------------------------------------------------
    # VALIDATE BEFORE WRITING
    # --------------------------------------------------------

    print("")
    print(
        "Validating database..."
    )


    validate_database(
        data
    )


    # --------------------------------------------------------
    # WRITE
    # --------------------------------------------------------

    OUTPUT_FILE.write_text(

        json.dumps(
            data,
            ensure_ascii=False,
            indent=2
        ),

        encoding="utf-8"

    )


    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    portraits = sum(
        1
        for item in data
        if item.get(
            "imageUrl"
        )
    )


    print("")
    print(
        "================================================"
    )

    print(
        "DATABASE BUILD SUCCESSFUL"
    )

    print(
        "Aniimo:",
        len(data)
    )

    print(
        "Portraits:",
        portraits
    )

    print(
        "Output:",
        OUTPUT_FILE
    )

    print(
        "================================================"
    )

    print("")


if __name__ == "__main__":

    main()
