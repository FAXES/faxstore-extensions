const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

let ogConfig = require('../config.json')

const config = {
    loggingChannel: '993582388162600990'
}
module.exports = async function(app, con, client, faxstore) { 

    let chan = client.channels.cache.get(config.loggingChannel)
    faxstore.on('releaseCreate', function(storeItem, release, releaseId, staffUser) {
        con.query(`SELECT * FROM sitesettings WHERE id="1"`, async function(err, result) { 
            if (err) throw err;
            
            let embed_color = result[0].themecolor;

            let reDesc;

            if(release.changes.length >= 2000) {
                reDesc = `${release.changes.substring(0, 2000).toString()}`;
            } else {
                reDesc = `${release.changes.toString()}`;
            }
            
            let embed = new MessageEmbed()
            .setColor(embed_color)
            .setAuthor({ name: storeItem.title })
            .setThumbnail(`https://store.shawnengmann.com/${storeItem.featureImage}`)
            .setTitle(`${release.version} - ${release.title}`)
            .setDescription(reDesc)
            .setURL(`${ogConfig.siteInformation.domain}/releases/${releaseId}`)

            let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel(`View Release`)
                    .setStyle("LINK")
                    .setURL(`${ogConfig.siteInformation.domain}/releases/${releaseId}`)
            )

            chan.send({ embeds: [embed], components: [row] });
        })
    });
        
}
