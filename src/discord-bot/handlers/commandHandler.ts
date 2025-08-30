import { Client, CommandInteraction, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { DiscordCaptionGenerator } from '../ai/discord-caption-generator';
import { DiscordCaption } from '../database/DiscordCaption';
import { discordRateLimiter } from '../utils/discord-rate-limiter';
import DiscordCloudinary from '../config/cloudinary';
import IDGenerator from '../utils/id-generator';

// Extend Discord.js Client interface
declare module 'discord.js' {
  interface Client {
    commands: Map<string, Command>;
  }
}

// Command interface
interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: any) => Promise<void>;
}

// Function to save Discord-specific caption data
async function saveDiscordCaption(data: {
  imageId: string;
  discordUserId: string;
  discordUsername: string;
  mood: string;
  imageName: string;
  captions: string[];
  imageUrl: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  cloudinaryFolder: string;
  guildId?: string;
  channelId?: string;
}) {
  try {
    const captionSet = new DiscordCaption({
      imageId: data.imageId,
      discordUserId: data.discordUserId,
      discordUsername: data.discordUsername,
      imageUrl: data.imageUrl,
      cloudinaryUrl: data.cloudinaryUrl,
      cloudinaryPublicId: data.cloudinaryPublicId,
      cloudinaryFolder: data.cloudinaryFolder,
      imageName: data.imageName,
      mood: data.mood,
      captions: data.captions,
      guildId: data.guildId,
      channelId: data.channelId
    });

    await captionSet.save();
    console.log('✅ Discord caption saved to database successfully');
    console.log('🆔 Image ID:', data.imageId);
    console.log('📁 Cloudinary folder:', data.cloudinaryFolder);
    console.log('🆔 Public ID:', data.cloudinaryPublicId);
    return true;
  } catch (error) {
    console.error('❌ Failed to save Discord caption:', error);
    return false;
  }
 }

