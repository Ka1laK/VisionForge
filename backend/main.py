"""
VisionForge: El Escáner Neuronal - Backend API

FastAPI application providing CNN inference and XAI capabilities
for interactive digit recognition visualization.
"""

import os
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2

from .model import load_model, create_feature_extraction_model, get_layer_activations
from .gradcam import generate_gradcam_explanation
from .preprocessing import (
    base64_to_image,
    image_to_base64,
    numpy_to_base64,
    preprocess_for_mnist,
    get_processed_image_base64
)


# Global model variables
model = None
feature_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    global model, feature_model
    
    # Get model path
    model_path = os.path.join(os.path.dirname(__file__), "mnist_cnn_model.keras")
    
    print("[INFO] Loading CNN model...")
    model = load_model(model_path)
    feature_model = create_feature_extraction_model(model)
    print("[OK] Model loaded successfully!")
    
    yield
    
    # Cleanup
    print("[INFO] Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="VisionForge: El Escáner Neuronal",
    description="""
    API para visualización interactiva de Redes Neuronales Convolucionales.
    
    ## Endpoints
    
    - **POST /scan**: Analiza un dibujo y devuelve los mapas de características
    - **POST /explain**: Genera un mapa de calor Grad-CAM para explicar la predicción
    
    ## Conceptos
    
    - **Feature Maps**: Representaciones intermedias de la imagen
    - **Grad-CAM**: Visualización de las regiones importantes para la decisión
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ScanRequest(BaseModel):
    """Request model for the /scan endpoint."""
    image: str  # Base64 encoded image


class ScanResponse(BaseModel):
    """Response model for the /scan endpoint."""
    processed_image: str  # Base64 encoded 28x28 processed image
    feature_maps_conv1: list[str]  # List of base64 encoded feature maps
    feature_maps_conv2: list[str]  # List of base64 encoded feature maps
    dense_activations: list[float]  # Activations from dense layer
    probabilities: list[float]  # Probability for each digit
    prediction: int  # Predicted digit


class ExplainRequest(BaseModel):
    """Request model for the /explain endpoint."""
    image: str  # Base64 encoded image
    class_idx: Optional[int] = None  # Target class (None for predicted)


class ExplainResponse(BaseModel):
    """Response model for the /explain endpoint."""
    heatmap: str  # Base64 encoded heatmap
    overlay: str  # Base64 encoded overlay image
    prediction: int  # Predicted digit
    confidence: float  # Confidence score


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "message": "VisionForge Neural Scanner API",
        "endpoints": ["/scan", "/explain"]
    }


@app.post("/scan", response_model=ScanResponse)
async def scan_image(request: ScanRequest):
    """
    Analyze a drawn digit and return feature maps and predictions.
    
    This endpoint:
    1. Preprocesses the input image for MNIST format
    2. Extracts feature maps from convolutional layers
    3. Returns the prediction with probabilities
    """
    global model, feature_model
    
    if model is None or feature_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Decode and preprocess image
        image = base64_to_image(request.image)
        processed = preprocess_for_mnist(image)
        
        # Get all layer activations
        activations = get_layer_activations(feature_model, processed)
        
        # Extract feature maps from conv layers
        conv1_maps = activations['conv1'][0]  # Shape: (14, 14, 32)
        conv2_maps = activations['conv2'][0]  # Shape: (7, 7, 64)
        
        # Convert feature maps to base64 images
        # Select a subset for visualization (first 16 maps)
        feature_maps_conv1 = []
        for i in range(min(16, conv1_maps.shape[-1])):
            feature_map = conv1_maps[:, :, i]
            # Resize for better visibility
            feature_map_resized = cv2.resize(feature_map, (56, 56), interpolation=cv2.INTER_NEAREST)
            feature_maps_conv1.append(numpy_to_base64(feature_map_resized))
        
        feature_maps_conv2 = []
        for i in range(min(16, conv2_maps.shape[-1])):
            feature_map = conv2_maps[:, :, i]
            # Resize for better visibility
            feature_map_resized = cv2.resize(feature_map, (56, 56), interpolation=cv2.INTER_NEAREST)
            feature_maps_conv2.append(numpy_to_base64(feature_map_resized))
        
        # Get dense layer activations
        dense_activations = activations['dense1'][0].tolist()
        
        # Get predictions
        probabilities = activations['predictions'][0].tolist()
        prediction = int(np.argmax(probabilities))
        
        # Get processed image as base64
        processed_image = get_processed_image_base64(image)
        
        return ScanResponse(
            processed_image=processed_image,
            feature_maps_conv1=feature_maps_conv1,
            feature_maps_conv2=feature_maps_conv2,
            dense_activations=dense_activations,
            probabilities=probabilities,
            prediction=prediction
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


@app.post("/explain", response_model=ExplainResponse)
async def explain_prediction(request: ExplainRequest):
    """
    Generate a Grad-CAM explanation for the prediction.
    
    This endpoint:
    1. Generates a Grad-CAM heatmap highlighting important regions
    2. Creates an overlay visualization
    3. Returns both the heatmap and overlay as base64 images
    """
    global model
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Decode and preprocess image
        image = base64_to_image(request.image)
        processed = preprocess_for_mnist(image)
        
        # Get prediction
        predictions = model.predict(processed, verbose=0)
        prediction = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][prediction])
        
        # Use specified class or predicted class
        target_class = request.class_idx if request.class_idx is not None else prediction
        
        # Generate Grad-CAM
        heatmap, overlay = generate_gradcam_explanation(
            model,
            processed,
            class_idx=target_class,
            layer_name='conv2'
        )
        
        # Convert to base64
        # Resize heatmap for better visibility
        heatmap_resized = cv2.resize(heatmap, (112, 112), interpolation=cv2.INTER_LINEAR)
        heatmap_base64 = numpy_to_base64(heatmap_resized)
        
        # Resize overlay
        overlay_resized = cv2.resize(overlay, (112, 112), interpolation=cv2.INTER_LINEAR)
        from PIL import Image
        overlay_pil = Image.fromarray(cv2.cvtColor(overlay_resized, cv2.COLOR_BGR2RGB))
        overlay_base64 = image_to_base64(overlay_pil)
        
        return ExplainResponse(
            heatmap=heatmap_base64,
            overlay=overlay_base64,
            prediction=prediction,
            confidence=confidence
        )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating explanation: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
