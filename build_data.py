#!/usr/bin/env python3

"""
Aniimo Team Builder - Data Builder

Builds the Aniimo database from the Official Aniimo Wiki.

Primary source:
    https://wiki.aniimo.com/

Secondary source:
    https://aniidex.com/

IMPORTANT:
- The official individual Aniimo page is authoritative for names.
- We deliberately ignore the generic Wiki page title.
- We prefer Wiki_Aniimo portrait images.
- We write aniimo.json into the repository root.
"""

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


# ============================================================
# CONFIGURATION
# ============================================================

ROOT = Path(__file__).resolve().parent

OUTPUT_FILE = ROOT / "aniimo.json"

INDEX_URL = "https://wiki.aniimo.com/"

ANIIDEX_URL = "https://aniidex.com/aniimo/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(compatible; AniimoTeamBuilder/1.0; "
        "fan project data refresh)"
    )
}

ELEMENTS = [
    "holy",
    "light",
    "fire",
    "ice",
    "dark",
    "electric",
    "lightning",
    "grass",
    "water",
    "rock",
    "earth",
    "wind",
]

ROLES = [
    "DPS",
    "Heal",
    "Support",
    "BREAK",
    "REGEN",
]

STAT_KEYS = [
    "HP",
    "BREAK",
    "ATK",
    "M.DEF",
    "P.DEF",
    "REGEN",
]


# ============================================================
# HTTP
# ============================================================

def get(url, timeout=30):

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=timeout
    )

    response.raise_for_status()

    return response.text


# ============================================================
# TEXT CLEANING
# ============================================================

def clean_text(text):

    if text is None:
        return ""

    text = re.sub(
        r"\s+",
        " ",
        str(text)
    )

    return text.strip()


def clean_lines(text):

    output = []

    for line in text.splitlines():

        line = clean_text(line)

        if not line:
            continue

        if line == "Image":
            continue

        if line.startswith("Image:"):
            continue

        output.append(line)

    return output


# ============================================================
# ELEMENTS
# ============================================================

def canonical_element(value):

    value = clean_text(value).lower()

    mapping = {

        "holy": "Light",
        "light": "Light",

        "electric": "Lightning",
        "lightning": "Lightning",

        "rock": "Earth",
        "earth": "Earth",

        "fire": "Fire",
        "ice": "Ice",
        "dark": "Dark",
        "grass": "Grass",
        "water": "Water",
        "wind": "Wind",
    }

    return mapping.get(value)


def extract_elements(lines):

    elements = []

    for line in lines:

        element = canonical_element(line)

        if element and element not in elements:

            elements.append(element)

    return elements


# ============================================================
# ROLES
# ============================================================

def extract_roles(lines):

    roles = []

    for line in lines:

        upper = clean_text(line).upper()

        if upper not in ROLES:
            continue

        if upper == "BREAK":
            role = "Break"

        elif upper == "REGEN":
            role = "Regen"

        else:
            role = upper.title()

        if role not in roles:
            roles.append(role)

    return roles


# ============================================================
# NAME
# ============================================================

def extract_name(soup, lines, fallback_name=None):

    """
    The official Wiki uses a generic page title:

        Official Aniimo Wiki - Complete Aniimo Index

    Therefore we MUST NOT use h1 as the Aniimo name.

    Individual pages contain:

        NO.001

        Emberpup

    so we locate the actual Aniimo heading.
    """

    generic_names = {
        "official aniimo wiki",
        "official aniimo wiki - complete aniimo index",
        "complete aniimo index",
        "official aniimo index",
        "aniimo wiki",
    }

    # --------------------------------------------------------
    # 1. Prefer H2/H3/H4 headings.
    # --------------------------------------------------------

    for heading in soup.find_all(
        ["h2", "h3", "h4"]
    ):

        value = clean_text(
            heading.get_text(
                " ",
                strip=True
            )
        )

        if not value:
            continue

        lower = value.lower()

        if lower in generic_names:
            continue

        if re.fullmatch(
            r"NO\.?\s*\d+",
            value,
            re.IGNORECASE
        ):
            continue

        if len(value) > 60:
            continue

        return value

    # --------------------------------------------------------
    # 2. Look at visible lines after NO.XXX.
    # --------------------------------------------------------

    for index, line in enumerate(lines):

        if re.fullmatch(
            r"NO\.?\s*\d+",
            line,
            re.IGNORECASE
        ):

            # The Wiki currently repeats NO.XXX,
            # then gives the Aniimo name.

            for next_index in range(
                index + 1,
                min(index + 6, len(lines))
            ):

                candidate = clean_text(
                    lines[next_index]
                )

                if not candidate:
                    continue

                if re.fullmatch(
                    r"NO\.?\s*\d+",
                    candidate,
                    re.IGNORECASE
                ):
                    continue

                if candidate.lower() in generic_names:
                    continue

                if len(candidate) <= 60:
                    return candidate

    # --------------------------------------------------------
    # 3. Fallback.
    # --------------------------------------------------------

    if fallback_name:

        fallback_name = clean_text(
            fallback_name
        )

        if (
            fallback_name.lower()
            not in generic_names
        ):

            fallback_name = re.sub(
                r"^NO\.?\s*\d+\s*",
                "",
                fallback_name,
                flags=re.IGNORECASE
            ).strip()

            if fallback_name:
                return fallback_name

    return "Unknown Aniimo"


