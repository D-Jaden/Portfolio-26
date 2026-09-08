from PIL import Image
import sys
import collections

def make_transparent(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    visited = set()
    queue = collections.deque()
    def is_bg(pixel): return pixel[0] > 230 and pixel[1] > 230 and pixel[2] > 230
    pixels = img.load()
    for x in range(width):
        if is_bg(pixels[x, 0]):
            queue.append((x, 0)); visited.add((x, 0))
        if is_bg(pixels[x, height-1]):
            queue.append((x, height-1)); visited.add((x, height-1))
    for y in range(height):
        if is_bg(pixels[0, y]) and (0, y) not in visited:
            queue.append((0, y)); visited.add((0, y))
        if is_bg(pixels[width-1, y]) and (width-1, y) not in visited:
            queue.append((width-1, y)); visited.add((width-1, y))
    dirs = [(0,1), (0,-1), (1,0), (-1,0)]
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        for dx, dy in dirs:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited and is_bg(pixels[nx, ny]):
                visited.add((nx, ny)); queue.append((nx, ny))
    img.save(img_path)
    print(f"Processed {img_path}")

for p in sys.argv[1:]: make_transparent(p)
