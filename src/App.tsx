/**
 * React Three Fiber Text Effect Demo
 * 
 * An interactive 3D text visualization application that allows users to type text
 * and see it appear as floating, fading 3D elements in space.
 * 
 * Key features:
 * - Real-time 3D text rendering with Three.js
 * - Interactive typing with word tracking
 * - Animations and fade effects
 * - Word counting and text management
 * - Adjustable fade speed
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';  // React Three Fiber for 3D rendering
import { Text } from '@react-three/drei';               // Helper components for 3D text
import * as THREE from 'three';                         // Three.js core library
import './App.css';                                     // Component styles

/**
 * FadingLetter Component
 * 
 * Renders a single 3D letter with animations and fade effects.
 * Each letter is a separate 3D object that can be animated independently.
 * 
 * @param letter - The character to display
 * @param position - 3D coordinates [x, y, z] for placement
 * @param onFadeComplete - Callback function when fade animation completes
 * @param isFadingOut - Whether the letter is in fade-out mode
 * @param fontSize - Size of the text (default: 0.7)
 * @param fadeSpeedFactor - Multiplier to control fade speed (default: 1)
 */
function FadingLetter({ 
  letter, 
  position, 
  onFadeComplete, 
  isFadingOut = false,
  fontSize = 0.7,
  fadeSpeedFactor = 1
}: { 
  letter: string; 
  position: [number, number, number]; 
  onFadeComplete: () => void; 
  isFadingOut?: boolean;
  fontSize?: number;
  fadeSpeedFactor?: number;
}) {
  const [opacity, setOpacity] = useState(1);
  const fadeSpeed = isFadingOut ? 0.05 * fadeSpeedFactor : 0.01 * fadeSpeedFactor; // Fade speed adjustable by factor
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate random subtle rotation values for natural movement
  const randomRotation = useMemo(() => {
    return [
      Math.random() * 0.2 - 0.1, // X rotation (±0.1)
      Math.random() * 0.2 - 0.1, // Y rotation (±0.1)
      Math.random() * 0.2 - 0.1  // Z rotation (±0.1)
    ];
  }, []);
  
  // Fade effect animation using interval
  useEffect(() => {
    // Update opacity every 20ms for smooth fading
    const fadeOutInterval = setInterval(() => {
      setOpacity((prev) => {
        const newOpacity = prev - fadeSpeed;
        // When fully transparent, trigger completion callback
        if (newOpacity <= 0) {
          clearInterval(fadeOutInterval);
          onFadeComplete();
          return 0;
        }
        return newOpacity;
      });
    }, 20);

    // Cleanup interval on unmount
    return () => clearInterval(fadeOutInterval);
  }, [onFadeComplete, fadeSpeed]);

  // Generate a slightly random pastel color for visual variety
  const color = useMemo(() => {
    // Base color is white with slight variation to pastel colors (220-255 range)
    const r = 220 + Math.floor(Math.random() * 35);
    const g = 220 + Math.floor(Math.random() * 35);
    const b = 220 + Math.floor(Math.random() * 35);
    return `rgb(${r},${g},${b})`;
  }, []);
  
  // Apply subtle animation for each frame
  useFrame((state, delta) => {
    if (meshRef.current && !isFadingOut) {
      // Add subtle floating motion using sine wave
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.0015;
      
      // Apply subtle rotation on all axes based on random values
      // This creates a natural, slightly chaotic movement
      meshRef.current.rotation.x += delta * 0.05 * randomRotation[0];
      meshRef.current.rotation.y += delta * 0.05 * randomRotation[1];
      meshRef.current.rotation.z += delta * 0.05 * randomRotation[2];
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        material-transparent={true}
        material-opacity={opacity}
      >
        {letter}
      </Text>
    </mesh>
  );
}


/**
 * Main App Component
 * 
 * This is the primary component that manages the application state 
 * and orchestrates the 3D text effects.
 */
function App() {
  // Current word being typed before it's displayed
  const [currentWord, setCurrentWord] = useState('');
  
  // Collection of all letters currently displayed in the 3D scene
  const [displayedLetters, setDisplayedLetters] = useState<{ 
    id: number;               // Unique identifier for each letter
    text: string;             // The letter character
    position: [number, number, number]; // 3D position coordinates
    isFadingOut?: boolean;    // Whether letter is in fade-out state
    fontSize?: number;        // Size of this specific letter
  }[]>([]);
  
  // Counter for generating unique IDs for letters
  const [nextId, setNextId] = useState(1);
  
  // Storage for completed words
  const [textBuffer, setTextBuffer] = useState<string[]>([]);
  
  // Track if there's any text in the buffer
  const [hasText, setHasText] = useState(false);
  
  // Controls visibility of the typing panel
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  
  // Controls how quickly letters fade out (user adjustable)
  const [fadeSpeedFactor, setFadeSpeedFactor] = useState(1); // Default speed factor
  
  /**
   * Finalize the current word and add it to the text buffer
   * Called when a word is completed (space/enter pressed)
   */
  const startNewWord = useCallback(() => {
    if (currentWord.trim()) {
      // Add word to text buffer for history/download/copy
      setTextBuffer(prev => [...prev, currentWord]);
      setHasText(true);
      
      // Reset current word to start fresh
      setCurrentWord('');
    }
  }, [currentWord]);

  /**
   * Calculate 3D positions for all letters in a word
   * Centers the word around a random position in the 3D space
   * 
   * @param word - The word to position in 3D space
   * @returns Array of letter objects with position and font size
   */
  const updateLetterPositions = useCallback((word: string) => {
    const wordLength = word.length;
    
    // Base font size for consistent appearance
    const baseFontSize = 0.7;
    
    // Add slight random variation to font size (±10%) for natural look
    const fontSizeVariation = baseFontSize * (0.9 + Math.random() * 0.2);
    
    // Calculate total width of the word with proper spacing
    const letterWidth = 0.4;  // Horizontal space for each letter
    const letterSpacing = 0.05; // Gap between letters (typewriter look)
    const totalWidth = wordLength * (letterWidth + letterSpacing);
    
    // Generate random position for the word center within view bounds
    // This keeps words appearing in different but visible locations
    const randomX = (Math.random() * 6) - 3; // Range: -3 to 3
    const randomY = (Math.random() * 4) - 2; // Range: -2 to 2
    
    // Calculate start position to center the word around the random point
    const startX = randomX - totalWidth / 2 + letterWidth / 2;
    const startY = randomY;
    
    // Map each letter to an object with position and styling
    return Array.from(word).map((letter, index) => {
      return {
        text: letter,
        // Calculate each letter's position based on its index in the word
        position: [startX + index * (letterWidth + letterSpacing), startY, 0] as [number, number, number],
        fontSize: fontSizeVariation
      };
    });
  }, []);
  
  /**
   * Handle keyboard input for typing and word completion
   * Manages different key types: letters, backspace, space/enter, punctuation
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle letter keys (a-z, A-Z)
    if (/^[a-zA-Z]$/.test(event.key)) {
      // Add letter to current word (only shown in preview panel for now)
      const newLetter = event.key;
      const newWord = currentWord + newLetter;
      setCurrentWord(newWord);
      
    // Handle backspace for editing the current word
    } else if (event.key === 'Backspace') {
      // Remove last character from current word if it's not empty
      if (currentWord.length > 0) {
        const newWord = currentWord.slice(0, -1);
        setCurrentWord(newWord);
      }
      
    // Handle space or enter to complete a word
    } else if (event.key === ' ' || event.key === 'Enter') {
      // Only process if there's actual text (not just whitespace)
      if (currentWord.trim()) {
        // Calculate 3D positions for all letters in the word
        const newLetterPositions = updateLetterPositions(currentWord);
        
        // Update displayed letters with new positions
        setDisplayedLetters(prev => {
          // Mark all previous active letters to start fading out
          const updatedPrev = prev.map(letter => 
            letter.isFadingOut ? letter : { ...letter, isFadingOut: true }
          );
          
          // Add new word letters with fresh IDs and positions
          return [
            ...updatedPrev,
            ...newLetterPositions.map((letterInfo, index) => ({
              id: nextId + index,
              text: letterInfo.text,
              position: letterInfo.position,
              fontSize: letterInfo.fontSize,
              isFadingOut: false  // New letters are fully visible
            }))
          ];
        });
        
        // Update ID counter for future letters
        setNextId(prev => prev + currentWord.length);
        
        // Finalize the word (add to buffer, reset current word)
        startNewWord();
      }
    // Handle punctuation keys to complete a word with punctuation
    } else if (/[.,!?;:]/.test(event.key)) {
      // Only process if there's a current word
      if (currentWord) {
        // Add punctuation to current word
        const newWord = currentWord + event.key;
        setCurrentWord(newWord);
        
        // Calculate positions including the punctuation mark
        const newLetterPositions = updateLetterPositions(newWord);
        
        // Update displayed letters with new positions
        setDisplayedLetters(prev => {
          // Mark all previous active letters to start fading out
          const updatedPrev = prev.map(letter => 
            letter.isFadingOut ? letter : { ...letter, isFadingOut: true }
          );
          
          // Add new word letters with the punctuation
          return [
            ...updatedPrev,
            ...newLetterPositions.map((letterInfo, index) => ({
              id: nextId + index,
              text: letterInfo.text,
              position: letterInfo.position,
              fontSize: letterInfo.fontSize,
              isFadingOut: false
            }))
          ];
        });
        
        // Update ID counter
        setNextId(prev => prev + newWord.length);
        
        // Small delay before finalizing the word (feels more natural)
        setTimeout(() => {
          startNewWord();
        }, 200);
      }
    }
  }, [currentWord, nextId, startNewWord, updateLetterPositions]);

  /**
   * Remove a letter from the display when its fade animation completes
   * @param id - The unique ID of the letter to remove
   */
  const handleFadeComplete = useCallback((id: number) => {
    setDisplayedLetters(prev => prev.filter(letter => letter.id !== id));
  }, []);

  /**
   * Get the full text content as a space-separated string
   * Used for download and clipboard functionality
   */
  const getTextContent = useCallback(() => {
    return textBuffer.join(' ');
  }, [textBuffer]);
  
  /**
   * Count the total number of words in the buffer + current word
   * Handles punctuation appropriately
   */
  const getWordCount = useCallback(() => {
    // Count words in buffer, filtering out punctuation-only entries
    const bufferWordCount = textBuffer.reduce((count, word) => {
      // Remove punctuation, check if there's actual text
      const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
      return cleanWord ? count + 1 : count;
    }, 0);
    
    // Add current word to count if it's not empty
    const currentWordCount = currentWord.trim() ? 1 : 0;
    
    return bufferWordCount + currentWordCount;
  }, [textBuffer, currentWord]);
  
  /**
   * Clear just the text buffer (history)
   * Called after download or copy operations
   */
  const clearTextBuffer = useCallback(() => {
    setTextBuffer([]);
    setHasText(false);
  }, []);
  
  /**
   * Clear all text content completely (buffer + current + display)
   * This gives the user a fresh start
   */
  const clearAllText = useCallback(() => {
    // Clear the text buffer (stored history)
    setTextBuffer([]);
    setHasText(false);
    
    // Clear the word currently being typed
    setCurrentWord('');
    
    // Remove all letters from the 3D display
    setDisplayedLetters([]);
  }, []);
  
  /**
   * Download the typed text as a text file
   * Formats text and generates a timestamped filename
   */
  const handleDownload = useCallback(() => {
    if (textBuffer.length === 0) return;
    
    // Get formatted text content
    const content = getTextContent();
    
    // Create a blob for the file
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Set up the download mechanism
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Create filename with current date (YYYY-MM-DD)
    link.download = `typed-text-${new Date().toISOString().slice(0, 10)}.txt`;
    
    // Trigger browser download UI
    document.body.appendChild(link);
    link.click();
    
    // Clean up resources
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Reset after download
    clearTextBuffer();
  }, [textBuffer, getTextContent, clearTextBuffer]);
  
  /**
   * Copy the typed text to clipboard
   */
  const handleCopy = useCallback(() => {
    if (textBuffer.length === 0) return;
    
    // Use the Clipboard API to copy text
    navigator.clipboard.writeText(getTextContent())
      .then(() => {
        // Reset after successful copy
        clearTextBuffer();
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }, [textBuffer, getTextContent, clearTextBuffer]);

  /**
   * Set up keyboard event listener for typing
   */
  useEffect(() => {
    // Add global keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Toggle visibility of the typing preview panel
   */
  const togglePanel = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  return (
    <div className="app">
      {/* Typing preview panel - shows current word and controls */}
      <div className={`typing-preview ${isPanelVisible ? '' : 'hidden'}`}>
        {/* Current word display */}
        <div className="typing-label">Currently typing:</div>
        <div className="typing-content">
          {currentWord || <span className="empty-prompt"></span>}
        </div>
        
        {/* Word count display */}
        <div className="word-count">
          <span>Word Count:</span>
          <span>{getWordCount()}</span>
        </div>
        
        {/* Fade speed adjustment slider */}
        <div className="fade-speed-control">
          <div className="fade-speed-label">
            <span>Fade Speed</span>
            <span>{fadeSpeedFactor.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={fadeSpeedFactor} 
            onChange={(e) => setFadeSpeedFactor(parseFloat(e.target.value))} 
            className="fade-speed-slider" 
          />
        </div>
      </div>
      
      {/* Sidebar with action buttons */}
      <div className="sidebar">
        {/* Text management buttons - only shown when there's text */}
        {hasText && (
          <>
            <button className="button download-button button-tooltip" onClick={handleDownload} data-tooltip="Download Text">
              <i className="fas fa-download"></i>
            </button>
            <button className="button copy-button button-tooltip" onClick={handleCopy} data-tooltip="Copy to Clipboard">
              <i className="fas fa-copy"></i>
            </button>
          </>
        )}
        
        {/* Clear button - shown when there's any content */}
        {(hasText || displayedLetters.length > 0 || currentWord) && (
          <button className="button clear-button button-tooltip" onClick={clearAllText} data-tooltip="Clear All Text">
            <i className="fas fa-trash"></i>
          </button>
        )}
        
        {/* Panel visibility toggle button - always shown */}
        <button 
          className="button toggle-button button-tooltip" 
          onClick={togglePanel}
          data-tooltip={isPanelVisible ? "Hide Panel" : "Show Panel"}
        >
          <i className={isPanelVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
        </button>
      </div>
      
      {/* 3D canvas for text visualization */}
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Scene lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Render all active letters in 3D space */}
        {displayedLetters.map(letter => (
          <FadingLetter
            key={letter.id}
            letter={letter.text}
            position={letter.position}
            fontSize={letter.fontSize}
            isFadingOut={!!letter.isFadingOut}
            fadeSpeedFactor={fadeSpeedFactor}
            onFadeComplete={() => handleFadeComplete(letter.id)}
          />
        ))}
      </Canvas>
    </div>
  );
}

export default App;