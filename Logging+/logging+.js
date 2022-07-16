const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

 
originalConfig = require('../config.json')
let storeDomain = originalConfig.siteInformation.domain


module.exports = async function (app, connection, bot, faxstore, client) {
  let logchan = bot.channels.cache.get(originalConfig.discordConfig.loggingChannelId);

faxstore.on('login', function (userObject, DbUserResults) {

  const date = Date.now();
 
  const embed = new MessageEmbed()
    .setTitle(`Logged In`)
    .setDescription(`**UserId:** \`${DbUserResults.userId}\``)
    .setTimestamp()


    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('User Account')
        .setStyle('LINK')
        .setURL(`${storeDomain}/user/${DbUserResults.userId}`),

        
    )
  logchan.send({ embeds: [embed], components: [row] })

  faxstore.emit('CreateAuditLog', DbUserResults.userId, 'Logged in', `logged in at <t:${date}>`);
});

faxstore.on('logout', function (userObject) {

    const date = Date.now();

    const embed = new MessageEmbed()
      .setTitle(`Logged Out`)
      .setDescription(`**UserId:** \`${userObject.id}\``)
      .setTimestamp()


    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('User Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed], components: [row] })

    faxstore.emit('CreateAuditLog', userObject.id, 'Logged Out', `logged out at <t:${date}>`);
   
});

faxstore.on('createUserAccount', function (userObject, serviceType) {

  const date = Date.now();

  const embed = new MessageEmbed()
    .setTitle(`New User Account`)
    .setDescription(`**UserId:** \`${userObject.id}\` \n **Login Type:** \`${serviceType}\``)
    .setTimestamp()


  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('User Account')
        .setStyle('LINK')
        .setURL(`${storeDomain}/user/${userObject.id}`),
    )

  logchan.send({ embeds: [embed], components: [row] })

  faxstore.emit('CreateAuditLog', userObject.id, 'New User Account', `Account created at <t:${date}> | Login Type: ${serviceType}`);
});

faxstore.on('onStart', function (licenseKey, siteDomain) {

  const date = Date.now();

  const embed = new MessageEmbed()
    .setTitle(`Faxstore Started`)
    .setDescription(`Faxstore Started`)
    .setTimestamp()


  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('Store Link')
        .setStyle('LINK')
        .setURL(`${siteDomain}`),
    )

  logchan.send({ embeds: [embed], components: [row] })

});

faxstore.on('userAccountDelete', function (staffUserId, userId) {
  const date = Date.now();

  const embed = new MessageEmbed()
    .setTitle(`User Account Delete`)
    .setDescription(`**Staff Member:** <@${staffUserId}> | \`${staffUserId}\` \n **User:** <@${userId}> | \`${userId}\` `)
    .setTimestamp()

  logchan.send({ embeds: [embed] })
});

faxstore.on('userAccountUnban', function (staffUserId, user) {
  const date = Date.now();

  let staffNotes;
  if(user.staffnotes == 'null' ) {
    staffNotes = 'No Staff Notes'
  } else {
    staffNotes = user.staffnotes
  }

  const embed = new MessageEmbed()
    .setTitle(`User Account Unban`)
    .setDescription(`**Staff Member:** <@${staffUserId}> | \`${staffUserId}\` \n **User:** <@${user.userId}> | \`${user.userId}\` \n **User Email:** \`${user.userEmail}\` \n **Staff Notes** \n \`\`\`${staffNotes}\`\`\``)
    .setTimestamp()

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('User Account')
        .setStyle('LINK')
        .setURL(`${storeDomain}/user/${user.userId}`),
    )

  logchan.send({ embeds: [embed], components: [row] })


});

faxstore.on('userAccountBan', function (staffUserId, user) {
    const date = Date.now();

    let staffNotes;
    if (user.staffnotes == 'null') {
      staffNotes = 'No Staff Notes'
    } else {
      staffNotes = user.staffnotes
    }

    const embed = new MessageEmbed()
      .setTitle(`User Account Ban`)
      .setDescription(`**Staff Member:** <@${staffUserId}> | \`${staffUserId}\` \n **User:** <@${user.userId}> | \`${user.userId}\` \n **User Email:** \`${user.userEmail}\` \n **Staff Notes** \n \`\`\`${staffNotes}\`\`\``)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('User Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${user.userId}`),
      )

    logchan.send({ embeds: [embed], components: [row] })


});

faxstore.on('userAccountUndisabled', function (staffUserId, user) {
    const date = Date.now();

    let staffNotes;
    if (user.staffnotes == 'null') {
      staffNotes = 'No Staff Notes'
    } else {
      staffNotes = user.staffnotes
    }

    const embed = new MessageEmbed()
      .setTitle(`User Account Undisabled`)
      .setDescription(`**Staff Member:** <@${staffUserId}> | \`${staffUserId}\` \n **User:** <@${user.userId}> | \`${user.userId}\` \n **User Email:** \`${user.userEmail}\` \n **Staff Notes** \n \`\`\`${staffNotes}\`\`\``)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('User Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${user.userId}`),
      )

    logchan.send({ embeds: [embed], components: [row] })

});

