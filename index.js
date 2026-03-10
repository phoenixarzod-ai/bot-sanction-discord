const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is running"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server started");
});

const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.TOKEN;
const ID_SALON_SANCTIONS = "1397295383260168297";

const ROLES_AUTORISES = [
  "1397295381490176001",
  "1397295381469200616",
  "1397295381469200612"
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("clientReady", () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;
  if (message.channel.id !== ID_SALON_SANCTIONS) return;

  const estGrade = message.member.roles.cache.some(role =>
    ROLES_AUTORISES.includes(role.id)
  );

  if (!estGrade) return;

  const contenu = message.content;

  // Extraction des champs
  const raison = contenu.match(/Raison\(s\)\s*:\s*(.+)/i)?.[1] || "Non précisé";
  const article = contenu.match(/Article\(s\).*:\s*(.+)/i)?.[1] || "Non précisé";
  const sanction = contenu.match(/Sanction\s*:\s*(.+)/i)?.[1] || "Non précisé";

  // Mentions des agents
  const mentions = [...contenu.matchAll(/<@!?(\d+)>/g)];
  if (!mentions.length) return;

  const date = new Date().toLocaleDateString("fr-FR");

  for (const mention of mentions) {

    const id = mention[1];

    try {

      const utilisateur = await client.users.fetch(id);

      const messagePrive = `
ℹ️ **Notification disciplinaire**

Bonjour ${utilisateur.username},

Une décision disciplinaire vous concernant a été prise.

━━━━━━━━━━━━━━━━━━━
📅 **Date :** ${date}

📄 **Raison :**
${raison}

⚖️ **Article enfreint :**
${article}

📝 **Sanction :**
${sanction}
━━━━━━━━━━━━━━━━━━━

📩 **Procédure de contestation**
Toute contestation doit être effectuée via un ticket Capitaine :
https://discord.com/channels/1397295381330661557/1397295383260168299

Cordialement,  
**Le Corps des gradés**  
Poste de Sandy Shores
`;

      await utilisateur.send(messagePrive);

      console.log(`📨 Envoyé à ${utilisateur.tag}`);

    } catch {

      console.log(`❌ MP impossible pour ${id}`);

    }
  }

});

if (!TOKEN) {
  console.error("❌ TOKEN manquant dans les variables d'environnement");
}

client.login(TOKEN);