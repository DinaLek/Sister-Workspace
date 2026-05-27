#!/usr/bin/env python3
"""Sister Marketing Agency — Proposal PDF Generator

Generates a branded PDF proposal by overlaying Hebrew text on the blank page
template and merging with the cover and terms PDFs.

Usage:
    python generate_proposal.py --content path/to/draft.json --output path/to/output.pdf
"""

import argparse
import json
import os
import sys
import warnings
warnings.filterwarnings("ignore")  # suppress pypdf indirect-reference warnings from template PDFs
from io import BytesIO
from pathlib import Path

try:
    from bidi.algorithm import get_display
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas as rl_canvas
    from pypdf import PdfReader, PdfWriter
except ImportError as e:
    print(f"\nError: Missing Python dependency — {e}")
    print("Please run: pip install -r requirements.txt\n")
    sys.exit(1)

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent.resolve()
RESOURCES    = SCRIPT_DIR / "resources"
PROPOSALS    = SCRIPT_DIR / "proposals"
FONT_DIR     = SCRIPT_DIR / ".." / ".." / "shared knowledge" / "Brand book" / "hebrew font" / "static"

COVER_PDF   = RESOURCES / "proposal front page.pdf"
BLANK_PDF   = RESOURCES / "Proposal blank page.pdf"
TERMS_PDF   = RESOURCES / "proposal terms and comments.pdf"
ORDER_PNG   = RESOURCES / "order.png"

# ── Brand Colors ───────────────────────────────────────────────────────────────
ORANGE = colors.HexColor("#F47B50")
RED    = colors.HexColor("#E8174D")
GRAY   = colors.HexColor("#695d5d")
DARK   = colors.HexColor("#1A1A1A")

# ── Page Layout (A4 = 595.28 x 841.89 pt, y-axis from bottom) ─────────────────
PAGE_W, PAGE_H  = A4
MARGIN_LEFT      = 99                  # 3.5 cm from left edge
TEXT_RIGHT       = PAGE_W - 99        # 3.5 cm from right edge
BULLET_RIGHT     = TEXT_RIGHT - 20    # bullets indented from right edge
CONTENT_TOP      = PAGE_H - 160        # below the header bar
CONTENT_BOTTOM   = 80                  # above the footer bar
LINE_HEIGHT      = 16

# ── Fixed Intro Text (identical in every proposal) ─────────────────────────────
INTRO_SENTENCES = [
    'Sister Marketing היא סוכנות דיגיטל שחושבת אסטרטגיה, נושמת קריאייטיב וחיה תוצאות.',
    'אנחנו משלבות שיווק מדויק עם טכנולוגיות AI מתקדמות, כדי ליצור מהלכים חכמים שמחוברים לעסק, לקהל ולמטרות שלו.',
    'ניהול סושיאל, קידום ממומן, תוכן, מיתוג ואוטומציה. הכול נבנה סביבכם, עם הבנה עמוקה של מה שצריך לקרות, ואיך לגרום לזה לקרות כמו שצריך.',
]


# ── Font Registration ──────────────────────────────────────────────────────────
def setup_fonts():
    variants = {
        "Assistant":         "Assistant-Regular.ttf",
        "Assistant-SemiBold": "Assistant-SemiBold.ttf",
        "Assistant-Bold":    "Assistant-Bold.ttf",
    }
    for name, filename in variants.items():
        path = FONT_DIR / filename
        if not path.exists():
            print(f"Warning: font not found at {path}")
            continue
        pdfmetrics.registerFont(TTFont(name, str(path)))


# ── Hebrew RTL Helper ──────────────────────────────────────────────────────────
def rtl(text: str) -> str:
    """Apply BiDi algorithm for Hebrew RTL text rendering in ReportLab."""
    return get_display(str(text), base_dir='R')


