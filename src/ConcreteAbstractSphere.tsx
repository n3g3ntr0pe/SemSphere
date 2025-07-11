import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface WordAnalysis {
  word: string;
  abstractionLevel: number;
  dimensions: Record<string, number>;
  position: [number, number, number];
  count: number;
}

interface SentencePath {
  sentence: string;
  path: string[];
  color: number;
}

interface OrthogonalDimension {
  name: string;
  angle: number;
  color: number;
  description: string;
}

interface AbstractionLayer {
  level: number;
  radius: number;
  name: string;
  color: number;
  examples: string;
}

const ConcreteAbstractSphere = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentence, setCurrentSentence] = useState('');
  const [isPlotted, setIsPlotted] = useState(false);
  const [wordData, setWordData] = useState<Record<string, WordAnalysis>>({});
  const [sentencePaths, setSentencePaths] = useState<SentencePath[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLayers, setShowLayers] = useState(true);

  // 6 Orthogonal dimensions as angular coordinates around sphere
  const orthogonalDimensions: OrthogonalDimension[] = [
    { name: 'Scale', angle: 0, color: 0xff6b6b, description: 'Microscopic ↔ Cosmic' },
    { name: 'Temporal', angle: 60, color: 0x4ecdc4, description: 'Instant ↔ Eternal' },
    { name: 'Agency', angle: 120, color: 0x45b7d1, description: 'Passive ↔ Active' },
    { name: 'Social', angle: 180, color: 0xf9ca24, description: 'Individual ↔ Collective' },
    { name: 'Sensory', angle: 240, color: 0x6c5ce7, description: 'Physical ↔ Mental' },
    { name: 'Causality', angle: 300, color: 0xa55eea, description: 'Effect ↔ Cause' }
  ];

  // 5 Abstraction layers (radius from center)
  const abstractionLayers: AbstractionLayer[] = [
    { level: 1, radius: 1, name: 'Concrete Objects', color: 0x2ecc71, examples: 'stone, apple, chair' },
    { level: 2, radius: 2.5, name: 'Material States', color: 0x3498db, examples: 'sand, liquid, solid' },
    { level: 3, radius: 4, name: 'Properties/Elements', color: 0x9b59b6, examples: 'silicon, hardness, carbon' },
    { level: 4, radius: 5.5, name: 'Processes/Particles', color: 0xe67e22, examples: 'dust, energy, motion' },
    { level: 5, radius: 7, name: 'Abstract Concepts', color: 0xe74c3c, examples: 'matter, existence, reality' }
  ];

  // Semantic analysis to determine word positioning
  const analyzeWordSemantics = (word: string) => {
    const lower = word.toLowerCase();
    
    // Determine abstraction level (radius)
    const abstractionLevel = getAbstractionLevel(lower);
    
    // Determine position on each orthogonal dimension (-1 to +1)
    const dimensions: Record<string, number> = {};
    
    // Scale: Microscopic (-1) to Cosmic (+1)
    const scaleWords = {
      micro: ['atom', 'cell', 'molecule', 'bacteria', 'electron', 'proton'],
      small: ['grain', 'pebble', 'insect', 'leaf', 'finger'],
      medium: ['rock', 'tree', 'person', 'house', 'car'],
      large: ['mountain', 'ocean', 'city', 'continent', 'planet'],
      cosmic: ['star', 'galaxy', 'universe', 'cosmos', 'infinity']
    };
    dimensions.Scale = getWordScale(lower, scaleWords);
    
    // Temporal: Instant (-1) to Eternal (+1)
    const temporalWords = {
      instant: ['now', 'moment', 'flash', 'instant', 'second'],
      short: ['minute', 'hour', 'day', 'quick', 'brief'],
      medium: ['week', 'month', 'season', 'regular'],
      long: ['year', 'decade', 'century', 'lasting', 'enduring'],
      eternal: ['forever', 'eternal', 'infinite', 'timeless', 'always']
    };
    dimensions.Temporal = getWordScale(lower, temporalWords);
    
    // Agency: Passive (-1) to Active (+1)
    const agencyWords = {
      passive: ['stone', 'water', 'sleep', 'rest', 'still', 'calm', 'receive'],
      neutral: ['exist', 'be', 'have', 'contain', 'hold'],
      active: ['run', 'jump', 'create', 'build', 'move', 'action', 'do', 'make']
    };
    dimensions.Agency = getAgencyScore(lower, agencyWords);
    
    // Social: Individual (-1) to Collective (+1)
    const socialWords = {
      individual: ['i', 'me', 'self', 'alone', 'personal', 'individual', 'private'],
      small: ['friend', 'family', 'pair', 'couple', 'partner'],
      group: ['team', 'group', 'community', 'neighborhood', 'organization'],
      collective: ['society', 'humanity', 'civilization', 'culture', 'public', 'global']
    };
    dimensions.Social = getWordScale(lower, socialWords);
    
    // Sensory: Physical (-1) to Mental (+1)
    const sensoryWords = {
      physical: ['touch', 'feel', 'hard', 'soft', 'hot', 'cold', 'taste', 'smell', 'see', 'hear'],
      neutral: ['sense', 'experience', 'perceive'],
      mental: ['think', 'believe', 'know', 'understand', 'idea', 'concept', 'mind', 'thought']
    };
    dimensions.Sensory = getAgencyScore(lower, sensoryWords);
    
    // Causality: Effect (-1) to Cause (+1)
    const causalityWords = {
      effect: ['result', 'outcome', 'consequence', 'end', 'finish', 'product'],
      neutral: ['process', 'change', 'transform'],
      cause: ['create', 'make', 'build', 'start', 'begin', 'source', 'origin', 'reason']
    };
    dimensions.Causality = getAgencyScore(lower, causalityWords);
    
    return {
      word: lower,
      abstractionLevel,
      dimensions
    };
  };

  const getAbstractionLevel = (word: string) => {
    // Concrete objects (level 1)
    const concrete = ['stone', 'rock', 'apple', 'tree', 'chair', 'table', 'car', 'house', 'book', 'phone', 'water', 'fire'];
    if (concrete.some(w => word.includes(w))) return 1;
    
    // Material states (level 2)
    const material = ['sand', 'liquid', 'solid', 'gas', 'metal', 'wood', 'plastic', 'glass', 'fabric', 'paper'];
    if (material.some(w => word.includes(w))) return 2;
    
    // Properties/Elements (level 3)
    const properties = ['hard', 'soft', 'hot', 'cold', 'big', 'small', 'fast', 'slow', 'silicon', 'carbon', 'oxygen'];
    if (properties.some(w => word.includes(w))) return 3;
    
    // Processes/Particles (level 4)
    const processes = ['energy', 'motion', 'change', 'growth', 'dust', 'particle', 'wave', 'force', 'power'];
    if (processes.some(w => word.includes(w))) return 4;
    
    // Abstract concepts (level 5)
    const abstract = ['love', 'justice', 'beauty', 'truth', 'existence', 'reality', 'consciousness', 'infinity', 'freedom'];
    if (abstract.some(w => word.includes(w))) return 5;
    
    // Default: analyze word characteristics
    if (word.length <= 4) return 1; // Short words tend to be concrete
    if (word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ism')) return 5; // Abstract suffixes
    if (word.endsWith('ing') || word.endsWith('ed')) return 4; // Process words
    return 3; // Default middle level
  };

  const getWordScale = (word: string, scaleWords: Record<string, string[]>) => {
    if (scaleWords.micro.some(w => word.includes(w))) return -1;
    if (scaleWords.small.some(w => word.includes(w))) return -0.5;
    if (scaleWords.medium.some(w => word.includes(w))) return 0;
    if (scaleWords.large.some(w => word.includes(w))) return 0.5;
    if (scaleWords.cosmic.some(w => word.includes(w))) return 1;
    return 0; // Default neutral
  };

  const getAgencyScore = (word: string, agencyWords: Record<string, string[]>) => {
    if (agencyWords.passive && agencyWords.passive.some(w => word.includes(w))) return -1;
    if (agencyWords.neutral && agencyWords.neutral.some(w => word.includes(w))) return 0;
    if (agencyWords.active && agencyWords.active.some(w => word.includes(w))) return 1;
    return 0; // Default neutral
  };

  // Convert semantic analysis to 3D spherical coordinates
  const semanticsToPosition = (analysis: { abstractionLevel: number; dimensions: Record<string, number> }): [number, number, number] => {
    const radius = abstractionLayers[analysis.abstractionLevel - 1].radius;
    
    // Calculate weighted angular position based on dimensions
    let totalAngle = 0;
    let totalWeight = 0;
    
    orthogonalDimensions.forEach(dim => {
      const value = analysis.dimensions[dim.name] || 0;
      const weight = Math.abs(value);
      totalAngle += dim.angle * weight;
      totalWeight += weight;
    });
    
    const azimuth = totalWeight > 0 ? (totalAngle / totalWeight) * (Math.PI / 180) : 0;
    
    // Add some elevation variation based on dimension values
    const elevation = (Math.sin(azimuth * 3) * 0.3) * Math.PI; // Vary between -0.3π and 0.3π
    
    // Convert spherical to Cartesian
    const x = radius * Math.cos(elevation) * Math.cos(azimuth);
    const y = radius * Math.sin(elevation);
    const z = radius * Math.cos(elevation) * Math.sin(azimuth);
    
    return [x, y, z];
  };

  const addSentence = () => {
    if (currentSentence.trim()) {
      setSentences([...sentences, currentSentence.trim()]);
      setCurrentSentence('');
    }
  };

  const plotData = () => {
    const allWords: Record<string, WordAnalysis> = {};
    const paths: SentencePath[] = [];
    
    sentences.forEach((sentence, sentenceIndex) => {
      const words = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      const path: string[] = [];
      
      words.forEach(word => {
        if (word && word.length > 1) {
          if (!allWords[word]) {
            const analysis = analyzeWordSemantics(word);
            const position = semanticsToPosition(analysis);
            allWords[word] = {
              ...analysis,
              position,
              count: 1
            };
          } else {
            allWords[word].count++;
          }
          path.push(word);
        }
      });
      
      if (path.length > 1) {
        paths.push({
          sentence,
          path,
          color: new THREE.Color().setHSL((sentenceIndex * 0.618) % 1, 0.9, 0.6).getHex()
        });
      }
    });
    
    setWordData(allWords);
    setSentencePaths(paths);
    setIsPlotted(true);
  };

  const clearData = () => {
    setSentences([]);
    setWordData({});
    setSentencePaths([]);
    setIsPlotted(false);
  };

  // Camera control state
  const [cameraAngle, setCameraAngle] = useState(0);
  const [cameraElevation, setCameraElevation] = useState(0);

  // Update camera position when zoom or angles change
  useEffect(() => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    const distance = 20 / zoomLevel;
    camera.position.x = distance * Math.cos(cameraElevation) * Math.cos(cameraAngle);
    camera.position.y = distance * Math.sin(cameraElevation);
    camera.position.z = distance * Math.cos(cameraElevation) * Math.sin(cameraAngle);
    camera.lookAt(0, 0, 0);
  }, [zoomLevel, cameraAngle, cameraElevation]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 900 / 700, 0.1, 1000);
    camera.position.set(15, 10, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(900, 700);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 20, 10);
    scene.add(directionalLight);

    // Mouse controls for camera
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseDown = (event: MouseEvent) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      mouseDown = false;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!mouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      setCameraAngle(prev => prev + deltaX * 0.003);
      setCameraElevation(prev => Math.max(-Math.PI/3, Math.min(Math.PI/3, prev - deltaY * 0.003)));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const newZoom = Math.max(0.1, Math.min(20, zoomLevel - event.deltaY * 0.005));
      setZoomLevel(newZoom);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear existing plotted objects
    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((child) => {
      if (child.userData.isPlotted) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => sceneRef.current!.remove(obj));

    // Always show abstraction layer spheres
    if (showLayers) {
      abstractionLayers.forEach(layer => {
        const geometry = new THREE.SphereGeometry(layer.radius, 32, 16);
        const material = new THREE.MeshBasicMaterial({ 
          color: layer.color, 
          transparent: true, 
          opacity: 0.1,
          wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.userData.isPlotted = true;
        sceneRef.current!.add(sphere);
      });
    }

    // Show dimensional spokes
    orthogonalDimensions.forEach(dim => {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          8 * Math.cos(dim.angle * Math.PI / 180),
          0,
          8 * Math.sin(dim.angle * Math.PI / 180)
        )
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: dim.color, opacity: 0.4, transparent: true });
      const line = new THREE.Line(geometry, material);
      line.userData.isPlotted = true;
      sceneRef.current!.add(line);
      
      // Dimension label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;
      
      if (context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = `#${dim.color.toString(16).padStart(6, '0')}`;
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.fillText(dim.name, canvas.width / 2, 30);
        context.font = '10px Arial';
        context.fillText(dim.description, canvas.width / 2, 50);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const label = new THREE.Sprite(labelMaterial);
      label.scale.set(2, 1, 1);
      label.position.copy(points[1]);
      label.position.multiplyScalar(1.1);
      label.userData.isPlotted = true;
      sceneRef.current!.add(label);
    });

    if (isPlotted) {
      // Plot words
      Object.values(wordData).forEach(data => {
        const size = 0.1 + (data.count * 0.05);
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const layerColor = abstractionLayers[data.abstractionLevel - 1].color;
        const material = new THREE.MeshPhongMaterial({ 
          color: layerColor,
          transparent: true,
          opacity: 0.8
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(...data.position);
        sphere.userData.isPlotted = true;
        sceneRef.current!.add(sphere);

        // Word label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;
        
        if (context) {
          context.fillStyle = 'rgba(0, 0, 0, 0.8)';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = 'white';
          context.font = 'bold 11px Arial';
          context.textAlign = 'center';
          context.fillText(data.word, canvas.width / 2, canvas.height / 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const wordLabel = new THREE.Sprite(labelMaterial);
        wordLabel.scale.set(1, 0.25, 1);
        wordLabel.position.set(data.position[0], data.position[1] + size + 0.3, data.position[2]);
        wordLabel.userData.isPlotted = true;
        sceneRef.current!.add(wordLabel);
      });

      // Plot sentence paths
      sentencePaths.forEach(pathData => {
        const points: THREE.Vector3[] = [];
        pathData.path.forEach(word => {
          if (wordData[word]) {
            points.push(new THREE.Vector3(...wordData[word].position));
          }
        });
        
        if (points.length > 1) {
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: pathData.color,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
          });
          const line = new THREE.Line(geometry, material);
          line.userData.isPlotted = true;
          sceneRef.current!.add(line);
        }
      });
    }

  }, [isPlotted, wordData, sentencePaths, showLayers]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Concrete→Abstract Semantic Sphere</h1>
        <p className="text-gray-300">
          Center = Concrete objects. Perimeter = Abstract concepts. 
          Angular dimensions distinguish orthogonal semantic properties.
        </p>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div ref={mountRef} className="border border-gray-700 rounded-lg overflow-hidden" />
          <div className="mt-2 text-xs text-gray-400 text-center">
            Mouse: Rotate | Wheel: Zoom | Current zoom: {zoomLevel.toFixed(1)}x
          </div>
        </div>

        <div className="w-80 space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Input Sentences</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentSentence}
                  onChange={(e) => setCurrentSentence(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSentence()}
                  placeholder="The stone became sand became dust became matter"
                  className="flex-1 px-3 py-2 bg-gray-700 rounded text-white text-sm"
                />
                <button
                  onClick={addSentence}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Add
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={plotData}
                  disabled={sentences.length === 0}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
                >
                  Plot Journeys
                </button>
                <button
                  onClick={clearData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Clear
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLayers}
                  onChange={(e) => setShowLayers(e.target.checked)}
                />
                Show abstraction layers
              </label>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Abstraction Layers</h3>
            <div className="space-y-2 text-xs">
              {abstractionLayers.map(layer => (
                <div key={layer.level} className="flex items-start gap-2">
                  <div 
                    className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" 
                    style={{ backgroundColor: `#${layer.color.toString(16).padStart(6, '0')}` }}
                  ></div>
                  <div>
                    <div className="font-medium">{layer.level}. {layer.name}</div>
                    <div className="text-gray-400">{layer.examples}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Collected Sentences</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {sentences.map((sentence, index) => (
                <div key={index} className="text-sm text-gray-300 p-2 bg-gray-700 rounded">
                  {sentence}
                </div>
              ))}
              {sentences.length === 0 && (
                <div className="text-sm text-gray-500 italic">No sentences yet...</div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Orthogonal Dimensions</h3>
            <div className="space-y-1 text-xs">
              {orthogonalDimensions.map(dim => (
                <div key={dim.name} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: `#${dim.color.toString(16).padStart(6, '0')}` }}
                  ></div>
                  <span className="font-medium">{dim.name}:</span>
                  <span className="text-gray-400">{dim.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcreteAbstractSphere; 