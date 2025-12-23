// Load BIP39 word list
let wordList: string[] | null = null;

export async function loadWordList(): Promise<string[]> {
  if (wordList) {
    return wordList;
  }

  try {
    const response = await fetch('/seedphrase.txt');
    const text = await response.text();
    wordList = text
      .split('\n')
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0);
    return wordList;
  } catch (error) {
    console.error('Failed to load word list:', error);
    return [];
  }
}

export function validateWord(word: string, wordList: string[]): boolean {
  return wordList.includes(word.toLowerCase().trim());
}

export function validatePhrase(phrase: string, wordList: string[]): {
  isValid: boolean;
  words: string[];
  wordCount: number;
  invalidWords: number[];
} {
  const words = phrase
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  
  const wordCount = words.length;
  const invalidWords: number[] = [];

  words.forEach((word, index) => {
    if (!validateWord(word, wordList)) {
      invalidWords.push(index);
    }
  });

  const isValid = invalidWords.length === 0 && (wordCount === 12 || wordCount === 24);

  return {
    isValid,
    words,
    wordCount,
    invalidWords,
  };
}

export function getAutocompleteSuggestions(
  input: string,
  wordList: string[],
  limit: number = 8
): string[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const searchTerm = input.toLowerCase().trim();
  const suggestions = wordList
    .filter((word) => word.startsWith(searchTerm))
    .slice(0, limit);

  return suggestions;
}

export function getCurrentWord(input: string): string {
  const words = input.trim().split(/\s+/);
  return words[words.length - 1] || '';
}


