const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View job application statistics')
    .addUserOption(option =>
      option.setName('user').setDescription('Filter by user (optional)')
    )
    .addStringOption(option =>
      option.setName('startdate').setDescription('Start date (YYYY-MM-DD)')
    )
    .addStringOption(option =>
      option.setName('enddate').setDescription('End date (YYYY-MM-DD)')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const targetUser = interaction.options.getUser('user');
    const startDate = new Date(interaction.options.getString('startdate'));
    const endDate = new Date(interaction.options.getString('enddate'));

    const messages = await channel.messages.fetch({ limit: 100 });
    let filteredMessages = messages.filter(msg => msg.author.bot && msg.embeds.length > 0);

    if (targetUser) {
      filteredMessages = filteredMessages.filter(msg => msg.content.includes(`<@${targetUser.id}>`));
    }

    if (!isNaN(startDate)) {
      filteredMessages = filteredMessages.filter(msg => msg.createdAt >= startDate);
    }

    if (!isNaN(endDate)) {
      filteredMessages = filteredMessages.filter(msg => msg.createdAt <= endDate);
    }

    const count = filteredMessages.size;

    const embed = new EmbedBuilder()
      .setTitle('📊 Job Posting Stats')
      .addFields(
        { name: 'User', value: targetUser ? `<@${targetUser.id}>` : 'All users', inline: true },
        { name: 'Start Date', value: isNaN(startDate) ? 'N/A' : startDate.toDateString(), inline: true },
        { name: 'End Date', value: isNaN(endDate) ? 'N/A' : endDate.toDateString(), inline: true },
        { name: 'Total Jobs Posted', value: count.toString(), inline: true }
      )
      .setColor(0x1E90FF);

    await interaction.editReply({ embeds: [embed] });
  },
};