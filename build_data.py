#!/usr/bin/env python3

"""
ANIIMO TEAM BUILDER DATA BUILDER

Primary source:
https://wiki.aniimo.com/

Secondary source:
https://aniidex.com/

This script downloads the complete Aniimo roster and
writes it directly to:

aniimo.json

The website reads that exact file.
"""

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


# =========================================================
# CONFIGURATION
# =========================================================

ROOT = Path(__file__).resolve().parent

OUTPUT_FILE = ROOT / "aniimo.json"

OFFICIAL_INDEX = "https://wiki.aniimo.com/"

ANIIDEX_INDEX = "https://aniidex.com/aniimo/"

HEADERS = {
    "User-Agent":
        "Aniimo-Team-Builder/1.0 "
        "(fan project; automated data refresh)"
}


STAT_KEYS = [
    "HP",
    "BREAK",
    "ATK",
    "M.DEF",
    "P.DEF",
    "REGEN"
]


ROLE_MAP = {
    "DPS": "DPS",
    "HEAL": "Heal",
    "SUPPORT": "Support",
    "BREAK": "BREAK",
    "REGEN": "REGEN"
}


ELEMENT_MAP = {
    "fire": "Fire",
    "water": "Water",
    "grass": "Grass",
    "ice": "Ice",
    "dark": "Dark",
    "electric": "Lightning",
    "lightning": "Lightning",
    "rock": "Earth",
    "earth": "Earth",
    "wind": "Wind",
    "holy": "Light",
    "light": "Light"
}


# =========================================================
# HTTP
# =========================================================

def get_page(url):
    response = requests.get(
        url,
        headers=HEADERS,
        timeout=30
    )

    response.raise_for_status()

    return response.text


# =========================================================
# TEXT CLEANING
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

        if line == "Image":
            continue

        if line.startswith("Image:"):
            continue

        if line.startswith("[Image"):
            continue

        result.append(line)

    return result


# =========================================================
# NUMBER
# =========================================================

def extract_number(lines):

    for line in lines[:40]:

        match = re.search(
            r"NO\.\s*(\d+)",
            line,
            re.IGNORECASE
        )

        if match:
            return int(match.group(1))

    return None


# =========================================================
# NAME
# =========================================================

def extract_name(soup, lines):

    heading = soup.find("h1")

    if heading:

        name = heading.get_text(
            " ",
            strip=True
        )

        if name:
            return name


    for line in lines[:40]:

        if re.fullmatch(
            r"NO\.\s*\d+",
            line,
            re.IGNORECASE
        ):
            continue

        if line.lower() in [
            "official aniimo wiki",
            "aniimo wiki"
        ]:
            continue

        if len(line) > 1:
            return line


    return "Unknown"


# =========================================================
# IMAGE
# =========================================================

def extract_image(
    soup,
    page_url,
    name
):

    # -----------------------------------------------------
    # First choice: OpenGraph image
    # -----------------------------------------------------

    meta = soup.find(
        "meta",
        property="og:image"
    )

    if meta:

        content = meta.get("content")

        if content:

            return urljoin(
                page_url,
                content
            )


    # -----------------------------------------------------
    # Second choice: image whose alt contains the name
    # -----------------------------------------------------

    for image in soup.find_all("img"):

        alt = (
            image.get("alt") or ""
        ).lower()

        source = (
            image.get("src")
            or image.get("data-src")
            or ""
        )

        if (
            source
            and name.lower() in alt
        ):

            return urljoin(
                page_url,
                source
            )


    # -----------------------------------------------------
    # Third choice: first usable large image
    # -----------------------------------------------------

    for image in soup.find_all("img"):

        source = (
            image.get("src")
            or image.get("data-src")
            or ""
        )

        if source:

            return urljoin(
                page_url,
                source
            )


    return None


# =========================================================
# ELEMENTS
# =========================================================

def extract_elements(lines):

    elements = []

    for line in lines[:50]:

        value = (
            line
            .strip()
            .lower()
        )

        if value in ELEMENT_MAP:

            element = ELEMENT_MAP[value]

            if element not in elements:

                elements.append(element)


    return elements


# =========================================================
# ROLES
# =========================================================

def extract_roles(lines):

    roles = []

    for line in lines[:50]:

        value = (
            line
            .strip()
            .upper()
        )

        if value in ROLE_MAP:

            role = ROLE_MAP[value]

            if role not in roles:

                roles.append(role)


    return roles


# =========================================================
# STATS
# =========================================================

