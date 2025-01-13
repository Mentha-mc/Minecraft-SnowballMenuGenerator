import React, { useState, useEffect } from 'react';

// Minecraft color code mapping
const colorMap: Record<string, string> = {
  '§0': '#000000', // Black
  '§1': '#0000AA', // Dark Blue
  '§2': '#00AA00', // Dark Green
  '§3': '#00AAAA', // Dark Aqua
  '§4': '#AA0000', // Dark Red
  '§5': '#AA00AA', // Dark Purple
  '§6': '#FFAA00', // Gold
  '§7': '#AAAAAA', // Gray
  '§8': '#555555', // Dark Gray
  '§9': '#5555FF', // Blue
  '§a': '#55FF55', // Green
  '§b': '#55FFFF', // Aqua
  '§c': '#FF5555', // Red
  '§d': '#FF55FF', // Light Purple
  '§e': '#FFFF55', // Yellow
  '§f': '#FFFFFF', // White
};

// Random characters for obfuscated text
const obfuscatedChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

interface MinecraftTextProps {
  text: string;
}

export default function MinecraftText({ text }: MinecraftTextProps) {
  const [obfuscatedText, setObfuscatedText] = useState<string[]>([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setObfuscatedText(
        Array(100).fill(0).map(() => 
          obfuscatedChars[Math.floor(Math.random() * obfuscatedChars.length)]
        )
      );
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  const processText = (input: string) => {
    let parts = [];
    let currentStyle = {
      color: '#FFFFFF',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      obfuscated: false,
    };
    
    let currentText = '';
    let i = 0;
    let obfuscatedIndex = 0;
    
    while (i < input.length) {
      if (input[i] === '§' && i + 1 < input.length) {
        if (currentText) {
          if (currentStyle.obfuscated) {
            const obfuscatedLength = currentText.length;
            parts.push({
              ...currentStyle,
              text: obfuscatedText.slice(obfuscatedIndex, obfuscatedIndex + obfuscatedLength).join(''),
              originalLength: obfuscatedLength
            });
            obfuscatedIndex += obfuscatedLength;
          } else {
            parts.push({ ...currentStyle, text: currentText });
          }
          currentText = '';
        }
        
        const code = input[i + 1].toLowerCase();
        if (colorMap[`§${code}`]) {
          currentStyle = { ...currentStyle, color: colorMap[`§${code}`] };
        } else {
          switch (code) {
            case 'k':
              currentStyle.obfuscated = true;
              break;
            case 'l':
              currentStyle.bold = true;
              break;
            case 'o':
              currentStyle.italic = true;
              break;
            case 'n':
              currentStyle.underline = true;
              break;
            case 'm':
              currentStyle.strikethrough = true;
              break;
            case 'r':
              currentStyle = {
                color: '#FFFFFF',
                bold: false,
                italic: false,
                underline: false,
                strikethrough: false,
                obfuscated: false,
              };
              break;
          }
        }
        i += 2;
      } else {
        currentText += input[i];
        i++;
      }
    }
    
    if (currentText) {
      if (currentStyle.obfuscated) {
        const obfuscatedLength = currentText.length;
        parts.push({
          ...currentStyle,
          text: obfuscatedText.slice(obfuscatedIndex, obfuscatedIndex + obfuscatedLength).join(''),
          originalLength: obfuscatedLength
        });
      } else {
        parts.push({ ...currentStyle, text: currentText });
      }
    }
    
    return parts;
  };

  const parts = processText(text);
  
  return (
    <span>
      {parts.map((part, index) => (
        <span
          key={index}
          style={{
            color: part.color,
            fontWeight: part.bold ? 'bold' : 'normal',
            fontStyle: part.italic ? 'italic' : 'normal',
            textDecoration: [
              part.underline && 'underline',
              part.strikethrough && 'line-through',
            ].filter(Boolean).join(' ') || undefined,
          }}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}