import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

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
  
  // Add subtle rotation to the letter
  const randomRotation = useMemo(() => {
    return [
      Math.random() * 0.2 - 0.1, // X rotation
      Math.random() * 0.2 - 0.1, // Y rotation
      Math.random() * 0.2 - 0.1  // Z rotation
    ];
  }, []);
  
  useEffect(() => {
    const fadeOutInterval = setInterval(() => {
      setOpacity((prev) => {
        const newOpacity = prev - fadeSpeed;
        if (newOpacity <= 0) {
          clearInterval(fadeOutInterval);
          onFadeComplete();
          return 0;
        }
        return newOpacity;
      });
    }, 20);

    return () => clearInterval(fadeOutInterval);
  }, [onFadeComplete, fadeSpeed]);

  // Generate a slightly random color for variety
  const color = useMemo(() => {
    // Base color is white with slight variation to pastel colors
    const r = 220 + Math.floor(Math.random() * 35);
    const g = 220 + Math.floor(Math.random() * 35);
    const b = 220 + Math.floor(Math.random() * 35);
    return `rgb(${r},${g},${b})`;
  }, []);
  
  // Subtle animation
  useFrame((state, delta) => {
    if (meshRef.current && !isFadingOut) {
      // Add subtle floating motion
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.0015;
      
      // Subtle rotation
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


function App() {
  const [currentWord, setCurrentWord] = useState('');
  const [displayedLetters, setDisplayedLetters] = useState<{ 
    id: number; 
    text: string; 
    position: [number, number, number]; 
    isFadingOut?: boolean;
    fontSize?: number;
  }[]>([]);
  const [nextId, setNextId] = useState(1);
  const [textBuffer, setTextBuffer] = useState<string[]>([]);
  const [hasText, setHasText] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [fadeSpeedFactor, setFadeSpeedFactor] = useState(1); // Default speed factor
  
  const startNewWord = useCallback(() => {
    if (currentWord.trim()) {
      // Add word to text buffer
      setTextBuffer(prev => [...prev, currentWord]);
      setHasText(true);
      
      // Reset current word
      setCurrentWord('');
    }
  }, [currentWord]);

  // Recalculate positions for all letters to keep the word centered around a random position
  const updateLetterPositions = useCallback((word: string) => {
    const wordLength = word.length;
    
    // Smaller font size
    const baseFontSize = 0.7;
    
    // Calculate a random font size variation (±10%)
    const fontSizeVariation = baseFontSize * (0.9 + Math.random() * 0.2);
    
    // Calculate total width of the word - adjust spacing to look more like a typewriter
    const letterWidth = 0.4; // Reduced letter width for smaller font
    const letterSpacing = 0.05; // Spacing between letters
    const totalWidth = wordLength * (letterWidth + letterSpacing);
    
    // Generate random position for the word center
    // Keep it somewhat centered on screen but with variation
    const randomX = (Math.random() * 6) - 3; // Range: -3 to 3
    const randomY = (Math.random() * 4) - 2; // Range: -2 to 2
    
    // Start position (to center the word around the random point)
    const startX = randomX - totalWidth / 2 + letterWidth / 2;
    const startY = randomY;
    
    return Array.from(word).map((letter, index) => {
      return {
        text: letter,
        position: [startX + index * (letterWidth + letterSpacing), startY, 0] as [number, number, number],
        fontSize: fontSizeVariation
      };
    });
  }, []);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (/^[a-zA-Z]$/.test(event.key)) {
      // Add letter to current word - but don't display it yet
      const newLetter = event.key;
      const newWord = currentWord + newLetter;
      setCurrentWord(newWord);
      
    } else if (event.key === 'Backspace') {
      // Remove last character from current word
      if (currentWord.length > 0) {
        const newWord = currentWord.slice(0, -1);
        setCurrentWord(newWord);
      }
      
    } else if (event.key === ' ' || event.key === 'Enter') {
      // Space or Enter pressed - display and start new word
      if (currentWord.trim()) {
        // Display the full word now
        const newLetterPositions = updateLetterPositions(currentWord);
        
        // Update displayed letters with new positions
        setDisplayedLetters(prev => {
          // Mark all previous non-fading letters to fade out
          const updatedPrev = prev.map(letter => 
            letter.isFadingOut ? letter : { ...letter, isFadingOut: true }
          );
          
          // Add new word letters
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
        
        // Update nextId
        setNextId(prev => prev + currentWord.length);
        
        // Now start new word (which will add to text buffer)
        startNewWord();
      }
    } else if (/[.,!?;:]/.test(event.key)) {
      // Punctuation pressed - add to current word and then display/start new word
      if (currentWord) {
        const newWord = currentWord + event.key;
        setCurrentWord(newWord);
        
        // Display the full word with punctuation
        const newLetterPositions = updateLetterPositions(newWord);
        
        // Update displayed letters with new positions
        setDisplayedLetters(prev => {
          // Mark all previous non-fading letters to fade out
          const updatedPrev = prev.map(letter => 
            letter.isFadingOut ? letter : { ...letter, isFadingOut: true }
          );
          
          // Add new word letters
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
        
        // Update nextId
        setNextId(prev => prev + newWord.length);
        
        // Add a short delay before starting new word
        setTimeout(() => {
          startNewWord();
        }, 200);
      }
    }
  }, [currentWord, nextId, startNewWord, updateLetterPositions]);

  const handleFadeComplete = useCallback((id: number) => {
    setDisplayedLetters(prev => prev.filter(letter => letter.id !== id));
  }, []);

  const getTextContent = useCallback(() => {
    return textBuffer.join(' ');
  }, [textBuffer]);
  
  const getWordCount = useCallback(() => {
    // Count words in buffer
    const bufferWordCount = textBuffer.reduce((count, word) => {
      // Remove punctuation, count actual words
      const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
      return cleanWord ? count + 1 : count;
    }, 0);
    
    // Add current word if it's not empty
    const currentWordCount = currentWord.trim() ? 1 : 0;
    
    return bufferWordCount + currentWordCount;
  }, [textBuffer, currentWord]);
  
  const clearTextBuffer = useCallback(() => {
    setTextBuffer([]);
    setHasText(false);
  }, []);
  
  const clearAllText = useCallback(() => {
    // Clear the text buffer (stored text)
    setTextBuffer([]);
    setHasText(false);
    
    // Clear current word
    setCurrentWord('');
    
    // Clear all displayed letters
    setDisplayedLetters([]);
  }, []);
  
  const handleDownload = useCallback(() => {
    if (textBuffer.length === 0) return;
    
    // Create text content with proper spacing and line breaks
    const content = getTextContent();
    
    // Create a blob with the text content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typed-text-${new Date().toISOString().slice(0, 10)}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Clear text buffer
    clearTextBuffer();
  }, [textBuffer, getTextContent, clearTextBuffer]);
  
  const handleCopy = useCallback(() => {
    if (textBuffer.length === 0) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(getTextContent())
      .then(() => {
        // Clear text buffer
        clearTextBuffer();
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }, [textBuffer, getTextContent, clearTextBuffer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const togglePanel = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);

  return (
    <div className="app">
      <div className={`typing-preview ${isPanelVisible ? '' : 'hidden'}`}>
        <div className="typing-label">Currently typing:</div>
        <div className="typing-content">
          {currentWord || <span className="empty-prompt"></span>}
        </div>
        
        {/* Word count display */}
        <div className="word-count">
          <span>Word Count:</span>
          <span>{getWordCount()}</span>
        </div>
        
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
      
      <div className="sidebar">
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
        {(hasText || displayedLetters.length > 0 || currentWord) && (
          <button className="button clear-button button-tooltip" onClick={clearAllText} data-tooltip="Clear All Text">
            <i className="fas fa-trash"></i>
          </button>
        )}
        <button 
          className="button toggle-button button-tooltip" 
          onClick={togglePanel}
          data-tooltip={isPanelVisible ? "Hide Panel" : "Show Panel"}
        >
          <i className={isPanelVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
        </button>
      </div>
      
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
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