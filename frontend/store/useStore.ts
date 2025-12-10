/**
 * Zustand store for VisionForge application state
 */

import { create } from 'zustand';

export interface ScanResult {
    processedImage: string;
    featureMapsConv1: string[];
    featureMapsConv2: string[];
    denseActivations: number[];
    probabilities: number[];
    prediction: number;
}

export interface ExplainResult {
    heatmap: string;
    overlay: string;
    prediction: number;
    confidence: number;
}

export interface ChallengeState {
    isActive: boolean;
    targetDigit: number;
    confusionDigit: number;
    attempts: number;
    successes: number;
}

interface AppState {
    // Canvas state
    canvasDataUrl: string | null;
    isDrawing: boolean;

    // Analysis state
    isAnalyzing: boolean;
    isExplaining: boolean;
    scanResult: ScanResult | null;
    explainResult: ExplainResult | null;
    error: string | null;

    // Visualization state
    currentStep: number;
    isVisualizationActive: boolean;
    showExplanation: boolean;

    // Challenge mode
    challenge: ChallengeState;

    // Actions
    setCanvasDataUrl: (url: string | null) => void;
    setIsDrawing: (drawing: boolean) => void;
    setIsAnalyzing: (analyzing: boolean) => void;
    setIsExplaining: (explaining: boolean) => void;
    setScanResult: (result: ScanResult | null) => void;
    setExplainResult: (result: ExplainResult | null) => void;
    setError: (error: string | null) => void;
    setCurrentStep: (step: number) => void;
    setIsVisualizationActive: (active: boolean) => void;
    setShowExplanation: (show: boolean) => void;

    // Challenge actions
    startChallenge: () => void;
    endChallenge: () => void;
    recordAttempt: (success: boolean) => void;

    // Compound actions
    reset: () => void;
    clearAnalysis: () => void;
}

// Random pairs of digits that are commonly confused
const confusionPairs = [
    [4, 9],
    [3, 8],
    [1, 7],
    [5, 6],
    [2, 7],
    [0, 6],
];

export const useStore = create<AppState>((set, get) => ({
    // Initial state
    canvasDataUrl: null,
    isDrawing: false,
    isAnalyzing: false,
    isExplaining: false,
    scanResult: null,
    explainResult: null,
    error: null,
    currentStep: 0,
    isVisualizationActive: false,
    showExplanation: false,

    challenge: {
        isActive: false,
        targetDigit: 4,
        confusionDigit: 9,
        attempts: 0,
        successes: 0,
    },

    // Basic setters
    setCanvasDataUrl: (url) => set({ canvasDataUrl: url }),
    setIsDrawing: (drawing) => set({ isDrawing: drawing }),
    setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
    setIsExplaining: (explaining) => set({ isExplaining: explaining }),
    setScanResult: (result) => set({ scanResult: result }),
    setExplainResult: (result) => set({ explainResult: result }),
    setError: (error) => set({ error: error }),
    setCurrentStep: (step) => set({ currentStep: step }),
    setIsVisualizationActive: (active) => set({ isVisualizationActive: active }),
    setShowExplanation: (show) => set({ showExplanation: show }),

    // Challenge actions
    startChallenge: () => {
        const pair = confusionPairs[Math.floor(Math.random() * confusionPairs.length)];
        set({
            challenge: {
                isActive: true,
                targetDigit: pair[0],
                confusionDigit: pair[1],
                attempts: 0,
                successes: 0,
            },
        });
    },

    endChallenge: () => {
        set({
            challenge: {
                ...get().challenge,
                isActive: false,
            },
        });
    },

    recordAttempt: (success) => {
        const current = get().challenge;
        set({
            challenge: {
                ...current,
                attempts: current.attempts + 1,
                successes: success ? current.successes + 1 : current.successes,
            },
        });
    },

    // Compound actions
    reset: () => set({
        canvasDataUrl: null,
        scanResult: null,
        explainResult: null,
        error: null,
        currentStep: 0,
        isVisualizationActive: false,
        showExplanation: false,
    }),

    clearAnalysis: () => set({
        scanResult: null,
        explainResult: null,
        error: null,
        currentStep: 0,
        isVisualizationActive: false,
        showExplanation: false,
    }),
}));
