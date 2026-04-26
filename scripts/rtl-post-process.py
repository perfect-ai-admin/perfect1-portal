# -*- coding: utf-8 -*-
"""Post-process a pandoc-generated docx to force full Hebrew RTL."""
import zipfile
import shutil
import re
import os
from pathlib import Path

DOCX = r"C:\Users\USER\Desktop\עוסק-פטור-או-עוסק-מורשה-v2.docx"
TMP = Path(r"C:\Users\USER\AppData\Local\Temp\docx_rtl_work")

W_NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'


def patch_document_xml(text: str) -> str:
    # 1) For every <w:pPr> add <w:bidi/> if missing
    def add_bidi_pPr(m):
        content = m.group(1)
        if '<w:bidi' not in content:
            content += '<w:bidi w:val="1"/>'
        return f'<w:pPr>{content}</w:pPr>'
    text = re.sub(r'<w:pPr>(.*?)</w:pPr>', add_bidi_pPr, text, flags=re.DOTALL)

    # 2) For every <w:p> without <w:pPr>, inject a <w:pPr> with bidi right at start
    def add_pPr_if_missing(m):
        inner = m.group(1)
        if '<w:pPr' in inner:
            return m.group(0)
        return f'<w:p><w:pPr><w:bidi w:val="1"/></w:pPr>{inner}</w:p>'
    # handle <w:p> and <w:p attrs>
    text = re.sub(r'<w:p(?:\s[^>]*)?>(.*?)</w:p>', add_pPr_if_missing, text, flags=re.DOTALL)

    # 3) For every <w:rPr> add <w:rtl/> if missing
    def add_rtl_rPr(m):
        content = m.group(1)
        if '<w:rtl' not in content:
            content += '<w:rtl w:val="1"/>'
        return f'<w:rPr>{content}</w:rPr>'
    text = re.sub(r'<w:rPr>(.*?)</w:rPr>', add_rtl_rPr, text, flags=re.DOTALL)

    # 4) For every <w:r> without <w:rPr>, add one with rtl (skip self-closing <w:r/>)
    def add_rPr_to_r(m):
        inner = m.group(1)
        if '<w:rPr' in inner:
            return m.group(0)
        return f'<w:r><w:rPr><w:rtl w:val="1"/></w:rPr>{inner}</w:r>'
    text = re.sub(r'<w:r>(.*?)</w:r>', add_rPr_to_r, text, flags=re.DOTALL)

    # 5) For every <w:tblPr> add <w:bidiVisual/> if missing
    def add_bidi_tbl(m):
        content = m.group(1)
        if '<w:bidiVisual' not in content:
            content += '<w:bidiVisual w:val="1"/>'
        return f'<w:tblPr>{content}</w:tblPr>'
    text = re.sub(r'<w:tblPr>(.*?)</w:tblPr>', add_bidi_tbl, text, flags=re.DOTALL)

    # 6) Section properties – add <w:bidi/> to every <w:sectPr>
    def add_bidi_sect(m):
        content = m.group(1)
        if '<w:bidi' not in content:
            content += '<w:bidi w:val="1"/>'
        return f'<w:sectPr{m.group(0)[len("<w:sectPr"):len(m.group(0))-len(m.group(1))-len("</w:sectPr>")]}>{content}</w:sectPr>'
    # simpler approach
    text = re.sub(
        r'(<w:sectPr[^>]*>)(.*?)(</w:sectPr>)',
        lambda m: m.group(1) + (m.group(2) if '<w:bidi' in m.group(2) else m.group(2) + '<w:bidi w:val="1"/>') + m.group(3),
        text,
        flags=re.DOTALL,
    )
    return text


def patch_styles_xml(text: str) -> str:
    # Inject/replace docDefaults so every run and paragraph is RTL + Hebrew font
    rpr_default = (
        '<w:rPrDefault><w:rPr>'
        '<w:rFonts w:ascii="David" w:hAnsi="David" w:cs="David" w:hint="cs"/>'
        '<w:sz w:val="22"/><w:szCs w:val="22"/>'
        '<w:rtl w:val="1"/>'
        '<w:lang w:val="he-IL" w:bidi="he-IL"/>'
        '</w:rPr></w:rPrDefault>'
    )
    ppr_default = (
        '<w:pPrDefault><w:pPr>'
        '<w:bidi w:val="1"/>'
        '<w:jc w:val="right"/>'
        '</w:pPr></w:pPrDefault>'
    )
    new_defaults = f'<w:docDefaults>{rpr_default}{ppr_default}</w:docDefaults>'

    if '<w:docDefaults>' in text:
        text = re.sub(r'<w:docDefaults>.*?</w:docDefaults>', new_defaults, text, flags=re.DOTALL)
    else:
        # insert right after <w:styles ...>
        text = re.sub(r'(<w:styles[^>]*>)', r'\1' + new_defaults, text, count=1)

    # Also add <w:bidi/> to every paragraph-bearing style's pPr if missing
    def patch_style_pPr(m):
        content = m.group(1)
        if '<w:bidi' not in content:
            content += '<w:bidi w:val="1"/>'
        if '<w:jc' not in content:
            content += '<w:jc w:val="right"/>'
        return f'<w:pPr>{content}</w:pPr>'
    text = re.sub(r'<w:pPr>(.*?)</w:pPr>', patch_style_pPr, text, flags=re.DOTALL)

    # And rtl on every style's rPr
    def patch_style_rPr(m):
        content = m.group(1)
        if '<w:rtl' not in content:
            content += '<w:rtl w:val="1"/>'
        return f'<w:rPr>{content}</w:rPr>'
    text = re.sub(r'<w:rPr>(.*?)</w:rPr>', patch_style_rPr, text, flags=re.DOTALL)
    return text


def main():
    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir(parents=True)
    with zipfile.ZipFile(DOCX, 'r') as z:
        z.extractall(TMP)

    doc_xml = TMP / 'word' / 'document.xml'
    styles_xml = TMP / 'word' / 'styles.xml'

    doc_xml.write_text(patch_document_xml(doc_xml.read_text(encoding='utf-8')), encoding='utf-8')
    if styles_xml.exists():
        styles_xml.write_text(patch_styles_xml(styles_xml.read_text(encoding='utf-8')), encoding='utf-8')

    # Rezip
    out = DOCX + '.new'
    if os.path.exists(out):
        os.remove(out)
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(TMP):
            for name in files:
                full = Path(root) / name
                rel = full.relative_to(TMP).as_posix()
                zf.write(full, rel)
    shutil.move(out, DOCX)
    shutil.rmtree(TMP)
    print(f"RTL-patched: {DOCX}")


if __name__ == '__main__':
    main()