def extract_stats(lines):

    stats = {}

    for index, line in enumerate(lines):

        clean = (
            line
            .strip()
            .upper()
            .replace("：", ":")
        )


        # -------------------------------------------------
        # Format:
        #
        # HP:
        # 67
        #
        # -------------------------------------------------

        for key in STAT_KEYS:

            if clean == key + ":":

                if index + 1 < len(lines):

                    value_line = (
                        lines[index + 1]
                        .strip()
                    )

                    match = re.search(
                        r"(\d+(?:\.\d+)?)",
                        value_line
                    )

                    if match:

                        value = match.group(1)

                        if "." in value:

                            stats[key] = float(value)

                        else:

                            stats[key] = int(value)


        # -------------------------------------------------
        # Also support:
        #
        # HP: 67
        #
        # -------------------------------------------------

        for key in STAT_KEYS:

            pattern = (
                r"^"
                + re.escape(key)
                + r"\s*:\s*"
                r"(\d+(?:\.\d+)?)$"
            )

            match = re.match(
                pattern,
                clean
            )

            if match:

                value = match.group(1)

                if "." in value:

                    stats[key] = float(value)

                else:

                    stats[key] = int(value)


    return stats


# =========================================================
# FORMS
# =========================================================

def extract_forms(lines):

    forms = []

    try:

        start = lines.index(
            "Forms"
        )

    except ValueError:

        return forms


    for line in lines[
        start + 1:
        start + 30
    ]:

        if line in [
            "Basic Info",
            "Evolution",
            "Stats",
            "Traits & Passives"
        ]:

            break


        if (
            "Form" in line
            and len(line) < 80
        ):

            found = re.findall(
                r"[A-Z][A-Za-z ]+Form",
                line
            )

            for form in found:

                form = form.strip()

                if form not in forms:

                    forms.append(form)


    return forms


# =========================================================
# TRAITS
# =========================================================

def extract_traits(lines):

    traits = []

    try:

        start = lines.index(
            "Traits & Passives"
        )

    except ValueError:

        return traits


    try:

        end = lines.index(
            "Homeland Abilities"
        )

    except ValueError:

        try:

            end = lines.index(
                "Basic Attacks"
            )

        except ValueError:

            end = min(
                start + 30,
                len(lines)
            )


    section = lines[
        start + 1:
        end
    ]


    i = 0

    while i < len(section):

        line = section[i]


        # Skip obvious noise

        if (
            line.startswith("Lv ")
            or line.isdigit()
        ):

            i += 1

            continue


        # Trait names tend to be followed immediately
        # by their descriptions.

        if i + 1 < len(section):

            description = section[i + 1]

            if (
                len(line) < 100
                and len(description) > 5
            ):

                traits.append({
                    "name": line,
                    "description": description
                })

                i += 2

                continue


        i += 1


    return traits


# =========================================================
# SKILLS
# =========================================================

def extract_skills(lines):

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

        # -------------------------------------------------
        # Expected structure:
        #
        # Skill Name
        # Description
        # Element:
        # Type: Physical
        # Cost: 0
        # Power: 72
        #
        # -------------------------------------------------

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
                    flags=re.IGNORECASE
                )


            if i + 4 < len(section):

                cost = re.sub(
                    r"^Cost:\s*",
                    "",
                    section[i + 4],
                    flags=re.IGNORECASE
                )


            if i + 5 < len(section):

                if section[i + 5].lower().startswith(
                    "power:"
                ):

                    power = re.sub(
                        r"^Power:\s*",
                        "",
                        section[i + 5],
                        flags=re.IGNORECASE
                    )

                    i += 6

                else:

                    i += 5

            else:

                i += 5


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


            continue


        i += 1


    return skills


# =========================================================
# ANALYSIS TAGS
# =========================================================

def make_tags(text):

    rules = {

        "attack_up":
            r"increase.*(?:attack|damage)|"
            r"increases.*damage|"
            r"increased.*damage",

        "defense_down":
            r"reduce.*(?:defen|defence)|"
            r"defense down|"
            r"defence down|"
            r"damage taken.*increase",

        "debuff":
            r"debuff|curse|mark|"
            r"weakness|"
            r"paraly|silence|stun|"
            r"freeze|slow",

        "break_support":
            r"break damage|"
            r"break.*taken|"
            r"increases.*break|"
            r"stagger",

        "heal":
            r"heal|healing|"
            r"restores? HP|"
            r"restore.*HP",

        "regen":
            r"regen|energy|EP|"
            r"restor.*energy|"
            r"reduces? the EP cost",

        "shield":
            r"shield|damage reduction",

        "control":
            r"stun|silence|paraly|"
            r"pull|slow|freeze|immobil",

        "burst":
            r"massive|heavy|"
            r"bonus damage|"
            r"extra damage",

        "self_scaling":
            r"stack|stacking|"
            r"each hit|critical"

    }


    tags = []


    for tag, pattern in rules.items():

        if re.search(
            pattern,
            text,
            re.IGNORECASE
        ):

            tags.append(tag)


    return sorted(
        set(tags)
    )


