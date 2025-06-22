const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top job posters in the server'),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });
    const filtered = messages.filter(msg =>
      msg.author.bot &&
      msg.content.startsWith('New Job posted by') &&
      msg.embeds.length > 0
    );

    const countByUser = {};
    filtered.forEach(msg => {
      const match = msg.content.match(/<@(\d+)>/);
      if (match) {
        const userId = match[1];
        countByUser[userId] = (countByUser[userId] || 0) + 1;
      }
    });

    const sorted = Object.entries(countByUser).sort((a, b) => b[1] - a[1]);

    let description = '';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, count] = sorted[i];
      const user = await interaction.client.users.fetch(userId).catch(() => null);
      const username = user ? `@${user.username}` : `<@${userId}>`;
      description += `**#${i + 1}** ${username}\n${count} job posting${count > 1 ? 's' : ''}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle('📈 Job Posting Leaderboard')
      .setDescription(description || 'No data yet.')
      .setColor(0x1E90FF);

    await interaction.editReply({ embeds: [embed] });
  },
};