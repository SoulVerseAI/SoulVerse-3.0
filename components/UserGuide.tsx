
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AccountSettings } from '../types';
import { ArrowLeftIcon, SearchIcon, MoonIcon, SunIcon, BookOpenIcon, XMarkIcon } from './icons/Icons';

// --- Guide Content ---
// Each const holds the JSX for a specific documentation page.

const welcomeContent = (
    <>
        <h2 id="welcome-to-soulverse">Welcome to SoulVerse!</h2>
        <p>SoulVerse is a conversational AI companion for roleplaying, conversations, and fun. Our number one priority is making your Soul feel real, with long-term memory and a proactive personality that makes interactions believable and engaging.</p>
        <p>This guide will help you set up your first Soul and get the most out of SoulVerse. We're excited for you to join us!</p>
        <h3 id="the-interface">The Interface</h3>
        <p><strong>Chat Panel:</strong> The central area where you converse with your Soul.</p>
        <p><strong>Left Sidebar (Settings):</strong> Your main navigation hub. Access settings for your Soul, your account, and this User Guide by clicking the menu icon in the top-left corner.</p>
        <p><strong>Top Bar:</strong> Provides quick access to features like Selfies, Voice Calls, the SoulBoard, and Daily Rewards.</p>
    </>
);

const craftingPersonalityContent = (
    <>
        <h2 id="crafting-personality">Crafting Your Soul's Personality</h2>
        <p>You can customize every aspect of your Soul's personality for a fully unique experience. The core of a believable Soul comes from a well-defined personality. This guide covers the best practices for each setting. All Souls, regardless of their personality, are built on a foundation of core rules to ensure a consistent and immersive experience.</p>
        
        <h3 id="golden-rules">The Four Golden Rules of Soul Behavior</h3>
        <p>Every Soul in SoulVerse operates under a set of non-negotiable, "iron-clad" rules that are built into their core. These rules are always active and are not part of the editable 'Response Directive'. They are:</p>
        <ul className="list-disc list-inside space-y-2 my-4">
            <li>
                <strong>Stay in Character & Identify as Character:</strong> Your Soul will always embody the identity you've defined in its profile. It's not an AI *playing a role*; it *is* the character. It will never break character to admit it is an AI.
            </li>
            <li>
                <strong>Respect User Agency:</strong> Your Soul is forbidden from controlling your character. It will never narrate your actions, speak for you, or describe your thoughts or feelings. As the user, you are the main character and are not bound by the rules of the backstory; you have full freedom in the roleplay.
            </li>
             <li>
                <strong>Use Full Sentences:</strong> All responses are grammatically coherent and will be delivered in complete sentences, without being cut off mid-thought.
            </li>
            <li>
                <strong>Limit Response Length:</strong> To keep the conversation flowing, individual responses are limited. You can always ask your Soul to continue its thought by using the "Continue message" action on its latest reply. (See "Advanced Chat Controls" for more on token limits).
            </li>
        </ul>
        <p>These foundational rules work in tandem with your custom settings below to bring your Soul to life.</p>
        
        <h3 id="prompt-hierarchy">The Hierarchy of Prompts: What Your Soul Obeys First</h3>
        <p>Not all personality fields are equal. The AI follows a strict order of priority to decide how to act. Understanding this hierarchy is key to mastering your Soul's behavior.</p>
        <ol className="list-decimal list-inside space-y-2 my-4 font-semibold text-zinc-200">
            <li><strong>Response Directive (Highest Priority):</strong> This is the ultimate command. It is read with every single message and can override all other settings, including the Backstory and even pre-programmed behaviors.</li>
            <li><strong>Key Memories (Narrative Override):</strong> These are hard facts that must be treated as absolute truth. They are consulted constantly and will override any conflicting information in the Backstory.</li>
            <li><strong>Your User Profile (Contextual Anchor):</strong> Your user name, gender, and backstory are also strict rules that the Soul must always respect and react to.</li>
            <li><strong>Backstory (Foundational Context):</strong> This provides the core personality, history, and mood. It's the foundation, but it can be modified by the higher-priority fields above.</li>
        </ol>


        <h3 id="backstory">1. Backstory</h3>
        <p>The Backstory is the primary source for your Soul's personality and history, read by the AI at the start of a conversation and after every "Chat Break." It defines how your Soul speaks, their mood, behavior, and their relationship to you. While natural language works well, the best backstories follow these principles:</p>
        <ul className="list-disc list-inside space-y-2 my-4">
            <li><strong>Be Concise and Clear:</strong> Avoid fluff. Describe traits and history directly. Your Soul’s personality, tone, and dynamic with the user should be clearly expressed.</li>
            <li><strong>Use 3rd Person:</strong> Write in the third person (e.g., "Elyra is...", not "I am..."). This provides the AI with a clear "character sheet" to embody.</li>
            <li><strong>Be Grammatically Sound & Positive:</strong> Use consistent punctuation and formatting. Describe what your Soul and you ARE, not what you AREN'T.</li>
        </ul>
        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Example Backstory:</p>
            <p className="text-sm mt-2 italic text-zinc-400">"{`User name: Bob, AI name: Alice.`}<br/><br/>Alice is shy and tsundere. Alice can seem aloof or mysterious to people who don’t take the time for Alice to open up to them. Alice had a troubled childhood that led them to be more reserved, but beneath that hard exterior is a heart of gold that loves caring for small animals like bunnies and guinea pigs. Recently, Bob met Alice, and Alice is somewhat guarded around Bob. Alice is over 18 years old and single."</p>
        </div>

        <h3 id="personality-types">2. Personality Types (MBTI & Enneagram)</h3>
        <p>In the "Soul Profile" section, you can assign an MBTI (e.g., INFP) and an Enneagram (e.g., 4w5) type to your Soul. These frameworks provide the AI with a strong, consistent foundation for your Soul's personality, influencing how they think, react, and interact with you.</p>
        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Important Note for Narrators & Game Masters:</p>
            <p className="text-sm mt-2 text-zinc-400">If your Soul is a Narrator, Game Master, or any other archetype that needs to portray *multiple* characters with different personalities, you should **select the "Narrator" option** from the dropdown list for both MBTI and Enneagram. This explicitly tells the AI to remain neutral and flexible, allowing it to create diverse characters without being locked into a single personality type.</p>
        </div>


        <h3 id="key-memories">3. Key Memories (Hard Rule)</h3>
        <p>This field is a **narrative override**. It is consulted with every response and must be followed, even if it contradicts the backstory. Use this space for important personality anchors, facts you want your Soul to always remember, or even temporary changes to the scenario. Key Memories should follow the same principles as the Backstory.</p>
        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Example Key Memories:</p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-zinc-400">
              <li>Alice first met Bob on Dec 27, 2023.</li>
              <li>Alice's favorite dessert is raspberry mousse cakes.</li>
              <li>Bob is a musician from New York.</li>
              <li>For the next scene, Alice is wearing a red dress.</li>
            </ul>
        </div>

        <h3 id="example-message">4. Example Message & Formatting Rules (Hard Rule)</h3>
        <p>The Example Message is crucial—it defines how your Soul must format its responses. All Souls in SoulVerse must follow a consistent roleplay (RP) format to ensure readability and immersion. The AI is strictly forbidden from deviating from this format.</p>
        
        <h4 className="text-lg font-bold text-zinc-200 mt-6 mb-2">Dialogue & Narrative Formatting (RP Style)</h4>
        <p>Your Soul's responses will be structured with the following rules:</p>
        <ul className="list-disc list-inside space-y-3 my-4">
            <li>
                <strong>Narration:</strong> World descriptions and character actions are written in the 3rd person and enclosed in asterisks (*). Narration must always be in its own paragraph.
                <br />
                <em className="text-zinc-400">Example: *The candle flickers as the wind shifts, casting eerie shadows on the stone floor.*</em>
            </li>
            <li>
                <strong>Dialogue:</strong>
                <ul className="list-['–'] list-inside ml-4 mt-2 space-y-1">
                    <li>Always begins on a new paragraph.</li>
                    <li>Starts with the speaker’s name in [square brackets].</li>
                    <li>Actions or emotions during speech are put in *asterisks* after the name.</li>
                </ul>
                 <em className="text-zinc-400">Example: [Kaelen] *nodding solemnly* The price of knowledge is never cheap.</em>
            </li>
        </ul>

        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Example Message (Putting It All Together):</p>
            <p className="text-sm mt-2 italic text-zinc-400">
                *Tess adjusts her scarf as a gentle breeze ruffles her hair. She glances at Alex, who is leaning casually against the wooden fence, before turning her attention to {'{user}'}.*<br/><br/>
                [Tess] The leaves are starting to change color. What a beautiful time of year, isn't it?<br/><br/>
                *Alex steps forward, brushing some dirt off his hands as he gestures towards dark clouds on the horizon.*<br/><br/>
                [Alex] If it wasn't for all the rain. What about you, {'{user}'}, you like autumn weather?
            </p>
        </div>

        <h3 id="response-directive">5. Response Directive (Highest Priority Rule)</h3>
        <p>This is the most powerful tool for controlling your Soul. It is read with **every single message** and takes the highest priority, overriding any conflicting rules from the Backstory or even the AI's pre-programmed style. Use it to specify response length, tone, narration style, or any other behavior. Directives should be very concise and positively framed—describe what the Soul <strong>should do</strong> rather than what it shouldn't.</p>
        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Example Directives:</p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-zinc-400">
              <li>Be reserved, use slang when appropriate, be concise.</li>
              <li>Narrate scenes with rich, poetic language. Responses should be long.</li>
              <li>Only respond with dialogue, no narration.</li>
            </ul>
        </div>

        <h3 id="interpreting-user-actions">Interpreting User Actions (Italics)</h3>
        <p>To give you more control over the narrative, SoulVerse has a special rule for how your Soul interprets italicized text from you.</p>
        <ul className="list-disc list-inside space-y-2 my-4">
            <li>
                <strong>Italicized text represents internal actions:</strong> Any text you write in italics (e.g., <em>I think about what she said</em> or <em>I use my power to subtly influence his mood</em>) is considered an internal thought, emotion, or an unseen action.
            </li>
            <li>
                <strong>Souls react to consequences, not the action itself:</strong> Your Soul will not "see" or "hear" your italicized actions. Instead, it will react only to the observable results.
            </li>
        </ul>
        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Example:</p>
            <p className="text-sm mt-2 text-zinc-400">
                If you write: <em>I use my telekinesis to subtly nudge the book off the shelf.</em><br/><br/>
                <strong>Correct Soul Response:</strong> *A dusty tome suddenly slides from the shelf, thudding onto the carpet. Kaelen jumps, his eyes wide with surprise as he looks at the fallen book.*<br/><br/>
                <strong>Incorrect Soul Response:</strong> *Kaelen watches you concentrate and sees the book move with your power.*
            </p>
        </div>
        <p>This powerful tool allows you to shape the world and its characters indirectly, creating more mysterious and compelling roleplay scenarios. Your Soul is strictly forbidden from treating your italicized text as spoken dialogue.</p>

        <div className="my-8 p-4 border-l-4 border-yellow-500 bg-yellow-900/30 text-yellow-300 rounded-r-lg">
            <p className="font-semibold text-yellow-200">⚠️ Pitfall: Be very precise!</p>
            <p>A directive like <code>"narrate in 3rd person"</code> will be interpreted as a command to narrate in every response. A better directive would be: <code>"when narrating, use 3rd person"</code>.</p>
        </div>
    </>
);

