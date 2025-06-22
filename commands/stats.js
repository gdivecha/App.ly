const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View job application statistics')
    .addUserOption(option =>
      option.setName('user').setDescription('Filter by user (optional)')
    )
    .addStringOption(option =>
      option.setName('startdate').setDescription('Start date (YYYY-MM-DD, optional)')
    )
    .addStringOption(option =>
      option.setName('enddate').setDescription('End date (YYYY-MM-DD, optional)')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const targetUser = interaction.options.getUser('user');
    const startDateStr = interaction.options.getString('startdate');
    const endDateStr = interaction.options.getString('enddate');

    const defaultStartDate = new Date('2023-12-19');
    const startDate = startDateStr ? new Date(startDateStr) : defaultStartDate;
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(new Date().setDate(new Date().getDate() + 1)); // tomorrow

    if (isNaN(startDate) || isNaN(endDate)) {
      return await interaction.editReply('❌ Invalid date format. Please use `YYYY-MM-DD`.');
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    let filteredMessages = messages.filter(
      msg =>
        msg.author.bot &&
        msg.embeds.length > 0 &&
        msg.content.startsWith('New Job posted by')
    );

    if (targetUser) {
      filteredMessages = filteredMessages.filter(msg =>
        msg.content.includes(`<@${targetUser.id}>`)
      );
    }

    filteredMessages = filteredMessages.filter(
      msg => msg.createdAt >= startDate && msg.createdAt <= endDate
    );

    const count = filteredMessages.size;

    const daysBetween = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    );

    const avgPerDay = (count / daysBetween).toFixed(2);
    const avgPerWeek = (avgPerDay * 7).toFixed(2);

    let totalReactions = 0;

    for (const msg of filteredMessages.values()) {
      const checkmarkReaction = msg.reactions.cache.get('✅');
      if (checkmarkReaction) {
        totalReactions += checkmarkReaction.count - 1; // subtract the bot's own ✅
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Job Posting Stats')
      .addFields(
        { name: 'User', value: targetUser ? `<@${targetUser.id}>` : 'All users', inline: true },
        { name: 'Start Date', value: startDate.toDateString(), inline: true },
        { name: 'End Date', value: endDate.toDateString(), inline: true },
        { name: 'Total Jobs Posted', value: count.toString(), inline: true },
        { name: 'Avg Posts per Day', value: avgPerDay, inline: true },
        { name: 'Avg Posts per Week', value: avgPerWeek, inline: true },
        { name: '✅ Reactions (Applied)', value: totalReactions.toString(), inline: true }
      )
      .setColor(0x1E90FF);

    await interaction.editReply({ embeds: [embed] });
  },
};