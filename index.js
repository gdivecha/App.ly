require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials, Events, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.commands = new Collection();

// Load all commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} is online.`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Show modal for job description
    if (interaction.commandName === 'postjob') {
      const modal = new ModalBuilder()
        .setCustomId('jobDescriptionModal')
        .setTitle('Enter Job Description');

      const descriptionInput = new TextInputBuilder()
        .setCustomId('jobDescriptionInput')
        .setLabel("Job Description")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const firstRow = new ActionRowBuilder().addComponents(descriptionInput);
      modal.addComponents(firstRow);
      await interaction.showModal(modal);

      // Store the original interaction for follow-up (not needed if using ephemeral or database)
      client.cachedPostData = interaction;
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'jobDescriptionModal') {
      const jobDescription = interaction.fields.getTextInputValue('jobDescriptionInput');
      const data = client.cachedPostData;

      const position = data.options.getString('position');
      const company = data.options.getString('company');
      const type = data.options.getString('type');
      const location = data.options.getString('location');
      const link = data.options.getString('link');
      const jobId = data.options.getString('jobid') || 'N/A';
      const numberApplied = data.options.getString('numberapplied') || 'N/A';
      const term = data.options.getString('term') || 'N/A';
      const duration = data.options.getString('duration') || 'N/A';
      const salary = data.options.getString('salary') || 'N/A';

      const embed = new EmbedBuilder()
        .setTitle(`${position}`)
        .setDescription([
          `**Company:** ${company}`,
          `**Type:** ${type}`,
          `**Location:** ${location}`,
          `**Link:** ${link}`,
          `**Job ID:** ${jobId}`,
          `**Applied:** ${numberApplied}`,
          `**Term:** ${term}`,
          `**Duration (Months):** ${duration}`,
          `**Salary:** ${salary}`
        ].join('\n'))
        .setColor(0xFFA500);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('jobDescriptionDropdown')
        .setPlaceholder('View Job Description')
        .addOptions([{
          label: 'Job Description',
          description: jobDescription.substring(0, 100),
          value: 'job_desc',
        }]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: `Posted by <@${data.user.id}> • <t:${Math.floor(Date.now() / 1000)}:t>`,
        embeds: [embed],
        components: [row]
      });
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'jobDescriptionDropdown') {
      await interaction.reply({
        content: `**Job Description:**\n${interaction.message.components[0].components[0].data.options[0].description}`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