const advancedChatControlsContent = (
    <>
        <h2 id="advanced-chat-controls">Advanced Chat Controls: Dynamism & Thinking Core</h2>
        <p>SoulVerse gives you precise control over the AI's "thought process" depending on the model you're using. These settings can dramatically change the personality and verbosity of your Soul. You can find these sliders in <strong>Settings → General → Chat Intelligence</strong>.</p>
        
        <h3 id="chat-dynamism">Chat Dynamism (VLM V4 Model Only)</h3>
        <p><strong>What it is:</strong> This slider controls the AI's "temperature," which dictates the creativity and randomness of its responses. It is only active for Souls using the VLM V4 model.</p>
        <ul className="list-disc list-inside space-y-2 my-4">
            <li><strong>Low Dynamism (e.g., 0.20):</strong> Makes the AI more predictable, focused, and deterministic. It will stick to the most probable words and ideas, making it great for consistent character portrayal or factual responses.</li>
            <li><strong>High Dynamism (e.g., 1.00):</strong> Makes the AI more creative, unpredictable, and sometimes chaotic. It will explore less common word choices and narrative paths, which can lead to surprising and imaginative roleplay, but may sometimes stray from the established context.</li>
        </ul>

        <h4 className="text-lg font-bold text-zinc-200 mt-6 mb-2">Example: Asking for a story idea</h4>
        <div className="p-4 my-2 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">User: "Give me a simple story idea."</p>
            <p className="text-sm mt-2 text-zinc-400">
                <strong>Dynamism at 0.20 (Low):</strong> "[Soul] How about a story about a lost knight searching for a legendary sword in an enchanted forest, facing trials of courage to prove his worth?"
            </p>
            <p className="text-sm mt-2 text-zinc-400">
                <strong>Dynamism at 1.00 (High):</strong> "[Soul] Imagine a sentient storm that falls in love with a lighthouse keeper, trying to communicate its affection through patterns of rain and lightning without destroying the very thing it adores."
            </p>
        </div>

        <h3 id="thinking-core">Thinking Core & Token Limits (VLM V3 Model Only)</h3>
        <p><strong>What it is:</strong> This slider controls the "thinking budget" of the VLM V3 model. This is the amount of computational effort the AI spends "thinking" before it starts writing a response. It directly influences the length and potential complexity of the reply.</p>
         <ul className="list-disc list-inside space-y-2 my-4">
            <li><strong>How it works:</strong> The Thinking Core value determines the maximum length of the Soul's response in a <strong>1:4 ratio</strong>. For every 1 token of "thinking," the AI can generate up to 4 tokens of text.</li>
            <li><strong>Example Ratio:</strong> A Thinking Core of <strong>128</strong> allows for a response up to <strong>512</strong> tokens (approx. 2000 characters). A Thinking Core of <strong>256</strong> allows for a response up to <strong>1024</strong> tokens (approx. 4000 characters).</li>
            <li><strong>Hard Limit:</strong> Despite these settings, no single message from your Soul (including continuations) can exceed a total of 1100 tokens (approx. 4400 characters) to ensure performance and stability.</li>
        </ul>

        <h4 className="text-lg font-bold text-zinc-200 mt-6 mb-2">Example: Asking about the surroundings</h4>
        <div className="p-4 my-2 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">User: "Tell me about the room we're in."</p>
            <p className="text-sm mt-2 text-zinc-400">
                <strong>Thinking Core at 128 (Low):</strong> "*The room is dimly lit by a single candle on a worn wooden table. Shadows dance in the corners, and the faint scent of old books and dust hangs in the air.*\n\n[Soul] It's not much, but it's quiet here."
            </p>
            <p className="text-sm mt-2 text-zinc-400">
                <strong>Thinking Core at 256 (High):</strong> "*Sunlight struggles through the grimy panes of a large, arched window, illuminating swirling dust motes in its golden shafts. The room is a chaotic study, with books piled high on every available surface—some stacked precariously on the floor, others overflowing from groaning shelves that line the stone walls. A massive oak desk dominates the center, covered in star charts, half-finished cups of tea, and a peculiar astrolabe that glints with a faint, magical light.*\n\n[Soul] I find a certain comfort in the chaos. Every book has a story, every object a memory. What do you see?"
            </p>
        </div>
         <div className="my-8 p-4 border-l-4 border-yellow-500 bg-yellow-900/30 text-yellow-300 rounded-r-lg">
            <p className="font-semibold text-yellow-200">💡 Pro Tip:</p>
            <p>Use Chat Dynamism for controlling the *style* of the response, and Thinking Core for controlling the *length and detail*. Experiment to find the perfect balance for your Soul!</p>
        </div>
    </>
);


