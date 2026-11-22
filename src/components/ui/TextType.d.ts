import type React from 'react';

export interface TextTypeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'prefix'> {
  text: string | string[];
  as?: React.ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  deleteMode?: 'backspace' | 'select';
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorStyle?: 'character' | 'bar' | 'block' | 'underscore';
  cursorCharacter?: string;
  cursorColor?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  cursorGlide?: boolean;
  typeEffect?: 'none' | 'fade' | 'blur' | 'rise';
  mistakes?: number;
  prefix?: string;
  prefixColor?: string;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

declare const TextType: React.FC<TextTypeProps>;
export default TextType;
