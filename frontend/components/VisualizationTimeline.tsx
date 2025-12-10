'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, ScanResult } from '@/store/useStore';
import FeatureMapGrid from './FeatureMapGrid';
import NeuralNetworkViz from './NeuralNetworkViz';
import ProbabilityChart from './ProbabilityChart';

interface VisualizationTimelineProps {
    scanResult: ScanResult;
}

interface TimelineStep {
    id: number;
    title: string;
    description: string;
    icon: string;
}

const steps: TimelineStep[] = [
    {
        id: 0,
        title: 'Tu Dibujo',
        description: 'La imagen de entrada procesada para el modelo',
        icon: '✏️',
    },
    {
        id: 1,
        title: 'Convolución 1',
        description: 'Detectando trazos simples (bordes, curvas)',
        icon: '🔬',
    },
    {
        id: 2,
        title: 'Convolución 2',
        description: 'Reconociendo partes del número (lazos, intersecciones)',
        icon: '🧩',
    },
    {
        id: 3,
        title: 'Capa Densa',
        description: 'Combinando patrones para formar conceptos',
        icon: '🧠',
    },
    {
        id: 4,
        title: 'Decisión Final',
        description: 'Probabilidad asignada a cada dígito',
        icon: '🎯',
    },
];

export default function VisualizationTimeline({
    scanResult,
}: VisualizationTimelineProps) {
    const { currentStep, setCurrentStep } = useStore();

    return (
        <div className="w-full">
            {/* Step navigation */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentStep(index)}
                                className={`flex items-center justify-center w-12 h-12 rounded-full 
                  transition-all duration-300 ${currentStep === index
                                        ? 'bg-neuro-accent text-neuro-bg-primary shadow-neuro'
                                        : currentStep > index
                                            ? 'bg-neuro-neural-active/20 text-neuro-neural-active border border-neuro-neural-active/50'
                                            : 'bg-neuro-bg-tertiary text-neuro-text-muted border border-neuro-border'
                                    }`}
                            >
                                <span className="text-lg">{step.icon}</span>
                            </motion.button>

                            {index < steps.length - 1 && (
                                <div
                                    className={`w-8 h-0.5 transition-colors duration-300 ${currentStep > index
                                            ? 'bg-neuro-neural-active'
                                            : 'bg-neuro-border'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Current step title */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-2xl font-bold text-neuro-accent mb-2">
                    Paso {currentStep + 1}: {steps[currentStep].title}
                </h2>
                <p className="text-neuro-text-secondary">
                    {steps[currentStep].description}
                </p>
            </motion.div>

            {/* Step content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 0 && (
                        <div className="flex justify-center">
                            <div className="card inline-block">
                                <h3 className="text-xl font-semibold text-neuro-accent mb-4 text-center">
                                    Imagen Procesada (28×28 píxeles)
                                </h3>
                                <div className="bg-neuro-bg-primary rounded-lg p-4 inline-block">
                                    <img
                                        src={`data:image/png;base64,${scanResult.processedImage}`}
                                        alt="Processed input"
                                        className="w-56 h-56 object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                </div>
                                <p className="text-neuro-text-muted text-sm mt-4 text-center max-w-sm">
                                    Tu dibujo redimensionado e invertido para coincidir con el formato MNIST que la red neuronal espera.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <FeatureMapGrid
                            featureMaps={scanResult.featureMapsConv1}
                            title="Mapas de Características - Capa Convolucional 1"
                            description="La primera capa detecta características básicas como bordes horizontales, verticales y curvas. Cada imagen muestra qué ha detectado un filtro diferente."
                            columns={4}
                        />
                    )}

                    {currentStep === 2 && (
                        <FeatureMapGrid
                            featureMaps={scanResult.featureMapsConv2}
                            title="Mapas de Características - Capa Convolucional 2"
                            description="La segunda capa combina los patrones simples para detectar estructuras más complejas como lazos, esquinas y partes específicas de los dígitos."
                            columns={4}
                        />
                    )}

                    {currentStep === 3 && (
                        <NeuralNetworkViz activations={scanResult.denseActivations} />
                    )}

                    {currentStep === 4 && (
                        <ProbabilityChart
                            probabilities={scanResult.probabilities}
                            prediction={scanResult.prediction}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-center gap-4 mt-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ← Anterior
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={currentStep === steps.length - 1}
                    className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Siguiente →
                </motion.button>
            </div>
        </div>
    );
}
