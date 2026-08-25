"""
Extract text from PDFs and output as JSON for Sanity seeding.
Converts PDF content into structured blocks (headings + paragraphs + lists).
"""

import json
import os
import re
import pdfplumber

SOURCE_DIR = "/Users/alexmccormick/Downloads/Processes Documentation"

FOLDER_TO_SUBCATEGORY = {
    "General": "general",
    "Operating Procedures": "operating-procedures",
    "Personnel": "personnel",
    "Training": "training",
}


def slugify(text):
    text = re.sub(r"\.pdf$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\([^)]*\)", "", text)  # remove (1) etc
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text


def clean_title(filename):
    title = re.sub(r"\.pdf$", "", filename, flags=re.IGNORECASE)
    title = re.sub(r"\s*\(\d+\)\s*$", "", title)
    return title.strip()


def extract_text_from_pdf(filepath):
    """Extract all text from a PDF, page by page."""
    pages_text = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
    return "\n\n".join(pages_text)


def is_heading(line):
    """Heuristic: a line is a heading if it's short, starts with a number+dot pattern, or is all/mostly uppercase."""
    stripped = line.strip()
    if not stripped:
        return False
    # Numbered section headings like "1. Introduction" or "4.6."
    if re.match(r"^\d+\.\s+[A-Z]", stripped) and len(stripped) < 80:
        return True
    # Lines that are short and bold-looking (all caps or title case, no period at end)
    if len(stripped) < 60 and not stripped.endswith(".") and not stripped.endswith(";"):
        words = stripped.split()
        if len(words) <= 8 and stripped[0].isupper():
            # Check if it looks like a title (most words capitalized)
            cap_count = sum(1 for w in words if w[0].isupper() or w in ("and", "or", "the", "of", "to", "in", "for", "a", "an"))
            if cap_count >= len(words) * 0.6:
                return True
    return False


def is_list_item(line):
    """Check if a line is a bullet/numbered list item."""
    stripped = line.strip()
    # Bullet points
    if stripped.startswith("●") or stripped.startswith("•") or stripped.startswith("-"):
        return True
    # Numbered sub-items like "3.1." or "15.1.2."
    if re.match(r"^\d+\.\d+\.?\s", stripped):
        return True
    return False


def text_to_portable_blocks(raw_text):
    """Convert raw text to Sanity portable text block array."""
    blocks = []

    # Remove footer lines (page numbers, "miService Processes Documentation" etc)
    lines = raw_text.split("\n")
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # Skip common footer patterns
        if re.match(r"^miService[s]? Processes Documentation", stripped, re.IGNORECASE):
            continue
        if re.match(r"^Pre Contract Disclosure Document", stripped, re.IGNORECASE):
            continue
        if re.match(r"^Page \d+$", stripped):
            continue
        # Skip the cover page title if it's just the document name repeated
        if stripped in ("miServices Processes Documentation",):
            continue
        cleaned_lines.append(line)

    # Group lines into paragraphs
    paragraphs = []
    current = []
    for line in cleaned_lines:
        if line.strip() == "":
            if current:
                paragraphs.append("\n".join(current))
                current = []
        else:
            current.append(line.strip())
    if current:
        paragraphs.append("\n".join(current))

    block_key = 0

    for para in paragraphs:
        if not para.strip():
            continue

        block_key += 1
        key = f"block{block_key:04d}"

        # Check first line for heading
        first_line = para.split("\n")[0]

        if is_heading(first_line) and len(para) < 100:
            blocks.append({
                "_type": "block",
                "_key": key,
                "style": "h2",
                "markDefs": [],
                "children": [
                    {
                        "_type": "span",
                        "_key": f"{key}s1",
                        "text": para.strip(),
                        "marks": [],
                    }
                ],
            })
        elif is_list_item(first_line):
            # Split into individual list items
            items = para.split("\n")
            for item in items:
                stripped = item.strip()
                if not stripped:
                    continue
                # Remove bullet/number prefix
                text = re.sub(r"^[●•\-]\s*", "", stripped)
                text = re.sub(r"^\d+\.\d+\.?\d*\.?\s*", "", text)
                if not text:
                    continue
                block_key += 1
                item_key = f"block{block_key:04d}"
                blocks.append({
                    "_type": "block",
                    "_key": item_key,
                    "style": "normal",
                    "listItem": "bullet",
                    "level": 1,
                    "markDefs": [],
                    "children": [
                        {
                            "_type": "span",
                            "_key": f"{item_key}s1",
                            "text": text,
                            "marks": [],
                        }
                    ],
                })
        else:
            # Regular paragraph - join lines
            text = " ".join(para.split("\n"))
            # Clean up multiple spaces
            text = re.sub(r"\s+", " ", text).strip()
            if text:
                blocks.append({
                    "_type": "block",
                    "_key": key,
                    "style": "normal",
                    "markDefs": [],
                    "children": [
                        {
                            "_type": "span",
                            "_key": f"{key}s1",
                            "text": text,
                            "marks": [],
                        }
                    ],
                })

    return blocks


def main():
    documents = []

    for folder_name, subcategory in FOLDER_TO_SUBCATEGORY.items():
        folder_path = os.path.join(SOURCE_DIR, folder_name)
        if not os.path.exists(folder_path):
            continue

        files = sorted(f for f in os.listdir(folder_path) if f.endswith(".pdf"))

        for filename in files:
            filepath = os.path.join(folder_path, filename)
            title = clean_title(filename)
            slug = slugify(filename)

            print(f"  Extracting: {title}...", file=__import__("sys").stderr)

            raw_text = extract_text_from_pdf(filepath)
            body = text_to_portable_blocks(raw_text)

            documents.append({
                "title": title,
                "slug": slug,
                "subcategory": subcategory,
                "body": body,
                "blockCount": len(body),
            })

    json.dump(documents, __import__("sys").stdout, indent=2)


if __name__ == "__main__":
    main()
