// commands/leaderboard.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show leaderboard of most job postings'),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });

    const userCounts = {};

    messages.forEach(msg => {
      if (
        msg.author.bot &&
        msg.content.startsWith('New Job posted by') &&
        msg.mentions.users.size > 0
      ) {
        const user = msg.mentions.users.first();
        if (user) {
          userCounts[user.id] = (userCounts[user.id] || 0) + 1;
        }
      }
    });

    const sorted = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.editReply('No job postings found yet.');
    }

    const fields = sorted.map(([userId, count], index) => ({
      name: `#${index + 1} <@${userId}>`,
      value: `${count} job posting${count === 1 ? '' : 's'}`,
      inline: false
    }));

    const embed = new EmbedBuilder()
      .setTitle('📈 Job Posting Leaderboard')
      .addFields(fields)
      .setColor(0x1E90FF);

    await interaction.editReply({ embeds: [embed] });
  }
};