from PIL import Image

# Size for each mosaic pixel
UNIT_PIXEL = 20


# # Image path
# PATH = "IMG_0879.jpeg"


# Open Image
def open_image(path):
    new_image = Image.open(path)
    return new_image


# Save Image
def save_image(image, path):
    image.save(path, 'png')


# Create a new image with the given size
def create_image(i, j):
    image = Image.new("RGB", (i, j), "white")
    return image


# Get the pixel from the given image
def get_pixel(image, i, j):
    # Inside image bounds?
    width, height = image.size
    if i > width or j > height:
        return None

    # Get Pixel
    pixel = image.getpixel((i, j))
    return pixel


# Convert image to same width and height
def scale_to_square(image):
    # Get size of original image
    width, height = image.size

    # New size
    size = min(width, height)

    # Create new Image and a Pixel Map
    new = create_image(size, size)
    pixels = new.load()

    width_skip = int((width - size) / 2)
    height_skip = int((height - size) / 2)

    if size == width:
        width_skip = 0

    if size == height:
        height_skip = 0

    for i in range(size):
        for j in range(size):
            pixels[i, j] = get_pixel(image, i + width_skip, j + height_skip)

    # Return new image
    return new


# Create a Grayscale version of the image
def convert_grayscale(image):
    # Get size of original image
    width, height = image.size

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    # Transform to grayscale
    for i in range(width):
        for j in range(height):
            # Get Pixel
            pixel = get_pixel(image, i, j)

            # Get R, G, B values (This are int from 0 to 255)
            red = pixel[0]
            green = pixel[1]
            blue = pixel[2]

            # Transform to grayscale
            gray = (red * 0.299) + (green * 0.587) + (blue * 0.114)

            # Set Pixel in new image
            pixels[i, j] = (int(gray), int(gray), int(gray))

    # Return new image
    return new


# Convert to mosaic image
def convert_mosaic(image):
    image = image.resize(size=(800, 800))
    width, height = image.size

    unit_size = UNIT_PIXEL

    # Transform to new size
    if width % UNIT_PIXEL != 0:
        unit_size = find_smaller_factor(width, UNIT_PIXEL)

    # Create new Image and a Pixel Map
    new = create_image(width, height)
    pixels = new.load()

    pixel_arr = []
    for i in range(0, width, unit_size):
        for j in range(0, height, unit_size):
            pixel_R = 0
            pixel_G = 0
            pixel_B = 0
            for k in range(unit_size):
                for q in range(unit_size):
                    pixel = get_pixel(image, i + k, q + j)
                    pixel_R += pixel[0]
                    pixel_G += pixel[1]
                    pixel_B += pixel[2]
            curr_R = int(pixel_R / (unit_size * unit_size))
            curr_G = int(pixel_G / (unit_size * unit_size))
            curr_B = int(pixel_B / (unit_size * unit_size))
            pixel_arr.append((curr_R, curr_G, curr_B))

    count = 0
    for i in range(0, width, unit_size):
        for j in range(0, height, unit_size):
            for k in range(unit_size):
                for q in range(unit_size):
                    pixels[i + k, j + q] = pixel_arr[count]
            count += 1
    return new


# To find the largest factor for k that is smaller than f
def find_smaller_factor(k, f):
    for i in range(f, 0, -1):
        if k % i == 0:
            return i

# def main():
#     img = open_image(PATH)
#     output = convert_mosaic(img)
#     output.show()
#
#
# if __name__ == "__main__":
#     main()
