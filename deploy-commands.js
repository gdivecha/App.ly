require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load all command definitions from /commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && typeof command.data.toJSON === 'function') {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ Skipped "${file}" – invalid or missing .data.toJSON()`);
  }
}

// Deploy the commands to your Discord guild
(async () => {
  const { DISCORD_CLIENT_ID, DISCORD_GUILD_ID, DISCORD_TOKEN } = process.env;

  if (!DISCORD_CLIENT_ID || !DISCORD_GUILD_ID || !DISCORD_TOKEN) {
    console.error('❌ Missing DISCORD_CLIENT_ID, DISCORD_GUILD_ID, or DISCORD_TOKEN in your .env file.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log(`🔁 Deploying ${commands.length} slash command(s) to guild ${DISCORD_GUILD_ID}...`);
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log(`✅ Successfully deployed slash commands: ${commandFiles.map(f => '/' + f.replace('.js', '')).join(', ')}`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
