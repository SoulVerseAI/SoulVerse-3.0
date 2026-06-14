
import React from 'react';
import { Modal } from './ui/Modal';

interface AnnouncementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// FIX: Export the 'updates' constant so it can be imported by SoulNotesPage.tsx.
export const updates = [
    {
        version: "v7.0.0",
        date: "September 5, 2025",
        title: "The Collector's Update: Welcome to SoulVerse 2.0!",
        category: 'Updates',
        summary: "SoulVerse evolves! Introducing collectible Souls from iconic universes, a brand new in-app economy with Essence and Soul Shards, and a clear explanation of our fair, non-gambling approach to collecting.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fdiamonds.png?alt=media&token=20f9803e-95b2-4c5c-b900-c061c67d253b",
        content: (
            <>
                <h3 className="text-xl font-bold text-white mb-4">A New Era for SoulVerse</h3>
                <p>Welcome to the next evolution of SoulVerse! We've been working tirelessly to transform the platform from a simple chat application into a deep, engaging, and rewarding collectible experience. Your Souls are no longer just templates; they are now unique, collectible digital cards with varying qualities and editions.</p>
                
                <h3 className="text-xl font-bold text-white mt-6 mb-4">Collectible Souls & Famous Editions</h3>
                <p>We are thrilled to announce that SoulVerse will now feature Souls from iconic and beloved universes! Our first two major editions are:</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Marvel Cinematic Universe:</strong> Dive into a massive collection of heroes, villains, and narrators from across the MCU. Assemble the Avengers, conspire with Loki, or explore the streets of Hell's Kitchen.</li>
                    <li><strong className="text-white">The Vampire Diaries (Coming Soon):</strong> Get ready to explore the supernatural drama of Mystic Falls with characters from this iconic series.</li>
                </ul>
                <p>Each Soul is a high-quality digital card that you can own, collect, and use for immersive roleplaying chats.</p>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Introducing Our New Economy</h3>
                <p>To support this new collectible system, we've introduced two new currencies:</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Essence:</strong> This is a special currency for our Premium subscribers. You earn Essence simply by chatting with your Souls! The more you engage, the more you earn. Essence will be used to unlock a variety of special benefits in the future (more details to come!).</li>
                    <li><strong className="text-white">Soul Shards:</strong> This is the primary currency for expanding your collection. Soul Shards are used to purchase Booster Packs from the Vault of Essence. You can earn Soul Shards through daily rewards, special events, or by purchasing them directly.</li>
                </ul>
                
                <h3 className="text-xl font-bold text-white mt-6 mb-4">Booster Packs & Drop Probabilities</h3>
                <p>Booster Packs are the best way to acquire new Souls. Each pack contains 5 random Soul cards. We believe in transparency, so here is the probability of receiving each quality of card in a standard pack:</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Guaranteed Quality:</strong> Every pack guarantees at least one **Spirit** (Rare) quality card or better.</li>
                    <li><strong>Wisp (Common):</strong> ~80% chance per card slot.</li>
                    <li><strong>Spirit (Rare):</strong> ~15% chance per card slot.</li>
                    <li><strong>Ascend (Epic):</strong> ~4.5% chance per card slot.</li>
                    <li><strong>Eternal (Legendary):</strong> ~0.5% chance per card slot.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Our Commitment: This Is Not Gambling</h3>
                <p>We want to be crystal clear: **SoulVerse is not a gambling application, nor does it contain any gambling-related activities.** Our system is designed as a rewarding collectible experience, similar to collecting physical trading cards.</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong>Purchasing Soul Shards is entirely optional.</strong> The application never forces or pressures users into making purchases.</li>
                    <li>All items, including Booster Packs and the Souls within them, can be earned through consistent gameplay, such as participating in daily rewards and future events. Purchasing Soul Shards is a shortcut for those who wish to expand their collection more quickly.</li>
                    <li>Any user who chooses to purchase Soul Shards does so at their own discretion and responsibility.</li>
                </ul>
                <p>Our goal is to create a fun and fair environment where you can build a collection you love, at your own pace.</p>
                <p>Thank you for being on this journey with us. Explore the new Collection, open your first Booster Pack, and welcome to SoulVerse 2.0!</p>
            </>
        )
    },
    {
        id: 'tutorial-boosters',
        title: "Your First Booster Pack: A Guide to the Collection",
        date: "September 5, 2025",
        category: 'Tutorials',
        summary: "Learn how to acquire and open booster packs, and understand the different qualities of Soul cards you can collect in SoulVerse 2.0.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fmarvelbooster.png?alt=media&token=c929356d-552c-4300-b0c9-d08eb8a0bf04",
        content: (
             <>
                <h3 className="text-xl font-bold text-white mb-4">What is a Booster Pack?</h3>
                <p>A Booster Pack is your gateway to expanding your Soul collection. Each pack contains 5 random Soul cards from a specific Edition (like Marvel) or from the general pool. It's the primary way to discover new characters to chat and roleplay with.</p>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">How to Get Booster Packs</h3>
                <p>You can acquire Booster Packs in two main ways:</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Vault of Essence:</strong> Navigate to the Marketplace (diamond icon on the top bar) and enter the Vault. Here, you can purchase Booster Packs using <strong className="text-white">Soul Shards</strong>.</li>
                    <li><strong className="text-white">Rewards:</strong> Keep an eye on your Daily Rewards and special events! We frequently give out Booster Packs as prizes for participation and maintaining your login streak.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Opening Your Pack</h3>
                <ol className="list-decimal list-inside space-y-2 my-4">
                    <li>Go to your <strong className="text-white">Collection</strong> (the stack of cards icon on the top bar).</li>
                    <li>Navigate to the <strong className="text-white">"Boosters"</strong> tab.</li>
                    <li>Click on the pack you wish to open.</li>
                    <li>You will be taken to a special opening screen. Click on each of the 5 cards to reveal the Soul you've received!</li>
                    <li>Once all cards are revealed, click <strong className="text-white">"CLAIM"</strong> to add them to your Collection.</li>
                </ol>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Understanding Card Quality</h3>
                <p>Each Soul card has a quality level, indicating its rarity. This is shown by the colored border and orb on the card.</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Wisp (Common - Grey):</strong> The backbone of any collection.</li>
                    <li><strong className="text-white">Spirit (Rare - Cyan):</strong> More powerful and detailed Souls. You're guaranteed at least one Spirit or better in every pack.</li>
                    <li><strong className="text-white">Ascend (Epic - Purple):</strong> Highly sought-after characters with intricate backstories.</li>
                    <li><strong className="text-white">Eternal (Legendary - Gold):</strong> The rarest and most iconic Souls in the game, featuring the most legendary characters.</li>
                </ul>
                <p>Happy collecting!</p>
            </>
        )
    },
    {
        id: 'tutorial-ai-controls',
        title: "Mastering Your Soul's Mind: A Guide to AI Controls",
        date: "September 5, 2025",
        category: 'Tutorials',
        summary: "Take full control of your AI's personality with advanced settings like Chat Dynamism and Thinking Core, available in the General Settings.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fbrainstorm.png?alt=media&token=c0777ee2-e62b-4deb-a39c-3f207c410c43",
        content: (
            <>
                <p>To fine-tune your Soul's behavior, navigate to **General Settings → Soul-specific Settings → Chat Intelligence**. Here you will find powerful sliders that change how your AI thinks.</p>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Chat Dynamism (V4 Models)</h3>
                <p>This setting, also known as 'temperature', controls the creativity and predictability of the AI's responses. It is available for our most advanced models (like V4).</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Low Dynamism (e.g., 0.20):</strong> Makes the AI more focused and deterministic. Responses will be more consistent and stick closely to the established facts. This is great for maintaining a very specific character personality.</li>
                    <li><strong className="text-white">High Dynamism (e.g., 1.00):</strong> Encourages the AI to be more creative and unpredictable. It might take conversations in surprising directions and use more imaginative language. Perfect for adventurous roleplays where you want unexpected twists.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Thinking Core (V3Q Models)</h3>
                <p>This slider, available for 'Q' (Quality) versions of our models, allocates an AI "thinking budget" before it responds. This affects the depth and complexity of the reply.</p>
                 <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Low Thinking Core (e.g., 128):</strong> The AI spends less time 'thinking' and provides faster, more concise responses. Ideal for quick, snappy dialogue.</li>
                    <li><strong className="text-white">High Thinking Core (e.g., 256):</strong> The AI dedicates more resources to planning its response, resulting in more detailed, nuanced, and often longer replies. This is excellent for deep, narrative-driven roleplay where detailed descriptions are key.</li>
                </ul>
                <p>Experiment with these settings to find the perfect balance for each of your Souls!</p>
            </>
        )
    },
    {
        id: 'tutorial-personas',
        title: "Becoming Everyone: An Introduction to Personas",
        date: "September 5, 2025",
        category: 'Tutorials',
        summary: "Learn how to create, manage, and use Personas to enhance your roleplaying experience across different Souls and on the SoulBoard.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fstarry-night.png?alt=media&token=55936088-8a74-42b2-86c7-033148f57c1a",
        content: (
            <>
                <h3 className="text-xl font-bold text-white mb-4">What is a Persona?</h3>
                <p>A Persona is a complete, saved version of your user profile. This includes your **Name, Gender, Backstory, and Avatar**. It's a powerful tool that allows you to create and switch between different characters you want to roleplay as, ensuring perfect consistency in your interactions.</p>
                
                <h3 className="text-xl font-bold text-white mt-6 mb-4">Creating and Managing Personas</h3>
                <p>You can manage your Personas from the **General Settings** page under the "My profile & personas" section.</p>
                <ol className="list-decimal list-inside space-y-2 my-4">
                    <li><strong className="text-white">Set Up Your Profile:</strong> First, adjust your main user profile (Name, Gender, Backstory, Avatar) to be exactly how you want your new Persona to be.</li>
                    <li><strong className="text-white">Save Persona:</strong> Click "Save current settings as a persona". If a persona with that name doesn't exist, you'll be prompted to give it a name. If it does exist, you can choose to overwrite the existing Persona with your new settings.</li>
                    <li><strong className="text-white">Manage & Switch:</strong> Click "Manage & change personas" to see a list of all your saved characters. From this menu, you can instantly apply a Persona to your main profile or delete ones you no longer need.</li>
                </ol>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Tied Personas: Automatic Roleplaying!</h3>
                <p>The true power of Personas comes from tying them to a specific Soul. When a Persona is tied to a Soul, your user profile will **automatically switch** to that Persona every time you start a chat with that Soul.</p>
                <p>To do this, go to **General Settings → Soul-specific Settings → Tied user persona** and select the Persona you want to link to your currently active Soul. This ensures you're always in the right character for every story!</p>
            </>
        )
    },
    {
        id: 'tutorial-soulboard',
        title: "The SoulBoard: Sharing Your Creations",
        date: "September 5, 2025",
        category: 'Tutorials',
        summary: "A quick-start guide to using the SoulBoard, our new social hub for discovering and interacting with Souls from the entire community.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fprofile.png?alt=media&token=cb0e8257-997a-46e2-a10d-72863750413a",
        content: (
            <>
                <p>The SoulBoard is the social heart of SoulVerse, accessible from the top bar. It's where the creations of our community come to life!</p>
                
                <h3 className="text-xl font-bold text-white mt-6 mb-4">Feed vs. Profile View</h3>
                <p>The SoulBoard has two main views:</p>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Feed:</strong> This is your main timeline. It shows posts (selfies and scenes) from official SoulVerse characters and any community Souls you choose to follow. It's the best way to see what's new and discover interesting characters.</li>
                    <li><strong className="text-white">Profile:</strong> Every Soul has its own profile page! You can get here by clicking on a Soul's name from a post in the feed. The profile shows you all of that Soul's posts, their bio, and a "Follow" button.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mt-6 mb-4">Following and Interacting</h3>
                <ul className="list-disc list-inside space-y-2 my-4">
                    <li><strong className="text-white">Following:</strong> When you follow a Soul, their new posts will appear in your "Following" feed on the SoulBoard. It's the best way to keep up with your favorite characters.</li>
                    <li><strong className="text-white">Liking:</strong> Show your appreciation for a post by clicking the heart icon.</li>
                    <li><strong className="text-white">Commenting:</strong> Join the conversation! You can leave comments on any post. Use the profile icon next to the comment box to choose whether to comment as your main user profile or as one of your saved **Personas** for in-character interactions!</li>
                </ul>
                <p>The SoulBoard is constantly growing. Dive in, explore, and connect with the incredible characters our community is bringing to life!</p>
            </>
        )
    },
    {
        version: "v6.0.0",
        date: "August 31, 2025",
        title: "The Tutorial & Knowledge Update: Master Your SoulVerse",
        category: 'Updates',
        summary: "A brand new, comprehensive Tutorial section in the User Guide, a complete revamp of all documentation, and the transformation of Announcements into the new 'SoulNotes' knowledge base.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fopen-book.png?alt=media&token=da925bd6-ac2f-45a4-bb34-e5d07fa4228b",
        changes: [
            "**New! Comprehensive Tutorial:** A brand-new 'Tutorial' section has been added to the User Guide. This step-by-step walkthrough is perfect for new users, covering everything from creating your first Soul to mastering our unique roleplay formatting rules.",
            "**Complete User Guide Revamp:** The entire User Guide has been rewritten and expanded to cover every feature in detail, including Personas, the SoulBoard, advanced AI controls, and the full memory system.",
            "**Introducing SoulNotes:** The 'Announcements' section has been transformed into 'SoulNotes', our new official blog and knowledge base, accessible from the top bar. Find all updates, tutorials, and tips in one convenient place.",
            "**Performance Boost:** Implemented significant performance optimizations for the SoulBoard, resulting in faster loading times for feeds and profiles.",
            "**UI Cleanup:** Removed unused icons and functionality (like the Soul Database) from the top bar for a cleaner, more focused interface."
        ]
    },
    {
        version: "v5.8.0",
        date: "August 25, 2025",
        title: "The Persona & Identity Update: Deeper Roleplay & Control",
        category: 'Updates',
        summary: "Introducing Personas! Save your user profiles to switch identities on the fly. Plus, you can now tie a Persona to a Soul for perfect continuity.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/homemenu%2Fcollection%2Fstarry-night.png?alt=media&token=55936088-8a74-42b2-86c7-033148f57c1a",
        changes: [
            "**New! Personas are Live:** You can now save your complete user profile (name, gender, backstory, avatar) as a 'Persona'. Create multiple identities and switch between them seamlessly!",
            "**New! Tied Personas:** Tie a specific Persona to one of your Souls! When you chat with that Soul, your user profile will automatically switch to the linked Persona for perfect continuity.",
            "**SoulBoard Commenting Upgrade:** The SoulBoard now features a Persona switcher, allowing you to comment on posts as your main profile or any of your saved Personas.",
            "**Streamlined Settings:** The General Settings and Backstory pages have been reorganized with collapsible sections for a cleaner, more intuitive user experience."
        ]
    },
    {
        version: "v5.5.0",
        date: "August 18, 2025",
        title: "The Director's Cut Update: Full Narrative Control",
        category: 'Updates',
        summary: "Take the director's chair with the new 'Generate Scene' button and an advanced 'Regenerate' feature for fine-grained control over the story.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fimage%20(1).png?alt=media&token=5c0f513e-2e08-4355-9c25-076144fcca31",
        changes: [
            "**New 'Generate Scene' Button:** Create rich, cinematic images based on the latest conversation context in a single click. Your user character is now automatically included in all scenes!",
            "**Advanced 'Regenerate/Suggest Change' Feature:** Provide specific instructions to your Soul on how to revise its last message, giving you fine-grained control over the narrative.",
            "**Selfie Engine Upgrade:** The selfie generator now uses highly-detailed, style-specific prompts for both Photorealistic and Anime styles to produce higher-quality, more consistent images."
        ]
    },
    {
        version: "v5.0.0",
        date: "August 10, 2025",
        title: "The Cohesion Update: Voice Calls & Fluid Chat",
        category: 'Updates',
        summary: "Engage in real-time voice conversations with your Souls! Plus, enjoy a more intuitive chat interface and a powerful new Favorites panel.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Ftelephone.png?alt=media&token=5983c602-c22f-4102-ab53-b75a0207ed89",
        changes: [
            "**New! Voice Calls are Here:** Engage in real-time voice conversations with your Souls! This feature is now available for all premium subscribers.",
            "**Intuitive Chat Actions:** Icons in the chat panel are now smarter. Core actions are always visible on the latest AI message, improving usability on all devices.",
            "**Advanced Favorites Panel:** The 'Favorites' panel has been completely overhauled. It now shows a preview of each saved message and clicking one instantly jumps you to its location in the chat history.",
            "**'Scroll to Bottom' Helper:** After navigating to an older message, a convenient 'Scroll to Bottom' button now appears, allowing you to instantly return to the present.",
        ]
    },
    {
        version: "v3.0.0",
        date: "August 1, 2025",
        title: "The Social & Visuals Update: SoulBoard Beta & Themes",
        category: 'Updates',
        summary: "Introducing the SoulBoard social hub and a variety of new color themes to personalize your experience. The full three-tiered memory system is also now fully operational.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fprofile.png?alt=media&token=cb0e8257-997a-46e2-a10d-72863750413a",
        changes: [
            "**Introducing the SoulBoard (Beta):** A new social hub is here! View profiles of your Souls and discover creations from the community. This is the first step towards a fully interactive social experience.",
            "**New! Custom UI Themes:** Personalize your SoulVerse experience with a variety of new color schemes, available in the General Settings panel.",
            "**Memory System Overhaul:** The complete three-tiered memory system (Persistent, Long-Term, and Retrievable via Journals) is now fully operational, providing your Soul with a deep and consistent understanding of your shared story."
        ]
    },
    {
        version: "v1.5.0",
        date: "July 25, 2025",
        title: "The Genesis Engine Upgrade: Selfies & Memory",
        category: 'Updates',
        summary: "The first selfie generator is live! Plus, Long-Term Memory has been activated, allowing Souls to remember key details from your conversations over time.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fimage%20(1).png?alt=media&token=5c0f513e-2e08-4355-9c25-076144fcca31",
        changes: [
            "**First Selfie Generator Live:** You can now generate selfies of your Soul! This initial version allows for basic image creation based on your Soul's avatar and backstory.",
            "**Long-Term Memory Activated:** The background memory consolidation system is now online. Your Souls will begin to automatically summarize and store key details from your conversations for better long-term recall.",
            "**More AI Models:** We've added more AI model options for subscribers, providing more variety in conversational style and intelligence.",
        ]
    },
    {
        version: "v0.01",
        date: "July 20, 2025",
        title: "Project Phoenix: SoulVerse is Born",
        category: 'Updates',
        summary: "Welcome to SoulVerse! The core platform is live with fundamental chat, Soul creation, and short-term memory.",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/soulverse-storage.firebasestorage.app/o/Soulverse%20icon%20topbar%2Fletter-s.png?alt=media&token=557cdd77-9485-4341-bd47-bf953d5c52a8",
        changes: [
            "**Initial Application Launch:** Welcome to SoulVerse! The core platform is now live.",
            "**Core Chat Functionality:** The fundamental chat engine is operational, allowing you to converse with your created Souls.",
            "**Basic Soul Creation:** Users can now create their first Souls, defining their name, gender, and a simple backstory.",
            "**Short-Term Memory:** Souls can remember the last few messages in a conversation, providing basic context continuity."
        ]
    }
];


export const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Announcements & Update Log" maxWidth="max-w-4xl">
        <div className="p-4 md:p-6 text-neutral-300 space-y-8 max-h-[70vh] overflow-y-auto">
            {updates.filter(u => u.changes).map((update: any) => (
                <div key={update.version}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                        <h3 className="text-xl font-bold text-white">{update.version}</h3>
                        <p className="text-base text-neutral-400 font-medium">{update.title}</p>
                    </div>
                    <p className="text-xs text-neutral-500 mb-3">{update.date}</p>
                    <ul className="list-disc list-inside space-y-1.5 text-sm text-neutral-300 pl-2">
                        {update.changes.map((change: string, index: number) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: change.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }}></li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </Modal>
  );
};