// Caption command with core mood options (25 max for Discord)
const captionCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('caption')
    .setDescription('Generate AI captions for your image')
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('The image to generate captions for')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('mood')
        .setDescription('Choose the mood for your caption')
        .setRequired(false)
        .addChoices(
          { name: '😜 Fun / Playful', value: '😜 Fun / Playful' },
          { name: '🎭 Creative / Artistic', value: '🎭 Creative / Artistic' },
          { name: '💼 Professional / Business', value: '💼 Professional / Business' },
          { name: '❤️ Romantic / Emotional', value: '❤️ Romantic / Emotional' },
          { name: '🤖 Tech / Modern', value: '🤖 Tech / Modern' },
          { name: '🌍 Travel / Adventure', value: '🌍 Travel / Adventure' },
          { name: '🍔 Food / Lifestyle', value: '🍔 Food / Lifestyle' },
          { name: '🎵 Music / Entertainment', value: '🎵 Music / Entertainment' },
          { name: '🏃‍♂️ Fitness / Health', value: '🏃‍♂️ Fitness / Health' },
          { name: '🎨 Fashion / Style', value: '🎨 Fashion / Style' },
          { name: '🏠 Home / Interior', value: '🏠 Home / Interior' },
          { name: '🐾 Pet / Animal', value: '🐾 Pet / Animal' },
          { name: '🌱 Nature / Environment', value: '🌱 Nature / Environment' },
          { name: '🎮 Gaming / Entertainment', value: '🎮 Gaming / Entertainment' },
          { name: '📚 Education / Learning', value: '📚 Education / Learning' },
          { name: '🎪 Party / Celebration', value: '🎪 Party / Celebration' },
          { name: '🧘‍♀️ Wellness / Mindfulness', value: '🧘‍♀️ Wellness / Mindfulness' },
          { name: '🚗 Automotive / Transport', value: '🚗 Automotive / Transport' },
          { name: '🏢 Architecture / Design', value: '🏢 Architecture / Design' },
          { name: '📱 Social Media / Viral', value: '📱 Social Media / Viral' },
          { name: '🎬 Movie / TV Show', value: '🎬 Movie / TV Show' },
          { name: '🏈 Sports / Athletics', value: '🏈 Sports / Athletics' },
          { name: '✈️ Aviation / Flight', value: '✈️ Aviation / Flight' },
          { name: '🚢 Marine / Ocean', value: '🚢 Marine / Ocean' },
          { name: '🏔️ Mountain / Hiking', value: '🏔️ Mountain / Hiking' }
        )
    ) as SlashCommandBuilder,
  execute: async (interaction: any) => {
    try {
      console.log('🎯 Command received: caption');
      console.log('🎯 Discord Bot: Processing caption request...');
      
      // Get user and image info
      const user = interaction.user;
      const imageAttachment = interaction.options.getAttachment('image');
      const mood = interaction.options.getString('mood') || '😜 Fun / Playful';
      
      console.log('👤 User:', user.username, `(${user.id})`);
      console.log('🖼️ Image:', imageAttachment.name, `(${imageAttachment.size} bytes)`);
      console.log('😊 Mood:', mood);

      // Send simple processing message (like before)
      await interaction.editReply('analyzing your image...');

      // Check rate limit using Discord-specific rate limiter
      const rateLimitCheck = await discordRateLimiter.canMakeRequest(user.id, 25);
      
      if (!rateLimitCheck.allowed) {
        const resetTime = rateLimitCheck.resetTime.toLocaleTimeString();
        await interaction.editReply(`❌ Rate limit exceeded! You've used all 25 requests today. Reset time: ${resetTime}`);
        return;
      }

      console.log(`✅ Rate limit check passed. Remaining: ${rateLimitCheck.remaining}/25`);

      // Generate unique ID for this image processing
      const idGenerator = IDGenerator.getInstance();
      const imageId = idGenerator.generateImageId(imageAttachment.name, user.id);
      console.log('🆔 Generated Image ID:', imageId);

      // Start parallel processing: AI generation + Cloudinary upload
      console.log('🚀 Starting parallel processing...');
      
      let captions: string[];
      let cloudinaryData: any;
      
      try {
        [captions, cloudinaryData] = await Promise.all([
          // Parallel 1: Generate AI captions
          (async () => {
            console.log('🤖 Starting AI caption generation...');
            const discordCaptionGenerator = new DiscordCaptionGenerator();
            const result = await discordCaptionGenerator.generateCaptions(
              imageAttachment.url, // Use Discord URL for AI (faster)
              mood,
              user.username
            );
            console.log('✅ AI captions generated successfully:', result.length);
            return result;
          })(),
          
          // Parallel 2: Upload to Cloudinary
          (async () => {
            console.log('☁️ Starting Cloudinary upload...');
            const cloudinary = DiscordCloudinary.getInstance();
            const result = await cloudinary.uploadImageWithId(
              imageAttachment.url,
              imageId,
              imageAttachment.name,
              user.id
            );
            console.log('✅ Cloudinary upload successful');
            return result;
          })()
        ]);
      } catch (error) {
        console.error('❌ Parallel processing failed:', error);
        await interaction.editReply('❌ Failed to process image. Please try again.');
        return;
      }

      if (!captions || captions.length === 0) {
        await interaction.editReply('❌ Failed to generate captions. Please try again.');
        return;
      }

      // Save to Discord-specific database with unified ID
      await saveDiscordCaption({
        imageId: imageId,
        discordUserId: user.id,
        discordUsername: user.username,
        mood: mood,
        imageName: imageAttachment.name,
        captions: captions,
        imageUrl: imageAttachment.url, // Keep Discord URL for reference
        cloudinaryUrl: cloudinaryData.secureUrl,
        cloudinaryPublicId: cloudinaryData.publicId,
        cloudinaryFolder: cloudinaryData.folder,
        guildId: interaction.guildId,
        channelId: interaction.channelId
      });

      // Create embed with captions - Better design balance
      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle('🎨 AI Caption Generation Complete!')
        .setDescription(`Generated ${captions.length} unique captions for your image!\n\n📋 **How to use:** Click the buttons below to copy each caption, then paste it in your social media posts!`)
        .addFields(
          { name: '📸 Image', value: imageAttachment.name, inline: true },
          { name: '😊 Mood', value: mood, inline: true },
          { name: '👤 User', value: user.username, inline: true }
        )
        .addFields(
          { name: '🆔 Image ID', value: imageId, inline: false },
          { name: '☁️ Cloudinary', value: `📁 ${cloudinaryData.folder}`, inline: false }
        )
        .addFields({
          name: '🚀 Status',
          value: '✅ Ready! You can now copy and use these captions!',
          inline: false
        })
        .setTimestamp()
        .setFooter({ text: `Powered by Capsera AI • Request ${26 - rateLimitCheck.remaining}/25` });

      // Add captions to embed with better formatting and spacing
      captions.forEach((caption, index) => {
        // Clean up caption text (remove any remaining code blocks and formatting)
        let cleanCaption = caption
          .replace(/```(?:json)?\s*\[([^\]]+)\]```/g, '$1') // Remove JSON code blocks
          .replace(/```(?:json)?\s*\[([^\]]+)/g, '$1') // Remove incomplete JSON code blocks
          .replace(/```/g, '') // Remove any remaining code blocks
          .replace(/\[(\d+)\]\s*\*\*([^*]+)\*\*:\s*/, '') // Remove numbered format
          .replace(/javascript/g, '') // Remove javascript label
          .replace(/^\s*\[\s*/, '') // Remove starting [
          .replace(/\s*\]\s*$/, '') // Remove ending ]
          .replace(/^\s*"\s*/, '') // Remove starting quote
          .replace(/\s*"\s*$/, '') // Remove ending quote
          .trim();
        
        // Ensure caption is not empty and has reasonable length
        if (cleanCaption.length < 10) {
          cleanCaption = `Generated caption ${index + 1} for your ${mood} mood! ✨`;
        }
        
        // Add better spacing and formatting for captions - Clean design
        embed.addFields({
          name: `${index + 1}️⃣ Caption ${index + 1}`,
          value: cleanCaption,
          inline: false
        });
      });

      // Create copy buttons with professional styling and proper IDs
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`copy_caption_1_${Date.now()}`)
            .setLabel('Copy Caption 1')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋'),
          new ButtonBuilder()
            .setCustomId(`copy_caption_2_${Date.now()}`)
            .setLabel('Copy Caption 2')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋'),
          new ButtonBuilder()
            .setCustomId(`copy_caption_3_${Date.now()}`)
            .setLabel('Copy Caption 3')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋')
        );

      // Create second row with channel selection buttons
      const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`send_current_${Date.now()}`)
            .setLabel('Send to Current Channel')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📺'),
          new ButtonBuilder()
            .setCustomId(`select_channel_${Date.now()}`)
            .setLabel('Choose Channel')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎯')
        );

      // Send response with both button rows
      await interaction.editReply({
        embeds: [embed],
        components: [row, row2]
      });

      console.log('✅ Discord response sent successfully');
      
      // ✅ DESIGN IMPROVEMENTS COMPLETED:
      // - Reduced bold text for better readability
      // - Better spacing between captions
      // - Professional button styling (Secondary for copy, Success for send)
      // - Clean caption formatting without overwhelming bold text
      // - Enhanced AI system instruction for maximum caption variety
      
      // TODO: Add proper copy button functionality with clipboard API
      // TODO: Consider mood selection UI before generation

    } catch (error) {
      console.error('❌ Caption command error:', error);
      await interaction.editReply('❌ An error occurred while generating captions. Please try again.');
    }
  }
};

