const express = require("express");
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");

const app = express();

app.get("/", (req, res) => res.send("Bot is running"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server started");
});

const TOKEN = process.env.TOKEN;

// salon où les sanctions sont envoyées
const ID_SALON_SANCTIONS = "1397295383260168297";

// catégorie où créer les tickets
const ID_CATEGORIE_SANCTIONS = "1481709703632257034";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("clientReady", (c) => {
  console.log(`✅ Bot connecté : ${c.user.tag}`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;
  if (message.channel.id !== ID_SALON_SANCTIONS) return;

  const contenu = message.content;

  // récupérer la ligne des agents
  const agentLine = contenu.match(/\*\*Agent\(s\) concerné\(s\)\s*:\*\*(.*)/i);

  if (!agentLine) return;

  const mentions = [...agentLine[1].matchAll(/<@!?(\d+)>/g)];

  if (!mentions.length) return;

  for (const mention of mentions) {

    const agentID = mention[1];

    const membre = await message.guild.members.fetch(agentID).catch(() => null);

    if (!membre) continue;

    const username = membre.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const salon = await message.guild.channels.create({
      name: `sanction-${username}`,
      type: ChannelType.GuildText,
      parent: ID_CATEGORIE_SANCTIONS,

      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: agentID,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    // petite attente pour que les permissions s'appliquent
    await new Promise(resolve => setTimeout(resolve, 1000));

    await salon.send(`
${membre}

📌 **NOTIFICATION SANCTION DISCIPLINAIRE**

${contenu}

📩 **Contestation**

Si vous souhaitez contester cette décision, merci d'ouvrir un **ticket Capitaine** :
https://discord.com/channels/1397295381330661557/1397295383260168299

-# Ce ticket restera ouvert **48h**. Passé ce délai, il est possible qu'il soit supprimé.

---

**Le Corps des gradés**  
Poste de Sandy Shores
`);
  }

});

client.login(TOKEN);