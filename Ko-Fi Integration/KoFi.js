const config = {
    webhookURL: "", // Your Discord channel webhook URL
    verificationToken: "" // Your Ko-Fi API Advanced Verification Token https://ko-fi.com/manage/webhooks?src=sidemenu
};

const discord = require('discord.js');
const webhook = new discord.WebhookClient({ url: config.webhookURL });
module.exports = async function(app) {
    app.post('/api/kofi', async function(req, res) {
        let data = await JSON.parse(req.body.data);
        if(data.verification_token !== config.verificationToken) return;
        const embed = new discord.MessageEmbed()
        .setColor('#2F3136')
        .setDescription(`**${data.type} Create**:\n[${data.from_name}](${data.url}) just sent you \`${data.amount}\` ${data.currency} on [ko-fi.com](https://ko-fi.com)!\n\n**Message**: ${data.message || 'No message available...'}`)
        .setTimestamp()
        await webhook.send({
            username: 'Ko-Fi Integration',
            embeds: [embed],
        });
    });
};
