"""
Image preprocessing utilities for MNIST-style digit recognition.
Handles base64 encoding/decoding and image transformations.

Enhanced preprocessing pipeline for better recognition of:
- Digits with similar silhouettes (1/7, 3/8, 4/9, 5/6)
- Unusual stroke styles
- Varying stroke widths
"""

import base64
import io
import numpy as np
from PIL import Image, ImageFilter, ImageOps
import cv2
from scipy import ndimage


def base64_to_image(base64_string: str) -> Image.Image:
    """
    Convert a base64 encoded string to a PIL Image.
    Handles data URL prefix if present.
    """
    # Remove data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return image


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """
    Convert a PIL Image to a base64 encoded string.
    """
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def numpy_to_base64(array: np.ndarray, normalize: bool = True) -> str:
    """
    Convert a numpy array to a base64 encoded PNG image.
    Useful for feature maps and heatmaps.
    """
    if normalize:
        # Normalize to 0-255 range
        array = array - array.min()
        if array.max() > 0:
            array = array / array.max()
        array = (array * 255).astype(np.uint8)
    else:
        array = array.astype(np.uint8)
    
    image = Image.fromarray(array)
    return image_to_base64(image)


def remove_small_components(binary_img: np.ndarray, min_size: int = 50) -> np.ndarray:
    """
    Remove small connected components (noise) from binary image.
    Keeps only the largest connected component.
    """
    # Find connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        binary_img, connectivity=8
    )
    
    if num_labels <= 1:
        return binary_img
    
    # Find largest component (excluding background which is label 0)
    areas = stats[1:, cv2.CC_STAT_AREA]
    if len(areas) == 0:
        return binary_img
    
    # Get the largest component
    largest_label = 1 + np.argmax(areas)
    
    # Create mask for the largest component
    result = np.zeros_like(binary_img)
    result[labels == largest_label] = 255
    
    return result


def thin_stroke(binary_img: np.ndarray, iterations: int = 2) -> np.ndarray:
    """
    Apply morphological thinning to normalize stroke width.
    This helps with varying stroke widths from different drawing styles.
    """
    kernel = np.ones((3, 3), np.uint8)
    
    # Dilate first to connect broken strokes
    dilated = cv2.dilate(binary_img, kernel, iterations=1)
    
    # Then erode to thin
    eroded = cv2.erode(dilated, kernel, iterations=iterations)
    
    return eroded


def normalize_stroke_width(binary_img: np.ndarray) -> np.ndarray:
    """
    Normalize stroke width using skeletonization followed by controlled dilation.
    This ensures consistent stroke width regardless of how thick the user draws.
    """
    # Skeletonize using morphological operations
    skeleton = np.zeros_like(binary_img)
    temp = binary_img.copy()
    
    kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    
    while True:
        eroded = cv2.erode(temp, kernel)
        temp_opened = cv2.dilate(eroded, kernel)
        subset = cv2.subtract(temp, temp_opened)
        skeleton = cv2.bitwise_or(skeleton, subset)
        temp = eroded.copy()
        
        if cv2.countNonZero(temp) == 0:
            break
    
    # Dilate skeleton to get consistent stroke width (similar to MNIST)
    dilation_kernel = np.ones((2, 2), np.uint8)
    normalized = cv2.dilate(skeleton, dilation_kernel, iterations=1)
    
    return normalized


