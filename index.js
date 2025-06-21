require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.jobDescriptions = {};

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

      client.cachedPostData = interaction;
      await interaction.showModal(modal);
    }
  }

  else if (interaction.isModalSubmit()) {
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
        .setTitle(position)
        .setDescription([
          `__**Company:**__ ${company}`,
          `__**Employment Type:**__ ${type}`,
          `__**Location:**__ ${location}`,
          `__**Link:**__ ${link}`,
          `__**Job ID:**__ ${jobId}`,
          `__**Applied:**__ ${numberApplied}`,
          `__**Term:**__ ${term}`,
          `__**Duration (Months):**__ ${duration}`,
          `__**Salary:**__ ${salary}`
        ].join('\n'))
        .setColor(0x1E90FF);

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('view_description')
          .setLabel('📄 View Job Description')
          .setStyle(ButtonStyle.Primary)
      );

      client.jobDescriptions[interaction.id] = jobDescription;

      await interaction.reply({
        content: `Posted by <@${data.user.id}> • <t:${Math.floor(Date.now() / 1000)}:F>`,
        embeds: [embed],
        components: [button]
      });
    }
  }

  else if (interaction.isButton() && interaction.customId === 'view_description') {
    const jobDescription = client.jobDescriptions[interaction.message.interaction.id] || 'No description available.';
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📄 Job Description')
          .setDescription(jobDescription)
          .setColor(0x1E90FF)
      ],
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);