import cv2
import numpy as np

def preprocess_image(image):
    """
    Preprocess the image by resizing, normalizing, and preparing for model input.

    Args:
        image (numpy.ndarray): The input image (grayscale).

    Returns:
        processed_image (numpy.ndarray): Preprocessed image ready for model input.
    """
    # Resize image to the target size (128x32)
    image_resized = cv2.resize(image, (128, 32))

    # Normalize pixel values (0 to 1 range)
    image_normalized = image_resized.astype(np.float32) / 255.0

    # Expand dimensions to match model input (batch_size, height, width, channels)
    image_processed = np.expand_dims(image_normalized, axis=-1)  # (128, 32, 1)

    return image_processed
