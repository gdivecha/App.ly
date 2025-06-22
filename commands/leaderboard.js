const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('See who has posted the most jobs')
    .addStringOption(option =>
      option.setName('range')
        .setDescription('Time range: "alltime" or "lastweek"')
        .addChoices(
          { name: 'All Time', value: 'alltime' },
          { name: 'Last Week', value: 'lastweek' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const range = interaction.options.getString('range') || 'alltime';
    const now = new Date();
    const startDate = range === 'lastweek'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date('2025-06-20');

    const messages = await channel.messages.fetch({ limit: 100 });
    const filtered = messages.filter(msg =>
      msg.author.bot &&
      msg.content.startsWith('New Job posted by') &&
      msg.embeds.length > 0 &&
      msg.createdAt >= startDate
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

    const sorted = Object.entries(userStats)
      .sort((a, b) => b[1].postCount - a[1].postCount)
      .slice(0, 10);

    const rankEmojis = ['🥇', '🥈', '🥉'];

    const daysInRange = Math.max(
      1,
      Math.ceil((now - startDate) / (1000 * 60 * 60 * 24))
    );

    let description = '';

    for (let i = 0; i < sorted.length; i++) {
      const [userId, stats] = sorted[i];
      const avgReactions = (stats.totalReactions / stats.postCount).toFixed(1);
      const avgPostsPerWeek = ((stats.postCount / daysInRange) * 7).toFixed(1);

      const rankIcon = rankEmojis[i] || `#${i + 1}`;
      description += `${rankIcon} <@${userId}>\n` +
        `${stats.postCount} total job post${stats.postCount !== 1 ? 's' : ''}・` +
        `${stats.totalReactions} reaction${stats.totalReactions !== 1 ? 's' : ''}・` +
        `${avgReactions} Avg Reactions/Post・${avgPostsPerWeek} Avg Posts/Week\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Job Posting Leaderboard')
      .setDescription(description || 'No data available.')
      .setColor(0x00BFFF)
      .setFooter({ text: `Range: ${range === 'lastweek' ? 'Last 7 Days' : 'All Time'}` });

    await interaction.editReply({ embeds: [embed] });
  }
};