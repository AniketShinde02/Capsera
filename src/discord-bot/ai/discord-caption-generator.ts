import { getNextDiscordGeminiKey } from '../config/gemini-keys';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Discord-specific AI caption generator with REAL image analysis
export class DiscordCaptionGenerator {
  private geminiKey: string | null = null;
  private initialized: boolean = false;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    // Don't initialize anything in constructor
  }

  // Initialize when first needed
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.geminiKey = getNextDiscordGeminiKey();
    if (!this.geminiKey) {
      throw new Error('No Gemini API key available for Discord bot');
    }
    
    // Initialize Google Generative AI
    this.genAI = new GoogleGenerativeAI(this.geminiKey);
    this.initialized = true;
  }

  // Generate captions for Discord using REAL image analysis (like main site)
  async generateCaptions(imageUrl: string, mood: string, username: string): Promise<string[]> {
    try {
      // Initialize if not already done
      await this.initialize();
      
      console.log('🎨 Generating AI captions for mood:', mood);
      console.log('📸 Analyzing image:', imageUrl);
      
      // Use REAL image analysis like main site
      const captions = await this.generateWithRealImageAnalysis(imageUrl, mood, username);
      
      console.log('✅ Discord AI captions generated with REAL image analysis:', captions.length);
      return captions;

    } catch (error) {
      console.error('❌ Discord AI generation failed:', error);
      // Return fallback captions
      return this.generateFallbackCaptions(mood, username);
    }
  }

  // Generate captions using REAL image analysis (same as main site)
  private async generateWithRealImageAnalysis(imageUrl: string, mood: string, username: string): Promise<string[]> {
    try {
      console.log('🔍 Starting REAL image analysis for Discord bot...');
      
      if (!this.genAI) {
        throw new Error('Google Generative AI not initialized');
      }

              // Get the Gemini Pro Vision model (same as main site)
        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-" });

      // Enhanced system instruction for maximum variety and uniqueness
      const systemInstruction = `You are an expert social media content creator and image analyst specializing in viral captions for Gen Z audiences.

STEP 1: ANALYZE THE IMAGE
You have been provided with an image. Analyze its visual content carefully.

IMPORTANT: You MUST analyze the actual image content you see. Do not generate generic captions.

Describe what you actually see:
- What is the main subject? (person, animal, object, landscape, etc.)
- What are they doing or what's happening?
- What's the setting/location/background?
- What colors dominate the image?
- What's the lighting like? (bright, dark, golden hour, etc.)
- What's the composition and style?
- What emotions or mood does the image convey?
- Are there any text, brands, or notable details?
- What's the overall aesthetic and vibe?

STEP 2: MATCH THE MOOD
Target mood: ${mood}

STEP 3: CREATE CAPTIONS
Generate exactly 3 COMPLETELY UNIQUE and different captions that:

✅ MUST directly reference what you see in the image (colors, objects, people, setting, etc.)
✅ MUST match the specified mood/tone perfectly
✅ MUST be engaging and shareable for TikTok, Instagram, and Snapchat
✅ MUST include relevant emojis (2-4 per caption)
✅ MUST include trending hashtags (3-5 per caption)
✅ MUST be concise (under 150 characters each)
✅ MUST feel authentic and relatable to Gen Z

CRITICAL VARIETY REQUIREMENTS:
Each caption must be COMPLETELY DIFFERENT from the others:

- Caption 1: Focus on VISUAL STORYTELLING and composition
  * Describe what you see in detail
  * Use descriptive language about colors, lighting, style
  * Example: "The way the golden light hits those mountains is pure magic 🏔️✨"

- Caption 2: Focus on EMOTIONAL CONNECTION and personal experience
  * Make it relatable and emotional
  * Use feeling-based language
  * Example: "This view hits different when you're actually there 🥺💫"

- Caption 3: Focus on LIFESTYLE and ASPIRATIONAL content
  * Make it about the lifestyle or goals
  * Use motivational or trendy language
  * Example: "Living that mountain life because why settle for ordinary? 🚀💪"

AVOID REPETITION:
- NO similar opening phrases
- NO similar sentence structures
- NO similar emotional tones
- NO similar hashtag patterns
- NO similar overall message

Return exactly 3 captions in an array format.`;

      console.log('🎯 Using main site system instruction for REAL image analysis');
      console.log('📸 Image URL:', imageUrl);
      console.log('😊 Target mood:', mood);
      console.log('👤 Username:', username);
      
      // Download and process the image
      const imageData = await this.downloadImage(imageUrl);
      
      // Generate captions using Gemini Pro Vision
      const result = await model.generateContent([
        systemInstruction,
        imageData
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Gemini AI Response:', text);
      
      // Parse the response to extract captions
      const captions = this.parseCaptionsFromResponse(text, mood, username);
      
      if (captions.length >= 3) {
        console.log('✅ Real AI captions generated based on image content!');
        console.log('📝 Captions:', captions);
        return captions;
      } else {
        console.log('⚠️ Failed to parse AI response, using enhanced templates');
        console.log('🔍 AI Response length:', text.length);
        console.log('🔍 Parsed captions count:', captions.length);
        console.log('🔍 Raw AI response preview:', text.substring(0, 200) + '...');
        return this.generateEnhancedTemplates(mood, username);
      }
      
    } catch (error) {
      console.error('❌ Real image analysis failed, using enhanced templates:', error);
      return this.generateEnhancedTemplates(mood, username);
    }
  }

  // Download image from URL for Gemini API
  private async downloadImage(imageUrl: string): Promise<any> {
    try {
      console.log('📥 Downloading image for Gemini analysis...');
      
      // For Discord CDN URLs, we need to handle them properly
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Create image data for Gemini
      const imageData = {
        inlineData: {
          data: Buffer.from(uint8Array).toString('base64'),
          mimeType: 'image/png' // Default to PNG, could be enhanced to detect type
        }
      };
      
      console.log('✅ Image downloaded and processed for Gemini');
      return imageData;
      
    } catch (error) {
      console.error('❌ Failed to download image:', error);
      throw new Error('Image download failed');
    }
  }

  // Parse captions from Gemini AI response
  private parseCaptionsFromResponse(response: string, mood: string, username: string): string[] {
    try {
      console.log('🔍 Parsing AI response for captions...');
      
      // Look for the actual captions section
      const captionSection = response.split('**STEP 3: CAPTIONS**')[1];
      if (!captionSection) {
        console.log('⚠️ No "**STEP 3: CAPTIONS**" section found');
        console.log('🔍 Response preview:', response.substring(0, 500) + '...');
        console.log('🔍 Looking for alternative sections...');
        
        // Try alternative section names
        const altSections = ['STEP 3: CAPTIONS', 'CAPTIONS:', 'GENERATE CAPTIONS:', 'CREATE CAPTIONS:'];
        for (const section of altSections) {
          const altSection = response.split(section)[1];
          if (altSection) {
            console.log(`✅ Found alternative section: ${section}`);
            return this.parseFromSection(altSection, mood, username);
          }
        }
        
              console.log('❌ No caption sections found, trying to parse entire response');
      return this.parseFromSection(response, mood, username);
    }
    
        console.log('📝 Found captions section, extracting...');
    return this.parseFromSection(captionSection, mood, username);
    
  } catch (error) {
    console.error('❌ Error in generateWithRealImageAnalysis:', error);
    return this.generateEnhancedTemplates(mood, username);
  }
}

  // Generate enhanced templates as fallback with maximum variety
  private generateEnhancedTemplates(mood: string, username: string): string[] {
    console.log('🔄 Using ENHANCED templates (AI analysis failed)');
    console.log('🎯 Mood:', mood);
    console.log('👤 Username:', username);
    
    const moodEmoji = this.getMoodEmoji(mood);
    const moodName = mood.replace(/[^a-zA-Z\s]/g, '').trim();
    
    // Create 3 completely different caption styles for maximum variety
    const systemInstructionCaptions = [
      // Caption 1: Visual storytelling focus
      `📸 ${moodEmoji} The way this ${moodName} scene unfolds is pure visual poetry. Every element, from the lighting to the composition, tells its own story. #${moodName.replace(/\s+/g, '')} #VisualPoetry #Storytelling #${username}`,
      
      // Caption 2: Emotional connection focus
      `💫 ${moodEmoji} There's something about ${moodName} that hits you right in the feels. This moment captures that energy perfectly. #${moodName.replace(/\s+/g, '')} #Feels #Moment #${username}`,
      
      // Caption 3: Lifestyle and aspiration focus
      `🚀 ${moodEmoji} This is what living the ${moodName} dream looks like. No filters, no faking - just pure authentic vibes. #${moodName.replace(/\s+/g, '')} #DreamLife #Authentic #${username}`
    ];
    
    console.log('📝 Generated enhanced templates:', systemInstructionCaptions);
    return systemInstructionCaptions;
  }

  // Get emoji for mood (same as main site)
  private getMoodEmoji(mood: string): string {
    const moodLower = mood.toLowerCase();
    
    if (moodLower.includes('fun') || moodLower.includes('playful')) return '😜';
    if (moodLower.includes('creative') || moodLower.includes('artistic')) return '🎭';
    if (moodLower.includes('professional') || moodLower.includes('business')) return '💼';
    if (moodLower.includes('romantic') || moodLower.includes('emotional')) return '❤️';
    if (moodLower.includes('tech') || moodLower.includes('modern')) return '🤖';
    if (moodLower.includes('travel') || moodLower.includes('adventure')) return '🌍';
    if (moodLower.includes('food') || moodLower.includes('lifestyle')) return '🍔';
    if (moodLower.includes('music') || moodLower.includes('entertainment')) return '🎵';
    if (moodLower.includes('fitness') || moodLower.includes('health')) return '🏃‍♂️';
    if (moodLower.includes('fashion') || moodLower.includes('style')) return '🎨';
    if (moodLower.includes('home') || moodLower.includes('interior')) return '🏠';
    if (moodLower.includes('pet') || moodLower.includes('animal')) return '🐾';
    if (moodLower.includes('nature') || moodLower.includes('environment')) return '🌱';
    if (moodLower.includes('gaming') || moodLower.includes('entertainment')) return '🎮';
    if (moodLower.includes('education') || moodLower.includes('learning')) return '📚';
    if (moodLower.includes('party') || moodLower.includes('celebration')) return '🎪';
    if (moodLower.includes('wellness') || moodLower.includes('mindfulness')) return '🧘‍♀️';
    if (moodLower.includes('automotive') || moodLower.includes('transport')) return '🚗';
    if (moodLower.includes('architecture') || moodLower.includes('design')) return '🏢';
    if (moodLower.includes('social media') || moodLower.includes('viral')) return '📱';
    if (moodLower.includes('movie') || moodLower.includes('tv')) return '🎬';
    if (moodLower.includes('sports') || moodLower.includes('athletics')) return '🏈';
    if (moodLower.includes('aviation') || moodLower.includes('flight')) return '✈️';
    if (moodLower.includes('marine') || moodLower.includes('ocean')) return '🚢';
    if (moodLower.includes('mountain') || moodLower.includes('hiking')) return '🏔️';
    if (moodLower.includes('beach') || moodLower.includes('summer')) return '🏖️';
    if (moodLower.includes('winter') || moodLower.includes('snow')) return '❄️';
    if (moodLower.includes('autumn') || moodLower.includes('fall')) return '🍂';
    if (moodLower.includes('spring') || moodLower.includes('bloom')) return '🌸';
    if (moodLower.includes('holiday') || moodLower.includes('christmas')) return '🎄';
    if (moodLower.includes('cozy') || moodLower.includes('warm')) return '🕯️';
    if (moodLower.includes('mystical') || moodLower.includes('magical')) return '✨';
    if (moodLower.includes('vintage') || moodLower.includes('retro')) return '📷';
    if (moodLower.includes('modern') || moodLower.includes('futuristic')) return '🚀';
    if (moodLower.includes('minimalist') || moodLower.includes('simple')) return '⚪';
    if (moodLower.includes('bold') || moodLower.includes('strong')) return '💪';
    if (moodLower.includes('elegant') || moodLower.includes('sophisticated')) return '👑';
    if (moodLower.includes('casual') || moodLower.includes('relaxed')) return '😊';
    if (moodLower.includes('formal') || moodLower.includes('professional')) return '🎯';
    if (moodLower.includes('energetic') || moodLower.includes('dynamic')) return '⚡';
    if (moodLower.includes('calm') || moodLower.includes('peaceful')) return '🧘‍♀️';
    if (moodLower.includes('inspirational') || moodLower.includes('motivational')) return '💡';
    if (moodLower.includes('special') || moodLower.includes('unique')) return '🌟';
    if (moodLower.includes('themed') || moodLower.includes('costume')) return '🎭';
    
    return '✨'; // Default emoji
  }

  // Parse captions from a specific section
  private parseFromSection(section: string, mood: string, username: string): string[] {
    try {
      console.log('🔍 Parsing from section...');
      console.log('📝 Section preview:', section.substring(0, 300) + '...');
      
      const captions: string[] = [];
      
      // Look for JSON code blocks first (remove ```json and ```)
      const jsonCodeBlockMatches = section.match(/```(?:json)?\s*\[([^\]]+)\]```/);
      if (jsonCodeBlockMatches && jsonCodeBlockMatches[1]) {
        const jsonContent = jsonCodeBlockMatches[1];
        const captionMatches = jsonContent.match(/"([^"]{20,200})"/g);
        if (captionMatches && captionMatches.length >= 3) {
          for (const match of captionMatches) {
            const caption = match.replace(/"/g, '').trim();
            if (caption.length > 20 && caption.length < 200) {
              captions.push(caption);
            }
          }
          console.log(`✅ Found ${captions.length} JSON code block captions`);
          return captions.slice(0, 3);
        }
      }

      // Look for incomplete JSON code blocks (missing closing ```)
      const incompleteJsonMatches = section.match(/```(?:json)?\s*\[([^\]]+)/);
      if (incompleteJsonMatches && incompleteJsonMatches[1]) {
        const jsonContent = incompleteJsonMatches[1];
        const captionMatches = jsonContent.match(/"([^"]{20,200})"/g);
        if (captionMatches && captionMatches.length >= 3) {
          for (const match of captionMatches) {
            const caption = match.replace(/"/g, '').trim();
            if (caption.length > 20 && caption.length < 200) {
              captions.push(caption);
            }
          }
          console.log(`✅ Found ${captions.length} incomplete JSON code block captions`);
          return captions.slice(0, 3);
        }
      }
      
      // Look for numbered captions with [1], [2], [3] format
      const numberedMatches = section.match(/\[(\d+)\]\s*\*\*([^*]+)\*\*:\s*"([^"]+)"/g);
      if (numberedMatches && numberedMatches.length >= 3) {
        for (const match of numberedMatches) {
          const captionMatch = match.match(/"([^"]+)"/);
          if (captionMatch && captionMatch[1]) {
            const caption = captionMatch[1].trim();
            if (caption.length > 20 && caption.length < 200) {
              captions.push(caption);
            }
          }
        }
        console.log(`✅ Found ${captions.length} numbered captions`);
        return captions.slice(0, 3);
      }
      
      // Look for quoted captions
      const quotedMatches = section.match(/"([^"]{20,200})"/g);
      if (quotedMatches && quotedMatches.length >= 3) {
        for (const match of quotedMatches) {
          const caption = match.replace(/"/g, '');
          if (caption.length > 20 && caption.length < 200) {
            captions.push(caption);
          }
        }
        console.log(`✅ Found ${captions.length} quoted captions`);
        return captions.slice(0, 3);
      }
      
      // Look for lines starting with numbers or bullet points
      const lines = section.split('\n').filter(line => line.trim());
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Look for numbered captions (1., 2., 3., etc.)
        if (/^\d+\./.test(trimmed)) {
          const caption = trimmed.replace(/^\d+\.\s*/, '').trim();
          if (caption.length > 20 && caption.length < 200) {
            captions.push(caption);
          }
        }
        // Look for bullet points
        else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const caption = trimmed.replace(/^[-•]\s*/, '').trim();
          if (caption.length > 20 && caption.length < 200) {
            captions.push(caption);
          }
        }
      }
      
      // If we found captions, return them
      if (captions.length >= 3) {
        console.log(`✅ Parsed ${captions.length} captions from lines`);
        return captions.slice(0, 3);
      }
      
      // Final fallback: look for any text that looks like a caption
      const allText = section.replace(/```/g, '').replace(/\[/g, '').replace(/\]/g, '');
      const words = allText.split(/\s+/);
      const potentialCaptions: string[] = [];
      
      for (let i = 0; i < words.length - 10; i++) {
        const potentialCaption = words.slice(i, i + 15).join(' ').trim();
        if (potentialCaption.length > 30 && potentialCaption.length < 200 && 
            !potentialCaption.includes('STEP') && !potentialCaption.includes('CAPTIONS')) {
          potentialCaptions.push(potentialCaption);
          if (potentialCaptions.length >= 3) break;
        }
      }
      
      if (potentialCaptions.length >= 3) {
        console.log(`✅ Extracted ${potentialCaptions.length} captions using fallback method`);
        return potentialCaptions.slice(0, 3);
      }
      
      console.log('⚠️ Could not parse captions from section');
      return [];
      
    } catch (error) {
      console.error('❌ Error parsing section:', error);
      return [];
    }
  }

  // Generate fallback captions (keep as backup)
  private generateFallbackCaptions(mood: string, username: string): string[] {
    const moodEmoji = this.getMoodEmoji(mood);
    const moodName = mood.replace(/[^a-zA-Z\s]/g, '').trim();
    
    return [
      `Amazing ${moodEmoji} ${moodName} vibes! ✨ #${moodName.replace(/\s+/g, '')} #Vibes #Mood #${username}`,
      `This is giving me major ${moodEmoji} ${moodName} energy! 🔥 #${moodName.replace(/\s+/g, '')} #Energy #Goals #${username}`,
      `Living that ${moodEmoji} ${moodName} life! 💫 #${moodName.replace(/\s+/g, '')} #Lifestyle #Mood #${username}`
    ];
  }
}
