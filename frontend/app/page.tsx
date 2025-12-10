'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
    scanImage,
    explainPrediction,
    transformScanResponse,
    transformExplainResponse,
} from '@/lib/api';
import DrawingCanvas from '@/components/DrawingCanvas';
import VisualizationTimeline from '@/components/VisualizationTimeline';
import HeatmapOverlay from '@/components/HeatmapOverlay';
import ConfusionChallenge from '@/components/ConfusionChallenge';
import Glossary from '@/components/Glossary';

export default function Home() {
    const {
        canvasDataUrl,
        isAnalyzing,
        isExplaining,
        scanResult,
        explainResult,
        error,
        showExplanation,
        challenge,
        setIsAnalyzing,
        setIsExplaining,
        setScanResult,
        setExplainResult,
        setError,
        setIsVisualizationActive,
        setShowExplanation,
        recordAttempt,
    } = useStore();

    // Handle image analysis
    const handleAnalyze = useCallback(async () => {
        if (!canvasDataUrl) {
            setError('Por favor, dibuja un dígito primero');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setShowExplanation(false);
        setExplainResult(null);

        try {
            const response = await scanImage(canvasDataUrl);
            const result = transformScanResponse(response);
            setScanResult(result);
            setIsVisualizationActive(true);

            // Check challenge result
            if (challenge.isActive) {
                const success = result.prediction === challenge.confusionDigit;
                recordAttempt(success);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al analizar la imagen');
        } finally {
            setIsAnalyzing(false);
        }
    }, [
        canvasDataUrl,
        challenge,
        recordAttempt,
        setIsAnalyzing,
        setError,
        setShowExplanation,
        setExplainResult,
        setScanResult,
        setIsVisualizationActive,
    ]);

    // Handle Grad-CAM explanation
    const handleExplain = useCallback(async () => {
        if (!canvasDataUrl) return;

        setIsExplaining(true);
        setError(null);

        try {
            const response = await explainPrediction(canvasDataUrl);
            const result = transformExplainResponse(response);
            setExplainResult(result);
            setShowExplanation(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al generar explicación');
        } finally {
            setIsExplaining(false);
        }
    }, [canvasDataUrl, setIsExplaining, setError, setExplainResult, setShowExplanation]);

    return (
        <div className="min-h-screen py-8 px-4">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-12">
                <div className="flex justify-between items-start">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-neuro-accent to-neuro-neural-active bg-clip-text text-transparent">
                                VisionForge
                            </span>
                        </h1>
                        <p className="text-xl text-neuro-text-secondary">
                            El Escáner Neuronal 🧠
                        </p>
                        <p className="text-neuro-text-muted text-sm mt-2 max-w-lg">
                            Observa cómo una Red Neuronal Convolucional &quot;piensa&quot; mientras reconoce
                            los dígitos que dibujas. Visualiza el proceso capa por capa.
                        </p>
                    </motion.div>

                    <Glossary />
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {/* Error display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400"
                        >
                            ⚠️ {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left column: Canvas and Challenge */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card"
                        >
                            <h2 className="text-xl font-semibold text-neuro-accent mb-4">
                                ✏️ Terminal de Entrada
                            </h2>
                            <DrawingCanvas onAnalyze={handleAnalyze} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <ConfusionChallenge />
                        </motion.div>
                    </div>

                    {/* Right column: Visualization */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {!scanResult && !isAnalyzing && (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="card text-center py-16"
                                >
                                    <div className="text-6xl mb-4">🔬</div>
                                    <h3 className="text-xl text-neuro-text-secondary mb-2">
                                        Esperando tu dibujo...
                                    </h3>
                                    <p className="text-neuro-text-muted text-sm max-w-md mx-auto">
                                        Dibuja un dígito del 0 al 9 en el lienzo y presiona
                                        &quot;Analizar con IA&quot; para ver cómo la red neuronal procesa tu imagen.
                                    </p>
                                </motion.div>
                            )}

                            {isAnalyzing && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="card text-center py-16"
                                >
                                    <div className="inline-block">
                                        <div className="spinner mx-auto mb-4" />
                                    </div>
                                    <h3 className="text-xl text-neuro-accent mb-2">
                                        Escaneando tu dibujo...
                                    </h3>
                                    <p className="text-neuro-text-muted text-sm">
                                        La red neuronal está procesando la imagen capa por capa
                                    </p>
                                </motion.div>
                            )}

                            {scanResult && !isAnalyzing && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <VisualizationTimeline scanResult={scanResult} />

                                    {/* XAI Button */}
                                    <div className="flex justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleExplain}
                                            disabled={isExplaining}
                                            className="px-6 py-3 bg-gradient-to-r from-neuro-neural-warning to-orange-600 
                        text-neuro-bg-primary font-semibold rounded-lg shadow-lg 
                        hover:shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {isExplaining ? (
                                                <>
                                                    <span className="spinner inline-block w-4 h-4 mr-2" />
                                                    Generando...
                                                </>
                                            ) : (
                                                '🔍 ¿Por qué tomaste esa decisión?'
                                            )}
                                        </motion.button>
                                    </div>

                                    {/* Grad-CAM Explanation */}
                                    <AnimatePresence>
                                        {showExplanation && explainResult && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <HeatmapOverlay
                                                    originalImage={scanResult.processedImage}
                                                    heatmap={explainResult.heatmap}
                                                    overlay={explainResult.overlay}
                                                    prediction={explainResult.prediction}
                                                    confidence={explainResult.confidence}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer info */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center text-neuro-text-muted text-sm"
                >
                    <div className="flex justify-center gap-6 flex-wrap">
                        <span>🧠 Red Neuronal Convolucional (CNN)</span>
                        <span>📊 Dataset: MNIST</span>
                        <span>🔥 Explicabilidad: Grad-CAM</span>
                    </div>
                    <p className="mt-3">
                        Una demostración interactiva de Inteligencia Artificial Explicable (XAI)
                    </p>
                </motion.footer>
            </main>
        </div>
    );
}
