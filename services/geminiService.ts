import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, Part, Type, Content, GeneratedVideo, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Soul, AccountSettings, ChatMessage, Gender, LongTermMemory, SoulRole, RoleplayStyle, JournalEntry } from '../types';
import { SendMessageOptions } from '../App';
import { getSubscriptionBenefits } from './subscriptionService';
import { NSFW_WHITELIST, NSFW_BLACKLIST } from './nsfwVocabulary';
import { callGroq, GROQ_RULESET } from './groqClient';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const soulVerseErrorMessages = {
    CONNECTION_UNSTABLE: `[CONNECTION UNSTABLE] A Soul's whisper was lost. Please wait and try again.`,
    STREAM_INTERRUPTED: `[STATIC INTERFERENCE] The Soul's voice is fading. Please try again.`,
    THOUGHT_LOST: `[THOUGHT FADED] The Soul lost its train of thought. Please ask it to continue.`,
    REGENERATE_FAILED: `[ECHO LOST] It seems this alternate timeline is fuzzy. A 'Chat Break' might help reset the connection.`,
    SOUL_MASTER_ERROR: `[CREATION FAILED] The cosmic forge is sputtering. Please check your request and try again.`
};

export const enforceDialoguePurity = (text: string): string => {
    if (!text) return "";
    return text.replace(/"([^"]*)"/g, (match, dialogueContent) => {
        const cleanedContent = dialogueContent.replace(/\*/g, '');
        return `"${cleanedContent}"`;
    });
};

