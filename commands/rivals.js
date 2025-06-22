// commands/rivals.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rivals')
    .setDescription('See your closest competitors on the job leaderboard'),

  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.channel;
    const now = new Date();
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
      if (!userStats[userId]) {
        userStats[userId] = 0;
      }
      userStats[userId]++;
    }

    const sorted = Object.entries(userStats)
      .sort((a, b) => b[1] - a[1]);

    const userId = interaction.user.id;
    const index = sorted.findIndex(([id]) => id === userId);

    if (index === -1) {
      await interaction.editReply("You haven't posted any jobs yet to have rivals.");
      return;
    }

    const above = sorted[index - 1];
    const below = sorted[index + 1];
    let reply = `📊 Your current rank: **#${index + 1}** with **${sorted[index][1]}** posts\n\n`;

    if (above) {
      reply += `⬆️ Just above: <@${above[0]}> — ${above[1]} posts\n`;
    } else {
      reply += `👑 You're at the top!\n`;
    }

    if (below) {
      reply += `⬇️ Just below: <@${below[0]}> — ${below[1]} posts`;
    } else {
      reply += `🎉 No one's catching up to you (yet)!`;
    }

    await interaction.editReply(reply);
  }
};
