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

interface SemanticAnalysis {
  word: string;
  abstractionLevel: number;
  dimensions: Record<string, number>;
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
  const targetZoomRef = useRef(1);
  const [showDimensionalFramework, setShowDimensionalFramework] = useState(true);
  const [showWaveVisualization, setShowWaveVisualization] = useState(false);

  // 6 Orthogonal dimensions as angular coordinates around sphere
  const orthogonalDimensions: OrthogonalDimension[] = [
    { name: 'Scale', angle: 0, color: 0xff6b6b, description: 'Microscopic ↔ Cosmic' },
    { name: 'Temporal', angle: 90, color: 0x4ecdc4, description: 'Instant ↔ Eternal' },
    { name: 'Agency', angle: 45, color: 0x45b7d1, description: 'Passive ↔ Active' },
    { name: 'Social', angle: 180, color: 0xf9ca24, description: 'Individual ↔ Collective' },
    { name: 'Sensory', angle: 270, color: 0x6c5ce7, description: 'Physical ↔ Mental' },
    { name: 'Causality', angle: 135, color: 0xa55eea, description: 'Effect ↔ Cause' }
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
  const analyzeWordSemantics = (word: string): SemanticAnalysis => {
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
    dimensions.Temporal = getTemporalScore(lower, temporalWords);
    
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
    dimensions.Social = getSocialScore(lower, socialWords);
    
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
    
    // Debug logging for specific words
    if (lower === 'minute') {
      console.log('=== DEBUG: MINUTE SEMANTIC ANALYSIS ===');
      console.log('Word:', lower);
      console.log('Abstraction Level:', abstractionLevel);
      console.log('Scale Score:', dimensions.Scale);
      console.log('Temporal Score:', dimensions.Temporal);
      console.log('Agency Score:', dimensions.Agency);
      console.log('Social Score:', dimensions.Social);
      console.log('Sensory Score:', dimensions.Sensory);
      console.log('Causality Score:', dimensions.Causality);
      console.log('All Dimensions:', dimensions);
      console.log('=== END SEMANTIC ANALYSIS DEBUG ===');
    }

    return {
      word: lower,
      abstractionLevel,
      dimensions
    };
  };

  // Comprehensive vocabulary organized by semantic properties
  const vocabularyByAbstraction: Record<number, string[]> = {
    1: ['stone', 'rock', 'apple', 'tree', 'chair', 'table', 'car', 'house', 'book', 'phone', 'water', 'fire'],
    2: ['sand', 'liquid', 'solid', 'gas', 'metal', 'wood', 'plastic', 'glass', 'fabric', 'paper'],
    3: ['hard', 'soft', 'hot', 'cold', 'big', 'small', 'fast', 'slow', 'silicon', 'carbon', 'oxygen'],
    4: ['energy', 'motion', 'change', 'growth', 'dust', 'particle', 'wave', 'force', 'power'],
    5: ['love', 'justice', 'beauty', 'truth', 'existence', 'reality', 'consciousness', 'infinity', 'freedom']
  };

  const vocabularyByDimension = {
    Scale: {
      micro: ['atom', 'cell', 'molecule', 'bacteria', 'electron', 'proton', 'particle', 'grain', 'tiny', 'microscopic'],
      small: ['grain', 'pebble', 'insect', 'leaf', 'finger', 'coin', 'seed', 'drop', 'speck', 'crumb'],
      medium: ['rock', 'tree', 'person', 'house', 'car', 'table', 'chair', 'human', 'animal', 'object'],
      large: ['mountain', 'ocean', 'city', 'continent', 'planet', 'building', 'forest', 'lake', 'country', 'region'],
      cosmic: ['star', 'galaxy', 'universe', 'cosmos', 'infinity', 'solar', 'galactic', 'cosmic', 'universal', 'space']
    },
    Temporal: {
      instant: ['now', 'moment', 'flash', 'instant', 'second', 'immediately', 'suddenly', 'quick', 'rapid', 'brief'],
      short: ['minute', 'hour', 'day', 'quick', 'brief', 'short', 'temporary', 'momentary', 'fleeting', 'swift'],
      medium: ['week', 'month', 'season', 'regular', 'periodic', 'routine', 'cycle', 'interval', 'span', 'duration'],
      long: ['year', 'decade', 'century', 'lasting', 'enduring', 'prolonged', 'extended', 'sustained', 'permanent', 'long'],
      eternal: ['forever', 'eternal', 'infinite', 'timeless', 'always', 'everlasting', 'immortal', 'endless', 'perpetual', 'constant']
    },
    Agency: {
      passive: ['stone', 'water', 'sleep', 'rest', 'still', 'calm', 'receive', 'accept', 'suffer', 'experience', 'undergo', 'endure'],
      neutral: ['exist', 'be', 'have', 'contain', 'hold', 'stay', 'remain', 'maintain', 'keep', 'preserve'],
      active: ['run', 'jump', 'create', 'build', 'move', 'action', 'do', 'make', 'work', 'force', 'drive', 'push', 'control', 'direct', 'lead']
    },
    Social: {
      individual: ['i', 'me', 'self', 'alone', 'personal', 'individual', 'private', 'solo', 'single', 'own', 'myself', 'separate'],
      small: ['friend', 'family', 'pair', 'couple', 'partner', 'duo', 'sibling', 'parent', 'child', 'spouse', 'neighbor'],
      group: ['team', 'group', 'community', 'neighborhood', 'organization', 'class', 'club', 'crew', 'band', 'committee'],
      collective: ['society', 'humanity', 'civilization', 'culture', 'public', 'global', 'nation', 'world', 'people', 'population', 'masses']
    },
    Sensory: {
      physical: ['touch', 'feel', 'hard', 'soft', 'hot', 'cold', 'taste', 'smell', 'see', 'hear', 'texture', 'temperature', 'pain', 'pressure'],
      neutral: ['sense', 'experience', 'perceive', 'notice', 'observe', 'detect', 'aware', 'conscious', 'sensation'],
      mental: ['think', 'believe', 'know', 'understand', 'idea', 'concept', 'mind', 'thought', 'imagine', 'remember', 'dream', 'wisdom', 'intelligence']
    },
    Causality: {
      effect: ['result', 'outcome', 'consequence', 'end', 'finish', 'product', 'impact', 'aftermath', 'reaction', 'response'],
      neutral: ['process', 'change', 'transform', 'development', 'evolution', 'transition', 'shift', 'modification'],
      cause: ['create', 'make', 'build', 'start', 'begin', 'source', 'origin', 'reason', 'generate', 'produce', 'trigger', 'initiate', 'launch']
    }
  };

  // Get all unique words from the vocabulary
  const getAllMappedWords = () => {
    const allWords = new Set<string>();
    
    // Add words from abstraction levels
    Object.values(vocabularyByAbstraction).forEach(words => {
      words.forEach(word => allWords.add(word));
    });
    
    // Add words from dimensions
    Object.values(vocabularyByDimension).forEach(dimension => {
      Object.values(dimension).forEach(words => {
        words.forEach(word => allWords.add(word));
      });
    });
    
    return Array.from(allWords).sort();
  };

  // Connection words that help create coherent sentences
  const connectionWords = new Set([
    // Articles
    'a', 'an', 'the',
    // Prepositions
    'in', 'on', 'at', 'by', 'for', 'with', 'without', 'of', 'to', 'from', 'into', 'onto', 'through', 'over', 'under', 'above', 'below', 'between', 'among', 'during', 'before', 'after', 'within', 'beyond', 'across', 'around', 'near', 'beside', 'behind', 'against', 'toward', 'towards', 'upon', 'beneath', 'underneath', 'inside', 'outside', 'throughout',
    // Conjunctions
    'and', 'or', 'but', 'yet', 'so', 'nor', 'because', 'since', 'while', 'when', 'where', 'how', 'why', 'if', 'unless', 'until', 'although', 'though', 'whereas', 'therefore', 'however', 'moreover', 'furthermore', 'nevertheless', 'consequently', 'thus', 'hence',
    // Pronouns
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what',
    // Auxiliary verbs
    'is', 'am', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'can', 'could', 'must', 'ought',
    // Common verbs
    'get', 'gets', 'got', 'getting', 'go', 'goes', 'went', 'going', 'gone', 'come', 'comes', 'came', 'coming', 'take', 'takes', 'took', 'taken', 'taking', 'give', 'gives', 'gave', 'given', 'giving', 'put', 'puts', 'putting', 'turn', 'turns', 'turned', 'turning', 'become', 'becomes', 'became', 'becoming',
    // Adverbs
    'very', 'quite', 'rather', 'really', 'truly', 'deeply', 'highly', 'completely', 'totally', 'entirely', 'fully', 'partially', 'slightly', 'somewhat', 'gradually', 'suddenly', 'slowly', 'quickly', 'carefully', 'gently', 'firmly', 'strongly', 'weakly', 'clearly', 'obviously', 'apparently', 'certainly', 'definitely', 'probably', 'possibly', 'maybe', 'perhaps', 'almost', 'nearly', 'about', 'approximately', 'exactly', 'precisely', 'just', 'only', 'even', 'still', 'already', 'yet', 'again', 'once', 'twice', 'always', 'never', 'sometimes', 'often', 'usually', 'rarely', 'seldom', 'frequently', 'occasionally', 'constantly', 'continuously', 'temporarily', 'permanently', 'immediately', 'eventually', 'finally', 'initially', 'originally', 'basically', 'essentially', 'actually', 'literally', 'virtually', 'practically', 'theoretically', 'logically', 'naturally', 'obviously', 'clearly', 'simply', 'merely', 'primarily', 'mainly', 'mostly', 'partly', 'largely', 'generally', 'specifically', 'particularly', 'especially', 'notably', 'remarkably', 'surprisingly', 'fortunately', 'unfortunately', 'hopefully', 'thankfully', 'sadly', 'happily', 'successfully', 'effectively', 'efficiently', 'properly', 'correctly', 'accurately', 'precisely', 'exactly', 'directly', 'indirectly', 'openly', 'secretly', 'publicly', 'privately', 'personally', 'professionally', 'formally', 'informally', 'officially', 'unofficially', 'legally', 'illegally', 'properly', 'improperly', 'safely', 'dangerously', 'carefully', 'carelessly', 'deliberately', 'accidentally', 'intentionally', 'unintentionally', 'consciously', 'unconsciously', 'voluntarily', 'involuntarily', 'willingly', 'unwillingly', 'eagerly', 'reluctantly', 'enthusiastically', 'hesitantly', 'confidently', 'nervously', 'calmly', 'anxiously', 'peacefully', 'violently', 'quietly', 'loudly', 'silently', 'noisily', 'smoothly', 'roughly', 'softly', 'hardly', 'barely', 'scarcely', 'widely', 'narrowly', 'broadly', 'specifically', 'generally', 'universally', 'locally', 'globally', 'internationally', 'nationally', 'regionally', 'domestically', 'abroad', 'overseas', 'here', 'there', 'everywhere', 'anywhere', 'somewhere', 'nowhere', 'elsewhere', 'inside', 'outside', 'upstairs', 'downstairs', 'nearby', 'far', 'close', 'distant', 'forward', 'backward', 'onwards', 'backwards', 'ahead', 'behind', 'up', 'down', 'left', 'right', 'north', 'south', 'east', 'west', 'today', 'yesterday', 'tomorrow', 'now', 'then', 'soon', 'late', 'early', 'recently', 'currently', 'presently', 'previously', 'formerly', 'originally', 'initially', 'finally', 'lastly', 'firstly', 'secondly', 'thirdly', 'next', 'later', 'earlier', 'afterwards', 'beforehand', 'meanwhile', 'simultaneously', 'concurrently'
  ]);

  // Check if a word is allowed (either semantic or connection)
  const isWordAllowed = (word: string): boolean => {
    const lower = word.toLowerCase();
    const mappedWords = new Set(getAllMappedWords());
    return mappedWords.has(lower) || connectionWords.has(lower);
  };

  // Validate sentence input
  const validateSentenceInput = (sentence: string): { isValid: boolean; invalidWords: string[] } => {
    const words = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0);
    const invalidWords = words.filter(word => !isWordAllowed(word));
    return {
      isValid: invalidWords.length === 0,
      invalidWords
    };
  };