faxstore.on('userAccountDisabled', function (staffUserId, user) {
    const date = Date.now();

    let staffNotes;
    if (user.staffnotes == 'null') {
      staffNotes = 'No Staff Notes'
    } else {
      staffNotes = user.staffnotes
    }

    const embed = new MessageEmbed()
      .setTitle(`User Account Disabled`)
      .setDescription(`**Staff Member:** <@${staffUserId}> | \`${staffUserId}\` \n **User:** <@${user.userId}> | \`${user.userId}\` \n **User Email:** \`${user.userEmail}\` \n **Staff Notes** \n \`\`\`${staffNotes}\`\`\``)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('User Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${user.userId}`),
      )

    logchan.send({ embeds: [embed], components: [row] })

});

faxstore.on('userAccountStaffNoteEdited', function (staffUserId, user) {
    const date = Date.now();

    let staffNotes;
    if (user.staffnotes == 'null') {
      staffNotes = 'No Staff Notes'
    } else {
      staffNotes = user.staffnotes
    }

    const embed = new MessageEmbed()
      .setTitle(`User Note Edited`)
      .setDescription(`**Staff Member:** <@${staffUserId}> | \`${staffUserId}\` \n **User:** <@${user.userId}> | \`${user.userId}\` \n **User Email:** \`${user.userEmail}\` `)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('User Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${user.userId}`),
      )

    logchan.send({ embeds: [embed], components: [row] })

});

faxstore.on('createCheckout', function (userId, cart, total, promoCode, paymentType) {
  const date = Date.now();

  let promo;

  if(promoCode == ' ,') { 
    promo = 'No Promo Code Used'
  } else {
    promo = promoCode
  }

  const embed = new MessageEmbed()
    .setTitle(`Checkout Created`)
    .setDescription(`**User:** <@${userId.id}> | ${userId.id}
    **Total:** \`${total}\`
    **Promocode Used:** \` ${promo}\`
    **Payment Method:** \`${paymentType}\`
    `)
    .setTimestamp()

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('Customer Account')
        .setStyle('LINK')
        .setURL(`${storeDomain}/user/${userId.id}`),
    )

  logchan.send({ embeds: [embed], components: [row] })
});

faxstore.on('checkoutCancel', function (userId) {
    const date = Date.now();


    const embed = new MessageEmbed()
      .setTitle(`Checkout Canceled`)
      .setDescription(`**User:** <@${userId.id}> | ${userId.id}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Customer Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userId.id}`),
      )

    logchan.send({ embeds: [embed], components: [row] })
});

faxstore.on('subscriptionUpdated', function(userId, expiry) {

  const embed = new MessageEmbed()
    .setTitle(`Subscription Create`)
    .setDescription(`**User:** <@${userId.id}> | ${userId.id} \n **Expiry:** ${expiry}`)
    .setTimestamp()

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('Customer Account')
        .setStyle('LINK')
        .setURL(`${storeDomain}/user/${userId.id}`),
    )

  logchan.send({ embeds: [embed], components: [row] })
});

faxstore.on('subscriptionCancelled', function (subscription, userObject) {

    const embed = new MessageEmbed()
      .setTitle(`Subscription Canceled`)
      .setDescription(`**User:** <@${userObject.id}> | ${userObject.id} \n **Subscription:** ${subscription}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Customer Account')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed], components: [row] })
});

faxstore.on('releaseCreate', function (storeItem, release, releaseId, staffUser) {

    const embed = new MessageEmbed()
      .setTitle(`Release Create`)
      .setDescription(`**Store Item:** ${storeItem} \n **Release:** ${release} \n **Release ID:** ${releaseId} \n **Staff Member:** <@${staffUser.id}> | ${staffUser.id}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Release Link')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed] })
    //logchan.send({ embeds: [embed], components: [row] })
   
});

faxstore.on('releaseEdit', function (release, staffUser) {
  const embed = new MessageEmbed()
      .setTitle(`Release Edit`)
      .setDescription(`**Release:** ${release} \n **Staff Member:** <@${staffUser.id}> | ${staffUser.id}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Release Link')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed] })
    //logchan.send({ embeds: [embed], components: [row] })
 
});

faxstore.on('releaseDelete', function (release, staffUser) {
  const embed = new MessageEmbed()
      .setTitle(`Release Delete`)
      .setDescription(`**Release:** ${release} \n **Staff Member:** <@${staffUser.id}> | ${staffUser.id}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Release Link')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed] })
    //logchan.send({ embeds: [embed], components: [row] })
 
    
});

faxstore.on('invoiceCreated', function (invoiceId, invoicedUser, staffUser, invoicedItems, due) {
  const embed = new MessageEmbed()
      .setTitle(`Invoice Create`)
      .setDescription(`**Invoice ID:** ${invoiceId} \n **User:** <@${invoicedUser.id}> | ${invoicedUser.id} \n **Staff Member:** <@${staffUser.id}> | ${staffUser.id} \n **Items:** ${invoicedItems} \n **Due:** ${due}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Release Link')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed] })
    //logchan.send({ embeds: [embed], components: [row] })
 
    
});

faxstore.on('invoiceUpdated', function (invoiceId, invoicedUser, due) {
  const embed = new MessageEmbed()
      .setTitle(`Invoice Create`)
      .setDescription(`**Invoice ID:** ${invoiceId} \n **User:** <@${invoicedUser.id}> | ${invoicedUser.id} \n **Due:** ${due}`)
      .setTimestamp()

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Release Link')
          .setStyle('LINK')
          .setURL(`${storeDomain}/user/${userObject.id}`),
      )

    logchan.send({ embeds: [embed] })
    //logchan.send({ embeds: [embed], components: [row] })
 
    
});
}