# ============================================================
# NUMBER
# ============================================================

def extract_number(lines, fallback_number=None):

    for line in lines[:30]:

        match = re.search(
            r"NO\.?\s*(\d+)",
            line,
            re.IGNORECASE
        )

        if match:

            return int(
                match.group(1)
            )

    return fallback_number


# ============================================================
# PORTRAIT
# ============================================================

def is_bad_image(url):

    if not url:
        return True

    lower = url.lower()

    bad_words = [
        "undefined",
        "ogimage",
        "pethead",
        "icon",
        "logo",
        "favicon",
        "background",
        "loading",
    ]

    for word in bad_words:

        if word in lower:
            return True

    return False


def extract_image_url(soup, page_url):

    """
    IMPORTANT:

    The official Aniimo page contains several images.

    We DO NOT use og:image first.

    We specifically search for:

        Wiki_Aniimo_XXXXX.png

    because that is the actual Aniimo portrait.

    Example:

        Emberpup
        Wiki_Aniimo_10051.png
    """

    candidates = []

    def add_candidate(source):

        if not source:
            return

        source = str(source).strip()

        if not source:
            return

        if source.startswith("data:"):
            return

        absolute = urljoin(
            page_url,
            source
        )

        if is_bad_image(absolute):
            return

        if absolute not in candidates:
            candidates.append(absolute)

    # --------------------------------------------------------
    # 1. Images in the page.
    # --------------------------------------------------------

    for image in soup.find_all("img"):

        sources = []

        sources.append(
            image.get("src")
        )

        sources.append(
            image.get("data-src")
        )

        sources.append(
            image.get("data-original")
        )

        sources.append(
            image.get("data-lazy-src")
        )

        srcset = image.get("srcset")

        if srcset:

            for item in srcset.split(","):

                item = item.strip()

                if item:

                    sources.append(
                        item.split()[0]
                    )

        for source in sources:

            add_candidate(source)

    # --------------------------------------------------------
    # 2. Direct image links.
    # --------------------------------------------------------

    for anchor in soup.find_all(
        "a",
        href=True
    ):

        href = anchor.get("href")

        if not href:
            continue

        lower = href.lower()

        if any(
            lower.endswith(extension)
            for extension in [
                ".png",
                ".jpg",
                ".jpeg",
                ".webp"
            ]
        ):

            add_candidate(href)

    # --------------------------------------------------------
    # 3. HIGHEST PRIORITY:
    # Wiki_Aniimo_XXXXX
    # --------------------------------------------------------

    for image_url in candidates:

        filename = image_url.lower().split("/")[-1]

        if (
            "wiki_aniimo_" in filename
            and not is_bad_image(image_url)
        ):

            return image_url

    # --------------------------------------------------------
    # 4. Look for the exact Aniimo image in image URLs.
    # --------------------------------------------------------

    for image_url in candidates:

        lower = image_url.lower()

        if (
            "wiki_stage" in lower
            and "aniimo" in lower
            and not is_bad_image(image_url)
        ):

            return image_url

    # --------------------------------------------------------
    # 5. Try the first non-bad official CDN image.
    # --------------------------------------------------------

    for image_url in candidates:

        lower = image_url.lower()

        if (
            "worldx-website-cdn.aniimo.com"
            in lower
        ):

            return image_url

    # --------------------------------------------------------
    # 6. AniDex fallback.
    # --------------------------------------------------------

    return None


# ============================================================
# STATS
# ============================================================