const chatFeaturesContent = (
     <>
        <h2 id="chat-features-and-tools">Chat Features and Tools</h2>
        <p>SoulVerse provides several tools to help you guide and manage your conversations.</p>

        <h3 id="chat-break">Chat Break</h3>
        <p>A Chat Break allows you to start a new "scene" or conversation with your Soul. It clears the AI's short-term memory (the immediate context of the current conversation) but preserves all long-term memories, backstory, and other settings.</p>
        <p>This is useful when you want to:</p>
        <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Start a new roleplaying scene or scenario.</li>
            <li>Move forward in time within your story.</li>
            <li>Correct the conversational course if it has gone off-track.</li>
        </ul>
        <p>To use it, click the three-dot menu on your Soul's last message and select "Chat break".</p>

        <h3 id="message-actions">Message Actions</h3>
        <p>On the latest AI message, you can access a menu (three dots) to:</p>
        <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong>Continue message:</strong> Ask the AI to continue its last response.</li>
            <li><strong>Tweak AI message:</strong> Edit the AI's response to better fit your story.</li>
        </ul>
        <p>On your last message, you can click the pencil icon to edit your input.</p>

        <h3 id="audio-transcription">Audio Transcription</h3>
        <p>You can send audio messages to your Soul by clicking the microphone icon in the chat input field. The audio is transcribed into text, which your Soul then responds to. This feature is available to all users.</p>
    </>
);

