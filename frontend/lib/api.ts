/**
 * API service layer for communicating with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ScanResponse {
    processed_image: string;
    feature_maps_conv1: string[];
    feature_maps_conv2: string[];
    dense_activations: number[];
    probabilities: number[];
    prediction: number;
}

export interface ExplainResponse {
    heatmap: string;
    overlay: string;
    prediction: number;
    confidence: number;
}

/**
 * Send an image to the /scan endpoint for analysis
 */
export async function scanImage(imageBase64: string): Promise<ScanResponse> {
    const response = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

/**
 * Send an image to the /explain endpoint for Grad-CAM visualization
 */
export async function explainPrediction(
    imageBase64: string,
    classIdx?: number
): Promise<ExplainResponse> {
    const response = await fetch(`${API_BASE_URL}/explain`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: imageBase64,
            class_idx: classIdx,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

/**
 * Check if the backend API is available
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Transform API response to store format
 */
export function transformScanResponse(response: ScanResponse) {
    return {
        processedImage: response.processed_image,
        featureMapsConv1: response.feature_maps_conv1,
        featureMapsConv2: response.feature_maps_conv2,
        denseActivations: response.dense_activations,
        probabilities: response.probabilities,
        prediction: response.prediction,
    };
}

/**
 * Transform explain API response to store format
 */
export function transformExplainResponse(response: ExplainResponse) {
    return {
        heatmap: response.heatmap,
        overlay: response.overlay,
        prediction: response.prediction,
        confidence: response.confidence,
    };
}
