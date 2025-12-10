# VisionForge: El Escáner Neuronal 🧠

Una plataforma web interactiva que desmitifica las Redes Neuronales Convolucionales (CNN) permitiéndote ser el sujeto de un escáner de IA. Dibuja dígitos y observa cómo la red neuronal "piensa" capa por capa.

![VisionForge Demo](https://img.shields.io/badge/Demo-Interactive-00d4ff?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18-ff6f00?style=for-the-badge&logo=tensorflow)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)

## 🎯 Características

### Visualización del Proceso
- **Timeline Animado**: Recorre el proceso de reconocimiento paso a paso
- **Mapas de Características**: Visualiza qué detecta cada capa convolucional
- **Activaciones Neuronales**: Observa las neuronas brillar según su nivel de activación
- **Gráfico de Probabilidades**: Ve la confianza para cada dígito (0-9)

### Explicabilidad (XAI)
- **Grad-CAM**: Genera mapas de calor que muestran las regiones más importantes para la decisión
- **Superposición Visual**: Compara tu dibujo original con las áreas de atención de la IA

### Gamificación
- **Desafío de Confusión**: Intenta dibujar dígitos que engañen a la IA
- **Glosario Integrado**: Aprende conceptos de CNN con explicaciones interactivas

## 🏗️ Arquitectura

```
VisionForge/
├── backend/                 # FastAPI + TensorFlow
│   ├── main.py             # API REST endpoints
│   ├── model.py            # CNN architecture & training
│   ├── gradcam.py          # Grad-CAM implementation
│   ├── preprocessing.py    # Image utilities
│   └── requirements.txt
│
├── frontend/               # Next.js 15 + React 19
│   ├── app/
│   │   ├── page.tsx        # Main application
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Styles
│   ├── components/
│   │   ├── DrawingCanvas.tsx
│   │   ├── VisualizationTimeline.tsx
│   │   ├── FeatureMapGrid.tsx
│   │   ├── NeuralNetworkViz.tsx
│   │   ├── ProbabilityChart.tsx
│   │   ├── HeatmapOverlay.tsx
│   │   ├── ConfusionChallenge.tsx
│   │   └── Glossary.tsx
│   ├── store/
│   │   └── useStore.ts     # Zustand state
│   └── lib/
│       └── api.ts          # API client
│
└── README.md
```

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Python 3.10+
- Node.js 18+
- npm o yarn

### Backend (FastAPI + TensorFlow)

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Crear entorno virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
.\venv\Scripts\activate   # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Entrenar el modelo (primera vez)
python model.py

# 5. Iniciar el servidor
uvicorn main:app --reload --port 8000
```

El backend estará disponible en: http://localhost:8000

**API Docs**: http://localhost:8000/docs

### Frontend (Next.js)

```bash
# 1. Navegar al directorio frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## 📡 API Endpoints

### POST /scan
Analiza una imagen y extrae características de cada capa.

**Request:**
```json
{
  "image": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "processed_image": "base64...",
  "feature_maps_conv1": ["base64...", ...],
  "feature_maps_conv2": ["base64...", ...],
  "dense_activations": [0.1, 0.5, ...],
  "probabilities": [0.01, 0.02, ..., 0.95],
  "prediction": 7
}
```

### POST /explain
Genera explicación Grad-CAM para la predicción.

**Request:**
```json
{
  "image": "data:image/png;base64,...",
  "class_idx": null  // opcional
}
```

**Response:**
```json
{
  "heatmap": "base64...",
  "overlay": "base64...",
  "prediction": 7,
  "confidence": 0.95
}
```

## 🧠 Conceptos de CNN Demostrados

### Arquitectura del Modelo
```
Input (28x28x1)
    ↓
Conv2D (32 filtros, 3x3) + ReLU
    ↓
MaxPooling2D (2x2)
    ↓
Conv2D (64 filtros, 3x3) + ReLU
    ↓
MaxPooling2D (2x2)
    ↓
Flatten
    ↓
Dense (128 neuronas) + ReLU
    ↓
Dense (10 neuronas) + Softmax → Predicción
```

### ¿Qué es una Convolución?
Una operación donde un pequeño filtro (kernel) recorre la imagen, detectando patrones específicos como bordes, curvas o texturas.

### ¿Qué son los Mapas de Características?
Son las "huellas dactilares" de lo que la red ha detectado. Cada filtro produce un mapa que muestra dónde encontró su patrón.

### ¿Qué es Grad-CAM?
**Gradient-weighted Class Activation Mapping** - Una técnica de XAI que usa los gradientes para determinar qué regiones de la imagen fueron más importantes para la predicción final.

## 🎨 Tema Visual

"Laboratorio de Neurociencia" - Tema oscuro con acentos de color cian eléctrico:

| Color | Hex | Uso |
|-------|-----|-----|
| Background | `#0a0a0f` | Fondo principal |
| Accent | `#00d4ff` | Elementos interactivos |
| Neural Active | `#00ff88` | Neuronas activadas |
| Warning | `#ffaa00` | Modo desafío |

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI** - Framework web de alto rendimiento
- **TensorFlow/Keras** - Deep Learning
- **NumPy** - Operaciones numéricas
- **Pillow** - Procesamiento de imágenes
- **OpenCV** - Colormaps y overlays

### Frontend
- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Framer Motion** - Animaciones fluidas
- **Zustand** - State management
- **Tailwind CSS** - Estilos utility-first

## 📚 Referencias

- [MNIST Dataset](http://yann.lecun.com/exdb/mnist/)
- [Grad-CAM Paper](https://arxiv.org/abs/1610.02391)
- [Keras Documentation](https://keras.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 📄 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

---

Desarrollado con 🧠 para hacer la IA más comprensible.
