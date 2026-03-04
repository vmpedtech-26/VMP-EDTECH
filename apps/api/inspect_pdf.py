import fitz
import sys
import os

pdf_path = sys.argv[1]
doc = fitz.open(pdf_path)
page = doc[0]
text = page.get_text()
print("--- TEXT ---")
print(text)

images = page.get_images()
print(f"--- IMAGES --- (count: {len(images)})")
for img in images:
    print(img)
