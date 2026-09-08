from PIL import Image
import sys

def bg_remove_fuzzy(img_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    newData = []
    for item in data:
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    img.save(img_path)
    print(f"Removed bg from {img_path}")

def pixelate(img_path, size=64):
    img = Image.open(img_path)
    imgSmall = img.resize((size, size), resample=Image.NEAREST)
    imgLarge = imgSmall.resize(img.size, Image.NEAREST)
    imgLarge.save(img_path)
    print(f"Pixelated {img_path}")

if __name__ == "__main__":
    bg_remove_fuzzy("hero/assets/pokemon_pfp.png")
    bg_remove_fuzzy("hero/assets/redbull_car.png")
    bg_remove_fuzzy("loading-assets/pixel_naruto.png")
    bg_remove_fuzzy("loading-assets/pixel_vegeta.png")
    pixelate("loading-assets/pixel_naruto.png", 64)
    pixelate("loading-assets/pixel_vegeta.png", 64)