# =========================================================
# PARSE ONE ANIIMO
# =========================================================

def parse_aniimo(
    url,
    fallback_name=None,
    fallback_number=None
):

    print(
        "Downloading:",
        url
    )


    html = get_page(url)

    soup = BeautifulSoup(
        html,
        "html.parser"
    )


    text = soup.get_text(
        "\n"
    )


    lines = clean_lines(
        text
    )


    number = (
        extract_number(lines)
        or fallback_number
    )


    name = (
        extract_name(
            soup,
            lines
        )
        or fallback_name
        or "Unknown"
    )


    image = extract_image(
        soup,
        url,
        name
    )


    elements = extract_elements(
        lines
    )


    roles = extract_roles(
        lines
    )


    stats = extract_stats(
        lines
    )


    forms = extract_forms(
        lines
    )


    traits = extract_traits(
        lines
    )


    skills = extract_skills(
        lines
    )


    all_text = " ".join(
        lines
    )


    trait = (
        traits[0]
        if traits
        else None
    )


    number_string = (
        str(number)
        if number is not None
        else str(
            fallback_number or ""
        )
    )


    if (
        number is not None
        and number < 1000
    ):

        number_string = (
            f"{number:03d}"
        )


    return {

        "id":
            number,

        "name":
            name,

        "number":
            number_string,

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
            forms,

        "trait":
            trait,

        "traits":
            traits,

        "skills":
            skills,

        "analysis": {

            "tags":
                make_tags(
                    all_text
                ),

            "notes":
                []

        },

        "lastVerified":
            time.strftime(
                "%Y-%m-%d"
            )

    }


# =========================================================
# MAIN
# =========================================================

def main():

    print("")
    print(
        "=========================================="
    )
    print(
        " ANIIMO TEAM BUILDER DATA REFRESH"
    )
    print(
        "=========================================="
    )
    print("")


    print(
        "Downloading official Aniimo index..."
    )


    html = get_page(
        OFFICIAL_INDEX
    )


    soup = BeautifulSoup(
        html,
        "html.parser"
    )


    links = []

    seen = set()


    for anchor in soup.find_all(
        "a",
        href=True
    ):

        href = urljoin(
            OFFICIAL_INDEX,
            anchor["href"]
        )


        if "/item/" not in href:

            continue


        text = anchor.get_text(
            " ",
            strip=True
        )


        match = re.search(
            r"NO\.\s*(\d+)",
            text,
            re.IGNORECASE
        )


        number = (
            int(match.group(1))
            if match
            else None
        )


        name = re.sub(
            r"^NO\.\s*\d+\s*",
            "",
            text,
            flags=re.IGNORECASE
        ).strip()


        if not name:

            continue


        key = (
            number,
            name.lower()
        )


        if key in seen:

            continue


        seen.add(key)


        links.append(
            (
                href,
                name,
                number
            )
        )


    print(
        f"Found {len(links)} Aniimo pages."
    )


    if len(links) < 80:

        raise RuntimeError(
            "The official Wiki returned "
            "too few Aniimo pages. "
            "Data refresh aborted so we "
            "don't overwrite good data."
        )


    output = []


    for index, (
        url,
        name,
        number
    ) in enumerate(
        links,
        start=1
    ):

        print(
            f"[{index}/{len(links)}] "
            f"{name}"
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
                "ERROR:",
                error
            )


            # Preserve the Aniimo in the
            # database even if one page fails.

            output.append({

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
                        "Refresh error: "
                        + str(error)
                    ]

                },

                "lastVerified":
                    time.strftime(
                        "%Y-%m-%d"
                    )

            })


        time.sleep(
            0.15
        )


    # Sort numerically

    output.sort(
        key=lambda item:
            int(
                item.get(
                    "id"
                ) or 999999
            )
    )


    # -----------------------------------------------------
    # SAFETY CHECK
    # -----------------------------------------------------

    valid = [
        item
        for item in output
        if item.get("name")
    ]


    if len(valid) < 80:

        raise RuntimeError(
            "Refresh produced too few valid Aniimo. "
            "Existing aniimo.json was NOT replaced."
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
        f"Successfully wrote {len(output)} Aniimo."
    )
    print(
        f"File: {OUTPUT_FILE}"
    )
    print(
        "=========================================="
    )


if __name__ == "__main__":

    main()
