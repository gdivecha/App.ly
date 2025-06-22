require('dotenv').config(); // Load variables from .env

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load all command definitions from the 'commands' folder
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

// Set up REST client with bot token
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy to a specific guild (fast for testing/dev)
(async () => {
  try {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_GUILD_ID || !process.env.DISCORD_TOKEN) {
      throw new Error('❌ Missing DISCORD_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID in .env file');
    }

    console.log(`🔄 Refreshing ${commands.length} application (/) commands...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded application (/) commands including leaderboard.');
  } catch (error) {
    console.error('❌ Failed to reload commands:', error);
  }
})();