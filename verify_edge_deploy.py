#!/usr/bin/env python3
"""
Pre-Deploy Grounded Metal Scrubbing Gate for StackLabs Edge.
Enforces architectural invariants, zero-puffery, zero confidential investor leaks,
and zero circular navigation loops before edge deployment.
"""

import sys
import re
from pathlib import Path

DEPLOY_DIR = Path(__file__).parent.resolve()

def check_circular_navigation():
    print("[1/5] Checking for circular navigation loops...")
    errors = []
    for html_file in DEPLOY_DIR.rglob("*.html"):
        content = html_file.read_text(encoding="utf-8")
        if "STACKLABS FORGE" in content:
            errors.append(f"Found 'STACKLABS FORGE' in {html_file.relative_to(DEPLOY_DIR)}")
    if errors:
        for err in errors:
            print(f"  ❌ ERROR: {err}")
        return False
    print("  ✅ PASS: No 'STACKLABS FORGE' circular navigation loops found.")
    return True

def check_homepage_navbar():
    print("[2/5] Checking homepage navbar for municipal contractor text...")
    index_file = DEPLOY_DIR / "index.html"
    content = index_file.read_text(encoding="utf-8")
    
    # Check navbar brand-mark specifically
    brand_match = re.search(r'<a\s+href="/"\s+class="brand-mark">([\s\S]*?)</a>', content)
    if not brand_match:
        print("  ❌ ERROR: Could not find brand-mark navbar link in index.html")
        return False
    
    brand_inner = brand_match.group(1)
    if "brand-city" in brand_inner or "Smyrna, Georgia" in brand_inner:
        print("  ❌ ERROR: Found brand-city / municipal text in brand-mark navbar.")
        return False
    
    print("  ✅ PASS: Navbar brand-mark is clean 'STACKLABS' logotype.")
    return True

def check_homepage_hero():
    print("[3/5] Checking homepage hero section for grounded copy...")
    index_file = DEPLOY_DIR / "index.html"
    content = index_file.read_text(encoding="utf-8")
    
    required_phrases = [
        "Deterministic Systems Engineering.",
        "Systems Engineering & Autonomous Architecture",
        "StackLabs is an independent systems R&D laboratory."
    ]
    
    missing = [p for p in required_phrases if p not in content]
    if missing:
        for m in missing:
            print(f"  ❌ ERROR: Missing required grounded hero phrase: '{m}'")
        return False
    
    print("  ✅ PASS: Hero copy is verified grounded systems architecture.")
    return True

def check_confidential_investors_and_puffery():
    print("[4/5] Checking index.html for confidential investor names and unclosed deal puffery...")
    index_file = DEPLOY_DIR / "index.html"
    content = index_file.read_text(encoding="utf-8")
    
    forbidden_terms = [
        "Pawel",
        "Rudnicki",
        "Jeremy Malone",
        "Davidson Homes",
        "Woods Crossing",
        "mathematically compelled"
    ]
    
    violations = [t for t in forbidden_terms if re.search(r'\b' + re.escape(t) + r'\b', content, re.IGNORECASE)]
    if violations:
        for v in violations:
            print(f"  ❌ ERROR: Found forbidden investor/puffery term in public homepage: '{v}'")
        return False
        
    print("  ✅ PASS: Zero confidential investor names or unclosed deal claims on homepage.")
    return True

def check_local_assets():
    print("[5/5] Checking local asset references in primary entrypoints...")
    missing_assets = []
    
    for page in ["index.html", "drop.html", "homestead.html"]:
        f = DEPLOY_DIR / page
        if not f.exists():
            continue
        content = f.read_text(encoding="utf-8")
        
        # Check img src="/..."
        img_srcs = re.findall(r'<img\s+[^>]*src=["\'](/[^"\']+)["\']', content)
        for src in img_srcs:
            asset_path = DEPLOY_DIR / src.lstrip("/")
            if not asset_path.exists():
                missing_assets.append((page, src))
                
    if missing_assets:
        for page, src in missing_assets:
            print(f"  ❌ ERROR: Broken asset link in {page}: {src}")
        return False
        
    print("  ✅ PASS: All referenced local media assets exist on disk.")
    return True

def main():
    print("==================================================")
    print("STACKLABS PRE-DEPLOY GROUNDED METAL SCRUBBING GATE")
    print("==================================================")
    
    checks = [
        check_circular_navigation,
        check_homepage_navbar,
        check_homepage_hero,
        check_confidential_investors_and_puffery,
        check_local_assets
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
            
    print("--------------------------------------------------")
    if not all_passed:
        print("❌ PRE-DEPLOY VERIFICATION FAILED. ABORTING DEPLOY.")
        sys.exit(1)
        
    print("✅ ALL PRE-DEPLOY GATES PASSED. READY FOR EDGE DEPLOY.")
    sys.exit(0)

if __name__ == "__main__":
    main()