def extract_stats(lines):

    stats = {}

    joined = "\n".join(lines)

    for key in STAT_KEYS:

        pattern = (
            re.escape(key)
            + r"\s*:\s*"
            + r"(\d+(?:\.\d+)?)"
        )

        match = re.search(
            pattern,
            joined,
            re.IGNORECASE
        )

        if not match:
            continue

        value = match.group(1)

        if "." in value:

            stats[key] = float(value)

        else:

            stats[key] = int(value)

    return stats


# ============================================================
# FORMS
# ============================================================

def extract_forms(lines):

    forms = []

    for line in lines:

        matches = re.findall(
            r"\b[A-Z][A-Za-z ]+Form\b",
            line
        )

        for form in matches:

            form = clean_text(form)

            if form and form not in forms:

                forms.append(form)

    return forms


# ============================================================
# TRAITS
# ============================================================

def extract_traits(lines):

    traits = []

    for index, line in enumerate(lines):

        if line != "Trait":
            continue

        # The current Wiki normally has:
        #
        # Trait
        # image
        # Trait Name
        # Description

        chunk = lines[
            index + 1:
            index + 8
        ]

        useful = []

        for value in chunk:

            if value in [
                "Skill Details",
                "Combat",
                "Innate",
            ]:
                break

            if value:
                useful.append(value)

        if useful:

            # Remove obvious UI-only text.
            useful = [
                x for x in useful
                if x.lower()
                not in {
                    "image",
                    "view illustration"
                }
            ]

        if useful:

            trait_name = useful[0]

            description = " ".join(
                useful[1:]
            )

            traits.append(
                {
                    "name": trait_name,
                    "description": description
                }
            )

        break

    return traits


# ============================================================
# SKILLS
# ============================================================

def extract_skills(lines):

    skills = []

    if "Skill Details" not in lines:
        return skills

    start = lines.index(
        "Skill Details"
    ) + 1

    end = len(lines)

    if "TOP" in lines[start:]:

        end = lines.index(
            "TOP",
            start
        )

    section = lines[
        start:end
    ]

    i = 0

    while i < len(section):

        current = clean_text(
            section[i]
        )

        if not current:
            i += 1
            continue

        # Ignore UI labels.
        if current in {
            "Combat",
            "Innate",
            "Image",
            "Element:",
        }:
            i += 1
            continue

        # ----------------------------------------------------
        # Look ahead for a skill description.
        # ----------------------------------------------------

        if i + 1 >= len(section):

            i += 1
            continue

        description = clean_text(
            section[i + 1]
        )

        if not description:

            i += 1
            continue

        # ----------------------------------------------------
        # Find Element / Type / Cost / Power.
        # ----------------------------------------------------

        element = ""
        skill_type = ""
        cost = ""
        power = ""

        j = i + 2

        while j < len(section):

            line = clean_text(
                section[j]
            )

            if line == "Element:":

                if j + 1 < len(section):

                    possible = clean_text(
                        section[j + 1]
                    )

                    # Empty Element: is common
                    # on the current Wiki.
                    if (
                        possible
                        and not possible.startswith(
                            "Type:"
                        )
                    ):

                        element = possible

                j += 1
                continue

            if line.startswith("Type:"):

                skill_type = re.sub(
                    r"^Type:\s*",
                    "",
                    line,
                    flags=re.IGNORECASE
                )

                j += 1
                continue

            if line.startswith("Cost:"):

                cost = re.sub(
                    r"^Cost:\s*",
                    "",
                    line,
                    flags=re.IGNORECASE
                )

                j += 1
                continue

            if line.startswith("Power:"):

                power = re.sub(
                    r"^Power:\s*",
                    "",
                    line,
                    flags=re.IGNORECASE
                )

                j += 1
                break

            # A new skill name usually begins
            # after the Power line, so stop if
            # we encounter another likely heading.
            if (
                line
                and not line.startswith(
                    (
                        "Element:",
                        "Type:",
                        "Cost:",
                        "Power:"
                    )
                )
                and j > i + 2
            ):

                break

            j += 1

        # ----------------------------------------------------
        # Only save if this looks like a real skill.
        # ----------------------------------------------------

        if (
            current
            and description
            and (
                skill_type
                or cost
                or power
            )
        ):

            skills.append(
                {
                    "name": current,
                    "description": description,
                    "element": element,
                    "type": skill_type,
                    "cost": cost,
                    "power": power
                }
            )

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

