'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface DrawingCanvasProps {
    width?: number;
    height?: number;
    onAnalyze?: () => void;
}

export default function DrawingCanvas({
    width = 280,
    height = 280,
    onAnalyze,
}: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

    const {
        setCanvasDataUrl,
        setIsDrawing,
        isAnalyzing,
        challenge,
        clearAnalysis,
    } = useStore();

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }, [width, height]);

    // Get mouse/touch position relative to canvas
    const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX: number, clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, []);

    // Draw line
    const draw = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (lastPos) {
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        setLastPos({ x, y });
    }, [lastPos]);

    // Event handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const pos = getPosition(e);
        if (!pos) return;

        setIsMouseDown(true);
        setIsDrawing(true);
        setLastPos(pos);
        clearAnalysis();
    }, [getPosition, setIsDrawing, clearAnalysis]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isMouseDown) return;
        const pos = getPosition(e);
        if (pos) draw(pos.x, pos.y);
    }, [isMouseDown, getPosition, draw]);

    const handleMouseUp = useCallback(() => {
        setIsMouseDown(false);
        setIsDrawing(false);
        setLastPos(null);

        // Save canvas data
        const canvas = canvasRef.current;
        if (canvas) {
            setCanvasDataUrl(canvas.toDataURL('image/png'));
        }
    }, [setIsDrawing, setCanvasDataUrl]);

    // Touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const pos = getPosition(e);
        if (!pos) return;

        setIsMouseDown(true);
        setIsDrawing(true);
        setLastPos(pos);
        clearAnalysis();
    }, [getPosition, setIsDrawing, clearAnalysis]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (!isMouseDown) return;
        const pos = getPosition(e);
        if (pos) draw(pos.x, pos.y);
    }, [isMouseDown, getPosition, draw]);

    const handleTouchEnd = useCallback(() => {
        handleMouseUp();
    }, [handleMouseUp]);

    // Clear canvas
    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        setCanvasDataUrl(null);
        clearAnalysis();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
        >
            {/* Challenge indicator */}
            {challenge.isActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-neuro-neural-warning/20 border border-neuro-neural-warning rounded-lg px-6 py-3 text-center"
                >
                    <p className="text-neuro-neural-warning font-semibold">
                        🎯 Desafío: Dibuja un <span className="text-2xl">{challenge.targetDigit}</span> que la IA confunda con un <span className="text-2xl">{challenge.confusionDigit}</span>
                    </p>
                </motion.div>
            )}

            {/* Canvas container */}
            <div className={`canvas-container p-4 ${challenge.isActive ? 'challenge-active' : ''}`}>
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={width}
                        height={height}
                        className="cursor-crosshair rounded-lg"
                        style={{ touchAction: 'none' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />

                    {/* Scanning animation */}
                    {isAnalyzing && <div className="scan-line" />}
                </div>
            </div>

            {/* Instructions */}
            <p className="text-neuro-text-secondary text-sm">
                Dibuja un dígito (0-9) en el lienzo
            </p>

            {/* Action buttons */}
            <div className="flex gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClear}
                    className="btn-secondary"
                    disabled={isAnalyzing}
                >
                    🗑️ Limpiar
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAnalyze}
                    className="btn-primary"
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <>
                            <span className="spinner inline-block w-5 h-5 mr-2" />
                            Analizando...
                        </>
                    ) : (
                        '🧠 Analizar con IA'
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
