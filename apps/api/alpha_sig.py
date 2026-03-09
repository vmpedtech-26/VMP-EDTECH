from PIL import Image
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]

img = Image.open(input_path).convert("RGBA")
datas = img.getdata()

newData = []
cutoff = 200 # If RGB > cutoff -> transparent
for item in datas:
    # item is (R, G, B, A)
    if item[0] > cutoff and item[1] > cutoff and item[2] > cutoff:
        newData.append((255, 255, 255, 0)) # Fully transparent
    else:
        # Keep the original ink but maybe tweak alpha to make it blend well? Just keep it.
        newData.append(item)

img.putdata(newData)
img.save(output_path, "PNG")

print(f"Saved: {output_path}")
