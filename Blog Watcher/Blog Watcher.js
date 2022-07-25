const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

let ogConfig = require('../config.json')

const config = {
    loggingChannel: '993582388162600990'
}
module.exports = async function(app, con, client, faxstore) { 
    
    let chan = client.channels.cache.get(config.loggingChannel)
    faxstore.on('blogpostCreate', function(userId, blogpost) {
        con.query(`SELECT * FROM sitesettings WHERE id="1"`, async function(err, result) { 
            if (err) throw err;
            
            let embed_color = result[0].themecolor;

            let reDesc;

            if(blogpost.blogcontent.length >= 2000) {
                reDesc = `${blogpost.blogcontent.substring(0, 2000).toString()}`;
            } else {
                reDesc = `${blogpost.blogcontent.toString()}`;
            }
            
            let user = client.users.cache.get(userId)
            let embed = new MessageEmbed()
            .setColor(embed_color)
            .setAuthor({ name: `${user.tag}`, iconURL: `https://images.discordapp.net/avatars/${user.id}/${user.avatar}` })
            .setImage(`https://store.shawnengmann.com${blogpost.image}`)
            .setTitle(blogpost.title)
            .setDescription(reDesc)
            .setURL(`${ogConfig.siteInformation.domain}/blog/b/${blogpost.urlId}`)

            let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel(`View Blog`)
                    .setStyle("LINK")
                    .setURL(`${ogConfig.siteInformation.domain}/blog/b/${blogpost.urlId}`)
            )

            chan.send({ embeds: [embed], components: [row] });

            
        })
    });
        
}