def tags_for(text):

    rules = {

        "attack_up":
            r"increase.*(?:attack|damage)"
            r"|increases.*damage"
            r"|increased.*damage",

        "defense_down":
            r"reduce.*(?:defen|defence)"
            r"|defense down"
            r"|defence down"
            r"|damage taken.*increase",

        "debuff":
            r"debuff|curse|mark|weakness"
            r"|reducing.*healing"
            r"|paraly|silence|stun|freeze|slow",

        "break":
            r"break damage"
            r"|break.*taken"
            r"|increases.*break"
            r"|stagger",

        "heal":
            r"heal|healing"
            r"|restores? HP"
            r"|restore.*HP",

        "regen":
            r"regen|energy|EP"
            r"|restor.*energy"
            r"|reduces? the EP cost",

        "shield":
            r"shield|damage reduction",

        "control":
            r"stun|silence|paraly"
            r"|pull|slow|freeze|immobil",

        "burst":
            r"massive|heavy|bonus damage"
            r"|extra damage|ultimate",

        "self_scaling":
            r"stack|stacking|each hit|critical",
    }

    found = []

    for tag, pattern in rules.items():

        if re.search(
            pattern,
            text,
            re.IGNORECASE
        ):

            found.append(tag)

    for element in [
        "Fire",
        "Water",
        "Grass",
        "Lightning",
        "Earth",
        "Wind",
        "Dark",
        "Ice",
        "Light",
    ]:

        pattern = (
            element
            + r"\s+(?:damage|debuff)"
        )

        if re.search(
            pattern,
            text,
            re.IGNORECASE
        ):

            found.append(
                element.lower()
                + "_synergy"
            )

    return sorted(
        set(found)
    )


# ============================================================
# PARSE INDIVIDUAL ANIIMO PAGE
# ============================================================