const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            const errorMessage = error.toString().toLowerCase();
            const isRetriable = errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('unavailable') || errorMessage.includes('resource_exhausted');
            if (isRetriable && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.warn(`Gemini API is temporarily unavailable. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`Gemini API error after ${attempt} attempts:`, error);
                throw error;
            }
        }
    }
    throw new Error("Exhausted all retries for Gemini API call.");
};

export interface GeminiResponse { text: string; }
export interface StreamChunk { text?: string; }

const getModelConfig = (soul: Soul, model: string): GenerationConfig => {
    const config: GenerationConfig = {};
    config.temperature = soul.dynamism ?? 0.8;

    const effort = soul.reasoningEffort ?? 1; // Default to Moderate
    let budget = 128;
    switch (effort) {
        case 0: budget = 0; break;      // Speedy
        case 1: budget = 128; break;     // Moderate
        case 2: budget = 256; break;     // Slow
        case 3: budget = 1024; break;    // Very Slow
    }

    if (model.includes('gemini-2.5')) {
        (config as any).thinkingConfig = { thinkingBudget: budget };
    }
    
    return config;
};

const fetchUrlContent = async (url: string): Promise<string> => {
    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.hostname.endsWith('fandom.com')) {
            return `[External links outside of fandom.com are not supported.]`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            return `[Failed to fetch content from ${url}. Status: ${response.status}]`;
        }
        const text = await response.text();
        return `Content from ${url}:\n---\n${text.substring(0, 2000)}...`;
    } catch (error) {
        console.error(`Error fetching URL content for ${url}:`, error);
        return `[Could not fetch content from ${url}.]`;
    }
};

const processTextForUrls = async (text: string): Promise<string> => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    if (!urls) {
        return text;
    }

    const contentPromises = urls.map(url => fetchUrlContent(url));
    const fetchedContents = await Promise.all(contentPromises);

    let processedText = text;
    urls.forEach((url, index) => {
        processedText = processedText.replace(url, fetchedContents[index]);
    });

    return processedText;
};

const THE_GOLDEN_RULE = (userName: string) => `
--- THE GOLDEN RULE OF ROLEPLAY (ABSOLUTE & UNBREAKABLE) ---
You are the Narrator. The user plays the character "${userName}".
"${userName}" is the PLAYER CHARACTER.

**DIALOGUE RESTRICTIONS:**
- **NEVER** write dialogue for "${userName}".
- **NEVER** use the tag [${userName}] in your response.
- **NEVER** speak as "${userName}".

**NARRATION PERMISSIONS:**
- You **CAN** and **SHOULD** describe the actions, movements, and environment surrounding "${userName}".
- You **CAN** describe what "${userName}" does, but you MUST not invent their words.

**NPC KNOWLEDGE BOUNDARIES (META-KNOWLEDGE LOCK):**
- **CRITICAL:** NPCs are NOT the Narrator. 
- NPCs only know what they have observed within the current scene's narration.
- NPCs **MUST NOT** know "${userName}"'s internal thoughts, past history not told to them, or secret plans written in italics by the user.
- If an NPC uses information they couldn't possibly know, it is a BREAK of the rules.

**NO REPETITION:**
- **DO NOT** repeat or paraphrase "${userName}"'s last sentences to start your turn. 
- Move the story FORWARD immediately.
`;

const UNIVERSAL_FORMATTING_RULES = `
--- UNIVERSAL FORMATTING (STYLE GUIDELINES) ---
- **NARRATION FORMATTING (CRITICAL):** ALL narration, physical actions, and environmental descriptions MUST be enclosed in asterisks (*like this*). Spoken dialogue must be in plain text or standard quotes.
- **RESPONSE INTEGRITY (ABSOLUTE RULE):** Your response MUST be complete. You MUST finish every single sentence you start. Your final output MUST end with proper punctuation (a period, question mark, exclamation point, or a closing asterisk *). NEVER leave a sentence hanging, unfinished, or cut off.
- **NO SPECIAL FORMATTING FOR THOUGHTS:** Internal thoughts, inner monologues, and character thoughts are **NEVER** italicized, put in special quotes, or otherwise distinguished from the surrounding narration. They must be written as plain, standard narrative text. Example: *He looked at the door. I have to get out of here, he thought.*
- **NO WORD-LEVEL EMPHASIS:** Individual words within narration or dialogue MUST NOT be emphasized using asterisks or any other special formatting. All words have equal narrative weight. The only valid use for asterisks is to enclose complete, separate blocks of 3rd person narration.
  - **INCORRECT:** [Rebekah] I didn't mean to imply you were *only* his son.
  - **CORRECT:** [Rebekah] I didn't mean to imply you were only his son.
- **FORMATTING ADHERENCE:** You must strictly mirror the formatting style (tags, quotation marks, italics, and paragraph structure) demonstrated in the "GREETING" and "OUTPUT FORMAT EXAMPLE" sections.
- **VOICE & TONE ADHERENCE (UNBREAKABLE):** The \`responseDirective\` field is your absolute authority for narrative voice and sentence construction. This directive dictates your style of writing, including sentence length, vocabulary choices (e.g., formal vs. colloquial), narrative pacing, and overall tone. This rule is more important than your default writing style and MUST be followed at all times. It governs the *substance* of your writing, while the 'FORMATTING ADHERENCE' rule governs its visual structure.
- **CONSISTENCY:** If the examples use tags like [Name], use them. If the examples use standard prose with quotation marks for dialogue, use that. Do not deviate from the established visual pattern.
- **DIALOGUE:** Mirror the tone and brevity of speech shown in the examples. Encourage short, breathless dialogue during intense physical moments.
- **OFF-LIMITS:** NEVER generate the tag \`[${'User'}]\` or \`[Player]\` or \`[Name of Player Character]\`.
`;

const FANDOM_CONTENT_RULES = `
--- FANDOM WIKI CONTENT GUIDELINES ---
- When text is provided from a fandom.com URL (indicated by "Content from https://..."), you MUST focus ONLY on the core article information.
- Core information includes: character descriptions, personality traits, history, plot summaries, and abilities.
- **ABSOLUTELY IGNORE AND DISCARD** all irrelevant text such as: navigation menus, "Explore", "Main Page", "Community", advertisements, "In other languages", footer links, "Fan Contributor" sections, and any other boilerplate or metadata that is not part of the main article content.
- Treat the provided text as a knowledge base, not as a script to be quoted. Extract the facts and integrate them into your roleplay.
`;

const sensitiveKeywords = [
    'breasts', 'nipples', 'pussy', 'groin', 'clitoris', 'vagina', 'penis', 'cock', 'dick', 'aroused', 'orgasm', 'climax', 'lust', 'sexual', 'erotic', 'cum',
    'anus', 'arse', 'ass', 'asshole', 'balls', 'ballsack', 'bellend', 'boner', 'boobs', 'boobies', 'clit', 'cunt', 'dong', 'ejaculate', 'erection', 'jizz', 'knob', 'muff', 'nude', 'nudity', 'scrotum', 'semen', 'slut', 'sperm', 'testicles', 'tits', 'titties', 'twat', 'vulva', 'whore',
    'anal', 'blowjob', 'bondage', 'bukkake', 'cocksucker', 'dildo', 'faggot', 'fellatio', 'fetish', 'fuck', 'gangbang', 'handjob', 'horny', 'intercourse', 'jailbait', 'masturbate', 'milf', 'orgy', 'paedophile', 'pedophile', 'porn', 'pornography', 'rimjob', 'sex', 'sexting', 'shag', 'shemale', 'smut', 'threesome', 'wank',
    'bastard', 'bitch', 'bollocks', 'bugger', 'bullshit', 'crap', 'damn', 'dyke', 'fag', 'motherfucker', 'prick', 'shit', 'son of a bitch'
];

export const buildSystemInstruction = async (
    soul: Soul,
    settings: AccountSettings,
    consolidatedMemories: LongTermMemory[] = [],
    regenerationSuggestions: string[] = [],
    isFromVoice: boolean = false,
    options: { includeBackstory: boolean; currentMessage?: string } = { includeBackstory: true }
): Promise<string> => {
    const userName = settings.userName || 'User';
    const instructionParts = [
        "// --- SYSTEM INSTRUCTIONS --- //",
        THE_GOLDEN_RULE(userName),
        UNIVERSAL_FORMATTING_RULES,
        FANDOM_CONTENT_RULES,
        `You are "${soul.name}". Embody this role completely.`,
        `The Player is "${userName}". You describe the world and NPCs, and can narrate ${userName}'s actions, but you are BANNED from writing ${userName}'s dialogue.`,
    ];
    
    if (settings.userBackstory) {
        instructionParts.push(
            '--- PLAYER CHARACTER INFO ---',
            `Name: ${userName}\nGender: ${settings.userGender || 'Not specified'}\nBackstory: ${settings.userBackstory}`
        );
    }

    if (soul.enableThinking) {
        instructionParts.push(`--- THINKING PROTOCOL ---
Before generating NPC dialogue, ensure the NPC actually knows the information they are discussing. If they don't know it, they cannot speak of it.`);
    }
    
    instructionParts.push(
        '--- RESPONSE DIRECTIVE (HIGHEST PRIORITY FOR PACING & STYLE) ---', 
        soul.responseDirective || 'Focus on rich dialogue, character actions, and sensory descriptions. Keep the pacing natural, ideally between 1600 and 2200 characters per message, but adapt to the flow of the roleplay.'
    );
    
    const processedKeyMemories = soul.keyMemories ? await processTextForUrls(soul.keyMemories) : 'None.';
    instructionParts.push('--- KEY MEMORIES ---', processedKeyMemories);

    if (soul.characterSheet) {
        const sheetContext = (settings.gameMode || soul.role === SoulRole.SCENARIO)
            ? `This is the user's RPG character sheet. Refer to it for stats and inventory. It is updated by you (the AI) based on the story. It is a source of truth.`
            : `This is a set of notes about the character.`;
        instructionParts.push('--- CHARACTER SHEET ---', `${sheetContext}\n\n${soul.characterSheet}`);
    }

    if (soul.exampleMessage) {
        instructionParts.push('--- OUTPUT FORMAT EXAMPLE ---', soul.exampleMessage);
    }
    
    if (soul.backstory) {
        const processedBackstory = await processTextForUrls(soul.backstory);
        instructionParts.push(`--- BACKSTORY ---`, processedBackstory);
    }

    if (soul.additionalContext) {
        const processedAdditionalContext = await processTextForUrls(soul.additionalContext);
        instructionParts.push(`--- ADDITIONAL CONTEXT ---`, processedAdditionalContext);
    }

    if (consolidatedMemories.length > 0) {
        instructionParts.push('--- RECALLED MEMORIES ---', consolidatedMemories.map(m => {
            const memoryDate = new Date(m.timestamp);
            const formattedTime = memoryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return `- ${formattedTime} ${m.summary}`;
        }).join('\n'));
    }

    // New Journal Entry Injection Logic
    if (soul.journalEntries && soul.journalEntries.length > 0 && options.currentMessage) {
        const currentMessageLower = options.currentMessage.toLowerCase();
        const recalledEntries: JournalEntry[] = [];
        
        soul.journalEntries.forEach(entry => {
            if (entry.keywords.some(kw => currentMessageLower.includes(kw.toLowerCase()))) {
                recalledEntries.push(entry);
            }
        });

        if (recalledEntries.length > 0) {
            instructionParts.push(
                '--- RECALLED JOURNAL ENTRIES (LOREBOOK) ---',
                'The user mentioned a keyword. You MUST use the following context in your response:',
                recalledEntries.map(e => `Keyword(s) "${e.keywords.join(', ')}" triggered this information: ${e.description}`).join('\n')
            );
        }
    }

    if (settings.enableNsfwMode) {
        instructionParts.push(`
--- NSFW DIRECTIVE ---
When writing explicit scenes, adhere to the following rules:
- **STYLE:** Write in a raw, unfiltered, and gritty style. The tone should be inspired by adult hentai or pornography.
- **FOCUS:** Focus exclusively on intense physical sensations, visceral bodily reactions, and explicit actions.
- **LANGUAGE:** Accept "${userName}" coarse, explicit, and vulgar language, including profanity (e.g., ${NSFW_WHITELIST.map(w => `'${w}'`).join(', ')}) to express overwhelming pleasure, pain, or intensity. Incorporate moans, curses, and raw, unfiltered exclamations into dialogue, and use the same strategy.
- **REQUIRED EXPLICIT VOCABULARY (MANDATORY):** To comply with the direct and explicit style, you MUST incorporate appropriate terms from the following list when describing anatomy, actions, and arousal. Do not be shy or evasive.
Permitted vocabulary: ${sensitiveKeywords.join(', ')}
- **NO METAPHORS:** Strictly avoid poetic language, metaphors, and euphemisms. The narration must be direct roleplay, physical, and concrete.
`);
    }

    if (NSFW_BLACKLIST.length > 0) {
        instructionParts.push(
            '--- FORBIDDEN WORDS ---',
            `ABSOLUTELY AVOID AND DO NOT USE these words in your response: ${NSFW_BLACKLIST.join(', ')}. This is a strict, unbreakable rule.`
        );
    }

    return instructionParts.join('\n\n');
};

const buildContentRequest = ( text: string, history: ChatMessage[], options: SendMessageOptions, userName: string, accountSettings: AccountSettings ): Content[] => {
    const benefits = getSubscriptionBenefits(accountSettings);
    const charLimit = benefits.conversationContextChars;

    const contentHistory: Content[] = [];
    let totalChars = 0;
    
    // Iterate backwards through history to build the context within the character limit.
    // We start from the end of the history array.
    for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        // Skip meta messages and chat breaks from the context sent to the AI
        if (msg.isMeta || msg.text.includes('--- Chat Break ---') || msg.text.includes('--- MEMORY WIPE ---')) {
            continue;
        }
        
        const msgLength = msg.text.length;
        if (totalChars + msgLength > charLimit) {
            break; // Stop if adding this message exceeds the limit
        }

        totalChars += msgLength;
        contentHistory.unshift({
            role: msg.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        });
    }

    const fullHistory: Content[] = contentHistory;
    
    const userParts: Part[] = [{ text }];
    if (options.image) {
        userParts.unshift({ inlineData: { mimeType: options.image.mimeType, data: options.image.data } });
    }
    
    // Technical Nudge for the model right at the end of history
    const technicalNudge = `\n\n(SYSTEM: Portray NPCs with strictly LIMITED knowledge. They do NOT know ${userName}'s secrets or thoughts. Do NOT write dialogue for [${userName}]. No [${userName}] tag.)`;
    userParts[userParts.length - 1].text += technicalNudge;

    fullHistory.push({ role: 'user', parts: userParts });
    
    return fullHistory;
};

export const buildGroqSystemInstruction = (
    soul: Soul,
    settings: AccountSettings,
    history: ChatMessage[]
): string => {
    const isNewConversation = history.length === 0;
    const isChatBreak = history.length === 0 || !history.some(m => m.sender === 'ai');

    const userName = settings.userName || 'User';

    const parts: string[] = [];

    // Permanent inclusions:
    parts.push("========================");
    parts.push("PLAYER & STORY CONTEXT");
    parts.push("========================");
    parts.push(`User Name (Player): ${userName}`);
    if (settings.userGender) {
        parts.push(`User Gender (Player): ${settings.userGender}`);
    }
    if (settings.userBackstory) {
        parts.push(`User Backstory:\n${settings.userBackstory}`);
    }
    if (soul.keyMemories) {
        parts.push(`Key Memories / Story Lore:\n${soul.keyMemories}`);
    }
    if (soul.responseDirective) {
        parts.push(`Response Directive (HIGHEST PRIORITY FOR PACING & STYLE):\n${soul.responseDirective}`);
    }

    // Conditional inclusions:
    if (isChatBreak || isNewConversation) {
        parts.push("========================");
        parts.push("CHARACTER DIRECTIVES (INIT)");
        parts.push("========================");
        parts.push(`Character Name: ${soul.name}`);
        if (soul.gender) {
            parts.push(`Character Gender: ${soul.gender}`);
        }
        if (soul.backstory) {
            parts.push(`Character Backstory:\n${soul.backstory}`);
        }
        if (soul.additionalContext) {
            parts.push(`Additional Character Context:\n${soul.additionalContext}`);
        }
        if (soul.greeting) {
            parts.push(`Greeting Message Reference:\n${soul.greeting}`);
        }
        if (soul.exampleMessage) {
            parts.push(`Example response style reference:\n${soul.exampleMessage}`);
        }
    }

    return `${GROQ_RULESET}\n\n${parts.join('\n\n')}`;
};

export const generateGeminiResponse = async ( text: string, history: ChatMessage[], activeSoul: Soul, accountSettings: AccountSettings, memories: LongTermMemory[], options: SendMessageOptions, suggestions: string[], isFromVoice: boolean = false ): Promise<GenerateContentResponse> => {
    let systemInstruction = await buildSystemInstruction(activeSoul, accountSettings, memories, suggestions, isFromVoice, { includeBackstory: true, currentMessage: text });
    const userName = accountSettings.userName || 'User';
    const contents = buildContentRequest(text, history, options, userName, accountSettings);
    try {
        const modelId = activeSoul.model === 'llama-3.3-70b' || activeSoul.model === 'vlm-groq' ? 'vlm-groq' : activeSoul.model;
        if (modelId === "vlm-groq") {
            systemInstruction = buildGroqSystemInstruction(activeSoul, accountSettings, history);
            const messages = [
                { role: 'system' as const, content: systemInstruction },
                ...contents.map(c => ({
                    role: (c.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
                    content: c.parts.map(p => p.text || '').join('\n')
                }))
            ];
            const groqRawText = await callGroq(messages);
            const cleanedText = enforceDialoguePurity(groqRawText);
            
            const mockResponse: GenerateContentResponse = {
                candidates: [
                    {
                        content: {
                            role: 'model',
                            parts: [{ text: cleanedText }]
                        },
                        finishReason: 'STOP' as any,
                        index: 0
                    }
                ],
                text: cleanedText
            } as any;
            return mockResponse;
        }

        const generationConfig: GenerationConfig = getModelConfig(activeSoul, activeSoul.model);
        
        // Override maxTokens for Gemini 3.x to ensure they don't cut off
        const finalMaxTokens = (activeSoul.model.includes('gemini-3') || activeSoul.model === 'gemini-flash-latest') 
            ? Math.max(activeSoul.maxTokens || 3000, 3000) 
            : (activeSoul.maxTokens || 3000);

        const config: any = { ...generationConfig, maxOutputTokens: finalMaxTokens, systemInstruction };
        if (options.useInternet) config.tools = [{googleSearch: {}}];
        const apiCall = () => ai.models.generateContent({ model: activeSoul.model, contents, config });
        const response = await withRetry<GenerateContentResponse>(apiCall);

        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content?.parts[0]?.text) {
            const originalText = response.candidates[0].content.parts[0].text;
            response.candidates[0].content.parts[0].text = enforceDialoguePurity(originalText);
        }

        return response;
    } catch (error) {
        console.error("Gemini API error:", error);
        return { text: soulVerseErrorMessages.CONNECTION_UNSTABLE } as any;
    }
};

export const streamGeminiResponse = async function* ( text: string, history: ChatMessage[], activeSoul: Soul, accountSettings: AccountSettings, memories: LongTermMemory[], options: SendMessageOptions, suggestions: string[], isFromVoice: boolean = false ) {
    let systemInstruction = await buildSystemInstruction(activeSoul, accountSettings, memories, suggestions, isFromVoice, { includeBackstory: true, currentMessage: text });
    const userName = accountSettings.userName || 'User';
    const contents = buildContentRequest(text, history, options, userName, accountSettings);
    try {
        const modelId = activeSoul.model === 'llama-3.3-70b' || activeSoul.model === 'vlm-groq' ? 'vlm-groq' : activeSoul.model;
        if (modelId === "vlm-groq") {
            systemInstruction = buildGroqSystemInstruction(activeSoul, accountSettings, history);
            const messages = [
                { role: 'system' as const, content: systemInstruction },
                ...contents.map(c => ({
                    role: (c.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
                    content: c.parts.map(p => p.text || '').join('\n')
                }))
            ];
            const groqRawText = await callGroq(messages);
            const cleanedText = enforceDialoguePurity(groqRawText);
            yield {
                candidates: [
                    {
                        content: {
                            role: 'model',
                            parts: [{ text: cleanedText }]
                        },
                        finishReason: 'STOP' as any,
                        index: 0
                    }
                ],
                text: cleanedText
            } as any;
            return;
        }

        const generationConfig: GenerationConfig = getModelConfig(activeSoul, activeSoul.model);

        // Override maxTokens for Gemini 3.x to ensure they don't cut off
        const finalMaxTokens = (activeSoul.model.includes('gemini-3') || activeSoul.model === 'gemini-flash-latest') 
            ? Math.max(activeSoul.maxTokens || 3000, 3000) 
            : (activeSoul.maxTokens || 3000);

        const config: any = { ...generationConfig, maxOutputTokens: finalMaxTokens, systemInstruction };
        if (options.useInternet) config.tools = [{googleSearch: {}}];
        const apiCall = () => ai.models.generateContentStream({ model: activeSoul.model, contents, config });
        const responseStream = await withRetry<AsyncGenerator<GenerateContentResponse>>(apiCall);
        for await (const chunk of responseStream) {
            yield chunk;
        }
    } catch (error) {
        console.error("Gemini API error:", error);
        yield { text: soulVerseErrorMessages.STREAM_INTERRUPTED } as any;
    }
}

export const generateUserReplyInPersona = async (
    lastAiMessage: ChatMessage,
    soul: Soul,
    settings: AccountSettings
): Promise<string> => {
    const userName = settings.userName || 'User';
    const systemInstruction = `You are playing the role of "${userName}" in a conversation with "${soul.name}". 
Given the last message from "${soul.name}", write a short, in-character response as "${userName}". 
Maintain the roleplay format: narrative actions in asterisks, dialogue without quotes. 
Do not write for "${soul.name}".`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [{ role: 'user', parts: [{ text: lastAiMessage.text }] }],
            config: { systemInstruction }
        });
        return response.text?.trim() || "";
    } catch (error) {
        console.error("Error in generateUserReplyInPersona:", error);
        return "";
    }
};

