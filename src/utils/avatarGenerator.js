const avatarStyles = [
  "bottts", // Abstract, cartoonish faces
  "botttsNeutral", // Neutral version of 'bottts'
  "identicon", // Abstract, geometric patterns
  "pixelArt", // Pixelated cartoon style
  "pixelArtNeutral", // Neutral pixel art style
  "shapes", // Abstract shapes and lines
  "rings", // Circular, abstract designs
];

/**
 * Generates a random DiceBear avatar URL
 * @returns {string} Avatar image URL
 */
export function getRandomAvatar() {
  const randomStyle =
    avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
  const randomSeed = Math.random().toString(36).substring(2, 10);
  return `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}`;
}

getRandomAvatar(); // Call the function to generate a random avatar URL
