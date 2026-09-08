import time
import json
import urllib.request
import urllib.parse
from PIL import Image

def get_duckduckgo_image(query, filename):
    print(f"Searching for {query}")
    try:
        url = 'https://html.duckduckgo.com/html/?q=' + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        vqd = html.split('vqd=')[1].split('&')[0]
        if '"' in vqd: vqd = vqd.split('"')[0]
        if "'" in vqd: vqd = vqd.split("'")[0]
        
        search_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        response = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(response)
        
        for res in data['results'][:5]:
            img_url = res['image']
            print(f"Trying {img_url}")
            try:
                img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(img_req, timeout=5) as img_resp, open(filename, 'wb') as out_file:
                    out_file.write(img_resp.read())
                
                print(f"Success downloaded {filename}")
                img = Image.open(filename).convert("RGBA")
                png_file = filename.replace('.jpg', '.png')
                img.save(png_file)
                return True
            except Exception as e:
                print(f"Failed {img_url}: {e}")
    except Exception as e:
        print(f"Failed search: {e}")
    return False

time.sleep(1)
get_duckduckgo_image("lego batman render transparent background", "hero/assets/batman_toy.jpg")
time.sleep(2)
get_duckduckgo_image("strike freedom gundam metal build action figure white background", "hero/assets/gundam_toy.jpg")
time.sleep(2)
get_duckduckgo_image("bicycle playing cards red and blue decks standing white background", "hero/assets/cards_toy.jpg")
time.sleep(2)
get_duckduckgo_image("nivea orange basketball white background", "hero/assets/bball_toy.jpg")
time.sleep(2)
get_duckduckgo_image("sh figuarts teen gohan super saiyan kamehameha white background", "hero/assets/gohan_toy.jpg")
