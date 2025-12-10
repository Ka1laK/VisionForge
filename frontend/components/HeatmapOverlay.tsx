'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeatmapOverlayProps {
    originalImage: string;
    heatmap: string;
    overlay: string;
    prediction: number;
    confidence: number;
}

export default function HeatmapOverlay({
    originalImage,
    heatmap,
    overlay,
    prediction,
    confidence,
}: HeatmapOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
        >
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-neuro-neural-warning mb-2">
                    🔍 Explicación de la Decisión (Grad-CAM)
                </h3>
                <p className="text-neuro-text-secondary text-sm">
                    Las zonas cálidas (rojo/amarillo) muestran los píxeles más importantes para predecir el dígito <strong>{prediction}</strong>.
                </p>
            </div>

            {/* Image comparison */}
            <div className="grid grid-cols-3 gap-4">
                {/* Original */}
                <div className="text-center">
                    <div className="bg-neuro-bg-primary rounded-lg p-2 inline-block">
                        <img
                            src={`data:image/png;base64,${originalImage}`}
                            alt="Original"
                            className="w-28 h-28 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    <p className="text-neuro-text-muted text-xs mt-2">Tu dibujo</p>
                </div>

                {/* Heatmap */}
                <div className="text-center">
                    <div className="bg-neuro-bg-primary rounded-lg p-2 inline-block">
                        <img
                            src={`data:image/png;base64,${heatmap}`}
                            alt="Heatmap"
                            className="w-28 h-28 object-contain"
                        />
                    </div>
                    <p className="text-neuro-text-muted text-xs mt-2">Mapa de calor</p>
                </div>

                {/* Overlay */}
                <div className="text-center">
                    <div className="heatmap-overlay bg-neuro-bg-primary rounded-lg p-2 inline-block">
                        <img
                            src={`data:image/png;base64,${overlay}`}
                            alt="Overlay"
                            className="w-28 h-28 object-contain"
                        />
                    </div>
                    <p className="text-neuro-text-muted text-xs mt-2">Superposición</p>
                </div>
            </div>

            {/* Explanation */}
            <div className="mt-6 bg-neuro-bg-primary/50 rounded-lg p-4">
                <p className="text-neuro-text-primary text-sm leading-relaxed">
                    <span className="text-neuro-neural-warning font-semibold">¿Por qué esa decisión?</span>{' '}
                    La red neuronal se enfocó en las áreas destacadas para determinar que el dígito es un{' '}
                    <span className="text-neuro-neural-active font-bold">{prediction}</span> con una confianza del{' '}
                    <span className="text-neuro-accent font-semibold">{(confidence * 100).toFixed(1)}%</span>.
                    Esto demuestra que la IA aprende a reconocer las características distintivas de cada número.
                </p>
            </div>

            {/* Color legend */}
            <div className="mt-4 flex justify-center items-center gap-2">
                <div className="w-32 h-3 rounded-full bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600" />
                <span className="text-neuro-text-muted text-xs">Baja → Alta importancia</span>
            </div>
        </motion.div>
    );
}
