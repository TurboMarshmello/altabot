const Discord = require("discord.js")
const chancejs = require("chance")
const fs = require("fs");
const prefix = (require("./config.json").prefix)
const chance = new chancejs()
const bot = new Discord.Client()
const settings = { }
var servers = {}
const superagent = require("superagent")
var silenced = { }

function saveRestricted() {
  fs.writeFile("./restricted.json", JSON.stringify(silenced), function(err) {
    if (err) {
      return console.log(err)
    }
  });
}

function loadRestricted() {
  fs.readFile('./restricted.json','utf8', function (err, data) {
    if (err) console.log(err)
    silenced = JSON.parse(data)
  })
}

bot.on("ready", () => {
      loadRestricted()
    console.log("Startup complete. Logged in as " + bot.user.username) // This is what is outputed into the console to show the bot has been launched
    bot.user.setGame("Start with " + prefix + " on "  + bot.guilds.size + " Servers" ) // This setting the game that it is playing on boot bot.guilds.size is the the amount of server it is on displayed as an integer
})
bot.on("guildCreate", guild => {
 bot.user.setGame("Start with " + prefix +  " on " + bot.guilds.size + " Servers" )
})

bot.on("guildDelete", guild => {
 bot.user.setGame("Start with " + prefix +  " on " + bot.guilds.size + " Servers" )
})