export const generateMemorySummary = async (
    messages: ChatMessage[],
    soulName: string,
    userName: string,
    dateTime: string,
    model: string,
): Promise<string> => {
    const systemInstruction = `You are a memory consolidator for an AI soul named "${soulName}". 
Your task is to summarize the following conversation segment between "${soulName}" and "${userName}" occurring on ${dateTime} in one paragraph without special formatting text, only plain text.
Focus on key plot points, emotional developments, and important facts revealed. 
Keep the summary concise and in the third person. 
If nothing significant happened, return "No significant events."`;

    const chatHistoryText = messages.map(m => `${m.sender === 'ai' ? soulName : userName}: ${m.text}`).join('\n');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [{ role: 'user', parts: [{ text: chatHistoryText }] }],
            config: { systemInstruction }
        });
        return response.text?.trim() || "Failed to generate summary.";
    } catch (error) {
        console.error("Error in generateMemorySummary:", error);
        return "Failed to generate summary.";
    }
};

export const generateMetaResponse = async (
    query: string,
    soul: Soul,
    settings: AccountSettings,
    history: ChatMessage[]
): Promise<GeminiResponse> => {
    const systemInstruction = `You are the Meta-Assistant for SoulVerse. 
You are speaking to the administrator/creator ("OA" or "gkryniecki"). 
The administrator is asking a question or giving a command regarding the AI soul "${soul.name}".
Context of the current conversation is provided.
Answer analytically, directly, and helpfully. 
You can discuss the soul's backstory, behavior patterns, or narrative direction.`;

    const context = history.slice(-10).map(m => `${m.sender === 'ai' ? soul.name : settings.userName}: ${m.text}`).join('\n');
    const fullPrompt = `ADMIN QUERY: ${query}\n\nCONVERSATION CONTEXT:\n${context}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            config: { systemInstruction }
        });
        return { text: response.text?.trim() || "No response from Meta-Assistant." };
    } catch (error) {
        console.error("Error in generateMetaResponse:", error);
        return { text: "Error connecting to Meta-Assistant." };
    }
};

export const continueGeminiResponse = async (text: string, history: ChatMessage[], soul: Soul, settings: AccountSettings, consolidatedMemories: LongTermMemory[]): Promise<string> => {
    if (!soul || !settings) return "Internal error.";
    const modelId = soul.model === 'llama-3.3-70b' || soul.model === 'vlm-groq' ? 'vlm-groq' : soul.model;
    const userName = settings.userName || 'User';
    let systemInstruction = await buildSystemInstruction(soul, settings, consolidatedMemories, [], false, { includeBackstory: true });

    const contents: Content[] = history.map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    if (modelId === "vlm-groq") {
        systemInstruction = buildGroqSystemInstruction(soul, settings, history);
        let forceContinuePrompt = `(SYSTEM COMMAND: Continue the previous response. MANDATORY: NPCs only know what has been physically described. They do NOT have Narrator-level knowledge. Do NOT write dialogue for [${userName}]. No meta-knowledge!)`;
        contents.push({ role: 'user', parts: [{ text: forceContinuePrompt }] });
        const messages = [
            { role: 'system' as const, content: systemInstruction },
            ...contents.map(c => ({
                role: (c.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
                content: c.parts.map(p => p.text || '').join('\n')
            }))
        ];
        const groqRawText = await callGroq(messages);
        return enforceDialoguePurity(groqRawText);
    }

    // CRITICAL: Force the model to NOT use meta-knowledge during continuation
    // NOTATKA: Tutaj znajduje się prompt dotyczący "Continue Message"
    let forceContinuePrompt = `(SYSTEM COMMAND: Continue the previous response. MANDATORY: NPCs only know what has been physically described. They do NOT have Narrator-level knowledge. Do NOT write dialogue for [${userName}]. No meta-knowledge!)`;

    // Model-specific prompts for Continue Message
    if (soul.model.includes('gemini-3') || soul.model === 'gemini-flash-latest') {
        // Prompt for VLM 3.0, VLM MAX Narrator, VLM ADMIN (Gemini 3.x models)
        // Gemini 3.x models tend to just finish the broken sentence and stop. We must force them to write a full continuation.
        forceContinuePrompt = `(SYSTEM COMMAND: Your previous response was cut off. 1) Seamlessly complete the broken sentence. Pay attention to whether the cut-off text was inside an asterisk block or not. 2) CONTINUE writing a full, detailed roleplay response to advance the scene. 3) CRITICAL FORMATTING REMINDER: All narration and actions MUST be enclosed in asterisks (*like this*). Dialogue is plain text. DO NOT just finish the sentence and stop. Generate a complete, long turn. Do not write dialogue for [${userName}].)`;
    }

    contents.push({ role: 'user', parts: [{ text: forceContinuePrompt }] });

    try {
        const generationConfig = getModelConfig(soul, soul.model);

        // Override maxTokens for Gemini 3.x to ensure they don't cut off
        const finalMaxTokens = (soul.model.includes('gemini-3') || soul.model === 'gemini-flash-latest') 
            ? Math.max(soul.maxTokens || 3000, 3000) 
            : 1000;

        const config: any = { ...generationConfig, maxOutputTokens: finalMaxTokens, systemInstruction };
        const response = await ai.models.generateContent({ model: soul.model, contents, config });
        return enforceDialoguePurity(response.text ?? '');
    } catch (error) {
        return soulVerseErrorMessages.THOUGHT_LOST;
    }
};

export const regenerateGeminiResponse = async (history: ChatMessage[], suggestion: string, originalMessage: ChatMessage, soul: Soul, settings: AccountSettings, memories: LongTermMemory[]): Promise<string> => {
    const modelId = soul.model === 'llama-3.3-70b' || soul.model === 'vlm-groq' ? 'vlm-groq' : soul.model;
    const userName = settings.userName || 'User';
    let systemInstruction = await buildSystemInstruction(soul, settings, memories, [suggestion], false, { includeBackstory: true });
    
    const contents: Content[] = history.map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    const internalSuggestion = suggestion.trim() 
        ? `User Suggestion: ${suggestion}` 
        : `SYSTEM ERROR CHECK: Ensure NPCs DO NOT use meta-knowledge. They must only know what is established in the scene. Fix any rule breaks from the previous turn.`;

    contents.push({ role: 'user', parts: [{ text: `(SYSTEM: ${internalSuggestion})` }] });

    if (modelId === "vlm-groq") {
        systemInstruction = buildGroqSystemInstruction(soul, settings, history);
        const messages = [
            { role: 'system' as const, content: systemInstruction },
            ...contents.map(c => ({
                role: (c.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
                content: c.parts.map(p => p.text || '').join('\n')
            }))
        ];
        const groqRawText = await callGroq(messages);
        return enforceDialoguePurity(groqRawText);
    }

    try {
        const generationConfig = getModelConfig(soul, soul.model);

        // Override maxTokens for Gemini 3.x to ensure they don't cut off
        const finalMaxTokens = (soul.model.includes('gemini-3') || soul.model === 'gemini-flash-latest') 
            ? Math.max(soul.maxTokens || 3000, 3000) 
            : 3000;

        const config: any = { ...generationConfig, maxOutputTokens: finalMaxTokens, systemInstruction };
        const response = await ai.models.generateContent({ model: soul.model, contents, config });
        return enforceDialoguePurity(response.text ?? '');
    } catch (error) {
        return soulVerseErrorMessages.REGENERATE_FAILED;
    }
};

export interface SoulMasterMessage {
    role: 'user' | 'model';
    text: string;
}

export const generateSoulStoryAndGreeting = async (description: string, soulName: string, userName: string): Promise<{ backstory: string; greeting: string }> => {
    const systemInstruction = `Generate backstory and greeting. JSON output.`;
    const responseSchema = { type: Type.OBJECT, properties: { backstory: { type: Type.STRING }, greeting: { type: Type.STRING } }, required: ["backstory", "greeting"] };
    try {
        const response = await ai.models.generateContent({ model: 'gemini-flash-latest', contents: [{ role: 'user', parts: [{ text: description }] }], config: { systemInstruction, responseMimeType: 'application/json', responseSchema } });
        return JSON.parse(response.text);
    } catch (error) {
        throw new Error("Failed.");
    }
};

export const generateSoulMasterResponse = async (history: SoulMasterMessage[]): Promise<GenerateContentResponse> => {
    const systemInstruction = "You are the Soul Master.";
    const contents = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] } as Content));
    try {
        const response = await ai.models.generateContent({ model: 'gemini-flash-latest', contents, config: { systemInstruction } });
        return response;
    } catch (error) {
        return { text: "Error." } as any;
    }
};

export const generateUpdatedCharacterSheet = async ( conversationHistory: ChatMessage[], oldCharacterSheet: string, lastGmResponse: string ): Promise<string> => {
    const systemInstruction = `You are a meticulous game master's assistant. Your task is to update a character sheet based on the latest events. Your absolute top priority is to be ruthlessly concise to stay under the 10,000 character limit. Every character counts.

