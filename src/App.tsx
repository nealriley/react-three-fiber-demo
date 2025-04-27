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
  fontSize = 0.7
}: { 
  letter: string; 
  position: [number, number, number]; 
  onFadeComplete: () => void; 
  isFadingOut?: boolean;
  fontSize?: number;
}) {
  const [opacity, setOpacity] = useState(1);
  const fadeSpeed = isFadingOut ? 0.05 : 0.01; // Faster fade for words being replaced
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

  const handleDownload = useCallback(() => {
    if (textBuffer.length === 0) return;
    
    // Create text content with proper spacing and line breaks
    const content = textBuffer.join(' ');
    
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
    setTextBuffer([]);
    setHasText(false);
  }, [textBuffer]);

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
        {hasText && (
          <button className="button download-button" onClick={handleDownload}>
            Download Text
          </button>
        )}
        <button className="button toggle-button" onClick={togglePanel}>
          Hide Panel
        </button>
      </div>
      
      <button 
        className={`button show-panel-button ${!isPanelVisible ? 'visible' : ''}`}
        onClick={togglePanel}
      >
        Show Panel
      </button>
      
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
            onFadeComplete={() => handleFadeComplete(letter.id)}
          />
        ))}
      </Canvas>
    </div>
  );
}

export default App;