bot.on("message", msg => {
    if(!msg.guild) return;
     if (silenced[msg.author.id] && silenced[msg.author.id].type == "user" && silenced[msg.author.id].active && msg.content.startsWith(prefix)) { return msg.channel.sendMessage("You have been blacklisted!")};
     if (!msg.content.startsWith(prefix)) {return;}
    let cmd = msg.content.split(" ")[0]
    cmd = cmd.slice(prefix.length)
    let args = msg.content.split(" ").slice(1)
    if (cmd == "ping") {
        msg.channel.send(":ping_pong: The current ping is: **" + Math.round(bot.ping) + "**ms")
    }
    if (cmd == "hello") {
        msg.channel.send({embed:  new Discord.RichEmbed().setTitle("Hello").setColor("#16a085").setAuthor("Alta", bot.user.displayAvatarURL).setDescription("Hey, I am Alta, an opensource bot by Turbomarshmello#3416 with grammar fixes by ohlookitsderpy#3799. I do cool stuff. Do .help for my commands! :P")})
    }
    if (cmd == "help") {
         msg.author.send({embed: new Discord.RichEmbed().setTitle("Help") .setColor("#16a085").setAuthor(bot.user.username  + " Help Page 1", bot.user.displayAvatarURL).setDescription("**Commands**\nInsert your commands here")}).then(msg=>msg.channel.send('Check your Direct Messages. :mailbox_with_mail: '));
    }
    if (cmd == "eval" && msg.author.id === "YOUR USER ID") { // This can also be added after the || command == "eval" && msg.author.id === "A TRUST WORTHY FRIEND'S ID" " 
        let result
        try {
            result = eval(args.join(" "))
        } catch(err) {
            return msg.channel.send(":x: There is an error The error is in console " + console.log(err))
        }
        msg.channel.send(":white_check_mark: Eval results: " + result)
    }
        if (cmd == "cat") {
         superagent.get("https://random.cat/meow", (err, res) => {
             if (err) { return msg.channel.send("An error has occurred. Details: " + err)}
             msg.channel.send("", {embed: new Discord.RichEmbed().setTitle("Random Cat").setImage(res.body.file).setFooter("Image by random.cat")
             })
         })
        }
        if (cmd == "dog") {
            superagent.get("https://random.dog/woof.json", (err, res) => {
                if (err) { return msg.channel.send("An error has occurred. Details: " + err)}
                msg.channel.send("", {embed: new Discord.RichEmbed().setTitle("Random Dog").setImage(res.body.url).setFooter("Image by random.dog")})
            })
        }
        if (cmd == "blacklist" && msg.author.id == "252001272146821120") {
        if (args[0] == "user") {
            let user = msg.mentions.users.first()
            if (user == undefined || user == null) {
                return msg.channel.send("Syntax: blacklist <user/id/guild> <user @mention/user id/guild id>")
            }
            msg.channel.send(user.username + " Has been blacklisted" + " Their ID (" + user.id + ").")
            silenced[user.id] = {"type":"user", "active":true}
        } else if (args[0] == "id") {
            let id = args[1]
            if (id == undefined || id == null) {
                return msg.channel.send("Syntax: blacklist <user/id/guild> <user @mention/user id/guild id>")
            }
            msg.channel.sendMessage("Blacklisting user ID " + id + ".")
            silenced[id] = {"type":"user", "active":true}
        }
        saveRestricted()
    }
    if (cmd == "unblacklist" && msg.author.id == "252001272146821120") {
        if (args[0] == "user") {
            let user = msg.mentions.users.first()
            if (user == undefined || user == null) {
                return msg.channel.send("Syntax: unblacklist <user/id/guild> <user @mention/user id/guild id>")
            }
            msg.channel.send(user.username + " Has been un-blacklisted" + " Their ID (" + user.id + ").")
            silenced[user.id] = {"type": "user", "active": false}
        } else if (args[0] == "id") {
            let id = args[1]
            if (id == undefined || id == null) {
                return msg.channel.send("Syntax: unblacklist <user/id/guild> <user @mention/user id/guild id>")
            }
            msg.channel.sendMessage("Un-blacklisting user ID " + id + ".")
            silenced[id] = {"type":"user", "active":false}
        }
        saveRestricted()
    }
    if (cmd === "kick") {
        if (!msg.member.hasPermission("KICK_MEMBERS")) {
            return msg.channel.send("Sorry, you don't have the required permissions to kick members from this server.")
        }
        if (!msg.guild.member(bot.user.id).hasPermission("KICK_MEMBERS")) { return msg.channel.send("I cannot kick members, since I do not have the permission to. Check your roles")}
        let user = msg.mentions.users.first()
        if (!user) {return msg.channel.send("Sorry, but you must specify a user.")}
        if (!msg.guild.member(user.id).kickable) { return msg.channel.send("Sorry, that user cannot be kicked")}
        let reason
        if (args[1]) {
            reason = args.slice(1).join(" ")
        } else {
            reason = "[No reason specified]"
        }
        msg.guild.member(user).kick()
        msg.channel.sendEmbed(
            new Discord.RichEmbed()
            .setColor("#34495e")
            .setDescription("The member " + user + " has been kicked from the server for the following reason: " + reason )
            .setAuthor("Player has been kicked")
            )
    }
       if (cmd === "prune") {
        if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_MESSAGES")) {
        msg.channel.sendMessage(":wastebasket: | You do not have the required permission to delete messages!").then(msg=>msg.delete(5000));
        return;
      } else if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_MESSAGES")) {
        msg.channel.sendMessage(":wastebasket: | I do not have the required permission to delete messages. Please check your roles").then(msg=>msg.delete(5000));
        return;
      }
      let messagecount = parseInt(args.join(" "));
        msg.channel.fetchMessages({limit : messagecount}).then(msgs => msg.channel.bulkDelete(msgs));
            msg.channel.sendMessage(':wastebasket: | Messages have been deleted!').then(msg=>msg.delete(5000))
        }
    if (cmd === "ban") {
        if (!msg.member.hasPermission("BAN_MEMBERS")) {
            return msg.channel.sendMessage("Sorry, you don't have the required permissions to ban members from the server.")
        }
        if (!msg.guild.member(bot.user.id).hasPermission("BAN_MEMBERS")) { return msg.channel.send("I cannot ban members, since I do not have the permission to. Check your roles")}
        let user = msg.mentions.users.first()
        if (!user) { return msg.channel.send("Sorry, but you must specify a user.")}
        if (!msg.guild.member(user.id).bannable) { return msg.channel.send(":x: I can't ban this user.")}
        if (args[2]) {
            reason = args.slice(2).join(" ")
        } else {
            reason = "[No reason specified]"
        }
        msg.guild.ban(msg.guild.member(user))
            msg.channel.sendEmbed(
            new Discord.RichEmbed()
            .setColor("#34495e")
            .setDescription("The member " + user + " has been banned from the server for the following reason: " + reason )
            .setAuthor("Player has been banned")
            )
    }
    if (cmd == "stats") {
        msg.channel.sendEmbed(
            new Discord.RichEmbed()
            .setColor("#16a085")
            .setTitle(bot.user.username + " Statistics")
            .setDescription("**Servers** - " + bot.guilds.size + "\n**Users** - " + bot.users.size + "\n**Library** - Discord.js")
        )

    }
});

bot.login(require("./config.json").token)
