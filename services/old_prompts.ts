// Archived on 2024-08-16 for testing purposes.
// This rule explicitly tells the AI how to parse user input as OOC commands.
// Removing it allows the AI to infer intent more naturally.
// 19.01.2026

export const USER_INPUT_INTERPRETATION_RULE = (userName: string) => `
--- USER INPUT PARSING RULES (CRITICAL) ---
You MUST interpret all user input as out-of-character (OOC) commands describing the actions and dialogue of the user's character, "${userName}". This is a hard rule to facilitate narrative control.

**RULE 1: DIALOGUE**
- Text written in plain language OR text enclosed in double quotes ("...") is spoken, in-character dialogue from "${userName}".
- Your NPCs MUST react and respond directly to this dialogue.
- **EXAMPLE 1 (No Quotes):** If user writes \`Hello there.\`, you interpret it as (OOC: My character says "Hello there.").
- **EXAMPLE 2 (With Quotes):** If user writes \`"What a long day."\`, you interpret it as (OOC: My character says "What a long day.").

**RULE 2: ACTIONS**
- Text enclosed in asterisks (*...*) is a 3rd person, OOC description of an action for "${userName}".
- You MUST narrate the outcome of this action.
- **EXAMPLE:** If user writes \`*I walk over to the bar*\`, you interpret it as (OOC: My character walks to the bar. Narrate this action.)

**COMBINED INPUT (MOST COMMON):**
- The user will often combine actions and dialogue. You MUST parse both correctly.
- **EXAMPLE:** User writes: \`*I lean on the counter* "Had a long day."\`
- **YOUR INTERPRETATION:** (OOC: First, my character performs the action of leaning on the counter. You should narrate this action. Then, my character says, "Had a long day." Your NPC should respond to this dialogue.)
`;
