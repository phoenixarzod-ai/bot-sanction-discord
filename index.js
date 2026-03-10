const { Client, GatewayIntentBits } = require("discord.js");

// ================= CONFIGURATION =================

const TOKEN = process.env.TOKEN;
const ID_SALON_SANCTIONS = "1397295383260168297";

const ROLES_AUTORISES = [
  "1397295381490176001",
  "1397295381469200616",
  "1397295381469200612"
];

// =================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers
  ]
});

function extraireSection(texte, titre) {
  const regex = new RegExp(
    `${titre}\\s*:\\s*([\\s\\S]+?)(?=\\n[A-ZÉÈA-Za-z\\(]|$)`,
    "i"
  );
  const resultat = texte.match(regex);
  return resultat ? resultat[1].trim() : "Non précisé";
}

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
  if (!contenu.includes("Agent(s) concerné(s)")) return;
  console.log("Section agent détectée");

  const regexMention = /<@!?(\d+)>/g;
  let ids = [];
  let m;

  while ((m = regexMention.exec(contenu)) !== null) {
    ids.push(m[1]);
  }
    ids.push(m[1]);
  }

  if (!ids.length) return;

  const date = new Date().toLocaleDateString("fr-FR");

  for (const id of ids) {
    try {
      const utilisateur = await client.users.fetch(id);

      const messagePrive = `
ℹ️ **Notification disciplinaire**

Bonjour ${utilisateur.username},

Une décision disciplinaire vous concernant a été prise par la hiérarchie.

━━━━━━━━━━━━━━━━━━━
📅 **Date :** ${date}

📄 **Motif(s) :**
${raisons}

⚖️ **Article(s) enfreint(s) :**
${articles}

📝 **Sanction(s) :**
${sanctions}
━━━━━━━━━━━━━━━━━━━

📩 **Procédure de contestation**
Toute contestation doit être effectuée via un ticket Capitaine :
https://discord.com/channels/1397295381330661557/1397295383260168299

Cette décision est applicable immédiatement.

Cordialement,  
**Le Corps des gradés**  
Poste de Sandy Shores
`;

      await utilisateur.send(messagePrive);
      console.log(`📨 Envoyé à ${utilisateur.tag}`);

    } catch {
      console.log(`❌ MP impossible : ${id}`);
    }
  }
});

client.login(TOKEN);