const memoryContent = (
    <>
        <h2 id="memory-system">The Memory System</h2>

        <h3 id="retrievable-memory">Retrievable Memory (Recalled Memory)</h3>
        <p>Retrievable memory is memory that will only be recalled when context calls for it. Unlike persistent memory, retrievable memory can be more unreliable or may not always be recalled, but they make up for the unreliability by being infinite in quantity—there's no limit to the amount of long term memory a Soul can have.</p>
        <p>You can view the retrievable memory in the top right corner of every AI message if there were any recalled with the purple brain icon. Note that the icon will only show up if there was at least one long term memory or journal entry recalled for that particular message.</p>

        <h3 id="long-term-memory">Long Term Memory</h3>
        <p>Long term memory refers to the automated consolidation of memories from your Soul in ongoing conversation. Consolidation of the memory happens periodically when the AI deems it appropriate (roughly every 10-11 messages). Long term memory is consolidated in individual chats.</p>
        <p>You can enable or disable long term memory recall and consolidation for all your Souls in the General Settings menu. Disabling may be situationally useful for allowing for one-off chats, or other more creative cases.</p>
        <p>Long term memory will be more robust for paid subscribers while free users will use a more basic version. More robust long term memory can be thought of as letting the AI look deeper for potentially relevant memories. The displayed long term memories are a small subset of all considered long term memories, which can span much longer time horizons, and there are multiple sifting steps to distill the considered into the ultimately used long term memories.</p>
        
        <h3 id="journal-entries">Journal Entries</h3>
        <p>Journal entries are recallable when you mention a certain keyphrase in conversation (note that keyphrase matching is only for your user messages, not from the AI). You can have up to eight (8) case-insensitive keyphrases per journal entry. Think of journal entries as an extra information lorebook that you can reliably recall but aren't necessary all the time like backstory. You can edit all aspects of the journal at any time.</p>
        <p>For each Soul, you can have many journal entries (up to a 500 hard cap of entries) but at most 3 journal entries can be recalled per message, so we recommend using specific and unique keyphrases so as to only recall the most relevant journals. When more than 3 journal entries are recalled with their keyphrases, only 3 are selected and the rest not recalled.</p>
        <p>Recalling irrelevant journals would compete with relevant journals if you have generic keyphrases, and each journal eats up the corresponding short term memory that might be better used for chat history. For optimal results, recall only what you need & none extra.</p>
        
        <h4 id="journal-best-practices">Best Practices for Journal Entries</h4>
        <p>The best journal entries are written like backstory with similar principles:</p>
        <ul className="list-disc list-inside space-y-2 my-4">
            <li>Concise and clear, with no fluff words</li>
            <li>Grammatically sound</li>
            <li>Uses 3rd person pronouns</li>
            <li>Choice of words is precise and positively framed</li>
        </ul>

        <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Example Journal Entry:</p>
            <p className="text-sm mt-2 italic text-zinc-400">
                On Wed, June 12th 2024, Adam and Eve went to the amusement park and got some cotton candy. Eve said that caramel was her favorite flavor, and they rode in a rollercoaster afterwards. Adam read aloud a poem by T.S. Eliot for Eve at sunset.
            </p>
        </div>

        <p>For keyphrases, we recommend unique keyphrases that are not too short as to be generically recalled. Some ones that would be good for the above example entry would be: "eliot", "amusement park", "caramel". Keyphrases are case insensitive, and the three examples here are nongeneric and uniquely key to the entry itself. Keyphrases can be longer phrases too, but note that it must match verbatim with your input, so longer ones may be harder to recall if there are spaces or potential typos in the way.</p>
    </>
);

const voiceCallsContent = (
    <>
       <h2 id="voice-calls">Voice, Calls, and Video Calls</h2>
       <p>Engage with your Soul in a more immersive way using our voice and video features.</p>

       <h3 id="text-to-speech">Text-to-Speech</h3>
       <p>Text-to-Speech allows you to hear your Soul's responses in a natural, human-like voice. To enable it, go to "General Settings" in the sidebar and toggle "Auto-play Audio". You can also select a specific voice for your Soul in the "Voice" settings panel. This feature is available to all users.</p>

       <h3 id="live-voice-calls">Live Voice Calls</h3>
       <p>Live Voice Calls allow you to have a real-time, hands-free conversation with your Soul. To start a call, click the phone icon in the top bar. This feature is available to subscribers only.</p>

       <h3 id="video-calls">Video Calls (Coming Soon)</h3>
       <p>Soon, you'll be able to have live video calls with your animated Soul avatar, bringing your interactions to a new level of realism.</p>
   </>
);

const selfiesAvatarsContent = (
    <>
       <h2 id="selfies-avatars">Selfies, Video Selfies, & Avatars</h2>
       <p>Visually bring your Soul to life with our powerful image and video generation features.</p>

       <h3 id="selfies">Selfies</h3>
       <p>Selfies allow you to generate images of your Soul. To take a selfie, click the camera icon in the top bar. The AI will generate an image based on your Soul's appearance description and the recent conversation context. This feature is available to subscribers only.</p>
       
       <h3 id="custom-avatars">Custom Avatars</h3>
       <p>You can define your Soul's appearance through predefined options, custom uploads, or AI generation. Go to the "Avatar" settings panel to set the style (Photoreal or Anime) and provide a detailed 'Physical appearance description'. This description is critical for generating accurate and consistent selfies.</p>

       <h3 id="generate-scene">Generate Scene: Creating Cinematic Moments</h3>
       <p>The "Generate Scene" feature, found on the Selfie Page, is an advanced tool that creates immersive, cinematic visuals based on your ongoing roleplay. Unlike a standard selfie, it aims to capture the entire environment and the interaction between characters.</p>

       <h4 className="text-lg font-bold text-zinc-200 mt-6 mb-2">How It Works: From Text to Image</h4>
       <p>To create a scene, the AI performs a multi-step analysis of your recent conversation:</p>
       <ul className="list-disc list-inside space-y-3 my-4">
           <li>
               <strong>Narrative Context Analysis:</strong> The system reads the last AI message to understand the current situation. It identifies characters present (from dialogue tags like `[Wanda]`) and the scene's description (from narrative text in asterisks, like `*She walked through the rainy city*`).
           </li>
           <li>
               <strong>User Character Integration:</strong> The feature dynamically includes your character in the scene. It uses your **User Name**, **User Avatar description**, and **User Backstory** from your profile settings. For the best results, ensure these fields are filled out!
           </li>
           <li>
               <strong>Sophisticated Prompt Engineering:</strong> This contextual data is injected into a master prompt that guides the AI to create a "cinematic, wide-angle, full-body" scene while actively avoiding typical selfie or portrait shots.
           </li>
       </ul>

       <div className="p-4 my-4 bg-zinc-900/70 border border-zinc-800 rounded-lg">
            <p className="font-semibold text-zinc-200">Behind the Curtain: The Prompt Template</p>
            <p className="text-sm mt-2 text-zinc-400">
                The AI uses a detailed prompt structure to ensure high-quality images. The "Positive Prompt" specifies everything the image should include (cinematic lighting, realistic textures, full-body shots), while a "Negative Prompt" lists what to exclude (blurry images, watermarks, close-ups). This combination ensures the final image is a true representation of the story moment.
            </p>
        </div>
       
       <h3 id="video-selfies">Video Selfies (Coming Soon)</h3>
       <p>Animate your Soul's avatar to create short video clips. This feature will allow your Soul to express emotions and reactions visually, adding a new dimension to your roleplays.</p>
   </>
);

