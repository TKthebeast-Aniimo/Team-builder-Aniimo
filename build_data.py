#!/usr/bin/env python3

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


# =========================================================
# CONFIG
# =========================================================

ROOT = Path(__file__).resolve().parent

OUTPUT_FILE = ROOT / "aniimo.json"

WIKI_HOME = "https://wiki.aniimo.com/"
ANIIDEX_HOME = "https://aniidex.com/"

HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Aniimo Team Builder fan project)"
}

TIMEOUT = 30


# =========================================================
# HTTP
# =========================================================

session = requests.Session()
session.headers.update(HEADERS)


def get_html(url):

    response = session.get(
        url,
        timeout=TIMEOUT
    )

    response.raise_for_status()

    return response.text


# =========================================================
# CLEAN TEXT
# =========================================================

def clean_lines(text):

    result = []

    for line in text.splitlines():

        line = re.sub(
            r"\s+",
            " ",
            line
        ).strip()

        if not line:
            continue

        result.append(line)

    return result


# =========================================================
# NUMBER
# =========================================================

def get_number(lines):

    for line in lines:

        match = re.search(
            r"NO\.\s*(\d+)",
            line,
            re.I
        )

        if match:

            return int(
                match.group(1)
            )

    return None


# =========================================================
# NAME
# =========================================================

def get_name(soup, lines):

    h1 = soup.find("h1")

    if h1:

        name = h1.get_text(
            " ",
            strip=True
        )

        if name:

            return name


    number_seen = False

    for line in lines:

        if re.match(
            r"NO\.\s*\d+",
            line,
            re.I
        ):

            number_seen = True

            continue


        if number_seen:

            if len(line) > 1:

                return line


    return "Unknown"


# =========================================================
# ELEMENTS
# =========================================================