  // Get semantic content words (excluding connection words)
  const getSemanticWords = (sentence: string): string[] => {
    const words = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 0);
    const mappedWords = new Set(getAllMappedWords());
    return words.filter(word => mappedWords.has(word));
  };

  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'abstraction' | 'dimension' | 'all'>('abstraction');
  const [selectedAbstractionLevel, setSelectedAbstractionLevel] = useState<number>(1);
  const [selectedDimension, setSelectedDimension] = useState<string>('Scale');
  const [inputValidation, setInputValidation] = useState<{ isValid: boolean; invalidWords: string[] }>({ isValid: true, invalidWords: [] });

  const addWordToSentence = (word: string) => {
    setSelectedWords([...selectedWords, word]);
  };

  const removeWordFromSentence = (index: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const createSentenceFromWords = () => {
    if (selectedWords.length > 0) {
      const sentence = selectedWords.join(' ');
      setSentences([...sentences, sentence]);
      setSelectedWords([]);
    }
  };

  const clearSelectedWords = () => {
    setSelectedWords([]);
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
    
    // Temporal concepts (level 4) - time is a process/dimension
    const temporal = ['now', 'then', 'when', 'moment', 'instant', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year', 'decade', 'century', 'forever', 'eternal', 'always', 'never', 'before', 'after', 'during', 'while'];
    if (temporal.some(w => word.includes(w))) return 4;
    
    // Pronouns and basic particles (level 2) - fundamental but not concrete objects
    const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
    if (pronouns.some(w => word.includes(w))) return 2;
    
    // Verbs (level 4) - actions/processes
    const verbs = ['run', 'walk', 'think', 'feel', 'see', 'hear', 'make', 'do', 'be', 'have', 'go', 'come', 'take', 'give'];
    if (verbs.some(w => word.includes(w))) return 4;
    
    // Adjectives (level 3) - properties
    const adjectives = ['good', 'bad', 'new', 'old', 'big', 'small', 'high', 'low', 'long', 'short', 'black', 'white'];
    if (adjectives.some(w => word.includes(w))) return 3;
    
    // Default: analyze word characteristics more intelligently
    if (word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ism') || word.endsWith('tion')) return 5; // Abstract suffixes
    if (word.endsWith('ing') || word.endsWith('ed')) return 4; // Process words
    if (word.endsWith('ly')) return 3; // Adverbs - properties of actions
    
    // Final fallback: use linguistic principles instead of length
    return 3; // Default middle level for unmapped words
  };

  const getWordScale = (word: string, scaleWords: Record<string, string[]>) => {
    if (scaleWords.micro.some(w => word.includes(w))) return -1;
    if (scaleWords.small.some(w => word.includes(w))) return -0.5;
    if (scaleWords.medium.some(w => word.includes(w))) return 0;
    if (scaleWords.large.some(w => word.includes(w))) return 0.5;
    if (scaleWords.cosmic.some(w => word.includes(w))) return 1;
    return 0; // Default neutral
  };

  const getTemporalScore = (word: string, temporalWords: Record<string, string[]>) => {
    if (temporalWords.instant.some(w => word.includes(w))) return -1;
    if (temporalWords.short.some(w => word.includes(w))) return -0.5;
    if (temporalWords.medium.some(w => word.includes(w))) return 0;
    if (temporalWords.long.some(w => word.includes(w))) return 0.5;
    if (temporalWords.eternal.some(w => word.includes(w))) return 1;
    return 0; // Default neutral
  };

  const getSocialScore = (word: string, socialWords: Record<string, string[]>) => {
    if (socialWords.individual.some(w => word.includes(w))) return -1;
    if (socialWords.small.some(w => word.includes(w))) return -0.5;
    if (socialWords.group.some(w => word.includes(w))) return 0;
    if (socialWords.collective.some(w => word.includes(w))) return 0.5;
    return 0; // Default neutral
  };

  const getAgencyScore = (word: string, agencyWords: Record<string, string[]>) => {
    if (agencyWords.passive && agencyWords.passive.some(w => word.includes(w))) return -1;
    if (agencyWords.neutral && agencyWords.neutral.some(w => word.includes(w))) return 0;
    if (agencyWords.active && agencyWords.active.some(w => word.includes(w))) return 1;
    return 0; // Default neutral
  };

  // Convert semantic analysis to 3D spherical coordinates
  const semanticsToPosition = (analysis: SemanticAnalysis): [number, number, number] => {
    const radius = abstractionLayers[analysis.abstractionLevel - 1].radius;
    
    // Calculate position by combining dimensional values along their respective axes
    let x = 0, y = 0, z = 0;
    
    orthogonalDimensions.forEach(dim => {
      const value = analysis.dimensions[dim.name] || 0;
      const angleRad = dim.angle * (Math.PI / 180);
      
      // Each dimension contributes to position based on its value and direction
      // For negative values, use a slight offset angle instead of full 180° flip
      const magnitude = Math.abs(value) * 0.5;
      let adjustedAngle = angleRad;
      
      if (value < 0) {
        // Offset negative values by 30° instead of 180° to avoid conflicts
        adjustedAngle = angleRad + (Math.PI / 6); // +30°
      } else if (value > 0) {
        // Offset positive values by -30° 
        adjustedAngle = angleRad - (Math.PI / 6); // -30°
      }
      // If value is 0, use the exact axis angle
      
      x += magnitude * Math.cos(adjustedAngle);
      z += magnitude * Math.sin(adjustedAngle);
      
      // Debug logging for specific words
      if (analysis.word === 'atom' || analysis.word === 'rock' || analysis.word === 'star' || analysis.word === 'now') {
        console.log(`${analysis.word} - ${dim.name}: value=${value}, magnitude=${magnitude}, originalAngle=${dim.angle}°, adjustedAngle=${adjustedAngle * 180 / Math.PI}°`);
      }
    });
    
    // Normalize the position to the correct radius
    const currentRadius = Math.sqrt(x * x + z * z);
    if (currentRadius > 0) {
      const scale = radius / currentRadius;
      x *= scale;
      z *= scale;
    } else {
      // If no dimensional values, place at default position
      x = radius;
      z = 0;
    }
    
    // Add some elevation variation based on dimensional complexity
    const dimensionSum = Object.values(analysis.dimensions).reduce((sum, val) => sum + Math.abs(val), 0);
    const elevation = (Math.sin(dimensionSum * Math.PI) * 0.2) * Math.PI;
    y = radius * Math.sin(elevation);
    
    // Adjust x and z for elevation
    const elevationScale = Math.cos(elevation);
    x *= elevationScale;
    z *= elevationScale;
    
    // Debug logging for specific words
    if (analysis.word === 'atom' || analysis.word === 'rock' || analysis.word === 'star' || analysis.word === 'now') {
      console.log(`=== DEBUG: ${analysis.word.toUpperCase()} POSITIONING ===`);
      console.log('Dimensions:', analysis.dimensions);
      console.log('Final position [x, y, z]:', [x, y, z]);
      console.log('=== END DEBUG ===');
    }
    
    return [x, y, z];
  };

  const addSentence = () => {
    if (currentSentence.trim()) {
      const validation = validateSentenceInput(currentSentence.trim());
      if (validation.isValid) {
        setSentences([...sentences, currentSentence.trim()]);
        setCurrentSentence('');
        setInputValidation({ isValid: true, invalidWords: [] });
      } else {
        setInputValidation(validation);
      }
    }
  };

  // Real-time validation as user types
  const handleSentenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentSentence(value);
    
    if (value.trim()) {
      const validation = validateSentenceInput(value.trim());
      setInputValidation(validation);
    } else {
      setInputValidation({ isValid: true, invalidWords: [] });
    }
  };

  const plotData = () => {
    const allWords: Record<string, WordAnalysis> = {};
    const paths: SentencePath[] = [];
    const usedPositions: Map<string, number> = new Map();
    
    // Track coverage statistics
    let mappedWordsCount = 0;
    let unmappedWordsCount = 0;
    const unmappedWords: string[] = [];
    
    sentences.forEach((sentence, sentenceIndex) => {
      console.log('=== PROCESSING SENTENCE ===');
      console.log('Original sentence:', sentence);
      
      // Get only semantic content words (exclude connection words)
      const semanticWords = getSemanticWords(sentence);
      console.log('Semantic words extracted:', semanticWords);
      
      const path: string[] = [];
      
      semanticWords.forEach(word => {
        console.log(`Processing word: "${word}", length: ${word.length}`);
        
        if (word && word.length > 0) {
          if (!allWords[word]) {
            console.log(`Analyzing new word: ${word}`);
            
            // Check if word is in our explicit vocabulary
            const allMapped = getAllMappedWords();
            const isExplicitlyMapped = allMapped.includes(word);
            
            if (isExplicitlyMapped) {
              mappedWordsCount++;
            } else {
              unmappedWordsCount++;
              unmappedWords.push(word);
              console.log(`⚠️  Word "${word}" not in semantic knowledge base - using defaults`);
            }
            
            const analysis = analyzeWordSemantics(word);
            let position = semanticsToPosition(analysis);
            
            // Check for position conflicts and add jitter if needed
            const positionKey = `${position[0].toFixed(3)},${position[1].toFixed(3)},${position[2].toFixed(3)}`;
            const conflictCount = usedPositions.get(positionKey) || 0;
            
            if (conflictCount > 0) {
              console.log(`Position conflict detected for "${word}" at ${positionKey}, adding jitter`);
              // Add small random offset based on conflict count
              const jitterAmount = 0.3;
              const angle = (conflictCount * 60) * (Math.PI / 180); // Spread conflicts in circle
              const jitterX = Math.cos(angle) * jitterAmount;
              const jitterZ = Math.sin(angle) * jitterAmount;
              
              position = [
                position[0] + jitterX,
                position[1] + (conflictCount * 0.1), // Small vertical offset
                position[2] + jitterZ
              ];
              console.log(`Jittered position for "${word}":`, position);
            }
            
            usedPositions.set(positionKey, conflictCount + 1);
            console.log(`Word "${word}" positioned at:`, position);
            
            allWords[word] = {
              ...analysis,
              position,
              count: 1
            };
          } else {
            console.log(`Word "${word}" already exists, incrementing count`);
            allWords[word].count++;
          }
          path.push(word);
        } else {
          console.log(`Word "${word}" filtered out (length: ${word.length})`);
        }
      });
      
      console.log('Final path for sentence:', path);
      console.log('=== END SENTENCE PROCESSING ===');
      
      // Only create path if we have semantic content words
      if (path.length > 0) {
        paths.push({
          sentence,
          path,
          color: new THREE.Color().setHSL((sentenceIndex * 0.618) % 1, 0.9, 0.6).getHex()
        });
      }
    });
    
    // Log coverage statistics
    const totalWords = mappedWordsCount + unmappedWordsCount;
    const coveragePercent = totalWords > 0 ? (mappedWordsCount / totalWords * 100).toFixed(1) : 0;
    
    console.log(`📊 SEMANTIC COVERAGE STATISTICS:`);
    console.log(`Mapped words: ${mappedWordsCount}/${totalWords} (${coveragePercent}%)`);
    console.log(`Unmapped words: ${unmappedWordsCount} - ${unmappedWords.join(', ')}`);
    
    console.log('All words to be plotted:', Object.keys(allWords));
    console.log('All paths:', paths);
    
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
  const cameraAngleRef = useRef(0);
  const cameraElevationRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const rect = mountRef.current.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
    camera.position.set(15, 10, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(rect.width, rect.height);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      cameraRef.current.aspect = rect.width / rect.height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);

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
      
      cameraAngleRef.current = cameraAngleRef.current + deltaX * 0.003;
      cameraElevationRef.current = Math.max(-Math.PI/3, Math.min(Math.PI/3, cameraElevationRef.current - deltaY * 0.003));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1; // Smoother zoom steps
      const newTargetZoom = Math.max(0.1, Math.min(20, targetZoomRef.current * zoomFactor));
      targetZoomRef.current = newTargetZoom;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Smooth zoom interpolation
      const zoomSpeed = 0.1; // Adjust for different smoothness (0.1 = smooth, 0.5 = faster)
      const currentZoom = zoomLevel;
      const targetZoom = targetZoomRef.current;
      const newZoom = currentZoom + (targetZoom - currentZoom) * zoomSpeed;
      
      // Only update if there's a meaningful difference
      if (Math.abs(newZoom - currentZoom) > 0.001) {
        setZoomLevel(newZoom);
      }
      
      // Update camera position smoothly
      if (cameraRef.current) {
        const distance = 20 / newZoom;
        const angle = cameraAngleRef.current;
        const elevation = cameraElevationRef.current;
        cameraRef.current.position.x = distance * Math.cos(elevation) * Math.cos(angle);
        cameraRef.current.position.y = distance * Math.sin(elevation);
        cameraRef.current.position.z = distance * Math.cos(elevation) * Math.sin(angle);
        cameraRef.current.lookAt(0, 0, 0);
      }
      
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
      window.removeEventListener('resize', handleResize);
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

    // Show dimensional framework (spokes and labels only) when enabled
    if (showDimensionalFramework) {
      // Dimensional spokes
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
        const material = new THREE.LineBasicMaterial({ color: dim.color, opacity: 0.6, transparent: true });
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
    }

    // Show wave pattern visualization
    if (showWaveVisualization) {
      // Show wave at multiple radii to demonstrate amplitude scaling
      const waveRadii = [1, 2.5, 4, 5.5, 7]; // Match abstraction layer radii
      const waveColors = [0x00ff00, 0x3498db, 0x9b59b6, 0xe67e22, 0xe74c3c]; // Match layer colors
      
      waveRadii.forEach((waveRadius, layerIndex) => {
        const wavePoints: THREE.Vector3[] = [];
        
        for (let angle = 0; angle <= 360; angle += 10) {
          const azimuthRad = angle * (Math.PI / 180);
          const elevation = (Math.sin(azimuthRad * 3) * 0.3) * Math.PI;
          
          const x = waveRadius * Math.cos(elevation) * Math.cos(azimuthRad);
          const y = waveRadius * Math.sin(elevation);
          const z = waveRadius * Math.cos(elevation) * Math.sin(azimuthRad);
          
          wavePoints.push(new THREE.Vector3(x, y, z));
        }
        
        // Create the wave line for this radius
        const waveGeometry = new THREE.BufferGeometry().setFromPoints(wavePoints);
        const waveMaterial = new THREE.LineBasicMaterial({ 
          color: waveColors[layerIndex], 
          linewidth: 2,
          transparent: true,
          opacity: 0.6
        });
        const waveLine = new THREE.Line(waveGeometry, waveMaterial);
        waveLine.userData.isPlotted = true;
        sceneRef.current!.add(waveLine);
      });
    }

    if (isPlotted) {
      console.log('=== RENDERING WORDS ===');
      console.log('wordData keys:', Object.keys(wordData));
      console.log('wordData values:', Object.values(wordData));
      
      // Plot words
      Object.values(wordData).forEach((data, index) => {
        console.log(`Rendering word ${index + 1}:`, data.word);
        console.log(`- Position:`, data.position);
        console.log(`- Abstraction level:`, data.abstractionLevel);
        console.log(`- Count:`, data.count);
        
        const size = 0.1 + (data.count * 0.05);
        console.log(`- Sphere size:`, size);
        
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const layerColor = abstractionLayers[data.abstractionLevel - 1].color;
        console.log(`- Color:`, layerColor);
        
        const material = new THREE.MeshPhongMaterial({ 
          color: layerColor,
          transparent: true,
          opacity: 0.8
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(...data.position);
        sphere.userData.isPlotted = true;
        sphere.userData.word = data.word; // Add word identifier
        
        console.log(`- Adding sphere to scene for "${data.word}" at position:`, sphere.position);
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
        wordLabel.userData.word = data.word + '_label';
        
        console.log(`- Adding label to scene for "${data.word}" at position:`, wordLabel.position);
        sceneRef.current!.add(wordLabel);
      });
      
      console.log('=== FINISHED RENDERING WORDS ===');
      console.log('Total objects in scene:', sceneRef.current!.children.length);

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

  }, [isPlotted, wordData, sentencePaths, showDimensionalFramework, showWaveVisualization]);

  return (
    <div className="w-full min-h-screen p-4 bg-gray-900 text-white">
      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-2">Concrete→Abstract Semantic Sphere</h1>
        <p className="text-gray-300 text-lg">
          Center = Concrete objects. Perimeter = Abstract concepts. 
          Angular dimensions distinguish orthogonal semantic properties.
        </p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-140px)]">
        <div className="flex-1 flex flex-col">
          <div ref={mountRef} className="flex-1 border border-gray-700 rounded-lg overflow-hidden" />
          <div className="mt-2 text-sm text-gray-400 text-center">
            Mouse: Rotate | Wheel: Zoom | Current zoom: {zoomLevel.toFixed(1)}x
          </div>
        </div>

        <div className="w-[28rem] space-y-4 overflow-y-auto">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Input Methods</h3>
            
            {/* Free Text Input with Validation */}
            <div className="mb-4 p-3 bg-gray-750 rounded">
              <h4 className="text-sm font-medium mb-2">Type Sentences Directly:</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSentence}
                    onChange={handleSentenceChange}
                    onKeyPress={(e) => e.key === 'Enter' && addSentence()}
                    placeholder="The stone became sand through time and change"
                    className={`flex-1 px-3 py-2 rounded text-white text-sm ${
                      inputValidation.isValid ? 'bg-gray-700 border-gray-600' : 'bg-red-900 border-red-500'
                    } border`}
                  />
                  <button
                    onClick={addSentence}
                    disabled={!inputValidation.isValid || !currentSentence.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
                {!inputValidation.isValid && (
                  <div className="text-red-400 text-xs">
                    Invalid words: {inputValidation.invalidWords.join(', ')}
                    <br />
                    <span className="text-gray-400">Only semantic words and connection words are allowed.</span>
                  </div>
                )}
                {inputValidation.isValid && currentSentence.trim() && (
                  <div className="text-green-400 text-xs">
                    ✓ Valid sentence with {getSemanticWords(currentSentence).length} semantic words
                  </div>
                )}
              </div>
            </div>

            {/* Guided Word Selection */}
            <div className="mb-3 p-3 bg-gray-750 rounded">
              <h4 className="text-sm font-medium mb-2">Or Build Sentences with Guided Selection:</h4>
              <div className="min-h-[40px] p-2 bg-gray-700 rounded text-sm border">
                {selectedWords.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedWords.map((word, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 rounded text-xs cursor-pointer hover:bg-red-600"
                        onClick={() => removeWordFromSentence(index)}
                        title="Click to remove"
                      >
                        {word} ×
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Select words below to build sentence...</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={createSentenceFromWords}
                  disabled={selectedWords.length === 0}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
                >
                  Add to Collection
                </button>
                <button
                  onClick={clearSelectedWords}
                  disabled={selectedWords.length === 0}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* View mode selector */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Browse by:</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('abstraction')}
                  className={`px-3 py-1 rounded text-xs ${viewMode === 'abstraction' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                  Abstraction
                </button>
                <button
                  onClick={() => setViewMode('dimension')}
                  className={`px-3 py-1 rounded text-xs ${viewMode === 'dimension' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                  Dimension
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1 rounded text-xs ${viewMode === 'all' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                >
                  All Words
                </button>
              </div>
            </div>

            {/* Word selection interface */}
            <div className="space-y-3">
              {viewMode === 'abstraction' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Abstraction Level:</label>
                  <select
                    value={selectedAbstractionLevel}
                    onChange={(e) => setSelectedAbstractionLevel(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-sm mb-2"
                  >
                    {abstractionLayers.map(layer => (
                      <option key={layer.level} value={layer.level}>
                        {layer.level}. {layer.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-400 mb-2">
                    {vocabularyByAbstraction[selectedAbstractionLevel].length} words available
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {vocabularyByAbstraction[selectedAbstractionLevel].map(word => (
                      <button
                        key={word}
                        onClick={() => addWordToSentence(word)}
                        className="p-1.5 bg-gray-600 hover:bg-blue-600 rounded text-xs text-left transition-colors"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {viewMode === 'dimension' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Dimension:</label>
                  <select
                    value={selectedDimension}
                    onChange={(e) => setSelectedDimension(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-sm mb-2"
                  >
                    {Object.keys(vocabularyByDimension).map(dim => (
                      <option key={dim} value={dim}>{dim}</option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-400 mb-2">
                    {Object.values(vocabularyByDimension[selectedDimension as keyof typeof vocabularyByDimension]).reduce((total, words) => total + words.length, 0)} words available
                  </div>
                  <div className="space-y-3">
                    {Object.entries(vocabularyByDimension[selectedDimension as keyof typeof vocabularyByDimension]).map(([category, words]) => (
                      <div key={category}>
                        <div className="text-sm font-medium text-gray-300 mb-2 capitalize">{category}: ({words.length})</div>
                        <div className="grid grid-cols-3 gap-1">
                          {words.map(word => (
                            <button
                              key={word}
                              onClick={() => addWordToSentence(word)}
                              className="p-1.5 bg-gray-600 hover:bg-blue-600 rounded text-xs text-left transition-colors"
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewMode === 'all' && (
                <div>
                  <label className="block text-sm font-medium mb-2">All Mapped Words:</label>
                  <div className="text-xs text-gray-400 mb-2">
                    {getAllMappedWords().length} total semantic words available
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-gray-750 p-2 rounded">
                    {getAllMappedWords().map(word => (
                      <button
                        key={word}
                        onClick={() => addWordToSentence(word)}
                        className="p-1.5 bg-gray-600 hover:bg-blue-600 rounded text-xs text-left transition-colors"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
                          {/* Examples and Help */}
              <div className="mt-4 p-2 bg-gray-750 rounded text-xs">
                <div className="font-medium text-gray-300 mb-1">Example sentences you can type:</div>
                <div className="text-gray-400 space-y-1">
                  <div>"The stone became sand through time and change"</div>
                  <div>"Energy flows from the star to create matter"</div>
                  <div>"Water transforms into gas when heat is applied"</div>
                </div>
                <div className="mt-2 text-gray-500">
                  <span className="font-medium">Tip:</span> Use connection words (the, and, through, when, etc.) 
                  to make natural sentences. Only semantic content words will be plotted.
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
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
                  Clear All
                </button>
              </div>

              <div className="space-y-2 mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showDimensionalFramework}
                    onChange={(e) => setShowDimensionalFramework(e.target.checked)}
                  />
                  Show dimensional framework
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showWaveVisualization}
                    onChange={(e) => setShowWaveVisualization(e.target.checked)}
                  />
                  Show elevation wave pattern
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
            <h3 className="text-lg font-semibold mb-2">Collected Sentences ({sentences.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sentences.map((sentence, index) => (
                <div key={index} className="text-sm text-gray-300 p-3 bg-gray-700 rounded hover:bg-gray-650 transition-colors">
                  <div className="font-medium">{sentence}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Semantic words: {getSemanticWords(sentence).join(', ')}
                  </div>
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