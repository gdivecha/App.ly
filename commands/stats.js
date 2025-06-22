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

    const defaultStartDate = new Date('2025-06-20');
    const startDate = startDateStr ? new Date(startDateStr) : defaultStartDate;
    const endDate = endDateStr ? new Date(endDateStr) : new Date(new Date().setDate(new Date().getDate() + 1));

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

    const daysBetween = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const avgPerDay = (count / daysBetween).toFixed(2);
    const avgPerWeek = (avgPerDay * 7).toFixed(2);

    let totalReactions = 0;
    const applicantCounts = {};
    const datePostMap = {};

    for (const msg of filteredMessages.values()) {
      const msgDate = msg.createdAt.toISOString().split('T')[0];

      if (!datePostMap[msgDate]) datePostMap[msgDate] = 0;
      datePostMap[msgDate]++;

      const checkmarkReaction = msg.reactions.cache.get('✅');
      if (checkmarkReaction) {
        try {
          const users = await checkmarkReaction.users.fetch();
          const posterMatch = msg.content.match(/<@!?(\d+)>/);
          const posterId = posterMatch ? posterMatch[1] : null;
          const validUsers = users.filter(user => !user.bot && user.id !== posterId);
          totalReactions += validUsers.size;

          validUsers.forEach(user => {
            if (!applicantCounts[user.id]) applicantCounts[user.id] = 0;
            applicantCounts[user.id]++;
          });
        } catch (err) {
          console.error(`Error fetching reaction users: ${err}`);
        }
      }
    }

    // Most Active Applicant
    let mostActiveApplicant = 'N/A';
    let maxApplications = 0;
    for (const [userId, count] of Object.entries(applicantCounts)) {
      if (count > maxApplications) {
        maxApplications = count;
        mostActiveApplicant = `<@${userId}>`;
      }
    }

    // Longest Posting Streak
    const sortedDates = Object.keys(datePostMap).sort();
    let longestStreak = 0, currentStreak = 0, prevDate = null;
    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);
      if (prevDate && (date - prevDate) === 86400000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = date;
    }

    // Most Active Posting Date
    const mostActiveDate = Object.entries(datePostMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const avgReactionsPerPost = count > 0 ? (totalReactions / count).toFixed(2) : '0.00';

    const embed = new EmbedBuilder()
      .setTitle('📊 Job Posting Stats')
      .addFields(
        { name: 'User', value: targetUser ? `<@${targetUser.id}>` : 'All users', inline: true },
        { name: 'Start Date', value: startDate.toDateString(), inline: true },
        { name: 'End Date', value: endDate.toDateString(), inline: true },
        { name: 'Total Jobs Posted', value: count.toString(), inline: true },
        { name: 'Avg Posts/Day', value: avgPerDay, inline: true },
        { name: 'Avg Posts/Week', value: avgPerWeek, inline: true },
        { name: '✅ Reactions (Others Applied)', value: totalReactions.toString(), inline: true },
        { name: 'Avg Reactions/Post', value: avgReactionsPerPost, inline: true },
        { name: 'Most Active Applicant', value: mostActiveApplicant, inline: true },
        { name: 'Longest Posting Streak (Days)', value: longestStreak.toString(), inline: true },
        { name: 'Most Active Posting Date', value: mostActiveDate, inline: true }
      )
      .setColor(0x1E90FF);

    await interaction.editReply({ embeds: [embed] });
  },
};