def parse_item(
    url,
    fallback_name=None,
    fallback_number=None
):

    html = get(url)

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

    # --------------------------------------------------------
    # NUMBER
    # --------------------------------------------------------

    number = extract_number(
        lines,
        fallback_number
    )

    # --------------------------------------------------------
    # NAME
    # --------------------------------------------------------

    name = extract_name(
        soup,
        lines,
        fallback_name
    )

    # --------------------------------------------------------
    # PORTRAIT
    # --------------------------------------------------------

    image = extract_image_url(
        soup,
        url
    )

    # --------------------------------------------------------
    # ELEMENTS
    # --------------------------------------------------------

    elements = extract_elements(
        lines[:45]
    )

    # --------------------------------------------------------
    # ROLES
    # --------------------------------------------------------

    roles = extract_roles(
        lines[:45]
    )

    # --------------------------------------------------------
    # STATS
    # --------------------------------------------------------

    stats = extract_stats(
        lines
    )

    # --------------------------------------------------------
    # FORMS
    # --------------------------------------------------------

    forms = extract_forms(
        lines[:80]
    )

    # --------------------------------------------------------
    # TRAITS
    # --------------------------------------------------------

    traits = extract_traits(
        lines
    )

    trait = (
        traits[0]
        if traits
        else None
    )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    skills = extract_skills(
        lines
    )

    # --------------------------------------------------------
    # TAGS
    # --------------------------------------------------------

    all_text = " ".join(
        lines
    )

    tags = tags_for(
        all_text
    )

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {

        "id": number,

        "name": name,

        "number": (
            f"{int(number):03d}"
            if number
            and int(number) < 1000
            else str(
                number
                or fallback_number
                or ""
            )
        ),

        "sourceUrl": url,

        "imageUrl": image,

        "elements": elements,

        "roles": roles,

        "stats": stats,

        "forms": forms,

        "trait": trait,

        "traits": traits,

        "skills": skills,

        "analysis": {
            "tags": tags,
            "notes": []
        },

        "lastVerified":
            time.strftime(
                "%Y-%m-%d"
            )
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print(
        "============================================"
    )

    print(
        "Aniimo Team Builder Data Refresh"
    )

    print(
        "============================================"
    )

    print()

    print(
        "Downloading official Aniimo index..."
    )

    soup = BeautifulSoup(
        get(INDEX_URL),
        "html.parser"
    )

    links = []

    seen_urls = set()

    # --------------------------------------------------------
    # Find official Aniimo item pages.
    # --------------------------------------------------------

    for anchor in soup.find_all(
        "a",
        href=True
    ):

        href = urljoin(
            INDEX_URL,
            anchor["href"]
        )

        path = urlparse(
            href
        ).path

        if "/item/" not in path:
            continue

        if href in seen_urls:
            continue

        seen_urls.add(
            href
        )

        text = clean_text(
            anchor.get_text(
                " ",
                strip=True
            )
        )

        number_match = re.search(
            r"NO\.?\s*(\d+)",
            text,
            re.IGNORECASE
        )

        number = (
            int(number_match.group(1))
            if number_match
            else None
        )

        name = re.sub(
            r"^NO\.?\s*\d+\s*",
            "",
            text,
            flags=re.IGNORECASE
        ).strip()

        # Do NOT allow the generic Wiki title
        # to become the fallback Aniimo name.

        generic_names = {
            "",
            "Official Aniimo Wiki",
            "Official Aniimo Wiki - Complete Aniimo Index",
            "Complete Aniimo Index",
        }

        if name in generic_names:
            name = None

        links.append(
            (
                href,
                name,
                number
            )
        )

    # --------------------------------------------------------
    # Deduplicate by Aniimo number.
    # --------------------------------------------------------

    by_number = {}

    for url, name, number in links:

        if number is None:
            continue

        if number not in by_number:

            by_number[number] = (
                url,
                name,
                number
            )

    ordered_links = list(
        by_number.values()
    )

    ordered_links.sort(
        key=lambda item:
        item[2]
    )

    print(
        f"Found {len(ordered_links)} Aniimo pages."
    )

    print()

    output = []

    # --------------------------------------------------------
    # Download each Aniimo.
    # --------------------------------------------------------

    for index, (
        url,
        fallback_name,
        number
    ) in enumerate(
        ordered_links,
        1
    ):

        print(
            f"[{index}/{len(ordered_links)}] "
            f"NO.{number:03d}"
        )

        try:

            aniimo = parse_item(
                url,
                fallback_name,
                number
            )

            print(
                f"    Name: "
                f"{aniimo['name']}"
            )

            if aniimo.get(
                "imageUrl"
            ):

                print(
                    "    Portrait: YES"
                )

            else:

                print(
                    "    Portrait: NO"
                )

            output.append(
                aniimo
            )

        except Exception as error:

            print(
                f"    ERROR: {error}"
            )

            output.append(
                {
                    "id": number,

                    "name":
                        fallback_name
                        or "Unknown Aniimo",

                    "number":
                        f"{number:03d}",

                    "sourceUrl":
                        url,

                    "imageUrl":
                        None,

                    "elements": [],

                    "roles": [],

                    "stats": {},

                    "forms": [],

                    "trait": None,

                    "traits": [],

                    "skills": [],

                    "analysis": {
                        "tags": [],
                        "notes": [
                            "Refresh error: "
                            + str(error)
                        ]
                    },

                    "lastVerified":
                        time.strftime(
                            "%Y-%m-%d"
                        )
                }
            )

        time.sleep(
            0.15
        )

    # --------------------------------------------------------
    # Sort by Aniimo number.
    # --------------------------------------------------------

    output.sort(
        key=lambda item:
        int(
            item.get(
                "id",
                99999
            )
            or 99999
        )
    )

    # --------------------------------------------------------
    # SANITY CHECKS
    # --------------------------------------------------------

    print()
    print(
        "Running sanity checks..."
    )

    emberpup = None

    for item in output:

        if int(
            item.get(
                "id",
                0
            )
            or 0
        ) == 1:

            emberpup = item
            break

    if emberpup is None:

        raise RuntimeError(
            "Sanity check failed: "
            "Aniimo #001 was not found."
        )

    if (
        emberpup.get(
            "name",
            ""
        ).strip().lower()
        != "emberpup"
    ):

        raise RuntimeError(
            "Sanity check failed: "
            "#001 is "
            + repr(
                emberpup.get(
                    "name"
                )
            )
            + " instead of Emberpup."
        )

    ember_image = (
        emberpup.get(
            "imageUrl"
        )
        or ""
    )

    if (
        "Wiki_Aniimo_"
        not in ember_image
    ):

        raise RuntimeError(
            "Sanity check failed: "
            "#001 does not have "
            "the official Aniimo portrait."
        )

    if len(output) < 20:

        raise RuntimeError(
            "Sanity check failed: "
            "fewer than 20 Aniimo "
            "were downloaded."
        )

    print(
        "Sanity checks PASSED."
    )

    print(
        f"#001 = {emberpup['name']}"
    )

    print(
        f"#001 portrait = "
        f"{ember_image}"
    )

    print()

    # --------------------------------------------------------
    # WRITE JSON
    # --------------------------------------------------------

    OUTPUT_FILE.write_text(
        json.dumps(
            output,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )

    print(
        "============================================"
    )

    print(
        f"Wrote {len(output)} Aniimo to:"
    )

    print(
        OUTPUT_FILE
    )

    print(
        "============================================"
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()
