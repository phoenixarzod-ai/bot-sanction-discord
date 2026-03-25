const express = require("express");
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require("discord.js");

const app = express();

// serveur pour Render
app.get("/", (req, res) => res.send("Bot is running"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server started");
});

const TOKEN = process.env.TOKEN;

const ID_SALON_SANCTIONS = "1397295383260168297";
const ID_CATEGORIE_SANCTIONS = "1481709703632257034";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// BOT CONNECTÉ
client.once("clientReady", (c) => {
  console.log(`✅ Bot connecté : ${c.user.tag}`);
});

// DEBUG ERREURS
client.on("error", console.error);
client.on("warn", console.warn);

// MESSAGE
client.on("messageCreate", async (message) => {

  try {

    if (message.author.bot) return;
    if (message.channel.id !== ID_SALON_SANCTIONS) return;

    console.log("📩 Message détecté");

    const contenu = message.content;

    // récupérer ligne agents
    const agentLine = contenu.match(/\*\*Agent\(s\) concerné\(s\)\s*:\*\*(.*)/i);

    if (!agentLine) {
      console.log("❌ Aucun agent trouvé");
      return;
    }

    const mentions = [...agentLine[1].matchAll(/<@!?(\d+)>/g)];

    if (!mentions.length) {
      console.log("❌ Pas de mention");
      return;
    }

    for (const mention of mentions) {

      const agentID = mention[1];

      const membre = await message.guild.members.fetch(agentID).catch(() => null);

      if (!membre) {
        console.log("❌ Membre introuvable");
        continue;
      }

      const username = membre.user.username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      console.log(`📁 Création salon pour ${username}`);

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
          },

          {
            id: client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }

        ]
      });

      console.log("✅ Salon créé");

      // attendre 1 seconde
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

      console.log(`📨 Message envoyé à ${username}`);
    }

  } catch (err) {
    console.error("💥 ERREUR :", err);
  }

});

// LOGIN DISCORD
console.log("Token présent :", !!TOKEN);

if (!TOKEN) {
  console.error("❌ TOKEN MANQUANT");
} else {
  client.login(TOKEN)
    .then(() => console.log("🔑 Connexion Discord en cours..."))
    .catch(err => console.error("❌ Erreur connexion :", err));
}