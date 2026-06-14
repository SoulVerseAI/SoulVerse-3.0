export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string;
          id: string;
          is_edited: boolean;
          sender: string;
          soul_id: string;
          text: string;
          timestamp: string;
          user_id: string;
        }
        Insert: {
          id: string;
          is_edited?: boolean;
          sender: string;
          soul_id: string;
          text: string;
          timestamp: string;
          user_id: string;
        }
        Update: {
          is_edited?: boolean;
          sender?: string;
          soul_id?: string;
          text?: string;
          timestamp?: string;
          user_id?: string;
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          keyphrases: string[];
          soul_id: string | null;
          user_id: string;
        }
        Insert: {
          content: string;
          id?: string;
          keyphrases: string[];
          soul_id?: string | null;
          user_id: string;
        }
        Update: {
          content?: string;
          keyphrases?: string[];
          soul_id?: string | null;
          user_id?: string;
        }
        Relationships: []
      }
      long_term_memories: {
        Row: {
          created_at: string;
          id: string;
          soul_id: string;
          summary: string;
          timestamp: string;
          user_id: string;
        }
        Insert: {
          id?: string;
          soul_id: string;
          summary: string;
          timestamp?: string;
          user_id: string;
        }
        Update: {
          soul_id?: string;
          summary?: string;
          timestamp?: string;
          user_id?: string;
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string;
          created_at: string;
          id: string;
          image_url: string;
          likes: number;
          soul_id: string;
          timestamp: string;
        }
        Insert: {
          caption: string;
          id: string;
          image_url: string;
          likes?: number;
          soul_id: string;
          timestamp?: string;
        }
        Update: {
          caption?: string;
          image_url?: string;
          likes?: number;
          soul_id?: string;
          timestamp?: string;
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_soul_id: string | null;
          auto_play_audio: boolean;
          created_at: string;
          daily_reward_streak: number;
          direct_writing_style: boolean;
          enable_nsfw_mode: boolean;
          favorite_messages: string[];
          followed_souls_ids: string[];
          id: string;
          last_reward_claim: string | null;
          light_mode: boolean;
          liked_post_ids: string[];
          multi_paragraph_responses: boolean;
          quick_switch_soul_ids: string[];
          referral_essence: number;
          soul_shards: number;
          subscription_tier: "Free" | "Premium" | "Ultra" | "Max";
          text_streaming: boolean;
          theme_overrides: string | null;
          user_avatar: string | null;
          user_avatar_description: string | null;
          user_avatar_face_detail_enhance: number | null;
          user_avatar_face_detail_prompt: string | null;
          user_avatar_style: "Photoreal" | "Anime" | null;
          user_backstory: string | null;
          user_gender: "Male" | "Female" | "Nonbinary" | null;
          user_name: string | null;
          voice_call_prefer_narration: boolean;
          voice_call_push_to_talk: boolean;
          voice_call_spontaneous_response: boolean;
          voice_call_unified_history: boolean;
        }
        Insert: {
          active_soul_id?: string | null;
          auto_play_audio?: boolean;
          daily_reward_streak?: number;
          direct_writing_style?: boolean;
          enable_nsfw_mode?: boolean;
          favorite_messages?: string[];
          followed_souls_ids?: string[];
          id: string;
          last_reward_claim?: string | null;
          light_mode?: boolean;
          liked_post_ids?: string[];
          multi_paragraph_responses?: boolean;
          quick_switch_soul_ids?: string[];
          referral_essence?: number;
          soul_shards?: number;
          subscription_tier?: "Free" | "Premium" | "Ultra" | "Max";
          text_streaming?: boolean;
          theme_overrides?: string | null;
          user_avatar?: string | null;
          user_avatar_description?: string | null;
          user_avatar_face_detail_enhance?: number | null;
          user_avatar_face_detail_prompt?: string | null;
          user_avatar_style?: "Photoreal" | "Anime" | null;
          user_backstory?: string | null;
          user_gender?: "Male" | "Female" | "Nonbinary" | null;
          user_name?: string | null;
          voice_call_prefer_narration?: boolean;
          voice_call_push_to_talk?: boolean;
          voice_call_spontaneous_response?: boolean;
          voice_call_unified_history?: boolean;
        }
        Update: {
          active_soul_id?: string | null;
          auto_play_audio?: boolean;
          daily_reward_streak?: number;
          direct_writing_style?: boolean;
          enable_nsfw_mode?: boolean;
          favorite_messages?: string[];
          followed_souls_ids?: string[];
          last_reward_claim?: string | null;
          light_mode?: boolean;
          liked_post_ids?: string[];
          multi_paragraph_responses?: boolean;
          quick_switch_soul_ids?: string[];
          referral_essence?: number;
          soul_shards?: number;
          subscription_tier?: "Free" | "Premium" | "Ultra" | "Max";
          text_streaming?: boolean;
          theme_overrides?: string | null;
          user_avatar?: string | null;
          user_avatar_description?: string | null;
          user_avatar_face_detail_enhance?: number | null;
          user_avatar_face_detail_prompt?: string | null;
          user_avatar_style?: "Photoreal" | "Anime" | null;
          user_backstory?: string | null;
          user_gender?: "Male" | "Female" | "Nonbinary" | null;
          user_name?: string | null;
          voice_call_prefer_narration?: boolean;
          voice_call_push_to_talk?: boolean;
          voice_call_spontaneous_response?: boolean;
          voice_call_unified_history?: boolean;
        }
        Relationships: []
      }
      shared_souls: {
        Row: {
          id: string
          created_at: string
          sharer_user_id: string
          original_soul_id: string
          name: string
          tagline: string
          greeting_message: string
          gender: "Male" | "Female" | "Nonbinary" | null
          backstory: string
          key_memories: string
          response_directive: string
          dynamism: number
          avatar: string | null
          share_code: string
          referral_count: number
          creator_name: string
          is_public: boolean
        }
        Insert: {
          id?: string
          sharer_user_id: string
          original_soul_id: string
          name: string
          tagline: string
          greeting_message: string
          gender: "Male" | "Female" | "Nonbinary" | null
          backstory: string
          key_memories: string
          response_directive: string
          dynamism: number
          avatar: string | null
          share_code: string
          referral_count?: number
          creator_name: string
          is_public?: boolean
        }
        Update: {
          id?: string
          sharer_user_id?: string
          original_soul_id?: string
          name?: string
          tagline?: string
          greeting_message?: string
          gender?: "Male" | "Female" | "Nonbinary" | null
          backstory?: string
          key_memories?: string
          response_directive?: string
          dynamism?: number
          avatar?: string | null
          share_code?: string
          referral_count?: number
          creator_name?: string
          is_public?: boolean
        }
        Relationships: []
      }
      souls: {
        Row: {
          antiRepeatStrength: number;
          avatar: string | null;
          avatarStyle: "Photoreal" | "Anime";
          backstory: string;
          bio: string;
          characterSheet: string | null;
          created_at: string;
          deletionTimestamp: string | null;
          description: string;
          dynamism: number;
          enableNsfwSelfies: boolean;
          enneagram: string | null;
          exampleMessage: string;
          faceDetailEnhance: number;
          faceDetailPrompt: string;
          followersCount: number;
          followingCount: number;
          gender: "Male" | "Female" | "Nonbinary" | null;
          greeting: string;
          id: string;
          keyMemories: string;
          maxTokens: number;
          mbti: string | null;
          memoryConsolidation: boolean;
          memoryRecall: boolean;
          model: string;
          name: string;
          physicalAppearanceDescription: string;
          profileBannerUrl: string | null;
          responseDirective: string;
          selfies: string[];
          role: "Character" | "Narrator" | "Scenario" | "Assistant" | null;
          roleplayStyle: string | null;
          templateName: string | null;
          thinkingBudget: number | null;
          user_id: string;
          username: string;
          voiceURI: string | null;
          soulId: number | null;
          shareCode: string | null;
          edition: string | null;
        }
        Insert: {
          antiRepeatStrength?: number;
          avatar?: string | null;
          avatarStyle?: "Photoreal" | "Anime";
          backstory: string;
          bio: string;
          characterSheet?: string | null;
          deletionTimestamp?: string | null;
          description: string;
          dynamism?: number;
          enableNsfwSelfies?: boolean;
          enneagram?: string | null;
          exampleMessage: string;
          faceDetailEnhance?: number;
          faceDetailPrompt: string;
          followersCount?: number;
          followingCount?: number;
          gender?: "Male" | "Female" | "Nonbinary" | null;
          greeting: string;
          id: string;
          keyMemories: string;
          maxTokens?: number;
          mbti?: string | null;
          memoryConsolidation?: boolean;
          memoryRecall?: boolean;
          model: string;
          name: string;
          physicalAppearanceDescription: string;
          profileBannerUrl?: string | null;
          responseDirective: string;
          selfies?: string[];
          role?: "Character" | "Narrator" | "Scenario" | "Assistant" | null;
          roleplayStyle?: string | null;
          templateName?: string | null;
          thinkingBudget?: number | null;
          user_id: string;
          username: string;
          voiceURI?: string | null;
          soulId?: number | null;
          shareCode?: string | null;
          edition?: string | null;
        }
        Update: {
          antiRepeatStrength?: number;
          avatar?: string | null;
          avatarStyle?: "Photoreal" | "Anime";
          backstory?: string;
          bio?: string;
          characterSheet?: string | null;
          deletionTimestamp?: string | null;
          description?: string;
          dynamism?: number;
          enableNsfwSelfies?: boolean;
          enneagram?: string | null;
          exampleMessage?: string;
          faceDetailEnhance?: number;
          faceDetailPrompt?: string;
          followersCount?: number;
          followingCount?: number;
          gender?: "Male" | "Female" | "Nonbinary" | null;
          greeting?: string;
          keyMemories?: string;
          maxTokens?: number;
          mbti?: string | null;
          memoryConsolidation?: boolean;
          memoryRecall?: boolean;
          model?: string;
          name?: string;
          physicalAppearanceDescription?: string;
          profileBannerUrl?: string | null;
          responseDirective?: string;
          selfies?: string[];
          role?: "Character" | "Narrator" | "Scenario" | "Assistant" | null;
          roleplayStyle?: string | null;
          templateName?: string | null;
          thinkingBudget?: number | null;
          user_id?: string;
          username?: string;
          voiceURI?: string | null;
          soulId?: number | null;
          shareCode?: string | null;
          edition?: string | null;
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}