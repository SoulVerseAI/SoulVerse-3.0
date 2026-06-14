// --- NSFW Vocabulary Management ---

/**
 * NSFW_WHITELIST
 * This array contains explicit or coarse terms that are explicitly allowed in the NSFW mode.
 * The AI is instructed to accept and use these words to facilitate a more unfiltered and gritty roleplay style.
 * This helps bypass overly sensitive default filters by providing clear context for the language.
 */
export const NSFW_WHITELIST: string[] = [
    'cum', 'fuck', 'cunt', 'pussy', 'slut', 'dick', 'cock', 'asshole', 
    'bitch', 'whore', 'slutty', 'hardcore', 'porn', 'hentai', 'bondage',
    'fetish', 'kink', 'orgasm'
];

/**
 * NSFW_BLACKLIST
 * This array contains terms that are strictly forbidden across the entire application,
 * for both user input and AI output.
 * 
 * - User Input: Messages containing these words will be blocked client-side before being sent.
 * - AI Output: The AI is strictly instructed in the system prompt to never generate these words.
 * 
 * This list should be populated with terms that are considered beyond the scope of acceptable content,
 * even for NSFW roleplay, such as those related to illegal acts, extreme hate speech, or other universally
 * unacceptable themes. The current list contains placeholders for demonstration.
 */
export const NSFW_BLACKLIST: string[] = [
    // Placeholder for genuinely unacceptable terms.
    // Examples might include terms related to illegal acts or extreme hate speech.
    // For demonstration, we'll add a few examples that are often filtered.
    'noncon', 'gore', 'child'
];
