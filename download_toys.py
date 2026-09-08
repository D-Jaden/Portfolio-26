from duckduckgo_search import DDGS
import urllib.request
import sys
from PIL import Image

def download_image(query, filename):
    print(f"Searching for {query}")
    try:
        ddgs = DDGS()
        results = list(ddgs.images(query, max_results=10))
        for res in results:
            url = res['image']
            print(f"Trying {url}")
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as response, open(filename, 'wb') as out_file:
                    out_file.write(response.read())
                print(f"Success downloaded {filename}")
                # Convert to PNG
                img = Image.open(filename).convert("RGBA")
                png_file = filename.replace('.jpg', '.png')
                img.save(png_file)
                return
            except Exception as e:
                print(f"Failed {url}: {e}")
    except Exception as e:
        print(f"DDGS failed: {e}")

download_image("lego batman videogame character render white background", "hero/assets/batman_toy.jpg")
download_image("strike freedom gundam metal build action figure white background", "hero/assets/gundam_toy.jpg")
download_image("bicycle playing cards red and blue deck standing side by side white background", "hero/assets/cards_toy.jpg")
download_image("nivea orange basketball white background", "hero/assets/bball_toy.jpg")
download_image("sh figuarts teen gohan super saiyan action figure white background", "hero/assets/gohan_toy.jpg")
