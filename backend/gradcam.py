"""
Grad-CAM (Gradient-weighted Class Activation Mapping) implementation.
Generates visual explanations for CNN predictions.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
import cv2


class GradCAM:
    """
    Grad-CAM implementation for generating visual explanations.
    
    Grad-CAM uses the gradients of the target class flowing into the final
    convolutional layer to produce a coarse localization map highlighting
    important regions in the image for prediction.
    """
    
    def __init__(self, model: keras.Model, layer_name: str = 'conv2'):
        """
        Initialize Grad-CAM with a model and target layer.
        
        Args:
            model: Trained Keras model
            layer_name: Name of the convolutional layer to use for Grad-CAM
        """
        self.model = model
        self.layer_name = layer_name
        
        # Create a model that outputs both the conv layer output and predictions
        self.grad_model = keras.Model(
            inputs=model.input,
            outputs=[
                model.get_layer(layer_name).output,
                model.output
            ]
        )
    
    def generate_heatmap(
        self,
        input_image: np.ndarray,
        class_idx: int = None
    ) -> np.ndarray:
        """
        Generate a Grad-CAM heatmap for the input image.
        
        Args:
            input_image: Preprocessed input image (1, 28, 28, 1)
            class_idx: Target class index. If None, uses the predicted class.
        
        Returns:
            Heatmap as a 2D numpy array
        """
        # Use GradientTape to record gradients
        with tf.GradientTape() as tape:
            # Get conv layer output and model predictions
            conv_output, predictions = self.grad_model(input_image)
            
            # If no class specified, use the predicted class
            if class_idx is None:
                class_idx = tf.argmax(predictions[0])
            
            # Get the score for the target class
            class_score = predictions[:, class_idx]
        
        # Compute gradients of the class score with respect to conv output
        grads = tape.gradient(class_score, conv_output)
        
        # Global average pooling of gradients
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Weight the conv output channels by their importance
        conv_output = conv_output[0]
        heatmap = conv_output @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        # Apply ReLU to keep only positive influences
        heatmap = tf.maximum(heatmap, 0)
        
        # Normalize to 0-1 range
        heatmap = heatmap / (tf.reduce_max(heatmap) + keras.backend.epsilon())
        
        return heatmap.numpy()
    
    def generate_overlay(
        self,
        input_image: np.ndarray,
        heatmap: np.ndarray,
        alpha: float = 0.4,
        colormap: int = cv2.COLORMAP_JET
    ) -> np.ndarray:
        """
        Generate a colored heatmap overlay on the original image.
        
        Args:
            input_image: Original input image (can be grayscale or RGB)
            heatmap: Grad-CAM heatmap
            alpha: Blending factor for overlay
            colormap: OpenCV colormap to use
        
        Returns:
            Blended image with heatmap overlay
        """
        # Prepare original image
        if len(input_image.shape) == 4:
            img = input_image[0, :, :, 0]  # Remove batch and channel dims
        elif len(input_image.shape) == 3:
            img = input_image[:, :, 0]
        else:
            img = input_image
        
        # Scale to 0-255
        img = (img * 255).astype(np.uint8)
        
        # Resize heatmap to match image size
        heatmap_resized = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
        
        # Apply colormap to heatmap
        heatmap_colored = cv2.applyColorMap(
            (heatmap_resized * 255).astype(np.uint8),
            colormap
        )
        
        # Convert grayscale image to BGR
        img_bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        
        # Blend original image with heatmap
        overlay = cv2.addWeighted(img_bgr, 1 - alpha, heatmap_colored, alpha, 0)
        
        return overlay


def generate_gradcam_explanation(
    model: keras.Model,
    input_image: np.ndarray,
    class_idx: int = None,
    layer_name: str = 'conv2'
) -> tuple:
    """
    Generate Grad-CAM explanation for a prediction.
    
    Args:
        model: Trained Keras model
        input_image: Preprocessed input image
        class_idx: Target class (None for predicted class)
        layer_name: Convolutional layer to use
    
    Returns:
        Tuple of (heatmap, overlay_image)
    """
    gradcam = GradCAM(model, layer_name)
    heatmap = gradcam.generate_heatmap(input_image, class_idx)
    overlay = gradcam.generate_overlay(input_image, heatmap)
    
    return heatmap, overlay
