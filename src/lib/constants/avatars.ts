// Avatares disponíveis para os jogadores
// Usando emojis como avatares para simplicidade inicial
// Posteriormente pode ser substituído por imagens personalizadas

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  category: 'fun' | 'animals' | 'fantasy' | 'sports' | 'food';
}

export const AVATARS: Avatar[] = [
  // Diversão
  { id: 'clown', emoji: '🤡', name: 'Palhaço', category: 'fun' },
  { id: 'party', emoji: '🥳', name: 'Festeiro', category: 'fun' },
  { id: 'cool', emoji: '😎', name: 'Descolado', category: 'fun' },
  { id: 'star', emoji: '🌟', name: 'Estrela', category: 'fun' },
  { id: 'fire', emoji: '🔥', name: 'Fogo', category: 'fun' },
  { id: 'rainbow', emoji: '🌈', name: 'Arco-íris', category: 'fun' },

  // Animais
  { id: 'cat', emoji: '🐱', name: 'Gato', category: 'animals' },
  { id: 'dog', emoji: '🐶', name: 'Cachorro', category: 'animals' },
  { id: 'lion', emoji: '🦁', name: 'Leão', category: 'animals' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicórnio', category: 'animals' },
  { id: 'fox', emoji: '🦊', name: 'Raposa', category: 'animals' },
  { id: 'panda', emoji: '🐼', name: 'Panda', category: 'animals' },
  { id: 'koala', emoji: '🐨', name: 'Coala', category: 'animals' },
  { id: 'owl', emoji: '🦉', name: 'Coruja', category: 'animals' },

  // Fantasia
  { id: 'wizard', emoji: '🧙', name: 'Mago', category: 'fantasy' },
  { id: 'knight', emoji: '⚔️', name: 'Guerreiro', category: 'fantasy' },
  { id: 'fairy', emoji: '🧚', name: 'Fada', category: 'fantasy' },
  { id: 'vampire', emoji: '🧛', name: 'Vampiro', category: 'fantasy' },
  { id: 'zombie', emoji: '🧟', name: 'Zumbi', category: 'fantasy' },
  { id: 'alien', emoji: '👽', name: 'Alien', category: 'fantasy' },
  { id: 'robot', emoji: '🤖', name: 'Robô', category: 'fantasy' },
  { id: 'ghost', emoji: '👻', name: 'Fantasma', category: 'fantasy' },

  // Esportes
  { id: 'soccer', emoji: '⚽', name: 'Futebol', category: 'sports' },
  { id: 'basketball', emoji: '🏀', name: 'Basquete', category: 'sports' },
  { id: 'trophy', emoji: '🏆', name: 'Campeão', category: 'sports' },
  { id: 'medal', emoji: '🥇', name: 'Medalha', category: 'sports' },

  // Comida
  { id: 'pizza', emoji: '🍕', name: 'Pizza', category: 'food' },
  { id: 'burger', emoji: '🍔', name: 'Hambúrguer', category: 'food' },
  { id: 'icecream', emoji: '🍦', name: 'Sorvete', category: 'food' },
  { id: 'cake', emoji: '🎂', name: 'Bolo', category: 'food' },
];

export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find((a) => a.id === id);
}

export function getRandomAvatar(): Avatar {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