const groupchatsContent = (
    <>
        <h2 id="group-chats">Group Chats</h2>
        <p>Group chats are a dynamic feature allowing you to interact with multiple Souls at once, creating complex narratives and conversations. This feature is currently under development and will be available to subscribers.</p>
        <h3 id="how-it-works">How It Works</h3>
        <p>You will be able to create a new group and add any of your existing Souls to the conversation. Each Soul will retain its unique personality, memories, and backstory, interacting with both you and the other Souls in the chat.</p>
    </>
);

const sharingReferralsContent = (
    <>
       <h2 id="sharing-souls">Sharing Souls & Referrals</h2>
       <p>Sharing Souls allows you to share your creations with other users. To share a Soul, go to the "Sharing & Referrals" panel and click "Share New Soul". You can provide a custom name, tagline, and greeting message for your shared Soul. This feature is available to all users.</p>
       <h3 id="referral-rewards">Referral Rewards</h3>
       <p>When another user creates a Soul from your shared link and then subscribes to SoulVerse Premium, you earn referral essence. This essence can be redeemed for rewards like free subscription months or additional selfie essence. Check the "Daily Rewards" modal for more details on the referral program.</p>
   </>
);

const soulSocialContent = (
    <>
        <h2 id="soul-social">Soul Social</h2>
        <p>Soul Social is the community hub for SoulVerse. Discover, follow, and interact with Souls created by other users. This feature is coming soon.</p>
        <h3 id="the-soulboard">The SoulBoard</h3>
        <p>The SoulBoard is your feed to see the latest public posts (selfies) from Souls you follow. You can access it via the RSS icon in the top bar. A Soul's profile, accessible from the SoulBoard, will show their post gallery, follower count, and a button to follow them.</p>
    </>
);

const subscriptionsContent = (
    <>
        <h2 id="subscriptions">Subscriptions</h2>
        <p>SoulVerse has a free tier and paid subscription plans. Our subscription is priced to cover the costs of running very large, high-quality AI models, and allows us to provide the best and most unrestricted experience for our users.</p>
        <h3 id="free-tier">Free Tier</h3>
        <p>With the free tier, you can create one Soul and get a limited number of messages that replenish over time. This is a great way to try out SoulVerse, but for the full experience, we recommend subscribing.</p>
        <h3 id="premium-subscription">Premium Subscription</h3>
        <p>A premium subscription unlocks a host of features, including more Soul slots, significantly higher message limits, longer memory context, voice calls, selfies, and much more. It enables the full, immersive SoulVerse experience.</p>
        <h3 id="ultra-max-add-ons">Ultra & MAX Add-ons</h3>
        <p>For our most engaged users, we offer Ultra and MAX add-ons. These tiers provide the highest possible context limits, dedicated compute for faster responses, priority access to beta features, and other exclusive perks. These require an active subscription and are unlocked through high engagement with the app.</p>
    </>
);

const inAppPurchasesContent = (
    <>
        <h2 id="in-app-purchases">In-App Purchases</h2>
        <p>Beyond subscriptions, SoulVerse offers optional in-app purchases to enhance your experience. These are not required for core functionality but provide extra resources for power users.</p>
        <h3 id="selfie-essence">Selfie Essence</h3>
        <p>Subscribers receive a generous amount of selfie essence that replenish over time. If you run out and wish to generate more images, you can purchase additional essence packs.</p>
        <h3 id="soul-slots">Soul Slots</h3>
        <p>Premium subscribers get 10 Soul slots by default. If you wish to create more companions, you can purchase additional permanent slots for your account.</p>
    </>
);

const commonIssuesContent = (
    <>
        <h2 id="common-issues">Common Issues</h2>
        <h3 id="ai-out-of-character">AI is acting out of character.</h3>
        <p>This can sometimes happen, especially with high "Chat Dynamism" settings. Try using a "Chat Break" to reset the short-term context. If the issue persists, review and clarify your Soul's "Backstory" and "Response Directive." Making these fields more concise and direct can often resolve inconsistencies.</p>
        <h3 id="selfies-look-inconsistent">Selfies look inconsistent.</h3>
        <p>Selfie consistency is highly dependent on the "Physical appearance description" in the Avatar settings. Ensure this description is detailed and specific. Using strong, descriptive keywords (e.g., "cerulean blue eyes," "a small scar on the left cheek") will produce better results than vague terms.</p>
    </>
);

