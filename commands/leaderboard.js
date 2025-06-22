const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See who has posted the most jobs')
    .addStringOption(option =>
      option.setName('range')
        .setDescription('Time range')
        .addChoices(
          { name: 'All Time', value: 'alltime' },
          { name: 'Last Week', value: 'lastweek' },
          { name: 'Today', value: 'today' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const range = interaction.options.getString('range') || 'alltime';
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messages = await channel.messages.fetch({ limit: 100 });
    const filtered = messages.filter(msg =>
      msg.author.bot &&
      msg.content.startsWith('New Job posted by') &&
      msg.embeds.length > 0 &&
      (range === 'alltime' ||
        (range === 'lastweek' && msg.createdAt >= oneWeekAgo) ||
        (range === 'today' && msg.createdAt >= todayStart))
    );

    const userStats = {};
    for (const msg of filtered.values()) {
      const match = msg.content.match(/<@!?(\d+)>/);
      if (!match) continue;
      const userId = match[1];
      if (!userStats[userId]) {
        userStats[userId] = {
          postCount: 0,
          lastPost: msg.createdAt,
          totalReactions: 0
        };
      }
      userStats[userId].postCount++;
      if (msg.createdAt > userStats[userId].lastPost) {
        userStats[userId].lastPost = msg.createdAt;
      }

      const checkmarkReaction = msg.reactions.cache.get('✅');
      if (checkmarkReaction) {
        try {
          const users = await checkmarkReaction.users.fetch();
          const validUsers = users.filter(u => !u.bot && u.id !== userId);
          userStats[userId].totalReactions += validUsers.size;
        } catch (err) {
          console.error('Reaction fetch error:', err);
        }
      }
    }

    const sorted = Object.entries(userStats).sort((a, b) => b[1].postCount - a[1].postCount);
    if (sorted.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📈 Job Posting Leaderboard')
        .setDescription('No data available for this time range.')
        .setColor(0x1E90FF)
        .setFooter({ text: `Range: ${range === 'lastweek' ? 'Last 7 Days' : range === 'today' ? 'Today' : 'All Time'}` });

      return await interaction.editReply({ embeds: [embed] });
    }

    let description = '';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, stats] = sorted[i];
      const avgReactionsPerPost = stats.postCount > 0
        ? (stats.totalReactions / stats.postCount).toFixed(2)
        : '0.00';
      const days = Math.max(1, (range === 'today' ? 1 : (range === 'lastweek' ? 7 : ((now - stats.lastPost) / (1000 * 60 * 60 * 24)))));
      const avgPostsPerWeek = (stats.postCount / days * 7).toFixed(2);

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      description += `${medal} <@${userId}>\n` +
        `${stats.postCount} total job post${stats.postCount !== 1 ? 's' : ''}・${stats.totalReactions} reaction${stats.totalReactions !== 1 ? 's' : ''}・${avgReactionsPerPost} Avg Reactions/Post・${avgPostsPerWeek} Avg Posts/Week\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Job Posting Leaderboard')
      .setDescription(description)
      .setColor(0x1E90FF)
      .setFooter({ text: `Range: ${range === 'lastweek' ? 'Last 7 Days' : range === 'today' ? 'Today' : 'All Time'}` });

    await interaction.editReply({ embeds: [embed] });
  }
};