ELEMENTS = {
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


def get_elements(lines):

    found = []

    for line in lines[:80]:

        value = line.lower().strip()

        if value in ELEMENTS:

            element = ELEMENTS[value]

            if element not in found:

                found.append(
                    element
                )

    return found


# =========================================================
# ROLES
# =========================================================

ROLES = {
    "DPS",
    "Heal",
    "Support",
    "BREAK",
    "REGEN"
}


def get_roles(lines):

    found = []

    for line in lines[:80]:

        if line.strip() in ROLES:

            if line.strip() not in found:

                found.append(
                    line.strip()
                )

    return found


# =========================================================
# STATS
# =========================================================

STAT_NAMES = [
    "HP",
    "BREAK",
    "ATK",
    "M.DEF",
    "P.DEF",
    "REGEN"
]


def get_stats(lines):

    stats = {}

    for i, line in enumerate(lines):

        current = (
            line
            .strip()
            .upper()
            .replace("：", ":")
        )


        # Format:
        #
        # HP:
        # 67
        #

        for stat in STAT_NAMES:

            if current == stat + ":":

                if i + 1 < len(lines):

                    match = re.search(
                        r"(\d+(?:\.\d+)?)",
                        lines[i + 1]
                    )

                    if match:

                        number = match.group(1)

                        if "." in number:

                            stats[stat] = float(
                                number
                            )

                        else:

                            stats[stat] = int(
                                number
                            )


        # Format:
        #
        # HP: 67
        #

        for stat in STAT_NAMES:

            match = re.match(
                r"^"
                + re.escape(stat)
                + r"\s*:\s*"
                r"(\d+(?:\.\d+)?)$",
                current
            )

            if match:

                number = match.group(1)

                if "." in number:

                    stats[stat] = float(
                        number
                    )

                else:

                    stats[stat] = int(
                        number
                    )

    return stats


# =========================================================
# PORTRAIT
# =========================================================

def get_portrait(
    soup,
    page_url,
    name,
    number
):

    """
    IMPORTANT:

    Do NOT use og:image.

    The Wiki can return:

        /undefinedimages/ogImage.png

    which is not an Aniimo portrait.

    Instead we inspect every image on the page and
    look for an image associated with the Aniimo.
    """


    candidates = []


    # -----------------------------------------------------
    # Collect image URLs
    # -----------------------------------------------------

    for img in soup.find_all("img"):

        sources = [

            img.get("src"),

            img.get("data-src"),

            img.get("data-lazy-src"),

            img.get("data-original"),

            img.get("srcset")

        ]


        for source in sources:

            if not source:

                continue


            # srcset can contain multiple URLs

            if "," in source:

                source = source.split(
                    ","
                )[0].strip()


            # Remove width descriptor

            source = re.sub(
                r"\s+\d+w$",
                "",
                source
            )


            absolute = urljoin(
                page_url,
                source
            )


            candidates.append(
                absolute
            )


    # -----------------------------------------------------
    # Score candidates
    # -----------------------------------------------------

    scored = []


    lower_name = name.lower()


    for url in candidates:

        lower = url.lower()

        score = 0


        # Reject known bad image

        if (
            "undefinedimages" in lower
            or "ogimage" in lower
        ):

            continue


        # Reject UI icons

        if any(
            x in lower
            for x in [
                "favicon",
                "logo",
                "icon",
                "arrow",
                "button",
                "close",
                "search"
            ]
        ):

            score -= 20


        # Aniimo image hints

        if "aniimo" in lower:

            score += 10


        if "pethead" in lower:

            score += 50


        if "pet" in lower:

            score += 10


        # Name in URL

        compact_name = re.sub(
            r"[^a-z0-9]",
            "",
            lower_name
        )


        compact_url = re.sub(
            r"[^a-z0-9]",
            "",
            lower
        )


        if compact_name in compact_url:

            score += 50


        # Number in URL

        if number is not None:

            number_text = str(
                number
            )

            if number_text in lower:

                score += 5


        # Common image formats

        if any(
            lower.endswith(
                extension
            )
            for extension in [
                ".png",
                ".jpg",
                ".jpeg",
                ".webp"
            ]
        ):

            score += 5


        scored.append(
            (
                score,
                url
            )
        )


    # -----------------------------------------------------
    # Best candidate
    # -----------------------------------------------------

    scored.sort(
        reverse=True
    )


    if scored:

        best_score, best_url = (
            scored[0]
        )


        if best_score >= 0:

            return best_url


    return None


# =========================================================
# TRAITS
# =========================================================

def get_traits(lines):

    traits = []


    try:

        start = lines.index(
            "Traits & Passives"
        )

    except ValueError:

        return traits


    end = min(
        start + 30,
        len(lines)
    )


    section = lines[
        start + 1:
        end
    ]


    i = 0


    while i + 1 < len(section):

        name = section[i]

        description = section[i + 1]


        if (
            len(name) < 100
            and len(description) > 10
            and name not in [
                "Image",
                "Skill Details"
            ]
        ):

            traits.append({

                "name":
                    name,

                "description":
                    description

            })

            i += 2

        else:

            i += 1


    return traits


# =========================================================
# SKILLS
# =========================================================

def get_skills(lines):

    skills = []


    try:

        start = lines.index(
            "Skill Details"
        )

    except ValueError:

        return skills


    section = lines[
        start + 1:
    ]


    i = 0


    while i < len(section):

        if (
            i + 2 < len(section)
            and section[i + 2] == "Element:"
        ):

            skill_name = section[i]

            description = section[i + 1]

            skill_type = ""

            cost = ""

            power = ""


            if i + 3 < len(section):

                skill_type = re.sub(
                    r"^Type:\s*",
                    "",
                    section[i + 3],
                    flags=re.I
                )


            if i + 4 < len(section):

                cost = re.sub(
                    r"^Cost:\s*",
                    "",
                    section[i + 4],
                    flags=re.I
                )


            if i + 5 < len(section):

                if section[i + 5].lower().startswith(
                    "power:"
                ):

                    power = re.sub(
                        r"^Power:\s*",
                        "",
                        section[i + 5],
                        flags=re.I
                    )


            skills.append({

                "name":
                    skill_name,

                "description":
                    description,

                "element":
                    "",

                "type":
                    skill_type,

                "cost":
                    cost,

                "power":
                    power

            })


            i += 6

        else:

            i += 1


    return skills


# =========================================================
# TEAM ANALYSIS TAGS
# =========================================================

def get_tags(
    traits,
    skills
):

    text = ""


    for trait in traits:

        text += " "

        text += trait.get(
            "description",
            ""
        )


    for skill in skills:

        text += " "

        text += skill.get(
            "description",
            ""
        )


    rules = {

        "attack_up":
            r"increase.*attack|"
            r"increases.*damage|"
            r"damage.*increase",

        "damage_up":
            r"increases damage|"
            r"damage is increased",

        "debuff":
            r"debuff|"
            r"weakness|"
            r"mark|"
            r"curse",

        "break":
            r"break damage|"
            r"increases.*break|"
            r"break.*increase",

        "heal":
            r"heal|"
            r"healing|"
            r"restore.*HP",

        "regen":
            r"regen|"
            r"energy|"
            r"EP",

        "shield":
            r"shield|"
            r"damage reduction",

        "control":
            r"stun|"
            r"freeze|"
            r"slow|"
            r"silence|"
            r"paraly",

        "critical":
            r"critical|"
            r"crit",

        "fire_debuff":
            r"fire debuff",

        "ice_debuff":
            r"ice debuff"

    }


    tags = []


    for tag, pattern in rules.items():

        if re.search(
            pattern,
            text,
            re.I
        ):

            tags.append(
                tag
            )


    return tags


# =========================================================
# ANIIMO PAGE
# =========================================================

def parse_aniimo(
    url,
    fallback_name,
    fallback_number
):

    print(
        "  Fetching:",
        fallback_name
    )


    html = get_html(
        url
    )


    soup = BeautifulSoup(
        html,
        "html.parser"
    )


    lines = clean_lines(
        soup.get_text("\n")
    )


    number = (
        get_number(lines)
        or fallback_number
    )


    name = (
        get_name(
            soup,
            lines
        )
        or fallback_name
    )


    image = get_portrait(
        soup,
        url,
        name,
        number
    )


    elements = get_elements(
        lines
    )


    roles = get_roles(
        lines
    )


    stats = get_stats(
        lines
    )


    traits = get_traits(
        lines
    )


    skills = get_skills(
        lines
    )


    tags = get_tags(
        traits,
        skills
    )


    return {

        "id":
            number,

        "name":
            name,

        "number":
            (
                f"{number:03d}"
                if number is not None
                and number < 1000
                else str(
                    number or ""
                )
            ),

        "sourceUrl":
            url,

        "imageUrl":
            image,

        "elements":
            elements,

        "roles":
            roles,

        "stats":
            stats,

        "forms":
            [],

        "trait":
            (
                traits[0]
                if traits
                else None
            ),

        "traits":
            traits,

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


# =========================================================
# FIND ALL ANIIMO
# =========================================================

def find_aniimo():

    print(
        "Downloading official Aniimo index..."
    )


    html = get_html(
        WIKI_HOME
    )


    soup = BeautifulSoup(
        html,
        "html.parser"
    )


    found = []

    seen = set()


    for a in soup.find_all(
        "a",
        href=True
    ):

        href = urljoin(
            WIKI_HOME,
            a["href"]
        )


        if "/item/" not in href:

            continue


        text = a.get_text(
            " ",
            strip=True
        )


        match = re.search(
            r"NO\.\s*(\d+)",
            text,
            re.I
        )


        if not match:

            continue


        number = int(
            match.group(1)
        )


        name = re.sub(
            r"NO\.\s*\d+",
            "",
            text,
            flags=re.I
        ).strip()


        if not name:

            continue


        key = (
            number,
            href
        )


        if key in seen:

            continue


        seen.add(
            key
        )


        found.append(
            (
                number,
                name,
                href
            )
        )


    found.sort(
        key=lambda x: x[0]
    )


    return found


# =========================================================
# MAIN
# =========================================================

def main():

    print("")
    print(
        "=========================================="
    )
    print(
        " ANIIMO DATABASE BUILDER"
    )
    print(
        "=========================================="
    )
    print("")


    pages = find_aniimo()


    print(
        "Found",
        len(pages),
        "Aniimo pages."
    )


    if len(pages) < 80:

        raise RuntimeError(
            "Only "
            + str(len(pages))
            + " Aniimo pages found. "
            "Refusing to overwrite database."
        )


    output = []


    for index, (
        number,
        name,
        url
    ) in enumerate(
        pages,
        1
    ):

        print(
            f"[{index}/{len(pages)}] "
            f"NO.{number:03d} {name}"
        )


        try:

            item = parse_aniimo(
                url,
                name,
                number
            )


            output.append(
                item
            )


        except Exception as error:

            print(
                "  ERROR:",
                error
            )


            # Keep the record rather than
            # losing the Aniimo completely.

            output.append({

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
                    url,

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

                "traits":
                    [],

                "skills":
                    [],

                "analysis": {

                    "tags":
                        [],

                    "notes": [
                        "Page could not be parsed."
                    ]

                },

                "lastVerified":
                    time.strftime(
                        "%Y-%m-%d"
                    )

            })


        # Be polite to the Wiki.

        time.sleep(
            0.2
        )


    # -----------------------------------------------------
    # PORTRAIT CHECK
    # -----------------------------------------------------

    portrait_count = sum(
        1
        for item in output
        if item.get(
            "imageUrl"
        )
    )


    print("")
    print(
        "Portraits found:",
        portrait_count,
        "/",
        len(output)
    )


    if portrait_count < 20:

        raise RuntimeError(
            "Too few portraits were found. "
            "Database was NOT replaced."
        )


    # -----------------------------------------------------
    # WRITE
    # -----------------------------------------------------

    OUTPUT_FILE.write_text(
        json.dumps(
            output,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )


    print("")
    print(
        "=========================================="
    )
    print(
        " DATABASE COMPLETE"
    )
    print(
        " Aniimo:",
        len(output)
    )
    print(
        " Portraits:",
        portrait_count
    )
    print(
        " Output:",
        OUTPUT_FILE
    )
    print(
        "=========================================="
    )


if __name__ == "__main__":

    main()
