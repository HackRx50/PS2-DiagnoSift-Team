from tensorflow.keras.optimizers import Adam
from models.cnn_lstm_ctc import create_model, ctc_loss
from utils.data_loader import load_data
from utils.image_preprocessing import preprocess_image
import matplotlib.pyplot as plt

def run_experiment(dataset_dir, epochs=20, batch_size=16, learning_rate=0.001):
    """
    Runs an experiment for training a model with specified parameters.

    Args:
        dataset_dir (str): Path to the dataset directory.
        epochs (int): Number of epochs for training.
        batch_size (int): Size of the training batches.
        learning_rate (float): Learning rate for the optimizer.
    
    Returns:
        model: The trained model.
    """
    # Load data
    images, labels = load_data(dataset_dir)
    images = [preprocess_image(img) for img in images]

    # Define model parameters
    input_shape = (128, 32, 1)  # Image input size
    output_size = len(set(labels)) + 1  # Number of unique characters + CTC blank

    # Create the model
    model = create_model(input_shape, output_size)

    # Compile model with Adam optimizer and CTC loss
    model.compile(optimizer=Adam(learning_rate=learning_rate), loss=ctc_loss)

    # Train the model
    history = model.fit(images, labels, epochs=epochs, batch_size=batch_size)

    # Plot training loss
    plot_loss(history)

    return model

def plot_loss(history):
    """
    Plots the training loss over epochs.
    
    Args:
        history: History object from model training.
    """
    plt.plot(history.history['loss'], label='Training Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    plt.show()

# Example usage of running an experiment
if __name__ == "__main__":
    dataset_dir = 'data/iam_handwritten_forms/'
    trained_model = run_experiment(dataset_dir, epochs=30, batch_size=16, learning_rate=0.0005)
    trained_model.save('cnn_lstm_ctc_model.h5')
