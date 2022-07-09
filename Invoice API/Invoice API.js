// API Configuration
const config = {
    secret: "YOUR_API_SECRET", // Secret used to authorize requests
    themeColor: "#0362fc", // Hex color
    domain: "https://domain.ext", // Make sure their is NO TRAILING SLASH
    debugMode: false // If true, will log errors to console
};

// Code stuffs don't touch :]
const bodyParser = require('body-parser');
const express = require("express");
const Discord = require('discord.js');
const defaultConfig = require('../config.json');
module.exports = async function(app, con, client) {
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.json());
    app.post('/extensions/invoiceApi/create', async function (req, res) {
        // Check authorization
        if(req?.body?.secret != config.secret) return res.send('Invalid secret provided in request.');
        // Check if data exists
        if(!req.body) return res.send('You did not include a body in your request.');
        if(!req?.body?.user) return res.send('You did not include a user in your request.');
        if(!req?.body?.title) return res.send('You did not include a title in your request.');
        if(!req?.body?.price) return res.send('You did not include a price in your request.');
        if(!req?.body?.description) return res.send('You did not include a description in your request.');
        if(!req?.body?.username) return res.send('You did not include a username in your request.');
        // Check if user exists
        await con.query(`SELECT * FROM users WHERE userid="${req.body.user}"`, async(err, row) => {
            if(err && config.debugMode) throw err;
            if(!row[0]) return res.send('User Id does not exist in the store database.');
            // Create invoice
            let createdAt = Date.now();
            let arrayThing = `[{"title": "${req?.body?.title}","url": "","description": "${req?.body?.description}","price": "${req?.body?.price}","productId": "","subId": ""}]`;
            arrayThing = arrayThing.replaceAll("'", "");
            let invoicingUsername = await client.users.fetch(req?.body?.user)
            invoicingUsername = invoicingUsername?.tag ?? null;
            await con.query(`INSERT INTO invoices (userId, items, status, due, createdAt, username) VALUES ("${req.body.user}", '${arrayThing}', "Due", "${createdAt}", "${createdAt}", "${invoicingUsername}")`, async (err, row) => {
                if(err && config.debugMode) console.log(err);
                let user = await client.users.fetch(req.body.user);
                if(!user) {
                    if(config.debugMode) console.log('Could not send message to user as they do not exist.');
                    return;
                };
                let embed = new Discord.MessageEmbed()
                .setColor(config.themeColor)
                .setTitle(`📋 Invoice Created`)
                .setDescription(`A new invoice was just sent to your account!\n\n**--- Details ---**\n**○ Title:** ${req?.body?.title}\n**○ Price:** \`${req?.body?.price}\`\n**○ Description:** ${req?.body?.description}\n**○ Creator:** ${req?.body?.username}`)
                .setTimestamp()
                try { embed.setThumbnail(`${config.domain}/assets/logo.png`) } catch(e) {}
                let buttons = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                    .setLabel('View Invoice')
                    .setStyle('LINK')
                    .setURL(`${config.domain}/invoice/${row.insertId}`)
                )
                await user.send({ embeds: [embed], components: [buttons] }).catch(e => {
                    if(config.debugMode) console.log(`We were unable to send a message to user Id ${req?.body?.user}.`, e.stack)
                });
                if(defaultConfig.discordConfig.useDiscordChannelLogs) {
                    let channel = await client.channels.cache.get(defaultConfig.discordConfig.loggingChannelId);
                    if(defaultConfig.discordConfig.useEmbeds && channel) {
                        let logEmbed = new Discord.MessageEmbed()
                        .setColor('#2F3136')
                        .setDescription(`**Create Invoice**:\n[${req?.body?.username}](${config.domain}) has created an invoice [#${row.insertId}](${config.domain}/invoice/${row.insertId})`)
                        .setTimestamp()
                        await channel?.send({ embeds: [logEmbed] }).catch(e => {
                            if(config.debugMode) console.log(`We were unable to send a message to channel Id ${defaultConfig.discordConfig.loggingChannelId}.`, e.stack)
                        });
                    } else if(channel) {
                        await channel?.send({ content: `${req?.body?.username} has created an invoice #${row.insertId}` }).catch(e => {
                            if(config.debugMode) console.log(`We were unable to send a message to channel Id ${defaultConfig.discordConfig.loggingChannelId}.`, e.stack)
                        });
                    } else {
                        if(config.debugMode) console.log(`We were unable to send a message to channel Id ${defaultConfig.discordConfig.loggingChannelId}.`, e.stack)
                    };
                };
                return res.send(`Invoice created successfully. | ${config.domain}/invoice/${row.insertId}`);
            });
        });
    });
};
