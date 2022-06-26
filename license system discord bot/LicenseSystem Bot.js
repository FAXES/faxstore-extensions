// This FaxStore extension was created by https://plutosworld.net if you have any suggestions, feel free to ping PlutoTheDev in FAXES Gaming! //
const extension_config = {
    "Allow users to edit their own keys": true,
    "license system domain": "https://license.plutosworld.net"
};


const { Collection, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");const commands = new Collection();const events = new Collection();const buttons = new Collection();const contextMenus = new Collection();const config = require("./config.json");
let characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '0', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_']
module.exports = function(app, connection, client, faxstore) {
    // Events
    client.db = connection;
    Object.keys(module.exports.events).forEach(event => {
        client.on(event, module.exports.events[event].bind(null, client))
        events.set(event, module.exports.events[event]);
    });
    // Commands
    Object.keys(module.exports.commands).forEach(command => {
        commands.set(module.exports.commands[command].info.name, module.exports.commands[command]);
    });
    // Buttons
    Object.keys(module.exports.buttons).forEach(button => {
        buttons.set(button, module.exports.buttons[button]);
    });
};

module.exports.commands = {
    0: {
        info: {
            name: "keys",
            description: "Manage authorization keys.",
            options: [{
                name: "manage",
                description: "Manage key options.",
                type: 2,
                options: [{
                    name: "create",
                    description: "Create a new key.",
                    type: 1,
                    options: [{
                        name: "member",
                        description: "The discord user to link this authorization key to.",
                        type: "USER",
                        required: true
                    }, {
                        name: "product",
                        description: 'The name of the "product" to display this key as.',
                        type: "STRING",
                        required: true
                    }, {
                        name: "ip",
                        description:"The IP allowed to use this authorization key.",
                        type: "STRING",
                        required: false
                    }, {
                        name: "locked",
                        description: "Whether or not this key is IP locked. Default yes.",
                        type: "BOOLEAN",
                        required: false
                    }]
                }, {
                    name: "delete",
                    description: "Delete a key(s).",
                    type: 1,
                    options: [{
                        name: "key",
                        description: "The specific key to delete.",
                        type: "STRING",
                        required: false
                    }, {
                        name: "user",
                        description: "Delete all keys from a specific user.",
                        type: "USER",
                        required: false
                    }, {
                        name: "ip",
                        description: "Delete all keys authorized for a specific IP.",
                        type: "STRING",
                        required: false
                    }, {
                        name: "id",
                        description: "The numerical ID that links to an authorization key.",
                        type: "NUMBER",
                        required: false
                    }]
                }]
            }, {
                name: "edit",
                description: "Edit an authorization key.",
                type: 1,
                options: [{
                    name: "key_id",
                    description: "The authorization key or ID of the authorization key to edit.",
                    type: "STRING",
                    required: true
                }]
            }]
        }
    },
    1: {
        info: {
            name: "view",
            description: "View authorization key(s) stats.",
            options: [{
                name: "key",
                description: "View a specific key.",
                type: 1,
                options: [{
                    name: "key",
                    description: "The specific key to view.",
                    type: "STRING",
                    required: false
                }, {
                    name: "id",
                    description: "The numerical ID that links to an authorization key.",
                    type: "NUMBER",
                    required: false
                }]
            }]
        }
    }
};

module.exports.events = {
    ready: async function(client) {
        if (!client.application) await client.application.fetch();
        let guild = client.guilds.cache.get(config.discordConfig.guildId);
        updateContextMenus(contextMenus, guild)
        for (let command of commands) {
            guild.commands.create(command[1].info).catch(e => { });
        };
    },
    interactionCreate: function(client, interaction) {
        if (interaction.guild.id !== config.discordConfig.guildId) return interaction.reply({ content: "This command is unavailable in this guild.", ephemeral: true });
        client.db.query(`SELECT permType FROM users WHERE userId = '${interaction.member.id}';`, function(err, foundUser) {
            client.db.query(`SELECT * FROM sitesettings;`, function(err, settings) {
                interaction.guild.settings = settings[0];
                interaction.guild.logs = interaction.guild.channels.cache.get(config.discordConfig.loggingChannelId)
                if (interaction.isCommand()) {
                    (!interaction.options._group) ? module.exports[interaction.options._subcommand](client, interaction, foundUser[0]) : module.exports[interaction.options._group][interaction.options._subcommand](client, interaction, foundUser[0]);
                };
                if (interaction.isButton()) {
                    if (interaction.customId.includes("-")) {
                        let name = interaction.customId.split("-")[0];
                        let id = interaction.customId.split("-")[1];
                        if (!module.exports.buttons[name]) return;
                        try { module.exports.buttons[name](client, interaction, id); } catch(e) {};
                    } else {
                        try { module.exports.buttons[interaction.customId](client, interaction); } catch(e) {};
                    }
                }
            });
        });
    }
};

module.exports.manage = {
    create: async function(client, interaction, permUser) {
        if (!permUser?.length && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
        if (permUser.permType < 3 && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
        let user = interaction.options.get("member")?.user;
        if (!user) return interaction.reply({ content: "Invalid user.", ephemeral: true });
        let product = interaction.options.get("product")?.value;
        let ip = interaction.options.get("ip")?.value || "127.0.0.1";
        let locked = interaction.options.get("locked")?.value;
        if (locked == undefined) locked = true;
        let key = await keyGenerator();
        client.db.query(`SELECT * FROM licensesystem WHERE authKey = '${key}';`, function(err, foundExist) {
            client.db.query(`SELECT authKey FROM licensesystem;`, async function(err, foundKeys) {
                if (foundExist?.length) {
                    let array = [];
                    for (let data of foundKeys) {
                        array.push(data.authKey);
                    };
                    key = await keyGenerator();
                    while (array.includes(key)) {
                        key = await keyGenerator();
                    };
                };
                client.db.query(`INSERT INTO licensesystem (userId, productName, productId, authStatus, totalRequests, lastRequest, authIP, authKey, authStatusForced, iplocked, ownedid) VALUES ('${user.id}', '${product}', 0, 1, 0, '', '${ip}', '${key}', 0, ${locked}, 0);`, function(err, goodQuery) {
                    if (!err) {
                        createAuditLog(interaction.member.id, "License Key Created", ` has created [Key #${goodQuery.insertId}](${extension_config["license system domain"]}/view/${goodQuery.insertId})`)
                        return interaction.reply({ content: `License key was generated and inserted! Please have the client check their user page on your license system page. The authKey ID is: ||${goodQuery.insertId}||`, ephemeral: true });
                    };
                });
            });
        });
    }, 
    delete: function(client, interaction, permUser) {
        if (!permUser?.length && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
        if (permUser.permType < 3 && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
        let key = interaction.options.get("key")?.value;
        let user = interaction.options.get("user")?.user;
        let ip = interaction.options.get("ip")?.value;
        let id = interaction.options.get("id")?.value;
        let queries = [];
        if (key) queries.push(`authKey = '${key}'`);
        if (user) queries.push(`userId = '${user.id}'`);
        if (ip) queries.push(`authIP = '${ip}'`);
        if (id) queries.push(`id = ${Number(id)}`);
        let query = ";";
        if (queries.length) query = " WHERE " + queries.join(" AND ") + ";";
        client.db.query(`SELECT * FROM licensesystem${query}`, function(err, foundKeys) {
            if (!foundKeys?.length) return interaction.reply({ content: "No keys were found under the information provided.", ephemeral: true });
            let string = "";
            for (let data of foundKeys) {
                string += `> **${data.id} : ${data.productName}**\n` + "`Key`: ||`" + data.authKey.split("", 30).join("") + "***************`||\n" 
            };
            let embed = new MessageEmbed()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .setColor(interaction.guild.settings.themecolor)
                .setAuthor({ name: "License keys to delete." })
                .setDescription(string)
            interaction.reply({ embeds: [embed], ephemeral: true, components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("deny-delete")
                        .setLabel("Cancel")
                        .setStyle("SUCCESS")
                ).addComponents(
                    new MessageButton()
                        .setCustomId("allow-delete")
                        .setLabel("Confirm")
                        .setStyle("DANGER")
                )
            ]});
            const collector = interaction.channel.createMessageComponentCollector({ filter: click => click.member.id === interaction.member.id, time: 60000 });
            collector.on("collect", async function(click) {
                switch(click.customId) {
                    case "deny-delete":
                        click.update({ components: [
                            new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setCustomId("0000")
                                    .setLabel("Process cancelled.")
                                    .setStyle("SECONDARY")
                                    .setDisabled(true)
                            )
                        ]});
                        collector.stop();
                    break;
                    case "allow-delete":
                        click.update({ components: [
                            new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setCustomId("confirm")
                                    .setLabel("Confirm")
                                    .setStyle("DANGER")
                            ).addComponents(
                                new MessageButton()
                                    .setCustomId("deny-delete")
                                    .setLabel("Cancel")
                                    .setStyle("SUCCESS")
                            )
                        ]});
                    break;
                    case "confirm":
                        click.update({ components: [
                            new MessageActionRow().addComponents(
                                new MessageButton()
                                    .setCustomId("0000")
                                    .setLabel("License Key(s) Deleted")
                                    .setStyle("SECONDARY")
                                    .setDisabled(true)
                            )
                        ]});
                        for (let data of foundKeys) {
                            client.db.query(`DELETE FROM licensesystem WHERE id = ${data.id};`, () => {});
                            createAuditLog(interaction.member.id, "License Key Deleted", ` has deleted Key #${data.id}`)
                        };
                    break;
                };
            });
        });
    }
};
module.exports.edit = function(client, interaction, permUser) {
    let foundKey;
    client.db.query(`SELECT * FROM licensesystem WHERE authKey = '${interaction.options.get("key")?.value}';`, function(err, foundKey1) {
        client.db.query(`SELECT * FROM licensesystem WHERE id = ${Number(interaction.options.get("key")?.value)};`, function(err, foundKey2) {
            if (foundKey1?.length) foundKey = foundKey1;
            if (foundKey2?.length) foundKey = foundKey2;
            if (!foundKey?.length) return interaction.reply({ content: "The provided key was not found.", ephemeral: true });
            if (extension_config["Allow users to edit their own keys"] == true) {
                if (foundKey[0].userId !== interaction.member.id) {
                    if (!permUser?.length && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
                    if (permUser.permType < 3 && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
                }
            } else {
                if (!permUser?.length && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
                if (permUser.permType < 3 && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
            };
            let embed = new MessageEmbed()
                .setFooter({ text: foundKey[0].authKey.split("", 30).join("") + "***************" })
                .setColor(interaction.guild.settings.themecolor)
                .setAuthor({ name: "Authorization key edit" })
                .addFields(
                    {
                        name: "Changeable Info",
                        value: `**IP**: ||${foundKey[0].authIP}||\n**IP Locked**: ${(foundKey[0].iplocked == true) ? "✅" : "❌"}\n**Status**: ${(foundKey[0].authStatus == true) ? "Active" : "Inactive"}\n**Forced Status (locked)**: ${(foundKey[0].authStatusForced == true) ? "Active" : "Inactive"}`
                    }
                )
            let row = [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`changeip-${foundKey[0].id}`)
                        .setLabel("Change IP")
                        .setStyle("SECONDARY")
                ).addComponents(
                    new MessageButton()
                        .setCustomId(`${(foundKey[0].iplocked == true) ? "ipunlock" : "iplock" }-${foundKey[0].id}`)
                        .setLabel(`${(foundKey[0].iplocked == true) ? "Unlock IP" : "Lock IP" }`) 
                        .setStyle(`${(foundKey[0].iplocked == true) ? "DANGER" : "SUCCESS" }`)
                ).addComponents(
                    new MessageButton()
                        .setCustomId(`${(foundKey[0].authStatus == true) ? "statusinactive" : "statusactive" }-${foundKey[0].id}`)
                        .setLabel(`${(foundKey[0].authStatus == true) ? "Status Inactive" : "Status Active" }`) 
                        .setStyle(`${(foundKey[0].authStatus == true) ? "DANGER" : "SUCCESS" }`)
                ).addComponents(
                    new MessageButton()
                        .setCustomId(`${(foundKey[0].authStatusForced == true) ? "fstatusinactive" : "fstatusactive" }-${foundKey[0].id}`)
                        .setLabel(`${(foundKey[0].authStatusForced == true) ? "F Status Inactive" : "F Status Active" }`) 
                        .setStyle(`${(foundKey[0].authStatusForced == true) ? "DANGER" : "SUCCESS" }`)
                ).addComponents(
                    new MessageButton()
                        .setCustomId(`regen-${foundKey[0].id}`)
                        .setLabel("Regen")
                        .setStyle("DANGER")
                )
            ]
            interaction.reply({ embeds: [embed], ephemeral: true, components: row })
        });
    });
};
module.exports.key = function(client, interaction, permUser) {
    if (!permUser?.length && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
    if (permUser.permType < 3 && interaction.member.id !== config.siteInformation.ownerId) return interaction.reply({ content: "Missing site permissions to manage license keys." });
    let id = interaction.options.get("id")?.value;
    let key = interaction.options.get("key")?.value;
    let query = ";";
    let queries = [];
    if (id) queries.push(`id = ${Number(id)}`);
    if (key) queries.push(`authKey = ${key}`);
    if (queries.length) query = " WHERE " + queries.join(" AND ") + ";";
    if (!queries?.length) return interaction.reply({ content: "Please provide an authorization key or ID.", ephemeral: true });
    client.db.query(`SELECT * FROM licensesystem${query}`, function(err, foundKeys) {
        if (!foundKeys?.length) return interaction.reply({ content: "No authorization keys were found under the information provided.", ephemeral: true });
        client.db.query(`SELECT * FROM users WHERE userId = '${foundKeys[0].userId}';`, async function(err, foundUser) {
            let user;
            if (foundUser?.length) {
                user = `[${foundUser[0].username}](${config.siteInformation.domain}/user/${foundUser[0].userId})`;
            } else user = await client.users.fetch(foundKeys[0].userId) || foundKeys[0].userId;
            let time = `<t:${String((Number(foundKeys[0].lastRequest) / 1000)).split(".")[0]}:R>`
            let embed = new MessageEmbed()
                .setFooter({ text: foundKeys[0].authKey.split("", 30).join("") + "***************" })
                .setColor(interaction.guild.settings.themecolor)
                .setAuthor({ name: "Authorization key info" })
                .setDescription("`Product`: " + `${foundKeys[0].productName}\n` + "`Owner`: " + `${user}\n` + "`Last Request`: " + time + "\n`Authorized IP`: " + `${foundKeys[0].authIP}\n`)
            interaction.reply({ embeds: [embed], ephemeral: true });
        });
    });
}

module.exports.buttons = {
    changeip: async function(client, interaction, id) {
        let backup = interaction.message.components;
        let button = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("0000")
                .setLabel("What is the IP you'd like to authorize for this authorization key?")
                .setStyle("PRIMARY")
                .setDisabled(true)
        );
        interaction.update({ components: [button] });
        let c = await interaction.channel.awaitMessages({ max: 1, filter: message => message.author.id === interaction.member.id, time: 60000 });
        if (!c?.first()) return;
        c?.first()?.delete();
        update(client, "authIP", `'${c.first()?.content}'`, Number(id));
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[0] = `**IP**: ||${c.first()?.content}||`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.editReply({ embeds: [embed], components: backup });
        createAuditLog(interaction.member.id, "License Key IP Update", ` has updated the ip for [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    ipunlock: function(client, interaction, id) {
        let backup = interaction.message.components;
        update(client, "iplocked", 0, Number(id));
        backup[0].components[1].style = "SUCCESS";
        backup[0].components[1].label = "Lock IP"
        backup[0].components[1].customId = `iplock-${id}`
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[1] = `**IP Locked**: ❌`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.update({ components: backup, embeds: [embed] });
        createAuditLog(interaction.member.id, "License Key IP Unlocked", ` has IP unlocked [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    iplock: function(client, interaction, id) {
        let backup = interaction.message.components;
        update(client, "iplocked", 1, Number(id));
        backup[0].components[1].style = "DANGER";
        backup[0].components[1].label = "Unlock IP"
        backup[0].components[1].customId = `ipunlock-${id}`
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[1] = `**IP Locked**: ✅`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.update({ components: backup, embeds: [embed] });
        createAuditLog(interaction.member.id, "License Key IP Locked", ` has IP locked [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    statusinactive: function(client, interaction, id) {
        let backup = interaction.message.components;
        update(client, "authStatus", 0, Number(id));
        backup[0].components[2].style = "SUCCESS";
        backup[0].components[2].label = "Status Active"
        backup[0].components[2].customId = `statusactive-${id}`
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[2] = `**Status**: Inactive`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.update({ components: backup, embeds: [embed] });
        createAuditLog(interaction.member.id, "License Key Disabled", ` has disabled [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    statusactive: function(client, interaction, id) {
        let backup = interaction.message.components;
        update(client, "authStatus", 1, Number(id));
        backup[0].components[2].style = "DANGER";
        backup[0].components[2].label = "Status Inactive"
        backup[0].components[2].customId = `statusinactive-${id}`
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[2] = `**Status**: Active`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.update({ components: backup, embeds: [embed] });
        createAuditLog(interaction.member.id, "License Key Enabled", ` has enabled [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    fstatusinactive: function(client, interaction, id) {
        let backup = interaction.message.components;
        update(client, "authStatusForced", 0, Number(id));
        backup[0].components[3].style = "SUCCESS";
        backup[0].components[3].label = "F Status Active";
        backup[0].components[3].customId = `fstatusactive-${id}`
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[3] = `**Forced Status (locked)**: Inactive`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.update({ components: backup, embeds: [embed] });
        createAuditLog(interaction.member.id, "License Key Force Enabled", ` has force enabled [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    fstatusactive: function(client, interaction, id) {
        let backup = interaction.message.components;
        update(client, "authStatusForced", 1, Number(id));
        backup[0].components[3].style = "DANGER";
        backup[0].components[3].label = "F Status Inactive";
        backup[0].components[3].customId = `fstatusinactive-${id}`
        let string = interaction.message.embeds[0].fields[0].value.split("\n");
        string[3] = `**Forced Status (locked)**: Active`;
        let embed = interaction.message.embeds[0];
        embed.fields[0].value = string.join("\n");
        interaction.update({ components: backup, embeds: [embed] });
        createAuditLog(interaction.member.id, "License Key Force Disabled", ` has force disabled [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    },
    regen: async function(client, interaction, id) {
        let key = await keyGenerator();
        client.db.query(`SELECT * FROM licensesystem WHERE authKey = '${key}';`, function(err, foundKey) {
            if (!foundKey?.length) {
                update(client, "authKey", `'${key}'`, Number(id));
                let embed = interaction.message.embeds[0];
                embed.footer.text = key.split("", 30).join("") + "***************"
                return interaction.update({embeds: [embed]});
            };
            client.db.query(`SELECT authKey FROM licensesystem;`, async function(err, foundKeys) {
                let array = [];
                for (let data of foundKeys) {
                    array.push(data.authKey);
                };
                key = await keyGenerator();
                while (array.includes(key)) {
                    key = await keyGenerator();
                };
                update(client, "authKey", `'${key}'`, Number(id));
                let embed = interaction.message.embeds[0];
                embed.footer.text = key.split("", 30).join("") + "***************"
                return interaction.update({embeds: [embed]});
            })
        });
        createAuditLog(interaction.member.id, "License Key Regenerated", ` has regenerated [Key #${id}](${extension_config["license system domain"]}/view/${id})`)
    }
};

module.exports.info = {
    name: "keys",
    description: "Manage authorization keys.",
    options: [{
        name: "manage",
        description: "Manage key options.",
        type: 2,
        options: [{
            name: "create",
            description: "Create a new key.",
            type: 1,
            options: [{
                name: "member",
                description: "The discord user to link this authorization key to.",
                type: "USER",
                required: true
            }, {
                name: "product",
                description: 'The name of the "product" to display this key as.',
                type: "STRING",
                required: true
            }, {
                name: "ip",
                description:"The IP allowed to use this authorization key.",
                type: "STRING",
                required: false
            }, {
                name: "locked",
                description: "Whether or not this key is IP locked. Default yes.",
                type: "BOOLEAN",
                required: false
            }]
        }, {
            name: "delete",
            description: "Delete a key(s).",
            type: 1,
            options: [{
                name: "key",
                description: "The specific key to delete.",
                type: "STRING",
                required: false
            }, {
                name: "user",
                description: "Delete all keys from a specific user.",
                type: "USER",
                required: false
            }, {
                name: "ip",
                description: "Delete all keys authorized for a specific IP.",
                type: "STRING",
                required: false
            }, {
                name: "id",
                description: "The numerical ID that links to an authorization key.",
                type: "NUMBER",
                required: false
            }]
        }]
    }, {
        name: "edit",
        description: "Edit an authorization key.",
        type: 1,
        options: [{
            name: "key_id",
            description: "The authorization key or ID of authorization key to edit.",
            type: "STRING",
            required: true
        }]
    }]
};

let keyGenerator = function() {
    let key = "";
    for (let i = 0; i < 46; i++) {
        key += `${characters[Math.floor(Math.random() * characters.length)]}`;
    };
    return key;
};

let updateContextMenus = function(contextMenus, guild) {
    for (let data of contextMenus) {
        guild.commands.create(data[1].info);
    };
    setTimeout(() => updateContextMenus(contextMenus, guild), 450000);
};

let update = function(client, column, variable, id) {
    client.db.query(`UPDATE licensesystem SET ${column} = ${variable} WHERE id = ${id};`, (err, good) => {if (err) throw err});
};