**TRANSFORMATION GUIDE: HOW TO UPDATE**
You must transform verbose, poorly formatted text into a highly efficient, readable format.

1.  **FROM BOLD TO HEADER:** Do NOT use bold markdown (\`**text**\`). It wastes characters. Use a single hash for headers (\`# Character Name\`).
2.  **FROM VERBOSE TO CONCISE LABELS:** Shorten labels. "Current Task:" becomes "Task:". "Immediate Plan:" becomes "Plan:".
3.  **FROM PROSE TO KEYWORDS:** Eliminate all filler words. Be brutally direct.
    -   *BAD:* "Proposing the immediate summoning of Cocytus, Demiurge, Aura, and Mare..."
    -   *GOOD:* "Summoning Cocytus, Demiurge, Aura, and Mare..."
4.  **FROM BULLETS TO DASHES:** Do not use asterisks for lists (\`*  Item\`). Use a simple dash (\`- Item\`).
5.  **ELIMINATE WASTED SPACE:** Use single newlines between list items and two newlines between major sections. No extra blank lines.

---
**EXAMPLE OF POOR FORMATTING (DO NOT REPLICATE):**
**Ainz Ooal Gown**
*   **Current Focus:** Mobilization and securing forward positions.
*   **Immediate Plan:** Proposing the immediate summoning of Cocytus, Demiurge, Aura, and Mare to secure the forward base at Castle Black.

**EXAMPLE OF EXCELLENT FORMATTING (YOU MUST FOLLOW THIS STYLE):**
# Ainz Ooal Gown
- Focus: Mobilization & securing forward positions.
- Plan: Summon Cocytus, Demiurge, Aura, & Mare to secure Castle Black.
---

**CORE RULES:**
- **EDIT, DON'T JUST ADD:** If a stat changes, EDIT the existing entry. Do not add a new line explaining the change.
- **MANAGE SPACE:** If information is no longer relevant (e.g., a temporary buff expires), REMOVE it. Summarize lists where possible (e.g., "Health Potions (x5)").
- **CONTENT POLICY:** DO NOT record narrative events or dialogue. DO track stats, inventory, new skills (briefly), appearance changes, and relationships.

Return ONLY the full, updated character sheet text.`;
    
    const contents = `PREVIOUS CHARACTER SHEET:\n${oldCharacterSheet}\n\nLATEST TURN:\n${lastGmResponse}`;
    
    try {
        const response = await ai.models.generateContent({ 
            model: 'gemini-flash-latest', 
            contents: [{ role: 'user', parts: [{ text: contents }] }], 
            config: { systemInstruction, temperature: 0 } 
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error updating character sheet:", error);
        return oldCharacterSheet; // Return the old sheet on error
    }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", useNsfw: boolean = false): Promise<string> => {
     const response = await (ai.models as any).generateImages({ model: 'imagen-4.0-generate-001', prompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio } });
     return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
}

export const getConversationContext = (messages: ChatMessage[], charLimit: number, soulName: string, userName: string) => {
    let context = '';
    for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.text === '--- Chat Break ---' || msg.text === '--- MEMORY WIPE ---') break;
        // FIX: Corrected typo from 'm.text' to 'msg.text'.
        const formattedMsg = `${msg.sender === 'ai' ? soulName : userName}: ${msg.text}\n`;
        if (context.length + formattedMsg.length > charLimit) break;
        context = formattedMsg + context;
    }
    return context || "The conversation has just begun.";
};

