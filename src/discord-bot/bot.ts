import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { commands } from './handlers/commandHandler';

// Discord bot client
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize commands collection
client.commands = new Collection();

// Load commands
export async function loadCommands() {
  try {
    console.log('🔄 Starting command registration process...');
    
    // Add commands to collection
    commands.forEach(command => {
      client.commands.set(command.data.name, command);
      console.log(`✅ Command added to collection: ${command.data.name}`);
    });

    // Register commands with Discord
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);
    
    const commandsData = commands.map(cmd => cmd.data.toJSON());
    console.log('📝 Commands to register:', commandsData.map(cmd => cmd.name));
    
    const clientId = process.env.DISCORD_CLIENT_ID!;
    console.log('🆔 Client ID:', clientId);
    
    const result = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandsData }
    );
    
    console.log('✅ Slash commands registered successfully with Discord API');
    console.log('📊 Registration result:', result);

  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
    throw error;
  }
}

// Setup interaction handler
export function setupInteractionHandler() {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    console.log('🎯 Command received:', interaction.commandName);
    
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.log('❌ Command not found in collection:', interaction.commandName);
      return;
    }

    try {
      // Defer reply for longer processing
      await interaction.deferReply();
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ Command execution error:', error);
      const reply = '❌ An error occurred while executing this command.';
      
      if (interaction.deferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply({ content: reply, ephemeral: true });
      }
    }
  });

  // Handle button interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('copy_caption_')) {
      try {
        console.log('📋 Copy caption button clicked:', interaction.customId);
        const captionIndex = interaction.customId.split('_')[2];
        console.log('📝 Caption index:', captionIndex);
        
        const embed = interaction.message.embeds[0];
        if (!embed) {
          console.log('❌ No embed found in message');
          await interaction.reply({
            content: '❌ **Error:** Could not find caption data. Please try generating captions again.',
            ephemeral: true
          });
          return;
        }
        
        console.log('📝 Embed fields:', embed.fields?.length || 0);
        
        const captionField = embed.fields?.find(field => field.name.includes(`Caption ${captionIndex}`));
        
        if (captionField) {
          console.log('✅ Found caption field:', captionField.name);
          
          // Clean caption text for easy copying
          const cleanCaption = captionField.value
            .replace(/\*\*/g, '') // Remove bold markers
            .replace(/\n/g, ' ') // Remove line breaks
            .trim();
          
          console.log('📝 Clean caption prepared:', cleanCaption.substring(0, 100) + '...');
          
          await interaction.reply({
            content: `📋 **Caption ${captionIndex} Ready to Copy!**\n\n**Copy this text:**\n\`\`\`\n${cleanCaption}\n\`\`\`\n\n**Instructions:**\n1. Select the text above (between the code blocks)\n2. Right-click and select "Copy"\n3. Or use Ctrl+C (Cmd+C on Mac)\n\n**Note:** Discord bots cannot copy directly to your clipboard due to security restrictions.`,
            ephemeral: true
          });
          
          console.log('✅ Copy caption response sent successfully');
        } else {
          console.log('❌ Caption field not found for index:', captionIndex);
          await interaction.reply({
            content: `❌ **Error:** Could not find Caption ${captionIndex}. Please try generating captions again.`,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('❌ Error in copy caption button:', error);
        await interaction.reply({
          content: '❌ **Error:** Failed to prepare caption for copying. Please try again.',
          ephemeral: true
        });
      }
    } else if (interaction.customId.startsWith('send_current_')) {
      // Handle send to current channel button
      try {
        console.log('📺 Send to current channel button clicked');
        
        const embed = interaction.message.embeds[0];
        if (!embed) {
          console.log('❌ No embed found in message');
          await interaction.reply({
            content: '❌ **Error:** Could not find caption data. Please try generating captions again.',
            ephemeral: true
          });
          return;
        }
        
        if (!embed.fields || embed.fields.length === 0) {
          console.log('❌ No fields found in embed');
          await interaction.reply({
            content: '❌ **Error:** No caption fields found. Please try generating captions again.',
            ephemeral: true
          });
          return;
        }
        
        // Find all caption fields
        const captionFields = embed.fields.filter(field => 
          field.name.includes('Caption') && field.value
        );
        
        console.log('📝 Found caption fields:', captionFields.length);
        
        if (captionFields.length > 0) {
          // Create a clean message with all captions
          const cleanCaptions = captionFields.map(field => {
            const cleanCaption = field.value
              .replace(/\*\*/g, '') // Remove bold markers
              .replace(/\n/g, ' ') // Remove line breaks
              .trim();
            return `**${field.name}:** ${cleanCaption}`;
          }).join('\n\n');
          
          console.log('📝 Clean captions prepared:', cleanCaptions.substring(0, 100) + '...');
          
          await interaction.reply({
            content: `📺 **All Captions Sent to Current Channel!**\n\n${cleanCaptions}`,
            ephemeral: false // Send to channel, not just to user
          });
          
          console.log('✅ Captions sent to current channel successfully');
        } else {
          console.log('❌ No valid caption fields found');
          await interaction.reply({
            content: '❌ **Error:** No valid captions found. Please try generating captions again.',
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('❌ Error in send to current channel button:', error);
        await interaction.reply({
          content: '❌ **Error:** Failed to send captions to channel. Please try again.',
          ephemeral: true
        });
      }
    } else if (interaction.customId.startsWith('select_channel_')) {
      // Handle channel selection button
      try {
        console.log('🎯 Choose channel button clicked');
        
        // Get all available channels in the guild
        const guild = interaction.guild;
        if (!guild) {
          await interaction.reply({
            content: '❌ **Error:** This command can only be used in a server.',
            ephemeral: true
          });
          return;
        }
        
        // Get text channels that the bot can see and send messages to
        const availableChannels = guild.channels.cache
          .filter(channel => 
            channel.type === 0 && // Text channel
            channel.permissionsFor(guild.members.me!)?.has('SendMessages') &&
            channel.permissionsFor(guild.members.me!)?.has('ViewChannel')
          )
          .map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type
          }))
          .slice(0, 25); // Discord limit for select menus
        
        if (availableChannels.length === 0) {
          await interaction.reply({
            content: '❌ **Error:** No available channels found where I can send messages.',
            ephemeral: true
          });
          return;
        }
        
        // Create channel selection message
        const channelList = availableChannels
          .map((channel, index) => `${index + 1}. #${channel.name}`)
          .join('\n');
        
        await interaction.reply({
          content: `🎯 **Choose a Channel to Send Captions:**\n\n${channelList}\n\n**Reply with the channel number (1-${availableChannels.length})**`,
          ephemeral: true
        });
        
        console.log('✅ Channel selection options sent');
        
      } catch (error) {
        console.error('❌ Error in channel selection button:', error);
        await interaction.reply({
          content: '❌ **Error:** Failed to show channel options. Please try again.',
          ephemeral: true
        });
      }
    }
  });
  
  // Handle message interactions for channel selection - SIMPLIFIED VERSION
  client.on('messageCreate', async (message) => {
    // Only respond to messages that are replies
    if (!message.reference || !message.reference.messageId) return;
    
    try {
      console.log('🔍 Message reply detected:', message.content);
      
      // Check if this is a reply to a channel selection message
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
      if (!referencedMessage) {
        console.log('❌ Could not fetch referenced message');
        return;
      }
      
      console.log('🔍 Referenced message author:', referencedMessage.author.id);
      console.log('🔍 Bot user ID:', client.user?.id);
      console.log('🔍 Is bot message:', referencedMessage.author.id === client.user?.id);
      
      if (referencedMessage.author.id !== client.user?.id) {
        console.log('❌ Not a bot message');
        return;
      }
      
      if (referencedMessage.content.includes('Choose a Channel to Send Captions')) {
        console.log('🎯 Channel selection reply received:', message.content);
        
        // Parse the channel number
        const channelNumber = parseInt(message.content.trim());
        if (isNaN(channelNumber) || channelNumber < 1 || channelNumber > 25) {
          await message.reply('❌ **Invalid channel number.** Please reply with a number between 1-25.');
          return;
        }
        
        console.log('📝 Parsed channel number:', channelNumber);
        
        // Get the original embed message from the same channel
        const embedMessage = message.channel.messages.cache.find(msg => 
          msg.embeds.length > 0 && 
          msg.embeds[0].title === '🎨 AI Caption Generation Complete!'
        );
        
        if (!embedMessage) {
          console.log('❌ No embed message found in cache');
          await message.reply('❌ **Error:** Could not find the caption data. Please try generating captions again.');
          return;
        }
        
        console.log('✅ Found embed message');
        
        const embed = embedMessage.embeds[0];
        if (!embed.fields || embed.fields.length === 0) {
          console.log('❌ No fields in embed');
          await message.reply('❌ **Error:** No caption fields found. Please try generating captions again.');
          return;
        }
        
        // Find all caption fields
        const captionFields = embed.fields.filter(field => 
          field.name.includes('Caption') && field.value
        );
        
        console.log('📝 Found caption fields:', captionFields.length);
        
        if (captionFields.length === 0) {
          await message.reply('❌ **Error:** No valid captions found. Please try generating captions again.');
          return;
        }
        
        // Get the selected channel
        const availableChannels = Array.from(message.guild?.channels.cache
          .filter(channel => 
            channel.type === 0 && // Text channel
            channel.permissionsFor(message.guild.members.me!)?.has('SendMessages') &&
            channel.permissionsFor(message.guild.members.me!)?.has('ViewChannel')
          )
          .values())
          .slice(0, 25);
        
        if (!availableChannels || availableChannels.length === 0) {
          await message.reply('❌ **Error:** No available channels found.');
          return;
        }
        
        console.log('📝 Available channels:', availableChannels.length);
        
        const selectedChannel = availableChannels[channelNumber - 1];
        if (!selectedChannel) {
          await message.reply('❌ **Error:** Invalid channel selection.');
          return;
        }
        
        console.log('✅ Selected channel:', selectedChannel.name);
        
        // Create clean captions
        const cleanCaptions = captionFields.map(field => {
          const cleanCaption = field.value
            .replace(/\*\*/g, '') // Remove bold markers
            .replace(/\n/g, ' ') // Remove line breaks
            .trim();
          return `**${field.name}:** ${cleanCaption}`;
        }).join('\n\n');
        
        // Send to selected channel
        const targetChannel = message.guild?.channels.cache.get(selectedChannel.id);
        if (targetChannel && targetChannel.type === 0) { // Text channel
          try {
            await targetChannel.send(`🚀 **Captions from ${message.author.username}:**\n\n${cleanCaptions}`);
            console.log(`✅ Captions sent to channel #${selectedChannel.name}`);
            
            await message.reply(`✅ **Captions sent to #${selectedChannel.name} successfully!**`);
          } catch (sendError) {
            console.error('❌ Error sending to target channel:', sendError);
            await message.reply(`❌ **Error:** Could not send to #${selectedChannel.name}. Check bot permissions.`);
          }
        } else {
          await message.reply('❌ **Error:** Could not send to selected channel.');
        }
        
      }
    } catch (error) {
      console.error('❌ Error processing channel selection:', error);
      await message.reply('❌ **Error:** Failed to process channel selection. Please try again.');
    }
  });

  // Handle general conversation and questions
  client.on('messageCreate', async (message) => {
    // Ignore bot messages and messages without content
    if (message.author.bot || !message.content) return;
    
    const content = message.content.toLowerCase().trim();
    
    try {
      // Capsera AI Information
      if (content.includes('what is capsera') || content.includes('what is this ai') || content.includes('tell me about capsera')) {
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '🤖 **What is Capsera AI?**',
            description: `**Capsera** is an advanced AI-powered social media caption generator that creates viral, engaging captions for your images!`,
            fields: [
              {
                name: '🎯 **What it does**',
                value: 'Analyzes your images and generates 3 unique, creative captions tailored to your chosen mood and style.',
                inline: false
              },
              {
                name: '🚀 **Features**',
                value: '• AI-powered image analysis\n• 46 different mood options\n• Viral caption generation\n• Social media optimized\n• Multiple output formats',
                inline: false
              },
              {
                name: '💡 **How to use**',
                value: 'Use `/caption` or `/caption-seasonal` commands with an image and mood selection!',
                inline: false
              }
            ],
            footer: { text: 'Powered by Gemini AI • Created for Gen Z creators' }
          }]
        });
        return;
      }
      
      // How to use the bot
      if (content.includes('how to use') || content.includes('how do i use') || content.includes('commands') || content.includes('help')) {
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '📚 **How to Use Capsera Bot**',
            description: `Here's how to get started with AI caption generation!`,
            fields: [
              {
                name: '📸 **Step 1: Upload Image**',
                value: 'Use `/caption` or `/caption-seasonal` and attach your image',
                inline: false
              },
              {
                name: '😊 **Step 2: Choose Mood**',
                value: 'Select from 46 different moods (Fun, Professional, Romantic, etc.)',
                inline: false
              },
              {
                name: '🎨 **Step 3: Get Captions**',
                value: 'AI analyzes your image and generates 3 unique captions',
                inline: false
              },
              {
                name: '📋 **Available Commands**',
                value: '• `/caption` - 25 core moods\n• `/caption-seasonal` - 21 seasonal/other moods',
                inline: false
              }
            ],
            footer: { text: 'Try it now with /caption!' }
          }]
        });
        return;
      }
      
      // Mood options explanation
      if (content.includes('mood') || content.includes('moods') || content.includes('what moods')) {
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '😊 **Available Moods**',
            description: `Capsera offers **46 different moods** to match your content style!`,
            fields: [
              {
                name: '🎯 **Core Moods (25)**',
                value: 'Fun, Professional, Romantic, Adventure, Fitness, Food, Travel, Fashion, Business, Creative, and more!',
                inline: false
              },
              {
                name: '🌍 **Seasonal/Other (21)**',
                value: 'Holiday, Summer, Winter, Motivational, Inspirational, Humorous, and special occasion moods!',
                inline: false
              },
              {
                name: '💡 **Pro Tip**',
                value: 'Choose a mood that matches your image content and target audience for best results!',
                inline: false
              }
            ],
            footer: { text: 'Use /caption or /caption-seasonal to see all options!' }
          }]
        });
        return;
      }
      
      // AI technology questions
      if (content.includes('how does it work') || content.includes('ai technology') || content.includes('gemini')) {
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '🧠 **How Capsera AI Works**',
            description: `**Advanced AI technology** powers your caption generation!`,
            fields: [
              {
                name: '🔍 **Image Analysis**',
                value: 'Uses Google Gemini AI to analyze your image content, colors, composition, and context',
                inline: false
              },
              {
                name: '🎭 **Mood Matching**',
                value: 'AI understands your selected mood and tailors captions to match that emotional tone',
                inline: false
              },
              {
                name: '✍️ **Caption Generation**',
                value: 'Creates 3 unique captions using advanced language models trained on viral social media content',
                inline: false
              },
              {
                name: '🚀 **Technology**',
                value: 'Powered by Gemini 2.0 Flash, the latest AI model from Google',
                inline: false
              }
            ],
            footer: { text: 'State-of-the-art AI for maximum creativity!' }
          }]
        });
        return;
      }
      
      // Backstory and creator info
      if (content.includes('who made') || content.includes('creator') || content.includes('backstory') || content.includes('story')) {
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '👨‍💻 **About Capsera**',
            description: `**The story behind your AI caption generator!**`,
            fields: [
              {
                name: '🎯 **Mission**',
                value: 'To help creators generate engaging, viral social media content using cutting-edge AI technology',
                inline: false
              },
              {
                name: '🚀 **Vision**',
                value: 'Democratize AI-powered content creation for everyone, especially Gen Z creators',
                inline: false
              },
              {
                name: '💡 **Why Discord?**',
                value: 'Bringing AI caption generation directly to where creators collaborate and share ideas',
                inline: false
              },
              {
                name: '🌟 **Future**',
                value: 'More AI features, better caption quality, and expanded social media platforms',
                inline: false
              }
            ],
            footer: { text: 'Built with ❤️ for the creator community' }
          }]
        });
        return;
      }
      
      // General AI questions
      if (content.includes('what is ai') || content.includes('artificial intelligence') || content.includes('machine learning')) {
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '🤖 **What is Artificial Intelligence?**',
            description: `**AI** is technology that enables computers to perform tasks that typically require human intelligence.`,
            fields: [
              {
                name: '🧠 **What AI Does**',
                value: '• Understands and processes language\n• Analyzes images and patterns\n• Learns from data\n• Makes predictions and decisions',
                inline: false
              },
              {
                name: '🎯 **In Capsera**',
                value: 'AI analyzes your images, understands your mood preferences, and generates creative captions that humans would write',
                inline: false
              },
              {
                name: '💡 **Real-World Use**',
                value: 'AI is used in social media, healthcare, finance, entertainment, and many other industries',
                inline: false
              }
            ],
            footer: { text: 'AI is the future of creative tools!' }
          }]
        });
        return;
      }
      
      // Fun facts and trivia
      if (content.includes('fun fact') || content.includes('trivia') || content.includes('interesting')) {
        const funFacts = [
          '🎨 **Capsera can analyze over 1000+ image types** - from food photos to travel landscapes!',
          '🚀 **AI generates captions in under 3 seconds** - faster than most humans can write!',
          '😊 **46 mood options** means there\'s a perfect style for every type of content!',
          '🌍 **Works with images from any country** - AI understands global visual content!',
          '💡 **Each caption is unique** - AI never repeats the same caption twice!',
          '📱 **Optimized for all social platforms** - Instagram, TikTok, Twitter, and more!'
        ];
        
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: '🎉 **Fun Fact About Capsera!**',
            description: randomFact,
            footer: { text: 'Ask for more fun facts anytime!' }
          }]
        });
        return;
      }
      
      // Greeting responses
      if (content.includes('hello') || content.includes('hi') || content.includes('hey') || content.includes('sup')) {
        const greetings = [
          '👋 **Hello there!** Ready to create some amazing captions?',
          '🤖 **Hi!** I\'m Capsera AI - your caption generation assistant!',
          '🎨 **Hey!** Let\'s make your images go viral with AI captions!',
          '🚀 **Sup!** Ready to generate some creative content?'
        ];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        await message.reply({
          embeds: [{
            color: 0x8B5CF6,
            title: randomGreeting,
            description: `Use **/caption** or **/caption-seasonal** to get started!`,
            footer: { text: 'Ask me anything about Capsera!' }
          }]
        });
        return;
      }
      
    } catch (error) {
      console.error('❌ Error in conversation handler:', error);
      // Don't reply on error to avoid spam
    }
  });
}

// Start bot
export async function startBot() {
  try {
    // Load commands
    await loadCommands();
    
    // Setup interaction handler
    setupInteractionHandler();
    
    // Login
    await client.login(process.env.DISCORD_BOT_TOKEN);
    
    console.log('✅ Discord bot setup complete!');
    
  } catch (error) {
    console.error('❌ Failed to start Discord bot:', error);
    process.exit(1);
  }
}