# ── Page Builder ───────────────────────────────────────────────────────────────
class PageBuilder:
    """Generates content pages as in-memory PDFs with Hebrew RTL text."""

    def __init__(self, content: dict):
        self.content = content
        self.pages: list[BytesIO] = []
        self._buf = None
        self._c   = None
        self._y   = 0

    # ── Public ────────────────────────────────────────────────────────────────

    def build(self) -> list[BytesIO]:
        self._new_page()

        # Header: client name (right) + date (left)
        self._draw_header_line()

        # Main title
        self._y -= 10
        self._draw_main_title()
        self._y -= 6

        # "נעים להכיר" intro — fixed text, identical in every proposal
        self._draw_section_heading("נעים להכיר")
        self._y -= 4
        for sentence in INTRO_SENTENCES:
            self._draw_paragraph(sentence)
            self._y -= 3
        self._y -= 10

        # Services
        for service in self.content.get("services", []):
            needed = self._estimate_service_height(service)
            if self._y - needed < CONTENT_BOTTOM:
                self._end_page()
                self._new_page()
            self._draw_service_block(service)
            self._y -= 10

        self._end_page()
        return self.pages

    # ── Page Management ───────────────────────────────────────────────────────

    def _new_page(self):
        self._buf = BytesIO()
        self._c   = rl_canvas.Canvas(self._buf, pagesize=A4)
        self._y   = CONTENT_TOP

    def _end_page(self):
        self._c.save()
        self._buf.seek(0)
        self.pages.append(self._buf)
        self._buf = None
        self._c   = None

    # ── Drawing Helpers ───────────────────────────────────────────────────────

    def _draw_header_line(self):
        client = self.content.get("client_name", "")
        date   = self.content.get("date", "")
        y      = self._y

        self._c.setFont("Assistant-SemiBold", 12)
        self._c.setFillColor(DARK)
        self._c.drawRightString(TEXT_RIGHT, y, rtl(f"לכבוד: {client}"))

        self._c.setFont("Assistant", 12)
        self._c.setFillColor(DARK)
        self._c.drawString(MARGIN_LEFT, y, date)

        self._y -= 18

    def _draw_main_title(self):
        self._c.setFont("Assistant-Bold", 15)
        self._c.setFillColor(RED)
        self._c.drawCentredString(PAGE_W / 2, self._y, rtl("הצעת מחיר עבור שירותי דיגיטל"))
        self._y -= 22

    def _draw_section_heading(self, text: str):
        self._c.setFont("Assistant-Bold", 12)
        self._c.setFillColor(RED)
        self._c.drawRightString(TEXT_RIGHT, self._y, rtl(text))
        self._y -= 16

    def _draw_service_block(self, service: dict):
        self._draw_section_heading(service.get("title", ""))
        self._y -= 2

        lead = service.get("lead", "")
        if lead:
            self._draw_paragraph(lead, font="Assistant-SemiBold", size=12)
            self._y -= 5

        self._c.setFont("Assistant-Bold", 12)
        self._c.setFillColor(RED)
        self._c.drawRightString(TEXT_RIGHT, self._y, rtl("מה כולל השירות:"))
        self._y -= 16

        for bullet in service.get("bullets", []):
            self._draw_bullet(bullet)

        self._y -= 4

        price = service.get("price", "")
        if price:
            self._c.setFont("Assistant-Bold", 12)
            self._c.setFillColor(DARK)
            self._c.drawRightString(TEXT_RIGHT, self._y, rtl(price))
            self._y -= 16

    def _draw_paragraph(self, text: str, font: str = "Assistant", size: float = 12,
                         color=None):
        if color is None:
            color = DARK
        self._c.setFont(font, size)
        self._c.setFillColor(color)

        max_w = TEXT_RIGHT - MARGIN_LEFT
        for line in self._wrap(text, font, size, max_w):
            self._c.drawRightString(TEXT_RIGHT, self._y, rtl(line))
            self._y -= size + 4

    def _draw_bullet(self, text: str):
        self._c.setFillColor(DARK)

        # Measure the bullet symbol so text always aligns after it
        bullet_sym = "•"
        self._c.setFont("Assistant", 13)
        bullet_w = pdfmetrics.stringWidth(bullet_sym + " ", "Assistant", 13)
        text_right = BULLET_RIGHT - bullet_w
        max_w = text_right - MARGIN_LEFT

        lines = self._wrap(text, "Assistant", 12, max_w)

        # First line: bullet on the right, text to its left
        self._c.setFont("Assistant", 13)
        self._c.drawRightString(BULLET_RIGHT, self._y, bullet_sym)
        self._c.setFont("Assistant", 12)
        if lines:
            self._c.drawRightString(text_right, self._y, rtl(lines[0]))
        self._y -= 16

        # Continuation lines: indented to text_right (hanging indent)
        self._c.setFont("Assistant", 12)
        for line in lines[1:]:
            self._c.drawRightString(text_right, self._y, rtl(line))
            self._y -= 16

    # ── Utilities ─────────────────────────────────────────────────────────────

    @staticmethod
    def _wrap(text: str, font: str, size: float, max_w: float) -> list[str]:
        """Word-wrap Hebrew text to fit within max_w points."""
        words  = text.split()
        lines  = []
        line   = ""
        for word in words:
            candidate = (line + " " + word).strip() if line else word
            if pdfmetrics.stringWidth(candidate, font, size) <= max_w:
                line = candidate
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)
        return lines if lines else [""]

    @staticmethod
    def _estimate_service_height(service: dict) -> float:
        """Rough estimate of vertical space needed for one service block (pt)."""
        base    = 16 + 16 + 16  # heading + lead + "מה כולל"
        bullets = len(service.get("bullets", [])) * 16
        price   = 16 if service.get("price") else 0
        return base + bullets + price + 24


