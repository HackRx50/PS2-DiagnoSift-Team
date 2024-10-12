import os
import cv2  # OpenCV for image processing
import numpy as np

def load_data(dataset_dir, target_size=(128, 32)):  # Set a fixed target size (height, width)
    images = []
    labels = []
    
    # Loop through the dataset directory
    for root, dirs, files in os.walk(dataset_dir):
        for file in files:
            if file.endswith(".png"):
                # Load image
                img_path = os.path.join(root, file)
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)  # Read image in grayscale

                # Resize image to a fixed target size (ensure all images are same size)
                img = cv2.resize(img, target_size)

                # Normalize image (optional but recommended for CNNs)
                img = img / 255.0

                images.append(img)
                
                # Assuming label is in filename or accessible (this part depends on your dataset)
                # Example: "path/to/image_word.png" -> label = "word"
                label = file.split("_")[1].replace(".png", "")  # Customize this part according to your dataset structure
                labels.append(label)

    # Convert images to NumPy arrays
    images = np.array(images)

    # Optionally reshape images for CNN input (if needed by the model)
    images = np.expand_dims(images, axis=-1)  # Adding a channel dimension for grayscale images (optional)

    # Convert labels to NumPy array or any format your model expects (e.g., encoded integers)
    labels = np.array(labels)

    return images, labels
