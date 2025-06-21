const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('postjob')
    .setDescription('Post a new job opportunity')
    .addStringOption(option =>
      option.setName('position').setDescription('Job title').setRequired(true))
    .addStringOption(option =>
      option.setName('company').setDescription('Company name').setRequired(true))
    .addStringOption(option =>
      option.setName('type').setDescription('Employment type (e.g. Full-time)').setRequired(true))
    .addStringOption(option =>
      option.setName('location').setDescription('Location of the job').setRequired(true))
    .addStringOption(option =>
      option.setName('link').setDescription('Job application URL').setRequired(true))
    .addStringOption(option =>
      option.setName('jobid').setDescription('Job ID').setRequired(false))
    .addStringOption(option =>
      option.setName('numberapplied').setDescription('Number applied').setRequired(false))
    .addStringOption(option =>
      option.setName('term').setDescription('Job term (e.g. Winter 2025)').setRequired(false))
    .addStringOption(option =>
      option.setName('duration').setDescription('Job duration in months').setRequired(false))
    .addStringOption(option =>
      option.setName('salary').setDescription('Salary').setRequired(false)),

  async execute(interaction) {
    const position = interaction.options.getString('position');
    const company = interaction.options.getString('company');
    const type = interaction.options.getString('type');
    const location = interaction.options.getString('location');
    const link = interaction.options.getString('link');
    const jobId = interaction.options.getString('jobid') || 'N/A';
    const numberApplied = interaction.options.getString('numberapplied') || 'N/A';
    const term = interaction.options.getString('term') || 'N/A';
    const duration = interaction.options.getString('duration') || 'N/A';
    const salary = interaction.options.getString('salary') || 'N/A';

    const embed = new EmbedBuilder()
      .setTitle(position)
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

    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:t>`;
    const content = `Posted by <@${interaction.user.id}> • ${timestamp}`;

    await interaction.reply({ content, embeds: [embed] });
  }
};