def enhance_contrast(gray_img: np.ndarray) -> np.ndarray:
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    for better contrast in varying lighting conditions.
    """
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
    return clahe.apply(gray_img)


def adaptive_threshold(gray_img: np.ndarray) -> np.ndarray:
    """
    Apply adaptive thresholding with Otsu's method for better binarization.
    Falls back to adaptive threshold if Otsu fails.
    """
    # First try Otsu's method
    _, otsu = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Check if Otsu produced reasonable result
    white_ratio = np.sum(otsu > 0) / otsu.size
    
    if white_ratio < 0.01 or white_ratio > 0.9:
        # Otsu failed, use adaptive threshold
        binary = cv2.adaptiveThreshold(
            gray_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
    else:
        binary = otsu
    
    return binary


def center_digit_by_mass(img_28x28: np.ndarray) -> np.ndarray:
    """
    Center digit using center of mass calculation.
    Uses scipy for more accurate moment calculation.
    """
    # Calculate center of mass
    cy, cx = ndimage.center_of_mass(img_28x28)
    
    if np.isnan(cx) or np.isnan(cy):
        return img_28x28
    
    # Target center is (13.5, 13.5) for 28x28 image
    shift_x = int(13.5 - cx)
    shift_y = int(13.5 - cy)
    
    # Shift image
    M = np.float32([[1, 0, shift_x], [0, 1, shift_y]])
    centered = cv2.warpAffine(img_28x28, M, (28, 28), borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    
    return centered


def preprocess_for_mnist(image: Image.Image) -> np.ndarray:
    """
    Advanced preprocessing pipeline for MNIST model input.
    
    Enhanced to handle:
    - Digits with similar silhouettes (1/7, 3/8, 4/9, 5/6)
    - Unusual stroke styles (thin, thick, broken)
    - Varying drawing speeds and pressures
    - Noisy or inconsistent strokes
    
    Pipeline:
    1. Convert to grayscale and normalize orientation
    2. Apply adaptive thresholding (Otsu + fallback)
    3. Remove noise and small components
    4. Normalize stroke width via skeletonization
    5. Center digit using center of mass
    6. Apply anti-aliasing for smooth edges
    7. Normalize to 0-1 range for model input
    """
    try:
        # Step 1: Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        img_array = np.array(image)
        
        # Step 2: Determine and correct background/foreground
        # Use histogram analysis for better background detection
        hist = cv2.calcHist([img_array], [0], None, [256], [0, 256]).flatten()
        background_val = np.argmax(hist)
        
        if background_val > 127:
            # Light background, dark strokes - invert
            img_array = 255 - img_array
        
        # Step 3: Enhanced contrast using CLAHE
        img_enhanced = enhance_contrast(img_array)
        
        # Step 4: Adaptive thresholding with Otsu
        binary = adaptive_threshold(img_enhanced)
        
        # Step 5: Remove small noise components
        binary = remove_small_components(binary)
        
        # Check if we have any content
        if cv2.countNonZero(binary) < 10:
            return np.zeros((1, 28, 28, 1), dtype=np.float32)
        
        # Step 6: Apply gentle morphological operations
        # Close small gaps in strokes
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel_close)
        
        # Step 7: Find bounding box with padding
        coords = np.column_stack(np.where(binary > 0))
        
        if len(coords) == 0:
            return np.zeros((1, 28, 28, 1), dtype=np.float32)
        
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        
        # Add small padding around the digit
        padding = 2
        h, w = img_array.shape
        y_min = max(0, y_min - padding)
        x_min = max(0, x_min - padding)
        y_max = min(h - 1, y_max + padding)
        x_max = min(w - 1, x_max + padding)
        
        # Extract digit region
        digit = binary[y_min:y_max + 1, x_min:x_max + 1]
        
        # Step 8: Resize preserving aspect ratio
        digit_h, digit_w = digit.shape
        
        # Target size (20x20 with 4px padding each side = 28x28)
        target_size = 20
        
        # Calculate new dimensions preserving aspect ratio
        aspect_ratio = digit_w / digit_h
        
        if digit_h > digit_w:
            new_h = target_size
            new_w = max(1, int(target_size * aspect_ratio))
        else:
            new_w = target_size
            new_h = max(1, int(target_size / aspect_ratio))
        
        # Use INTER_AREA for downscaling, INTER_CUBIC for upscaling
        if digit_h > new_h or digit_w > new_w:
            interpolation = cv2.INTER_AREA
        else:
            interpolation = cv2.INTER_CUBIC
        
        digit_resized = cv2.resize(digit, (new_w, new_h), interpolation=interpolation)
        
        # Step 9: Place in 28x28 canvas centered
        canvas = np.zeros((28, 28), dtype=np.uint8)
        
        y_offset = (28 - new_h) // 2
        x_offset = (28 - new_w) // 2
        
        # Ensure offsets are non-negative
        y_offset = max(0, y_offset)
        x_offset = max(0, x_offset)
        
        # Calculate the region to copy
        copy_h = min(new_h, 28 - y_offset)
        copy_w = min(new_w, 28 - x_offset)
        
        canvas[y_offset:y_offset + copy_h, x_offset:x_offset + copy_w] = digit_resized[:copy_h, :copy_w]
        
        # Step 10: Center using center of mass (more accurate than geometric center)
        canvas = center_digit_by_mass(canvas)
        
        # Step 11: Apply Gaussian blur for anti-aliasing (mimics MNIST style)
        canvas = cv2.GaussianBlur(canvas, (3, 3), 0.5)
        
        # Step 12: Re-normalize intensity to full range
        if canvas.max() > 0:
            canvas = (canvas.astype(np.float32) / canvas.max() * 255).astype(np.uint8)
        
        # Step 13: Normalize to 0-1 range
        img_normalized = canvas.astype(np.float32) / 255.0
        
        # Add batch and channel dimensions: (1, 28, 28, 1)
        img_final = np.expand_dims(np.expand_dims(img_normalized, axis=0), axis=-1)
        
        return img_final
        
    except Exception as e:
        # Log error and return blank image
        print(f"Preprocessing error: {e}")
        return np.zeros((1, 28, 28, 1), dtype=np.float32)


def create_heatmap_overlay(
    original_image: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.4
) -> np.ndarray:
    """
    Create a colored heatmap overlay on the original image.
    Uses JET colormap for visualization.
    """
    # Ensure heatmap is 2D
    if len(heatmap.shape) > 2:
        heatmap = heatmap.squeeze()
    
    # Normalize heatmap
    heatmap = heatmap - heatmap.min()
    if heatmap.max() > 0:
        heatmap = heatmap / heatmap.max()
    
    # Resize heatmap to match original image
    heatmap_resized = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
    
    # Apply colormap
    heatmap_colored = cv2.applyColorMap(
        (heatmap_resized * 255).astype(np.uint8),
        cv2.COLORMAP_JET
    )
    
    # Convert original to BGR if grayscale
    if len(original_image.shape) == 2:
        original_bgr = cv2.cvtColor(original_image, cv2.COLOR_GRAY2BGR)
    else:
        original_bgr = original_image
    
    # Blend images
    overlay = cv2.addWeighted(original_bgr, 1 - alpha, heatmap_colored, alpha, 0)
    
    return overlay


def get_processed_image_base64(image: Image.Image) -> str:
    """
    Get the preprocessed 28x28 image as base64 for visualization.
    """
    preprocessed = preprocess_for_mnist(image)
    # Remove batch and channel dims, scale back to 0-255
    img_2d = (preprocessed[0, :, :, 0] * 255).astype(np.uint8)
    return numpy_to_base64(img_2d, normalize=False)
