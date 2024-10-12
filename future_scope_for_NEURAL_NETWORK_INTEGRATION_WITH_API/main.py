import argparse
from tensorflow.keras.models import load_model
from utils.data_loader import load_data
from utils.image_preprocessing import preprocess_image
from experiments import run_experiment
import os

def train_model(dataset_dir, epochs, batch_size, learning_rate, save_model_path):
    """
    Train the handwritten text recognition model.

    Args:
        dataset_dir (str): Path to the dataset directory.
        epochs (int): Number of epochs for training.
        batch_size (int): Training batch size.
        learning_rate (float): Learning rate for the optimizer.
        save_model_path (str): Path to save the trained model.
    """
    print("[INFO] Starting training...")
    model = run_experiment(dataset_dir, epochs, batch_size, learning_rate)
    
    if save_model_path:
        model.save(save_model_path)
        print(f"[INFO] Model saved at {save_model_path}")

def load_and_predict(model_path, image_path):
    """
    Load a pre-trained model and make predictions on a new image.

    Args:
        model_path (str): Path to the saved model file.
        image_path (str): Path to the image file.

    Returns:
        prediction (str): Predicted text.
    """
    print("[INFO] Loading model...")
    model = load_model(model_path)

    print("[INFO] Preprocessing image...")
    image = preprocess_image(image_path)

    print("[INFO] Making prediction...")
    # Note: Prediction output logic can vary, this is just an example.
    prediction = model.predict(image)
    print(f"Prediction: {prediction}")
    return prediction

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Handwritten Text Recognition using CNN-LSTM-CTC")
    
    # Define arguments
    parser.add_argument('--train', action='store_true', help='Train the model')
    parser.add_argument('--predict', action='store_true', help='Make prediction with a trained model')
    parser.add_argument('--dataset_dir', type=str, default=None, help='Path to the dataset directory')
    parser.add_argument('--model_path', type=str, default=None, help='Path to load or save the model')
    parser.add_argument('--image_path', type=str, default=None, help='Path to the image for prediction')
    parser.add_argument('--epochs', type=int, default=20, help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=16, help='Training batch size')
    parser.add_argument('--learning_rate', type=float, default=0.001, help='Learning rate for the optimizer')
    
    args = parser.parse_args()
    
    if args.train:
        if not args.dataset_dir:
            print("[ERROR] --dataset_dir is required for training.")
        else:
            train_model(
                dataset_dir=args.dataset_dir,
                epochs=args.epochs,
                batch_size=args.batch_size,
                learning_rate=args.learning_rate,
                save_model_path=args.model_path
            )
    
    if args.predict:
        if not args.model_path or not args.image_path:
            print("[ERROR] --model_path and --image_path are required for prediction.")
        else:
            load_and_predict(args.model_path, args.image_path)
