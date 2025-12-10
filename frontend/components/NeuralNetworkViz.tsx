'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface NeuralNetworkVizProps {
    activations: number[];
    maxNeurons?: number;
}

export default function NeuralNetworkViz({
    activations,
    maxNeurons = 32,
}: NeuralNetworkVizProps) {
    // Sample activations if too many
    const displayActivations = activations.length > maxNeurons
        ? activations.filter((_, i) => i % Math.ceil(activations.length / maxNeurons) === 0)
        : activations;

    // Normalize activations
    const maxActivation = Math.max(...displayActivations, 0.001);
    const normalizedActivations = displayActivations.map(a => a / maxActivation);

    // Create layer layout (8 columns)
    const cols = 8;
    const rows = Math.ceil(normalizedActivations.length / cols);

    return (
        <div className="card">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-neuro-accent mb-2">
                    Capa Densa
                </h3>
                <p className="text-neuro-text-secondary text-sm">
                    Cada neurona representa un patrón aprendido. El brillo indica su nivel de activación.
                </p>
            </div>

            {/* Neural network visualization */}
            <div className="flex justify-center">
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                    {normalizedActivations.map((activation, index) => (
                        <motion.div
                            key={index}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.02, type: 'spring' }}
                            className="relative group"
                        >
                            <div
                                className="w-6 h-6 rounded-full transition-all duration-300"
                                style={{
                                    background: `radial-gradient(circle, 
                    rgba(0, 255, 136, ${activation}) 0%, 
                    rgba(0, 153, 102, ${activation * 0.5}) 50%, 
                    rgba(51, 68, 85, ${1 - activation * 0.8}) 100%)`,
                                    boxShadow: activation > 0.5
                                        ? `0 0 ${activation * 15}px rgba(0, 255, 136, ${activation * 0.7})`
                                        : 'none',
                                }}
                            />

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <div className="bg-neuro-bg-tertiary border border-neuro-accent/50 rounded px-2 py-1 text-xs whitespace-nowrap">
                                    Neurona {index + 1}: {(activation * 100).toFixed(1)}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-neuro-neural-inactive" />
                    <span className="text-neuro-text-muted text-xs">Baja activación</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 255, 136, 1) 0%, rgba(0, 153, 102, 0.5) 100%)',
                            boxShadow: '0 0 8px rgba(0, 255, 136, 0.6)'
                        }}
                    />
                    <span className="text-neuro-text-muted text-xs">Alta activación</span>
                </div>
            </div>
        </div>
    );
}
