// commands/rivals.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rivals')
    .setDescription('See your closest competitors on the job leaderboard'),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });

    const filtered = messages.filter(msg =>
      msg.author.bot &&
      msg.content.startsWith('New Job posted by') &&
      msg.embeds.length > 0
    );

    const userStats = {};

    for (const msg of filtered.values()) {
      const match = msg.content.match(/<@!?(\d+)>/);
      if (!match) continue;
      const userId = match[1];
      userStats[userId] = (userStats[userId] || 0) + 1;
    }

    const sorted = Object.entries(userStats).sort((a, b) => b[1] - a[1]);
    const userId = interaction.user.id;
    const index = sorted.findIndex(([id]) => id === userId);

    if (index === -1) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🤖 No Rivals Yet!')
            .setDescription("You haven't posted any jobs yet to have rivals.")
            .setColor(0xFF6347)
        ]
      });
    }

    const above = sorted[index - 1];
    const current = sorted[index];
    const below = sorted[index + 1];

    const embed = new EmbedBuilder()
      .setTitle('🥊 Job Rivals')
      .setColor(0x00AEFF)
      .setDescription(`Your current rank: **#${index + 1}** with **${current[1]}** post${current[1] !== 1 ? 's' : ''}`)
      .addFields(
        above
          ? { name: '⬆️ Just above you', value: `<@${above[0]}> — ${above[1]} post${above[1] !== 1 ? 's' : ''}`, inline: false }
          : { name: '👑 You\'re at the top!', value: 'No one above you!', inline: false },
        below
          ? { name: '⬇️ Just below you', value: `<@${below[0]}> — ${below[1]} post${below[1] !== 1 ? 's' : ''}`, inline: false }
          : { name: '🎉 You\'re untouchable!', value: 'No one is close behind.', inline: false }
      )
      .setFooter({ text: 'Keep posting to stay ahead!' });

    await interaction.editReply({ embeds: [embed] });
  }
};