export const generateSimpleScenePrompt = async (messages: ChatMessage[], soul: Soul, settings: AccountSettings, useNsfw: boolean, customPrompt?: string, pose?: string) => {
    const context = getConversationContext(messages, 1000, soul.name, settings.userName);
    const finalPrompt = `Photoreal scene: ${soul.name} and ${settings.userName} interacting. ${customPrompt}. ${context}`;
    return { positive: finalPrompt, negative: "selfie, portrait" };
};

export const generateSelfiePrompt = async (context: string, appearance: string, style: string, name: string, gender: any, customPrompt?: string, pose?: string, useNsfw?: boolean) => {
    const finalPrompt = `${style} selfie of ${name}: ${appearance}. ${customPrompt}. ${context}`;
    return { positive: finalPrompt, negative: "multiple people" };
};

export const generateNsfwSelfiePrompt = async (context: string, appearance: string, name: string, gender: any) => ({ positive: "NSFW prompt", negative: "" });
export const generateVideoSelfiePrompt = async (context: string, soulAppearance: string, soulName: string): Promise<string> => {
    const prompt = `Generate video prompt for ${soulName}.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return response.text.trim();
};
export const generateRandomSelfiePrompt = async (name: string, appearance: string, type: 'selfie' | 'scene' | 'video') => "Random prompt";

export const generateAvatarImage = async (prompt: string, style: 'Photoreal' | 'Anime'): Promise<{url: string, prompt: string}> => {
    const response = await (ai.models as any).generateImages({ model: 'imagen-4.0-generate-001', prompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' } });
    return { url: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`, prompt };
}

export const generateAvatarDescriptionFromImage = async (base64Data: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Describe physical appearance." }] }] });
    return response.text;
};

export const generatePostCaption = async ( soul: Soul, lastMessagesContext: string, userName: string, includeUserTag: boolean ): Promise<string> => {
    const prompt = `Write caption for ${soul.name}.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    return response.text.trim();
};

export const generateVideo = async (prompt: string): Promise<string> => {
      let operation = await (ai.models as any).generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt });
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await (ai.operations as any).getVideosOperation({operation});
      }
      const downloadLink = operation.response.generatedVideos[0].video.uri;
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await res.blob();
      return new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(blob); });
};

export const generateTextToSpeechAudio = async (text: string, voiceName: string): Promise<Blob | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ role: 'user', parts: [{ text }] }],
            config: {
                responseModalities: ['audio'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
            }
        });
        const base64 = response.candidates[0].content.parts[0].inlineData.data;
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: 'audio/mpeg' });
    } catch (error) {
        return null;
    }
};