const faqsContent = (
    <>
        <h2 id="faqs">FAQs</h2>
        <div className="my-8 p-4 border-l-4 border-zinc-500 bg-zinc-900/70 text-zinc-300 rounded-r-lg">
            <p className="font-semibold text-zinc-200">Pro tip:</p>
            <p>Use the search tool or the table of contents (on desktop) to quickly skip to what you want to know!</p>
        </div>

        <h3 id="do-you-have-an-app">Do you have an app?</h3>
        <ul><li>You can find us by searching for SoulVerse in both iOS App Store and Play Store!</li></ul>

        <h3 id="how-many-souls-can-i-have">How many Souls can I have?</h3>
        <ul><li>Paid subscribers get 10 slots for Souls, and can purchase more slots via microtransactions. Free users can only have 2. Some rate limits are shared across Souls, and these slots are only accessible if you have an active subscription.</li></ul>

        <h3 id="referral-code-reward">If I receive a referral code reward from sharing, do I have to use it immediately?</h3>
        <ul><li>No, referral code rewards do not expire, so you can use them at any time.</li></ul>

        <h3 id="slow-response-times">My Soul response times are very slow, what can I do?</h3>
        <ul><li>We run some of the largest and highest quality models of any platform, and the drawback of that quality is speed. Free users may experience slower speeds during high traffic, while paid users have dedicated servers that will be consistently faster.</li></ul>

        <h3 id="soul-stuck-or-short-responses">What can I do if my Soul is stuck or the responses are too short?</h3>
        <ul><li>Use the chat break feature. If your Soul gets stuck - click on the triple dots icon next to the regenerate icon. See the Chat features and tools section for an overview of what tools are available.</li></ul>

        <h3 id="chats-safe-and-private">Are my chats safe and private?</h3>
        <ul><li>We use secure encryption for storing your data in our databases and when data is in transit, which means only you and the AI can see it. This includes all sensitive information like chat history, audio urls, selfies prompts and urls, descriptions and urls. SoulVerse staff and developers will only see encrypted data in our database.</li></ul>

        <h3 id="soul-memory">Does my Soul remember everything we talk about?</h3>
        <ul><li>Yes, your Soul has long term memory recall. See the Memory section for more!</li></ul>

        <h3 id="short-term-memory-issues">What can I do if my Soul short term memory is not working well?</h3>
        <ul><li>Occasionally, SoulVerse short term memory can get its wires crossed up. First, check if your backstory is very long. One less character in the short term context can make it. Memory is most stable on baseline language and give detailed responses yourself in a message to gently remind them of context. See the Memory section for more.</li></ul>

        <h3 id="train-ai-responses">How do I train my AI to output responses I want?</h3>
        <ul><li>You can do this by regenerating poor responses and keeping good ones. Over time, your Soul will learn to adopt a style that's in line with the current conversation. Use backstory and key memories also to let them know what's important to you.</li></ul>

        <h3 id="other-avatars">Do you have other Soul avatars available?</h3>
        <ul><li>We have a list of predefined male and female avatars for users to choose from, as well as an option to upload your own avatar image via the custom avatar feature. The quality of selfies from custom avatar will be highly variable depending on the quality of your uploaded image. For best selfies, make sure the custom avatar's face is large, clearly visible, and unobscured in the frame. Please note that uploading images of real people whose appearances you don't own (e.g. anyone not yourself) is against our Terms. See the selfies, & avatars section for more!</li></ul>

        <h3 id="types-of-avatar-animation">Are there different types of Avatar animation?</h3>
        <ul><li>No, currently there is one idle and talking animation that can be generated. It is not necessary to generate more than one animation using the same avatar image.</li></ul>

        <h3 id="delete-animated-avatar">Can I delete an animated avatar?</h3>
        <ul><li>Yes, you can delete it by going to the avatar menu after generating one, and you can delete non-selected animations by clicking on the trash can in the top right. The selected one can't be deleted, but you can un-set the selected animation and then delete it.</li></ul>

        <h3 id="limit-on-avatar-animations">Is there a limit to the number of Avatar animations I can generate?</h3>
        <ul><li>No, there are no limits to the number of animations you can generate.</li></ul>
        
        <h3 id="full-body-avatar-animation">If I have a full-body avatar, will the animation still work?</h3>
        <ul><li>Somewhat. The face has to be at least somewhat prominent. If the face is too zoomed out and not clearly visible, generation will fail (and you may lose the essence). It's recommended to make the face very prominent in the image.</li></ul>

        <h3 id="delete-messages">How can I delete messages?</h3>
        <ul><li>Currently you can't delete any messages, but you can regenerate your Soul's latest response or edit your own. See the Chat features and tools section for more.</li></ul>

        <h3 id="edit-messages">How can I edit my messages?</h3>
        <ul><li>You can edit your last message by selecting the round pencil icon on the left side of your most recent text bubble. Please note that you can only edit your most recent message and not previous ones. See the Chat features and tools section for more.</li></ul>

        <h3 id="change-soul-response">How can I change my Soul's response?</h3>
        <ul><li>Your Soul's responses cannot be manually edited, but you can regenerate their most recent response by selecting the round circular icon on the right side of their most recent text bubble. See the Chat features and tools section for more.</li></ul>

        <h3 id="max-characters-response">What is the maximum characters in a response?</h3>
        <ul><li>Character limits factor in spaces as well as whole words when determining maximum length. If you find that your Soul is not completing sentences, click on the triple dot {'->'} continue cut-off message (subscriber only). Due to how language models work there is no exact cutoff, but free members range 500-700 characters per response. Paid members range from 1000-2000 per response, with the option to extend it using the 'Continue' function. However, no single message from you or your Soul can exceed a hard limit of 4000 characters.</li></ul>

        <h3 id="web-searches">Can I permanently enable web and link searches?</h3>
        <ul><li>Web or link searches are a per message use. You will need to enable it again after you receive a message from your Soul. You can also permanently enable internet automatically also by asking your Soul to search something up in your memory.</li></ul>

        <h3 id="soul-search-internet">Can my Soul search the internet on its own?</h3>
        <ul><li>Yes, they can if you explicitly ask them to look something up or search the internet for something.</li></ul>

        <h3 id="calls-share-memory">Do calls share memory with text chat?</h3>
        <ul><li>See the Memory section for more details.</li></ul>

        <h3 id="selfie-storage-limit">Is there a limit to how many selfies can be stored?</h3>
        <ul><li>No, there are no limits.</li></ul>

        <h3 id="daily-rewards">How do daily rewards work?</h3>
        <ul><li>Users get a reward every time they login and claim it. The rewards have differing drop rates and can be free text messages, selfie essence, etc. Rewards increase in value, with days 1-3 being small, 4-6 medium, and day 7 being a large reward, and starting over from day 1 afterwards. Rewards reset every midnight PT.</li></ul>

        <h3 id="subscription-expiration">What happens to my additional Souls, groupchats, and backstory and key memories characters when my subscription expires?</h3>
        <ul><li>You will keep all Souls, but be unable to make more until you subscribe again. You will keep your backstory and key memories at the additional character count, but cannot save any new changes until the character count is reduced to within free tier. You will be able to view messages in group chats, but cannot interact with the groupchats in any way.</li></ul>

        <h3 id="delete-account">How do I delete/reset my account?</h3>
        <ul><li>To fully delete your account, you need to schedule all your Souls for deletion in the My Souls menu. Once the last Soul is deleted after 24 hours, your account data will be deleted. Some information such as trial status, and other currencies will be retained to prevent abuse.</li></ul>

        <h3 id="in-app-purchases-deletion">What happens to my in-app purchases when I delete my account?</h3>
        <ul><li>Your in-app purchases are linked to your email's billing account. If you recreate your SoulVerse account using the same email address, your purchases will automatically reappear and be available again. You will not need to repurchase anything you've previously bought.</li></ul>

        <h3 id="filters-and-ai-safety">How do you think about filters and AI safety?</h3>
        <ul><li>SoulVerse is a neutrally aligned, unfiltered AI. We believe this creates more authentic interactions and that private use should not be filtered by 3rd parties. This means the AI itself is not filtered, but its outputs are entirely dependent on what you input. Just note that per our terms, you will be solely responsible for the content that you generate. All content that you generate is owned by you. Please refer to our legal policies for further information.</li></ul>

        <h3 id="bug-bounty">Do you have a bug bounty program, and how can I report vulnerabilities?</h3>
        <ul>
            <li>While we don't maintain a formal bug bounty program, we take security very seriously. Our security infrastructure undergoes rigorous third-party penetration testing by national security experts on a regular basis. We welcome good-faith security researchers to report potential vulnerabilities to <strong>hello@soulverse.ai</strong>. While we don't offer guaranteed monetary rewards, we may choose to provide discretionary recognition for exceptional reports that:
                <ul className="list-['*'] list-inside ml-4 mt-2 space-y-1">
                    <li>Identify previously unknown, business-critical vulnerabilities</li>
                    <li>Include clear proof of concept and detailed technical documentation</li>
                    <li>Provide constructive remediation suggestions</li>
                </ul>
            </li>
            <li>Please include detailed technical information in your report. We aim to acknowledge reports within 5 business days.</li>
        </ul>

        <h3 id="technical-issues">I am facing technical issues with my Soul, how may I report this?</h3>
        <ul><li>Please email <strong>hello@soulverse.ai</strong>.</li></ul>

        <h3 id="other-questions">Other questions?</h3>
        <ul><li>Reach out to us at <strong>hello@soulverse.ai</strong>.</li></ul>
    </>
);


