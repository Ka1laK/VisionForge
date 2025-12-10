'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function ConfusionChallenge() {
    const { challenge, startChallenge, endChallenge, scanResult } = useStore();

    // Check if current attempt is a success
    const isSuccess =
        scanResult &&
        challenge.isActive &&
        scanResult.prediction === challenge.confusionDigit;

    return (
        <div className="card">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-neuro-neural-warning mb-2">
                    🎮 Desafío de Confusión
                </h3>
                <p className="text-neuro-text-secondary text-sm">
                    ¿Puedes engañar a la IA? Intenta dibujar un dígito que la red confunda con otro.
                </p>
            </div>

            {!challenge.isActive ? (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startChallenge}
                    className="w-full py-4 bg-gradient-to-r from-neuro-neural-warning to-orange-600 
            text-neuro-bg-primary font-bold rounded-lg transition-all hover:shadow-lg"
                >
                    🎯 Iniciar Desafío
                </motion.button>
            ) : (
                <div className="space-y-4">
                    {/* Challenge info */}
                    <div className="bg-neuro-bg-primary rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-neuro-text-muted text-sm">Objetivo:</p>
                                <p className="text-lg">
                                    Dibuja un <span className="text-neuro-accent font-bold text-2xl">{challenge.targetDigit}</span>
                                    {' '}que parezca un{' '}
                                    <span className="text-neuro-neural-warning font-bold text-2xl">{challenge.confusionDigit}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-neuro-text-muted text-sm">Intentos:</p>
                                <p className="text-lg font-mono">
                                    <span className="text-neuro-neural-active">{challenge.successes}</span>
                                    {' '}/{' '}
                                    <span className="text-neuro-text-secondary">{challenge.attempts}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Result feedback */}
                    {scanResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-4 rounded-lg text-center ${isSuccess
                                    ? 'bg-neuro-neural-active/20 border border-neuro-neural-active'
                                    : 'bg-red-500/20 border border-red-500'
                                }`}
                        >
                            {isSuccess ? (
                                <>
                                    <p className="text-neuro-neural-active text-xl font-bold">
                                        🎉 ¡Éxito!
                                    </p>
                                    <p className="text-neuro-text-secondary text-sm mt-1">
                                        La IA predijo {scanResult.prediction} en lugar de {challenge.targetDigit}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-red-400 text-xl font-bold">
                                        ❌ Intenta de nuevo
                                    </p>
                                    <p className="text-neuro-text-secondary text-sm mt-1">
                                        La IA predijo {scanResult.prediction}.
                                        Necesitas que prediga {challenge.confusionDigit}.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Tips */}
                    <div className="bg-neuro-bg-tertiary/50 rounded-lg p-3">
                        <p className="text-neuro-text-muted text-xs">
                            💡 <strong>Tip:</strong> Los dígitos {challenge.targetDigit} y {challenge.confusionDigit}{' '}
                            comparten características visuales similares. Exagera las partes que los hacen parecidos.
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={endChallenge}
                        className="w-full py-2 btn-secondary text-sm"
                    >
                        Terminar Desafío
                    </motion.button>
                </div>
            )}
        </div>
    );
}
