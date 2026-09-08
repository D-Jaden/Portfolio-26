from bing_image_downloader import downloader
import os
import shutil

def get_image(query, out_name):
    downloader.download(query, limit=1, output_dir='dataset', adult_filter_off=True, force_replace=False, timeout=60, verbose=True)
    # The image is saved in dataset/<query>/Image_1.jpg
    dir_path = os.path.join('dataset', query)
    if os.path.exists(dir_path):
        files = os.listdir(dir_path)
        if files:
            src = os.path.join(dir_path, files[0])
            shutil.copy(src, out_name)
            print(f"Successfully copied to {out_name}")
            return True
    return False

get_image("lego batman videogame character render white background", "hero/assets/batman_toy.jpg")
get_image("strike freedom gundam metal build action figure white background", "hero/assets/gundam_toy.jpg")
get_image("bicycle playing cards red and blue decks standing white background", "hero/assets/cards_toy.jpg")
get_image("nivea orange basketball white background", "hero/assets/bball_toy.jpg")
get_image("sh figuarts teen gohan super saiyan kamehameha white background", "hero/assets/gohan_toy.jpg")