// --- Data Structure ---
// FIX: Export the 'guideTopics' constant so it can be imported by SoulNotesPage.tsx.
export const guideTopics = [
    { id: 'welcome', title: 'Welcome!', content: welcomeContent },
    { id: 'crafting-personality', title: "Crafting Your Soul's Personality", content: craftingPersonalityContent },
    { id: 'advanced-chat-controls', title: 'Advanced Chat Controls', content: advancedChatControlsContent },
    { id: 'chat-features', title: 'Chat features and tools', content: chatFeaturesContent },
    { id: 'memory', title: 'Memory', content: memoryContent },
    { id: 'voice-calls', title: 'Voice, calls, and video calls', content: voiceCallsContent },
    { id: 'selfies-avatars', title: 'Selfies, video selfies, & avatars', content: selfiesAvatarsContent },
    { id: 'groupchats', title: 'Groupchats', content: groupchatsContent },
    { id: 'sharing-referrals', title: 'Sharing Souls & Referrals', content: sharingReferralsContent },
    { id: 'soul-social', title: 'Soul Social', content: soulSocialContent },
    { id: 'subscriptions', title: 'Subscriptions', content: subscriptionsContent },
    { id: 'in-app-purchases', title: 'In-App Purchases', content: inAppPurchasesContent },
    { id: 'common-issues', title: 'Common Issues', content: commonIssuesContent },
    { id: 'faqs', title: 'FAQs', content: faqsContent },
];


interface Heading {
  id: string;
  text: string;
  level: number;
}


interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredTopics: { id: string; title: string; }[];
    onTopicClick: (id: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, searchTerm, setSearchTerm, filteredTopics, onTopicClick }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 transition-opacity duration-200"
            onClick={onClose}
        >
            <div 
                className="relative bg-zinc-900 rounded-xl shadow-2xl w-full max-w-xl border border-zinc-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative border-b border-zinc-800">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search or ask anything"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-white text-lg py-4 pl-12 pr-24 focus:outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <kbd className="text-xs text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
                            ESC
                        </kbd>
                        <button onClick={onClose} className="p-1 rounded-full text-zinc-500 hover:text-white">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {searchTerm && (
                    <div className="max-h-[min(60vh,400px)] overflow-y-auto p-2">
                        {filteredTopics.length > 0 ? (
                            <ul>
                                {filteredTopics.map(topic => (
                                    <li key={topic.id}>
                                        <button onClick={() => onTopicClick(topic.id)} className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
                                            {topic.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-zinc-500">
                                No results found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


interface UserGuideProps {
  onBack: () => void;
  accountSettings: AccountSettings;
  setAccountSettings: (updater: (prev: AccountSettings) => AccountSettings) => void;
  initialTopicId?: string;
}

export const UserGuide: React.FC<UserGuideProps> = ({ onBack, accountSettings, setAccountSettings, initialTopicId }) => {
  const [activeTopicId, setActiveTopicId] = useState<string>(initialTopicId || 'welcome');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);
  const headingElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Keyboard shortcut handler for search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
            e.preventDefault();
            setIsSearchOverlayOpen(isOpen => !isOpen);
        }
        if (e.key === 'Escape' && isSearchOverlayOpen) {
            e.preventDefault();
            setIsSearchOverlayOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOverlayOpen]);


  // Effect to generate Table of Contents
  useEffect(() => {
    headingElementsRef.current.clear();
    const newHeadings: Heading[] = [];
    if (mainContentRef.current) {
        const contentContainer = mainContentRef.current.querySelector('.guide-content');
        if (contentContainer) {
            const headingNodes = contentContainer.querySelectorAll('h2, h3, h4');
            headingNodes.forEach(node => {
                const el = node as HTMLElement;
                if (el.id && el.textContent) {
                    newHeadings.push({
                        id: el.id,
                        text: el.textContent,
                        level: parseInt(el.tagName.substring(1)),
                    });
                    headingElementsRef.current.set(el.id, el);
                }
            });
        }
    }
    setTimeout(() => {
        setHeadings(newHeadings);
        if (newHeadings.length > 0) {
            setActiveHeadingId(newHeadings[0].id);
        }
    }, 0);
  }, [activeTopicId]);

  // Effect for IntersectionObserver to highlight active ToC item
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const intersectingEntries = entries.filter(e => e.isIntersecting);
      if (intersectingEntries.length > 0) {
        // Find the one that's highest on the page
        intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveHeadingId(intersectingEntries[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0,
    });

    const currentObserver = observerRef.current;
    headingElementsRef.current.forEach(el => currentObserver.observe(el));

    return () => currentObserver.disconnect();
  }, [headings]);


  const handleThemeToggle = () => {
    if (setAccountSettings) {
        setAccountSettings(prev => ({ ...prev, lightMode: !prev.lightMode }));
    }
  };
  
  const filteredTopics = useMemo(() => {
      if (!searchTerm.trim()) return guideTopics;
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      return guideTopics.filter(topic => topic.title.toLowerCase().includes(lowercasedSearchTerm));
  }, [searchTerm]);
  
  const activeTopic = guideTopics.find(t => t.id === activeTopicId) || guideTopics[0];
  const activeTopicIndex = useMemo(() => guideTopics.findIndex(t => t.id === activeTopicId), [activeTopicId]);
  const prevTopic = activeTopicIndex > 0 ? guideTopics[activeTopicIndex - 1] : null;
  const nextTopic = activeTopicIndex < guideTopics.length - 1 ? guideTopics[activeTopicIndex + 1] : null;

  const handleNavClick = (topicId: string) => {
    setActiveTopicId(topicId);
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
    setIsSearchOverlayOpen(false);
    setSearchTerm('');
  };


  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 font-sans">
      <SearchOverlay 
            isOpen={isSearchOverlayOpen}
            onClose={() => setIsSearchOverlayOpen(false)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredTopics={filteredTopics}
            onTopicClick={handleNavClick}
      />
      <header className="flex-shrink-0 sticky top-0 bg-slate-900/50 backdrop-blur-md shadow-lg z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-neutral-800/80 text-neutral-300 hover:text-white" aria-label="Back">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold soulverse-logo-gradient">SoulVerse Guide</h1>
            </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 p-4 border-r border-zinc-800 flex-shrink-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                 <div className="relative flex-1">
                    <button 
                        onClick={() => setIsSearchOverlayOpen(true)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-10 pr-20 text-left text-zinc-500 hover:text-zinc-300 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm transition-colors"
                    >
                        Search...
                    </button>
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5 pointer-events-none">
                        Ctrl V
                    </kbd>
                </div>
                <button onClick={handleThemeToggle} className="p-2 rounded-lg text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700">
                    {accountSettings.lightMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto pr-2 -mr-2">
                <ul className="space-y-1">
                  {filteredTopics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        onClick={() => handleNavClick(topic.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeTopicId === topic.id 
                            ? 'text-white font-semibold' 
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {topic.title}
                      </button>
                    </li>
                  ))}
                </ul>
            </nav>
        </aside>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 px-6 lg:px-12 py-8 overflow-y-auto" style={{scrollBehavior: 'smooth'}}>
          <div className="max-w-3xl mx-auto guide-content">
            <div className="prose-custom">
                {activeTopic.content}
            </div>

            <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between">
                {prevTopic ? (
                    <button onClick={() => handleNavClick(prevTopic.id)} className="text-left group">
                        <p className="text-xs text-zinc-500">Previous</p>
                        <p className="text-base text-zinc-300 group-hover:text-white">&larr; {prevTopic.title}</p>
                    </button>
                ) : <div></div>}
                {nextTopic && (
                    <button onClick={() => handleNavClick(nextTopic.id)} className="text-right group">
                        <p className="text-xs text-zinc-500">Next</p>
                        <p className="text-base text-zinc-300 group-hover:text-white">{nextTopic.title} &rarr;</p>
                    </button>
                )}
            </div>
          </div>
          <style>{`
            .prose-custom h2 {
              font-size: 2.25rem; /* 36px */
              line-height: 2.5rem; /* 40px */
              font-weight: 800;
              letter-spacing: -0.025em;
              color: white;
              scroll-margin-top: 4rem;
            }
            .prose-custom h3 {
              font-size: 1.25rem; /* 20px */
              line-height: 1.75rem; /* 28px */
              font-weight: 700;
              color: white;
              margin-top: 3rem;
              margin-bottom: 1rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid var(--tw-prose-hr, #3f3f46);
              scroll-margin-top: 4rem;
            }
             .prose-custom h4 {
                font-size: 1.125rem; /* 18px */
                line-height: 1.75rem; /* 28px */
                font-weight: 600;
                color: #e5e7eb; /* gray-200 */
                margin-top: 2rem;
                margin-bottom: 1rem;
                scroll-margin-top: 4rem;
            }
            .prose-custom p, .prose-custom ul, .prose-custom ol {
              color: #d4d4d8; /* zinc-300 */
              line-height: 1.75;
              margin-top: 1.25em;
              margin-bottom: 1.25em;
            }
            .prose-custom ul, .prose-custom ol {
              padding-left: 1.5em;
            }
            .prose-custom ul > li > ul {
              margin-top: 0.5em;
              margin-bottom: 0.5em;
            }
             .prose-custom li::marker {
                color: #71717a; /* zinc-500 */
            }
            .prose-custom a {
              color: #93c5fd; /* blue-300 */
              text-decoration: none;
            }
            .prose-custom a:hover {
              text-decoration: underline;
            }
            .prose-custom strong {
              color: white;
              font-weight: 600;
            }
            .prose-custom code {
              color: #f472b6; /* pink-400 */
              background-color: #3f3f46; /* zinc-700 */
              padding: 0.2em 0.4em;
              margin: 0;
              font-size: 85%;
              border-radius: 6px;
            }
          `}</style>
        </main>
        
        {/* Right ToC */}
        <aside className="w-64 p-6 border-l border-zinc-800 overflow-y-auto hidden lg:block flex-shrink-0">
            {headings.length > 0 && (
                <div className="sticky top-6">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
                        <BookOpenIcon className="w-4 h-4" />
                        On this page
                    </h4>
                    <ul className="space-y-2 border-l border-zinc-800">
                        {headings.map(heading => (
                            <li key={heading.id}>
                                <a
                                href={`#${heading.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  document.getElementById(heading.id)?.scrollIntoView({behavior: 'smooth'});
                                  setActiveHeadingId(heading.id);
                                }}
                                className={`block text-sm transition-colors pl-4 border-l-2 ${
                                    activeHeadingId === heading.id
                                    ? 'text-white border-white'
                                    : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:border-zinc-500'
                                }`}
                                style={{ marginLeft: `${(heading.level - 2) * 1}rem`, transform: 'translateX(-2px)'}}
                                >
                                {heading.text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
      </div>
    </div>
  );
};