import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'VisionForge: El Escáner Neuronal',
    description: 'Plataforma interactiva para visualizar el pensamiento de redes neuronales convolucionales',
    keywords: ['CNN', 'deep learning', 'neural networks', 'visualization', 'XAI', 'MNIST'],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="bg-neuro-bg-primary min-h-screen antialiased">
                <div className="relative min-h-screen">
                    {/* Background effects */}
                    <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />
                    <div className="fixed inset-0 bg-gradient-to-b from-neuro-bg-primary via-transparent to-neuro-bg-primary pointer-events-none" />

                    {/* Main content */}
                    <main className="relative z-10">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
