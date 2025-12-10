"""
CNN Model definition and training for MNIST digit recognition.
Architecture designed for intermediate layer visualization.

Improved with:
- Better architecture (BatchNormalization, more filters)
- Data augmentation for hand-drawn variations
- More training epochs with learning rate scheduling
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping


def create_cnn_model() -> keras.Model:
    """
    Create an improved CNN model for MNIST digit recognition.
    
    Architecture optimized for hand-drawn digit recognition:
    - Conv2D (32 filters) -> BatchNorm -> ReLU -> MaxPool
    - Conv2D (64 filters) -> BatchNorm -> ReLU -> MaxPool  
    - Conv2D (128 filters) -> BatchNorm -> ReLU
    - Flatten -> Dense (256) -> Dropout -> Dense (128) -> Dropout -> Dense (10) -> Softmax
    """
    inputs = layers.Input(shape=(28, 28, 1), name="input_image")
    
    # First convolutional block
    x = layers.Conv2D(32, (3, 3), padding='same', name='conv1')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.MaxPooling2D((2, 2), name='pool1')(x)
    
    # Second convolutional block
    x = layers.Conv2D(64, (3, 3), padding='same', name='conv2')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.MaxPooling2D((2, 2), name='pool2')(x)
    
    # Third convolutional block (new)
    x = layers.Conv2D(128, (3, 3), padding='same', name='conv3')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    
    # Dense layers with more capacity
    x = layers.Flatten(name='flatten')(x)
    x = layers.Dense(256, activation='relu', name='dense1')(x)
    x = layers.Dropout(0.4, name='dropout1')(x)
    x = layers.Dense(128, activation='relu', name='dense2')(x)
    x = layers.Dropout(0.3, name='dropout2')(x)
    outputs = layers.Dense(10, activation='softmax', name='predictions')(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name='mnist_cnn_improved')
    return model


def train_model(model_path: str = "mnist_cnn_model.keras") -> keras.Model:
    """
    Train the CNN model on MNIST dataset with data augmentation.
    
    Improvements:
    - Data augmentation (rotation, zoom, shift) for hand-drawn variations
    - More epochs (15) with early stopping
    - Learning rate reduction on plateau
    - Better generalization for real hand-drawn digits
    """
    print("Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    
    # Preprocess data
    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0
    
    # Add channel dimension
    x_train = np.expand_dims(x_train, -1)
    x_test = np.expand_dims(x_test, -1)
    
    print(f"Training data shape: {x_train.shape}")
    print(f"Test data shape: {x_test.shape}")
    
    # Data augmentation for hand-drawn digit variations
    datagen = ImageDataGenerator(
        rotation_range=20,          # Random rotation ±20 degrees
        width_shift_range=0.15,     # Random horizontal shift ±15%
        height_shift_range=0.15,    # Random vertical shift ±15%
        zoom_range=0.15,            # Random zoom ±15%
        shear_range=0.15,           # Shear intensity
        fill_mode='constant',       # Fill with black
        cval=0                      # Fill value (black)
    )
    
    # Create and compile model with optimized learning rate
    model = create_cnn_model()
    
    optimizer = keras.optimizers.Adam(learning_rate=0.001)
    
    model.compile(
        optimizer=optimizer,
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # Callbacks for better training
    callbacks = [
        # Reduce learning rate when validation loss plateaus
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=0.00001,
            verbose=1
        ),
        # Early stopping to prevent overfitting
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        )
    ]
    
    # Train with data augmentation
    print("\nTraining model with data augmentation...")
    
    # Split training data for validation
    val_split = int(0.1 * len(x_train))
    x_val = x_train[:val_split]
    y_val = y_train[:val_split]
    x_train_aug = x_train[val_split:]
    y_train_aug = y_train[val_split:]
    
    history = model.fit(
        datagen.flow(x_train_aug, y_train_aug, batch_size=64),
        epochs=30,
        validation_data=(x_val, y_val),
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate
    print("\nEvaluating model...")
    test_loss, test_acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"Test accuracy: {test_acc:.4f}")
    
    # Save model
    model.save(model_path)
    print(f"\nModel saved to {model_path}")
    
    return model


def load_model(model_path: str = "mnist_cnn_model.keras") -> keras.Model:
    """
    Load a trained model from disk.
    If model doesn't exist, train a new one.
    """
    if os.path.exists(model_path):
        print(f"Loading model from {model_path}")
        return keras.models.load_model(model_path)
    else:
        print(f"Model not found at {model_path}. Training new model...")
        return train_model(model_path)


def create_feature_extraction_model(base_model: keras.Model) -> keras.Model:
    """
    Create a model that outputs intermediate layer activations.
    Returns activations from:
    - conv1: First convolutional layer
    - conv2: Second convolutional layer
    - conv3: Third convolutional layer
    - dense1: First dense layer
    - predictions: Final softmax output
    """
    # Check if we have the new or old model
    try:
        conv3_output = base_model.get_layer('conv3').output
    except ValueError:
        # Fallback for old model compatibility
        conv3_output = base_model.get_layer('conv2').output

    layer_outputs = {
        'conv1': base_model.get_layer('conv1').output,
        'conv2': base_model.get_layer('conv2').output,
        'conv3': conv3_output,
        'dense1': base_model.get_layer('dense1').output,
        'predictions': base_model.get_layer('predictions').output,
    }
    
    feature_model = Model(
        inputs=base_model.input,
        outputs=layer_outputs
    )
    
    return feature_model


def get_layer_activations(
    feature_model: keras.Model,
    input_image: np.ndarray
) -> dict:
    """
    Get activations from all intermediate layers.
    
    Args:
        feature_model: Model with multiple outputs
        input_image: Preprocessed input image (1, 28, 28, 1)
    
    Returns:
        Dictionary with layer names and their activations
    """
    outputs = feature_model.predict(input_image, verbose=0)
    
    return {
        'conv1': outputs['conv1'],
        'conv2': outputs['conv2'],
        'conv3': outputs.get('conv3', outputs['conv2']), # Fallback
        'dense1': outputs['dense1'],
        'predictions': outputs['predictions']
    }


if __name__ == "__main__":
    # Train model when run directly
    train_model()
