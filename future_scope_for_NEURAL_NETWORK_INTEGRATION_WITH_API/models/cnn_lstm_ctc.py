import tensorflow as tf
from tensorflow.keras import layers

def create_model(input_shape, output_size):
    inputs = layers.Input(shape=input_shape)

    # CNN layers
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # Reshape for LSTM
    shape = tf.keras.backend.int_shape(x)
    x = layers.Reshape(target_shape=(shape[1], shape[2] * shape[3]))(x)

    # LSTM layers
    x = layers.Bidirectional(layers.LSTM(128, return_sequences=True))(x)
    x = layers.Bidirectional(layers.LSTM(128, return_sequences=True))(x)

    # Dense layer to map to output size
    x = layers.Dense(output_size, activation='softmax')(x)

    model = tf.keras.Model(inputs, x)
    return model

def ctc_loss(y_true, y_pred):
    return tf.keras.backend.ctc_batch_cost(y_true, y_pred)