# ── Work Order Page ────────────────────────────────────────────────────────────
def build_work_order_page(content: dict) -> BytesIO:
    """Creates the work order page: order.png as background, overlaid with client name and date."""
    buf = BytesIO()
    c   = rl_canvas.Canvas(buf, pagesize=A4)

    # Draw the full-page PNG background
    c.drawImage(str(ORDER_PNG), 0, 0, width=PAGE_W, height=PAGE_H, preserveAspectRatio=False)

    # Estimated Y of the "לכבוד:" / date line (~18% from top of A4)
    Y = PAGE_H - 152

    # White rectangle to erase existing date (left side)
    c.setFillColor(colors.white)
    c.rect(30, Y - 6, 200, 20, fill=1, stroke=0)

    # White rectangle to erase existing client name + "לכבוד:" (right side, to page edge)
    c.rect(200, Y - 6, PAGE_W - 200, 20, fill=1, stroke=0)

    # Write new date (left-aligned, matching header line style)
    c.setFont("Assistant", 11)
    c.setFillColor(DARK)
    c.drawString(48, Y, content.get("date", ""))

    # Write new "לכבוד: [client]" (right-aligned)
    c.setFont("Assistant-SemiBold", 11)
    client = content.get("client_name", "")
    c.drawRightString(PAGE_W - 48, Y, rtl(f"לכבוד: {client}"))

    c.save()
    buf.seek(0)
    return buf


# ── PDF Assembly ────────────────────────────────────────────────────────────────
def assemble_pdf(content_pages: list[BytesIO], output_path: Path, content: dict):
    writer = PdfWriter()

    # Page 1: cover (as-is)
    writer.append(PdfReader(str(COVER_PDF)))

    # Content pages: fresh reader per page avoids cross-reference issues
    for buf in content_pages:
        blank_page = PdfReader(str(BLANK_PDF)).pages[0]
        text_page  = PdfReader(buf).pages[0]
        blank_page.merge_page(text_page)
        writer.add_page(blank_page)

    # Terms (as-is)
    writer.append(PdfReader(str(TERMS_PDF)))

    # Work order — built from order.png with overlaid client name and date
    if ORDER_PNG.exists():
        order_buf = build_work_order_page(content)
        writer.append(PdfReader(order_buf))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)


# ── Entry Point ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Sister Marketing — Proposal PDF Generator")
    parser.add_argument("--content", required=True, help="Path to proposal JSON draft file")
    parser.add_argument("--output",  required=True, help="Output PDF path")
    args = parser.parse_args()

    content_path = Path(args.content)
    output_path  = Path(args.output)

    if not content_path.exists():
        print(f"Error: content file not found: {content_path}")
        sys.exit(1)

    for required in [COVER_PDF, BLANK_PDF, TERMS_PDF]:
        if not required.exists():
            print(f"Error: template PDF not found: {required}")
            sys.exit(1)

    with open(content_path, encoding="utf-8") as f:
        content = json.load(f)

    setup_fonts()

    builder = PageBuilder(content)
    pages   = builder.build()

    assemble_pdf(pages, output_path, content)

    client   = content.get("client_name", "")
    services = [s.get("title", "") for s in content.get("services", [])]
    print(f"\nProposal ready: {output_path}")
    print(f"Client: {client}")
    print(f"Services ({len(services)}): {', '.join(services)}")


if __name__ == "__main__":
    main()
