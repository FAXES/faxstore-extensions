const config = require('../config.json');
const axios = require('axios');
const Discord = require('discord.js')

const docsConfig = {
    docsDomain: 'docs.faxes.zone'
}

module.exports = async function(app, connection, bot, faxstore) {
        let commands = [
            {
                name: "docs",
                description: `Search documentation.`,
                options: [
                    {name: "query", description: "Search query", type: "STRING", required: true}
                ]
            }
        ]
        bot.application.commands.create(commands[0], config.discordConfig.guildId).catch(function(err) {console.log(err)});
        bot.on("interactionCreate", async function(interaction) {
            if(interaction.commandName == "docs") {
                let query = interaction.options.get("query")?.value;
                if(query) {
                    let resp = await axios.get(`https://${docsConfig.docsDomain}/api/search?q=${encodeURIComponent(query)}`);
                    let i = 0;
                    if(!resp?.data) return interaction.reply({content: "Search failed.", ephemeral: true}).catch(function(_) {});
                    let num1 = {}
                    let desc = ``;
                    if(resp.data?.length <= 0) {
                        num1.title = 'No results found';
                        num1.link = `https://${docsConfig.docsDomain}`;
                        desc = 'No results where found with your search. Try a different search term.'
                    }
                    resp.data.forEach(e => {
                        i++;if(i > 6) return;
                        if(i==1) {
                            num1.title = e.title;
                            num1.link = `https://${docsConfig.docsDomain}/a/${e.id}`;
                            desc += `> ${e.description.substring(0, 150)}...\n\n**More Results:**\n`
                        } else {
                            desc += `→ __[${e.title}](https://${docsConfig.docsDomain}/a/${e.id})__\n`;
                        }
                    });
                    
                    const embed = new Discord.MessageEmbed()
                    .setColor('#1b4a6f')
                    .setAuthor({ name:`Documentation seach results:`})
                    .setTitle(num1.title)
                    .setURL(num1.link)
                    .setDescription(`${desc}`)
                    .setTimestamp()
                    interaction.reply({embeds: [embed], ephemeral: false}).catch(function(_) {});
                } else {
                    interaction.reply({content: "No search query was supplied.", ephemeral: true}).catch(function(_) {});
                };
            };
    });
};
