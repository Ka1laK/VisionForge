'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProbabilityChartProps {
    probabilities: number[];
    prediction: number;
}

export default function ProbabilityChart({
    probabilities,
    prediction,
}: ProbabilityChartProps) {
    const maxProb = Math.max(...probabilities);

    return (
        <div className="card">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-neuro-accent mb-2">
                    Decisión Final
                </h3>
                <p className="text-neuro-text-secondary text-sm">
                    Probabilidad asignada a cada dígito. La barra más alta es la predicción.
                </p>
            </div>

            {/* Prediction display */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-neuro-neural-active to-emerald-600 shadow-neural-glow">
                    <span className="text-5xl font-bold text-neuro-bg-primary">
                        {prediction}
                    </span>
                </div>
                <p className="mt-3 text-neuro-neural-active font-semibold">
                    Predicción: {(probabilities[prediction] * 100).toFixed(1)}% de confianza
                </p>
            </motion.div>

            {/* Bar chart */}
            <div className="flex items-end justify-center gap-3 h-48">
                {probabilities.map((prob, digit) => {
                    const heightPercent = (prob / maxProb) * 100;
                    const isWinner = digit === prediction;

                    return (
                        <div key={digit} className="flex flex-col items-center gap-2">
                            {/* Probability value */}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: digit * 0.1 }}
                                className={`text-xs font-mono ${isWinner ? 'text-neuro-neural-active' : 'text-neuro-text-muted'}`}
                            >
                                {(prob * 100).toFixed(0)}%
                            </motion.span>

                            {/* Bar */}
                            <div className="relative w-8 h-36 bg-neuro-bg-primary rounded-t-md overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    transition={{
                                        delay: digit * 0.1,
                                        duration: 0.5,
                                        type: 'spring',
                                        stiffness: 100,
                                    }}
                                    className={`absolute bottom-0 left-0 right-0 rounded-t-md ${isWinner ? 'probability-bar winner' : 'probability-bar'
                                        }`}
                                />
                            </div>

                            {/* Digit label */}
                            <span
                                className={`text-lg font-semibold ${isWinner ? 'text-neuro-neural-active' : 'text-neuro-text-secondary'
                                    }`}
                            >
                                {digit}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
