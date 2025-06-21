const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('postjob')
    .setDescription('Post a new job opportunity')
    .addStringOption(option => option.setName('position').setDescription('Job title').setRequired(true))
    .addStringOption(option => option.setName('company').setDescription('Company name').setRequired(true))
    .addStringOption(option => option.setName('type').setDescription('Employment type').setRequired(true))
    .addStringOption(option => option.setName('location').setDescription('Job location').setRequired(true))
    .addStringOption(option => option.setName('link').setDescription('Job application link').setRequired(true))
    .addStringOption(option => option.setName('jobid').setDescription('Job ID'))
    .addStringOption(option => option.setName('numberapplied').setDescription('Number applied'))
    .addStringOption(option => option.setName('term').setDescription('Job term'))
    .addStringOption(option => option.setName('duration').setDescription('Duration in months'))
    .addStringOption(option => option.setName('salary').setDescription('Salary')),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('jobDescriptionModal')
      .setTitle('Enter Job Description');

    const descriptionInput = new TextInputBuilder()
      .setCustomId('jobdescription')
      .setLabel('Job Description')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(descriptionInput);
    modal.addComponents(row);

    // Temporarily store values in interaction for use after modal submit
    interaction.client.tempJobData = {
      userId: interaction.user.id,
      timestamp: Math.floor(Date.now() / 1000),
      values: {
        position: interaction.options.getString('position'),
        company: interaction.options.getString('company'),
        type: interaction.options.getString('type'),
        location: interaction.options.getString('location'),
        link: interaction.options.getString('link'),
        jobId: interaction.options.getString('jobid') || 'N/A',
        numberApplied: interaction.options.getString('numberapplied') || 'N/A',
        term: interaction.options.getString('term') || 'N/A',
        duration: interaction.options.getString('duration') || 'N/A',
        salary: interaction.options.getString('salary') || 'N/A'
      }
    };

    await interaction.showModal(modal);
  }
};
