require('dotenv').config(); // Load variables from .env

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Prepare all slash commands from the 'commands' folder
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && typeof command.data.toJSON === 'function') {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ Skipped "${file}" – invalid or missing .data`);
  }
}

// Set up REST client with Discord bot token
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy to a specific guild for quick testing
(async () => {
  try {
    const { DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;
    if (!DISCORD_CLIENT_ID || !DISCORD_GUILD_ID || !process.env.DISCORD_TOKEN) {
      throw new Error('❌ Missing DISCORD_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID in .env');
    }

    console.log(`🔄 Refreshing ${commands.length} application (/) commands for guild ${DISCORD_GUILD_ID}...`);

    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded all commands including leaderboard.');
  } catch (error) {
    console.error('❌ Failed to reload commands:', error);
  }
})();