// Caption seasonal command with seasonal mood options (21 max for Discord)
const captionSeasonalCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('caption-seasonal')
    .setDescription('Generate AI captions with seasonal/weather moods')
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('The image to generate captions for')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('mood')
        .setDescription('Choose the seasonal mood for your caption')
        .setRequired(false)
        .addChoices(
          { name: '🏖️ Beach / Summer', value: '🏖️ Beach / Summer' },
          { name: '❄️ Winter / Snow', value: '❄️ Winter / Snow' },
          { name: '🍂 Autumn / Fall', value: '🍂 Autumn / Fall' },
          { name: '🌸 Spring / Bloom', value: '🌸 Spring / Bloom' },
          { name: '🎄 Holiday / Christmas', value: '🎄 Holiday / Christmas' },
          { name: '🎉 Celebration / Party', value: '🎉 Celebration / Party' },
          { name: '🕯️ Cozy / Warm', value: '🕯️ Cozy / Warm' },
          { name: '🗺️ Adventure / Explore', value: '🗺️ Adventure / Explore' },
          { name: '✨ Mystical / Magical', value: '✨ Mystical / Magical' },
          { name: '📷 Vintage / Retro', value: '📷 Vintage / Retro' },
          { name: '🚀 Modern / Futuristic', value: '🚀 Modern / Futuristic' },
          { name: '🎨 Artistic / Creative', value: '🎨 Artistic / Creative' },
          { name: '⚪ Minimalist / Simple', value: '⚪ Minimalist / Simple' },
          { name: '💪 Bold / Strong', value: '💪 Bold / Strong' },
          { name: '👑 Elegant / Sophisticated', value: '👑 Elegant / Sophisticated' },
          { name: '😊 Casual / Relaxed', value: '😊 Casual / Relaxed' },
          { name: '🎯 Formal / Professional', value: '🎯 Formal / Professional' },
          { name: '⚡ Energetic / Dynamic', value: '⚡ Energetic / Dynamic' },
          { name: '🧘‍♀️ Calm / Peaceful', value: '🧘‍♀️ Calm / Peaceful' },
          { name: '💡 Inspirational / Motivational', value: '💡 Inspirational / Motivational' },
          { name: '🌟 Special / Unique', value: '🌟 Special / Unique' },
          { name: '🎭 Themed / Costume', value: '🎭 Themed / Costume' }
        )
    ) as SlashCommandBuilder,
  execute: async (interaction: any) => {
    // Reuse the same logic as caption command
    await captionCommand.execute(interaction);
  }
};

// Export commands
export const commands = [captionCommand, captionSeasonalCommand];
