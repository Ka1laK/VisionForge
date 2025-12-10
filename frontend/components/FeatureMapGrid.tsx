'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureMapGridProps {
    featureMaps: string[];
    title: string;
    description: string;
    columns?: number;
}

export default function FeatureMapGrid({
    featureMaps,
    title,
    description,
    columns = 4,
}: FeatureMapGridProps) {
    return (
        <div className="card">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-neuro-accent mb-2">{title}</h3>
                <p className="text-neuro-text-secondary text-sm">{description}</p>
            </div>

            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
                {featureMaps.map((map, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="feature-map-item"
                    >
                        <img
                            src={`data:image/png;base64,${map}`}
                            alt={`Feature map ${index + 1}`}
                            className="w-full h-auto"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </motion.div>
                ))}
            </div>

            <p className="text-neuro-text-muted text-xs mt-3 text-center">
                {featureMaps.length} mapas de características
            </p>
        </div>
    );
}
