const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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

    const message = await interaction.reply({
      content: `New Job posted by <@${interaction.user.id}> • <t:${Math.floor(Date.now() / 1000)}:F>\n✅ *Please react with a check mark if you applied to this job as well.*`,
      embeds: [embed],
      fetchReply: true
    });

    await message.react('✅');
  }
};