# SemSphere - 3D Semantic Visualization

A React-based interactive 3D visualization tool for exploring semantic relationships between words and concepts in multidimensional space.

## Overview

SemSphere creates an immersive 3D sphere where words are positioned based on their semantic properties across multiple dimensions. Users can input sentences and watch as words are analyzed, positioned, and connected through semantic space, revealing hidden patterns in language and meaning.

## Features

### 🌐 Multidimensional Semantic Analysis
- **6 Orthogonal Dimensions**: Scale (Microscopic ↔ Cosmic), Temporal (Instant ↔ Eternal), Agency (Passive ↔ Active), Social (Individual ↔ Collective), Sensory (Physical ↔ Mental), Causality (Effect ↔ Cause)
- **5 Abstraction Layers**: From concrete objects at the center to abstract concepts at the perimeter
- **Intelligent Word Positioning**: Automatic semantic analysis determines 3D coordinates for each word

### 🎮 Interactive 3D Environment
- **Mouse Controls**: Drag to rotate, scroll to zoom
- **Dynamic Zoom**: Smooth zoom from macro (entire semantic space) to micro (individual word details)
- **Layer Visualization**: Toggle abstraction layers on/off
- **Real-time Rendering**: Powered by Three.js for smooth 3D graphics

### 📊 Sentence Journey Mapping
- **Path Visualization**: Connect words in sentences to show semantic journeys
- **Color-coded Paths**: Each sentence gets a unique color for easy tracking
- **Word Frequency**: Larger spheres represent more frequently used words
- **Semantic Clustering**: Related concepts naturally group together in 3D space

### 🎨 Visual Design
- **Modern Dark Theme**: Professional appearance suitable for presentations
- **Responsive Layout**: Works across different screen sizes
- **Information Panels**: Side panels showing abstraction layers, dimensions, and collected sentences
- **Interactive Labels**: Word labels appear near their 3D positions

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SemSphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Project Structure
```
SemSphere/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── ConcreteAbstractSphere.tsx # Core 3D visualization component
│   └── main.tsx                   # React entry point
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript configuration
```

## Usage

### Basic Interaction

1. **Input Sentences**: Type sentences in the input field (e.g., "The stone became sand became dust became matter")
2. **Add to Collection**: Click "Add" to collect multiple sentences
3. **Plot Journeys**: Click "Plot Journeys" to visualize all collected sentences in 3D space
4. **Explore**: Use mouse to rotate and zoom, explore how words relate in semantic space
5. **Toggle Layers**: Use checkbox to show/hide abstraction layer spheres

### Example Sentences to Try
- `"The stone became sand became dust became matter"` - Progression through abstraction levels
- `"Love grows from friendship into eternal connection"` - Temporal and emotional progression
- `"Atoms form molecules create life develops consciousness"` - Scale and complexity progression

### Understanding the Visualization

**Abstraction Layers** (color-coded spheres):
1. **Green**: Concrete Objects (stone, apple, chair)
2. **Blue**: Material States (sand, liquid, solid)
3. **Purple**: Properties/Elements (silicon, hardness, carbon)
4. **Orange**: Processes/Particles (dust, energy, motion)
5. **Red**: Abstract Concepts (matter, existence, reality)

**Dimensional Spokes** (colored lines from center):
- **Red**: Scale dimension
- **Teal**: Temporal dimension  
- **Blue**: Agency dimension
- **Yellow**: Social dimension
- **Purple**: Sensory dimension
- **Pink**: Causality dimension

## Technical Details

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **3D Graphics**: Three.js for WebGL rendering
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS (via CDN)

### Semantic Analysis Algorithm

The application analyzes each word across multiple dimensions:

1. **Abstraction Level Determination**: Categorizes words from concrete (level 1) to abstract (level 5)
2. **Dimensional Scoring**: Evaluates position on each of the 6 orthogonal dimensions
3. **3D Coordinate Calculation**: Converts semantic properties to spherical coordinates
4. **Visual Representation**: Renders as positioned spheres with connecting paths

### Performance Optimizations
- Efficient Three.js scene management
- Optimized word analysis algorithms
- Responsive zoom controls with smooth transitions
- Memory management for large vocabulary sets

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Components

**ConcreteAbstractSphere.tsx**:
- Main visualization component
- Handles 3D scene setup and rendering
- Manages user interactions and word analysis
- Controls camera positioning and zoom

**Semantic Analysis Functions**:
- `analyzeWordSemantics()` - Core word analysis
- `semanticsToPosition()` - 3D coordinate conversion
- `getAbstractionLevel()` - Abstraction layer classification

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- **Export Functionality**: Save visualizations as images or 3D models
- **Custom Vocabularies**: Load domain-specific word sets
- **Animation**: Animate sentence construction in real-time
- **Collaborative Features**: Share semantic spaces with others
- **Advanced Analytics**: Statistical analysis of semantic patterns
- **VR Support**: Virtual reality exploration of semantic space

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js community for excellent 3D graphics library
- React team for the robust frontend framework
- Semantic analysis inspired by cognitive linguistics research 