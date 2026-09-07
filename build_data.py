#!/usr/bin/env python3

"""
Aniimo Team Builder - Official Wiki Data Builder

Builds aniimo.json from:
    https://wiki.aniimo.com/

Extracts:

- Aniimo name / number
- Official portrait
- Element
- Roles
- Total Attribute Score
- HP
- BREAK
- ATK
- M.DEF
- P.DEF
- REGEN
- Forms
- Habitats
- Homeland Ability
- Mobility
- Trait
- Skill Details
- Skill images
- Analysis tags
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

ROLES = [
    "DPS",
    "HEAL",
    "SUPPORT",
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
# TEXT HELPERS
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


def unique_list(values):

    result = []

    for value in values:

        value = clean_text(value)

        if value and value not in result:
            result.append(value)

    return result


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

def extract_name(
    soup,
    lines,
    fallback_name=None
):

    generic_names = {
        "official aniimo wiki",
        "official aniimo wiki - complete aniimo index",
        "complete aniimo index",
        "official aniimo index",
        "aniimo wiki",
    }

    # --------------------------------------------------------
    # Prefer actual headings.
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
    # Look after NO.XXX.
    # --------------------------------------------------------

    for index, line in enumerate(lines):

        if re.fullmatch(
            r"NO\.?\s*\d+",
            line,
            re.IGNORECASE
        ):

            for next_index in range(
                index + 1,
                min(index + 8, len(lines))
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

    if fallback_name:

        fallback_name = clean_text(
            fallback_name
        )

        fallback_name = re.sub(
            r"^NO\.?\s*\d+\s*",
            "",
            fallback_name,
            flags=re.IGNORECASE
        ).strip()

        if (
            fallback_name
            and fallback_name.lower()
            not in generic_names
        ):

            return fallback_name

    return "Unknown Aniimo"


# ============================================================
# NUMBER
# ============================================================

def extract_number(
    lines,
    fallback_number=None
):

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
# IMAGE HELPERS
# ============================================================

def is_bad_image(url):

    if not url:
        return True

    lower = url.lower()

    bad_words = [
        "undefined",
        "ogimage",
        "pethead",
        "favicon",
        "logo",
        "background",
        "loading",
    ]

    return any(
        word in lower
        for word in bad_words
    )


def absolute_image_url(
    source,
    page_url
):

    if not source:
        return None

    source = str(source).strip()

    if not source:
        return None

    if source.startswith("data:"):
        return None

    return urljoin(
        page_url,
        source
    )


def extract_image_url(
    soup,
    page_url
):

    candidates = []

    def add_candidate(source):

        absolute = absolute_image_url(
            source,
            page_url
        )

        if not absolute:
            return

        if is_bad_image(absolute):
            return

        if absolute not in candidates:
            candidates.append(absolute)

    # --------------------------------------------------------
    # Images.
    # --------------------------------------------------------

    for image in soup.find_all("img"):

        sources = [
            image.get("src"),
            image.get("data-src"),
            image.get("data-original"),
            image.get("data-lazy-src"),
        ]

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
    # Linked images.
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
    # Highest priority:
    # Wiki_Aniimo
    # --------------------------------------------------------

    for image_url in candidates:

        filename = (
            image_url
            .lower()
            .split("/")[-1]
        )

        if (
            "wiki_aniimo_" in filename
            and not is_bad_image(image_url)
        ):

            return image_url

    # --------------------------------------------------------
    # Official Wiki stage image.
    # --------------------------------------------------------

    for image_url in candidates:

        lower = image_url.lower()

        if (
            "wiki_stage" in lower
            and "aniimo" in lower
        ):

            return image_url

    # --------------------------------------------------------
    # Official CDN fallback.
    # --------------------------------------------------------

    for image_url in candidates:

        if (
            "worldx-website-cdn.aniimo.com"
            in image_url.lower()
        ):

            return image_url

    return None


# ============================================================
# ATTRIBUTE SCORE
# ============================================================

def extract_attribute_score(lines):

    """
    Current Wiki:

        Attributes：371

    Also supports:

        Attributes: 371
        Attribute Score: 371
    """

    patterns = [

        r"Attributes\s*[：:]\s*(\d+(?:\.\d+)?)",

        r"Attribute\s*Score\s*[：:]\s*(\d+(?:\.\d+)?)",

        r"Total\s*Attributes?\s*[：:]\s*(\d+(?:\.\d+)?)",

    ]

    joined = "\n".join(lines)

    for pattern in patterns:

        match = re.search(
            pattern,
            joined,
            re.IGNORECASE
        )

        if match:

            value = match.group(1)

            if "." in value:
                return float(value)

            return int(value)

    # --------------------------------------------------------
    # Separate-line fallback.
    # --------------------------------------------------------

    for index, line in enumerate(lines):

        if re.fullmatch(
            r"Attributes?\s*[：:]?",
            line,
            re.IGNORECASE
        ):

            for next_index in range(
                index + 1,
                min(index + 3, len(lines))
            ):

                value = clean_text(
                    lines[next_index]
                )

                if re.fullmatch(
                    r"\d+(?:\.\d+)?",
                    value
                ):

                    return (
                        float(value)
                        if "." in value
                        else int(value)
                    )

    return None


# ============================================================
# STATS
# ============================================================

def extract_stats(lines):

    stats = {}

    stat_pattern = re.compile(
        r"^(HP|BREAK|ATK|M\.DEF|P\.DEF|REGEN)\s*[：:]?$",
        re.IGNORECASE
    )

    # --------------------------------------------------------
    # Current Wiki separate-line format.
    # --------------------------------------------------------

    for index, line in enumerate(lines):

        current = clean_text(line)

        match = stat_pattern.fullmatch(
            current
        )

        if not match:
            continue

        key = match.group(1).upper()

        for next_index in range(
            index + 1,
            min(index + 5, len(lines))
        ):

            possible = clean_text(
                lines[next_index]
            )

            if not possible:
                continue

            if stat_pattern.fullmatch(
                possible
            ):
                break

            value_match = re.fullmatch(
                r"(\d+(?:\.\d+)?)",
                possible
            )

            if value_match:

                value = value_match.group(1)

                stats[key] = (
                    float(value)
                    if "." in value
                    else int(value)
                )

                break

    # --------------------------------------------------------
    # Inline fallback.
    # --------------------------------------------------------

    joined = "\n".join(lines)

    for key in STAT_KEYS:

        if key in stats:
            continue

        pattern = (
            re.escape(key)
            + r"\s*[：:]\s*"
            + r"(\d+(?:\.\d+)?)"
        )

        match = re.search(
            pattern,
            joined,
            re.IGNORECASE
        )

        if match:

            value = match.group(1)

            stats[key] = (
                float(value)
                if "." in value
                else int(value)
            )

    return stats


# ============================================================
# FORMS
# ============================================================

def extract_forms(
    soup,
    lines,
    page_url
):

    """
    IMPORTANT:

    Forms are returned as OBJECTS rather than strings.

    Example:

        {
            "name": "Basic Form",
            "url": "...",
            "imageUrl": "..."
        }

    This allows app.js to switch forms later.
    """

    forms = []

    # --------------------------------------------------------
    # Find form links.
    # --------------------------------------------------------

    for anchor in soup.find_all(
        "a",
        href=True
    ):

        name = clean_text(
            anchor.get_text(
                " ",
                strip=True
            )
        )

        if not name:
            continue

        if not re.search(
            r"\bForm\b",
            name,
            re.IGNORECASE
        ):
            continue

        href = urljoin(
            page_url,
            anchor["href"]
        )

        if not href:
            continue

        # ----------------------------------------------------
        # Try to obtain an image belonging to this form.
        # ----------------------------------------------------

        image_url = None

        image = anchor.find("img")

        if image:

            image_url = absolute_image_url(
                image.get("src")
                or image.get("data-src"),
                page_url
            )

        form = {
            "name": name,
            "url": href,
            "imageUrl": image_url,
            "stats": {},
            "attributeScore": None,
            "elements": [],
            "roles": [],
            "traits": [],
            "trait": None,
            "skills": [],
            "habitats": [],
            "homelandAbility": None,
            "mobility": None,
        }

        # Prevent duplicate forms.
        if not any(
            existing["name"] == name
            and existing["url"] == href
            for existing in forms
        ):

            forms.append(form)

    # --------------------------------------------------------
    # Text-only fallback.
    # --------------------------------------------------------

    if not forms:

        for line in lines:

            value = clean_text(line)

            if not re.fullmatch(
                r"[A-Za-z][A-Za-z0-9 '&-]*Form",
                value,
                re.IGNORECASE
            ):
                continue

            if value.lower() in {
                "form",
                "view form",
            }:
                continue

            forms.append(
                {
                    "name": value,
                    "url": None,
                    "imageUrl": None,
                    "stats": {},
                    "attributeScore": None,
                    "elements": [],
                    "roles": [],
                    "traits": [],
                    "trait": None,
                    "skills": [],
                    "habitats": [],
                    "homelandAbility": None,
                    "mobility": None,
                }
            )

    return forms


# ============================================================
# HABITATS
# ============================================================

def extract_habitats(lines):

    habitats = []

    try:
        start = lines.index(
            "Habitats"
        )
    except ValueError:
        return habitats

    for line in lines[
        start + 1:
        start + 5
    ]:

        value = clean_text(line)

        if not value:
            continue

        if value in {
            "Homeland Ability",
            "Mobility",
            "Trait",
            "Skill Details",
        }:
            break

        # Current Wiki can put several habitats
        # on one line.
        parts = re.split(
            r"\s+(?=[A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*)*\.)",
            value
        )

        if len(parts) == 1:

            parts = re.split(
                r"\s{2,}",
                value
            )

        for part in parts:

            part = part.strip(
                " ."
            )

            if part:
                habitats.append(part)

    return unique_list(habitats)


# ============================================================
# HOMELAND ABILITY
# ============================================================

def extract_homeland_ability(
    lines
):

    try:
        start = lines.index(
            "Homeland Ability"
        )
    except ValueError:
        return None

    values = []

    for line in lines[
        start + 1:
        start + 12
    ]:

        value = clean_text(line)

        if not value:
            continue

        if value in {
            "Mobility",
            "Trait",
            "Skill Details",
            "Habitats",
        }:
            break

        # Ignore isolated UI numbers.
        if re.fullmatch(
            r"\d+",
            value
        ):
            continue

        values.append(value)

    if not values:
        return None

    return {
        "name": values[0],
        "description": (
            " ".join(values[1:])
            if len(values) > 1
            else ""
        )
    }


# ============================================================
# MOBILITY
# ============================================================

def extract_mobility(
    lines,
    soup,
    page_url
):

    try:
        start = lines.index(
            "Mobility"
        )
    except ValueError:
        return None

    values = []

    for line in lines[
        start + 1:
        start + 12
    ]:

        value = clean_text(line)

        if not value:
            continue

        if value in {
            "Trait",
            "Skill Details",
            "Habitats",
            "Homeland Ability",
        }:
            break

        values.append(value)

    if not values:
        return None

    name = values[0]

    description = ""

    if len(values) > 1:
        description = " ".join(
            values[1:]
        )

    # --------------------------------------------------------
    # Try to find mobility image.
    # --------------------------------------------------------

    image_url = None

    mobility_heading = None

    for heading in soup.find_all(
        string=re.compile(
            r"Mobility",
            re.IGNORECASE
        )
    ):

        mobility_heading = heading

        break

    if mobility_heading:

        parent = mobility_heading.parent

        if parent:

            image = parent.find_next(
                "img"
            )

            if image:

                image_url = absolute_image_url(
                    image.get("src")
                    or image.get("data-src"),
                    page_url
                )

    return {
        "name": name,
        "description": description,
        "imageUrl": image_url
    }


# ============================================================
# TRAITS
# ============================================================

def extract_traits(lines):

    traits = []

    try:
        start = lines.index(
            "Trait"
        )
    except ValueError:
        return traits

    values = []

    for line in lines[
        start + 1:
        start + 10
    ]:

        value = clean_text(line)

        if not value:
            continue

        if value in {
            "Skill Details",
            "Combat",
            "Innate",
        }:
            break

        if value.lower() in {
            "image",
            "view illustration",
        }:
            continue

        values.append(value)

    if values:

        traits.append(
            {
                "name": values[0],
                "description": " ".join(
                    values[1:]
                )
            }
        )

    return traits


# ============================================================
# SKILL IMAGE HELPERS
# ============================================================

def get_skill_image_candidates(
    soup,
    page_url
):

    images = []

    for image in soup.find_all("img"):

        source = (
            image.get("src")
            or image.get("data-src")
            or image.get("data-original")
        )

        absolute = absolute_image_url(
            source,
            page_url
        )

        if not absolute:
            continue

        if is_bad_image(
            absolute
        ):
            continue

        images.append(
            {
                "url": absolute,
                "element": image
            }
        )

    return images


# ============================================================
# SKILLS
# ============================================================

def extract_skills(
    lines,
    soup,
    page_url
):

    """
    Parses the current official Wiki format.

    Example:

        Skill Details
        Combat Innate

        Fire Kick
        Description...

        Element:
        Type: Physical
        Cost: 0
        Power: 72

        Pebble Kick
        Description...
    """

    skills = []

    try:
        start = lines.index(
            "Skill Details"
        ) + 1
    except ValueError:
        return skills

    section = lines[start:]

    stop_words = {
        "TOP",
        "Terms of Use",
        "Privacy Policy",
    }

    cleaned = []

    for line in section:

        if line in stop_words:
            break

        cleaned.append(
            clean_text(line)
        )

    section = cleaned

    ignored = {
        "",
        "Combat",
        "Innate",
    }

    i = 0

    # --------------------------------------------------------
    # Find skill names by locating the metadata that follows.
    # --------------------------------------------------------

    while i < len(section):

        current = clean_text(
            section[i]
        )

        if current in ignored:
            i += 1
            continue

        # Metadata cannot be a skill.
        if (
            current.startswith("Type:")
            or current.startswith("Cost:")
            or current.startswith("Power:")
            or current == "Element:"
        ):
            i += 1
            continue

        if i + 1 >= len(section):
            break

        description = clean_text(
            section[i + 1]
        )

        if not description:
            i += 1
            continue

        element = ""
        skill_type = ""
        cost = ""
        power = ""

        metadata_found = False

        j = i + 2

        while j < len(section):

            line = clean_text(
                section[j]
            )

            # ------------------------------------------------
            # Element
            # ------------------------------------------------

            if line == "Element:":

                # Current Wiki may leave this blank.
                j += 1

                if (
                    j < len(section)
                    and not section[j].startswith(
                        "Type:"
                    )
                    and not section[j].startswith(
                        "Cost:"
                    )
                    and not section[j].startswith(
                        "Power:"
                    )
                ):

                    possible = clean_text(
                        section[j]
                    )

                    if possible:
                        element = possible
                        j += 1

                continue

            # ------------------------------------------------
            # Type
            # ------------------------------------------------

            if re.match(
                r"^Type\s*:",
                line,
                re.IGNORECASE
            ):

                skill_type = re.sub(
                    r"^Type\s*:\s*",
                    "",
                    line,
                    flags=re.IGNORECASE
                ).strip()

                metadata_found = True

                j += 1
                continue

            # ------------------------------------------------
            # Cost
            # ------------------------------------------------

            if re.match(
                r"^Cost\s*:",
                line,
                re.IGNORECASE
            ):

                cost = re.sub(
                    r"^Cost\s*:\s*",
                    "",
                    line,
                    flags=re.IGNORECASE
                ).strip()

                metadata_found = True

                j += 1
                continue

            # ------------------------------------------------
            # Power
            # ------------------------------------------------

            if re.match(
                r"^Power\s*:",
                line,
                re.IGNORECASE
            ):

                power = re.sub(
                    r"^Power\s*:\s*",
                    "",
                    line,
                    flags=re.IGNORECASE
                ).strip()

                metadata_found = True

                j += 1

                break

            # ------------------------------------------------
            # Once metadata started, another normal line
            # indicates the next skill.
            # ------------------------------------------------

            if metadata_found and line:
                break

            j += 1

        if metadata_found:

            skills.append(
                {
                    "name": current,
                    "description": description,
                    "element": element,
                    "type": skill_type,
                    "cost": cost,
                    "power": power,
                    "imageUrl": None
                }
            )

            i = max(
                i + 2,
                j
            )

        else:

            i += 1

    # --------------------------------------------------------
    # Attempt to associate official skill images.
    #
    # We do this separately because the text extraction
    # removes "Image" lines.
    # --------------------------------------------------------

    images = get_skill_image_candidates(
        soup,
        page_url
    )

    # Remove obvious evolution / mobility / trait images
    # where possible.
    usable_images = []

    for item in images:

        lower = item["url"].lower()

        if any(
            blocked in lower
            for blocked in [
                "wiki_pethead",
                "evolution",
            ]
        ):
            continue

        usable_images.append(
            item["url"]
        )

    # The Wiki generally presents skill icons in the same
    # order as the skills. Only assign when counts make sense.
    if usable_images:

        for index, skill in enumerate(
            skills
        ):

            if index < len(usable_images):

                skill["imageUrl"] = (
                    usable_images[index]
                )

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

    return sorted(
        set(found)
    )


# ============================================================
# PARSE INDIVIDUAL ANIIMO
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

    number = extract_number(
        lines,
        fallback_number
    )

    name = extract_name(
        soup,
        lines,
        fallback_name
    )

    image = extract_image_url(
        soup,
        url
    )

    elements = extract_elements(
        lines
    )

    roles = extract_roles(
        lines
    )

    attribute_score = (
        extract_attribute_score(
            lines
        )
    )

    stats = extract_stats(
        lines
    )

    forms = extract_forms(
        soup,
        lines,
        url
    )

    habitats = extract_habitats(
        lines
    )

    homeland_ability = (
        extract_homeland_ability(
            lines
        )
    )

    mobility = extract_mobility(
        lines,
        soup,
        url
    )

    traits = extract_traits(
        lines
    )

    trait = (
        traits[0]
        if traits
        else None
    )

    skills = extract_skills(
        lines,
        soup,
        url
    )

    all_text = " ".join(
        lines
    )

    tags = tags_for(
        all_text
    )

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

        "attributeScore": attribute_score,

        "stats": stats,

        "forms": forms,

        "habitats": habitats,

        "homelandAbility":
            homeland_ability,

        "mobility": mobility,

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
    # Find official Aniimo pages.
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
    # Deduplicate by number.
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
    # Download.
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

            print(
                f"    Attribute Score: "
                f"{aniimo.get('attributeScore')}"
            )

            print(
                f"    Stats: "
                f"{len(aniimo.get('stats', {}))}/6"
            )

            print(
                f"    Forms: "
                f"{len(aniimo.get('forms', []))}"
            )

            print(
                f"    Habitats: "
                f"{len(aniimo.get('habitats', []))}"
            )

            print(
                f"    Skills: "
                f"{len(aniimo.get('skills', []))}"
            )

            if aniimo.get(
                "homelandAbility"
            ):

                print(
                    "    Homeland: YES"
                )

            else:

                print(
                    "    Homeland: NO"
                )

            if aniimo.get(
                "mobility"
            ):

                print(
                    "    Mobility: YES"
                )

            else:

                print(
                    "    Mobility: NO"
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

                    "attributeScore":
                        None,

                    "stats": {},

                    "forms": [],

                    "habitats": [],

                    "homelandAbility":
                        None,

                    "mobility":
                        None,

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
    # Sort.
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
    # SANITY CHECKS.
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

    # --------------------------------------------------------
    # DATA QUALITY REPORT.
    # --------------------------------------------------------

    with_attributes = sum(
        1
        for item in output
        if item.get(
            "attributeScore"
        ) is not None
    )

    with_full_stats = sum(
        1
        for item in output
        if len(
            item.get(
                "stats",
                {}
            )
        ) >= 6
    )

    with_forms = sum(
        1
        for item in output
        if item.get("forms")
    )

    with_skills = sum(
        1
        for item in output
        if item.get("skills")
    )

    with_habitats = sum(
        1
        for item in output
        if item.get("habitats")
    )

    with_homeland = sum(
        1
        for item in output
        if item.get(
            "homelandAbility"
        )
    )

    with_mobility = sum(
        1
        for item in output
        if item.get(
            "mobility"
        )
    )

    with_traits = sum(
        1
        for item in output
        if item.get("traits")
    )

    print()
    print(
        "Data quality report:"
    )

    print(
        f"    Aniimo downloaded: {len(output)}"
    )

    print(
        f"    Attribute scores:  "
        f"{with_attributes}"
    )

    print(
        f"    Full stats:        "
        f"{with_full_stats}"
    )

    print(
        f"    With forms:        "
        f"{with_forms}"
    )

    print(
        f"    With habitats:     "
        f"{with_habitats}"
    )

    print(
        f"    With homeland:     "
        f"{with_homeland}"
    )

    print(
        f"    With mobility:     "
        f"{with_mobility}"
    )

    print(
        f"    With skills:       "
        f"{with_skills}"
    )

    print(
        f"    With traits:       "
        f"{with_traits}"
    )

    print()

    print(
        "Sanity checks PASSED."
    )

    print(
        f"#001 = {emberpup['name']}"
    )

    print(
        f"#001 Attribute Score = "
        f"{emberpup.get('attributeScore')}"
    )

    print(
        f"#001 Stats = "
        f"{emberpup.get('stats')}"
    )

    print(
        f"#001 Forms = "
        f"{len(emberpup.get('forms', []))}"
    )

    print(
        f"#001 Skills = "
        f"{len(emberpup.get('skills', []))}"
    )

    print()

    # --------------------------------------------------------
    # WRITE JSON.
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
