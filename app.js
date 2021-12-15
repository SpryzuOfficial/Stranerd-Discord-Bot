require('dotenv').config();

const fs = require('fs'); 
const Discord = require('discord.js');

const client = new Discord.Client();

client.on('ready', () =>
{
    console.log(client.user.tag);
});

client.on('message', message =>
{
    if(message.author.bot)
    {
        return;
    }

    const msg_split = message.content.split(' ');

    const command = msg_split.slice(0, 1)[0];
    const args = msg_split.slice(1);

    if(message.member.hasPermission('ADMINISTRATOR'))
    {
        if(command == 'S!joinmsg')
        {
            n_msg = {"join_msg": args.join(" ")};
            message.channel.send('The new message will be: `' + args.join(" ") + '`');
            fs.writeFileSync('config.json', JSON.stringify(n_msg));
        }
    }
});

client.on('guildMemberAdd', member =>
{
    const channel = member.guild.channels.cache.find(ch => ch.id === process.env.GENERAL_C);

    if (channel) 
    {
        const j_msg = JSON.parse(fs.readFileSync('config.json')).join_msg;
        console.log(j_msg);
        channel.send(`Welcome to the server, ${member}`);
        member.send(j_msg);
    }
});

client.login(process.env.TOKEN);