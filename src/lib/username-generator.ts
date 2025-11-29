/**
 * Random Username Generator
 * Generates creative usernames for users who haven't set one yet
 */

const adjectives = [
    'Creative', 'Epic', 'Swift', 'Clever', 'Bright', 'Cool', 'Smart', 'Bold',
    'Wise', 'Quick', 'Sharp', 'Wild', 'Neat', 'Chill', 'Cosmic', 'Stellar',
    'Radiant', 'Vibrant', 'Dynamic', 'Sleek', 'Prime', 'Mega', 'Ultra', 'Super',
    'Mystic', 'Noble', 'Elite', 'Ace', 'Pro', 'Alpha', 'Ninja', 'Quantum',
    'Digital', 'Cyber', 'Phoenix', 'Thunder', 'Blaze', 'Storm', 'Frost', 'Shadow'
];

const nouns = [
    'Creator', 'Artist', 'Designer', 'Maker', 'Builder', 'Dreamer', 'Innovator',
    'Pioneer', 'Explorer', 'Voyager', 'Wizard', 'Genius', 'Master', 'Champion',
    'Legend', 'Hero', 'Knight', 'Warrior', 'Sage', 'Scholar', 'Writer', 'Poet',
    'Thinker', 'Visionary', 'Leader', 'Influencer', 'Storyteller', 'Maverick',
    'Craftsman', 'Virtuoso', 'Prodigy', 'Guardian', 'Seeker', 'Wanderer', 'Pilot',
    'Navigator', 'Strategist', 'Engineer', 'Architect', 'Developer'
];

/**
 * Generate a random username based on email
 * Uses email as seed for consistency
 */
export function generateRandomUsername(email?: string): string {
    if (!email) {
        return getRandomCombination();
    }

    // Use email as seed for consistent username generation
    const seed = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const adjIndex = seed % adjectives.length;
    const nounIndex = (seed * 7) % nouns.length;
    const number = (seed % 100).toString().padStart(2, '0');

    return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
}

/**
 * Get a truly random combination (no seed)
 */
function getRandomCombination(): string {
    const adjIndex = Math.floor(Math.random() * adjectives.length);
    const nounIndex = Math.floor(Math.random() * nouns.length);
    const number = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
}

/**
 * Get username display - prefers username, falls back to generated name
 */
export function getDisplayUsername(username?: string | null, email?: string): string {
    if (username && username.trim().length > 0) {
        return username;
    }

    return generateRandomUsername(email);
}
