'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlossaryTerm {
    term: string;
    definition: string;
    icon: string;
}

const glossaryTerms: GlossaryTerm[] = [
    {
        term: 'Red Neuronal Convolucional (CNN)',
        definition: 'Un tipo de red neuronal especializada en procesar imágenes. Usa filtros que se "deslizan" sobre la imagen para detectar patrones como bordes, esquinas y formas.',
        icon: '🧠',
    },
    {
        term: 'Convolución',
        definition: 'Una operación matemática donde un pequeño filtro (kernel) recorre la imagen, multiplicando y sumando valores. Como pasar una lupa que detecta un patrón específico.',
        icon: '🔬',
    },
    {
        term: 'Mapa de Características',
        definition: 'Es la "huella dactilar" de lo que la red ha encontrado. Cada filtro produce un mapa que muestra dónde detectó su patrón específico en la imagen.',
        icon: '🗺️',
    },
    {
        term: 'Pooling (Submuestreo)',
        definition: 'Una técnica para reducir el tamaño de los mapas de características, conservando la información más importante. Como hacer zoom out manteniendo los detalles clave.',
        icon: '📉',
    },
    {
        term: 'Capa Densa (Fully Connected)',
        definition: 'Las capas finales donde cada neurona está conectada a todas las anteriores. Aquí la red "piensa" y combina todos los patrones detectados para tomar una decisión.',
        icon: '🔗',
    },
    {
        term: 'Softmax',
        definition: 'La función que convierte las activaciones finales en probabilidades. Cada salida se convierte en un porcentaje, y todos suman 100%.',
        icon: '📊',
    },
    {
        term: 'Grad-CAM',
        definition: 'Un "foco" que ilumina las partes más importantes de la imagen para la decisión de la IA. Usa los gradientes para crear un mapa de calor de relevancia.',
        icon: '🔥',
    },
    {
        term: 'MNIST',
        definition: 'Un famoso dataset de dígitos escritos a mano (0-9). Contiene 70,000 imágenes de 28x28 píxeles. Es el "Hola Mundo" del deep learning.',
        icon: '✍️',
    },
];

export default function Glossary() {
    const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Toggle button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-neuro-bg-tertiary 
          border border-neuro-border rounded-lg hover:border-neuro-accent 
          transition-colors"
            >
                <span className="text-xl">📖</span>
                <span className="text-neuro-text-secondary text-sm">Glosario</span>
            </motion.button>

            {/* Glossary panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] overflow-y-auto 
              bg-neuro-bg-secondary border border-neuro-border rounded-xl shadow-2xl z-50"
                    >
                        <div className="p-4 border-b border-neuro-border">
                            <h3 className="text-lg font-semibold text-neuro-accent">
                                📚 Glosario de Conceptos CNN
                            </h3>
                            <p className="text-neuro-text-muted text-xs mt-1">
                                Haz clic en un término para expandir su definición
                            </p>
                        </div>

                        <div className="divide-y divide-neuro-border">
                            {glossaryTerms.map((item) => (
                                <div key={item.term} className="p-3">
                                    <button
                                        onClick={() =>
                                            setExpandedTerm(
                                                expandedTerm === item.term ? null : item.term
                                            )
                                        }
                                        className="w-full flex items-center gap-3 text-left hover:text-neuro-accent 
                      transition-colors"
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="flex-1 font-medium text-neuro-text-primary text-sm">
                                            {item.term}
                                        </span>
                                        <motion.span
                                            animate={{ rotate: expandedTerm === item.term ? 180 : 0 }}
                                            className="text-neuro-text-muted"
                                        >
                                            ▼
                                        </motion.span>
                                    </button>

                                    <AnimatePresence>
                                        {expandedTerm === item.term && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="mt-2 pl-9 text-neuro-text-secondary text-sm leading-relaxed">
                                                    {item.definition}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40"
                />
            )}
        </div>
    );
}
