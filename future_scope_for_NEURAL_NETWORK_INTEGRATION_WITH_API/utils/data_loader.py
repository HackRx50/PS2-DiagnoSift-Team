import os
import cv2
import numpy as np

def load_data(dataset_dir):
    """
    Loads the images and labels from the specified dataset directory.
    
    Args:
        dataset_dir (str): Path to the dataset directory.

    Returns:
        images (list): List of loaded images.
        labels (list): Corresponding labels for the images.
    """
    images = []
    labels = []

    # Iterate through the directory to load images and corresponding labels
    for root, dirs, files in os.walk(dataset_dir):
        for file in files:
            if file.endswith(".png"):
                # Load image
                img_path = os.path.join(root, file)
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                images.append(img)
                
                # Load the label (assuming label is part of the filename, adjust as needed)
                label = file.split('_')[0]  # Example: assuming filename format is "label_filename.png"
                labels.append(label)

    return np.array(images), np.array(labels)
