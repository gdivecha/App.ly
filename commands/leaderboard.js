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
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messages = await channel.messages.fetch({ limit: 100 });
    const filtered = messages.filter(msg =>
      msg.author.bot &&
      msg.content.startsWith('New Job posted by') &&
      msg.embeds.length > 0 &&
      (range === 'alltime' || msg.createdAt >= oneWeekAgo)
    );

    const countByUser = {};
    for (const msg of filtered.values()) {
      const match = msg.content.match(/<@(\d+)>/);
      if (match) {
        const userId = match[1];
        countByUser[userId] = (countByUser[userId] || 0) + 1;
      }
    }

    const sorted = Object.entries(countByUser).sort((a, b) => b[1] - a[1]);

    let description = '';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, count] = sorted[i];
      description += `**#${i + 1}** <@${userId}>\n${count} job posting${count !== 1 ? 's' : ''}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle('📈 Job Posting Leaderboard')
      .setDescription(description || 'No data available.')
      .setColor(0x1E90FF)
      .setFooter({ text: `Range: ${range === 'lastweek' ? 'Last 7 Days' : 'All Time'}` });

    await interaction.editReply({ embeds: [embed] });
  }
};