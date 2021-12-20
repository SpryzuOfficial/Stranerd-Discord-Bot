require('dotenv').config();

const fs = require('fs'); 
const Discord = require('discord.js');

const { dbConnection } = require('./config_database');
const Ticket = require('./models/ticket');
const Channel = require('./models/channel');

const client = new Discord.Client();

dbConnection();

client.on('ready', () =>
{
    console.log(client.user.tag);
});

client.on('message', async(message) =>
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
            new_msg = {"join_msg": args.join(" ")};

            message.channel.send('The new message will be: `' + args.join(" ") + '`');
            
            fs.writeFileSync('config.json', JSON.stringify(new_msg));
        }

        if(command == 'S!givetickets')
        {
            if(args[0] && args[1])
            {
                const user_id = args[0];
                const tickets = args[1];
                
                if(message.mentions.users.first())
                {
                    const user_id = message.mentions.users.first().id;

                    searchAndStoreInDB(user_id, tickets, message.mentions.users.first(), message);
                }
                else
                {
                    message.guild.members.fetch(user_id)
                        .then(async(member) => 
                        {
                            if(member)
                            {
                                searchAndStoreInDB(user_id, tickets, member, message);
                            }
                        })
                        .catch(err => 
                        {
                            message.channel.send('Cant found user with id `' + user_id + '`');
                            console.log(err);
                        });
                }
            }
        }

        if(command == 'S!help') 
        {
            const user_id = message.author.id;

            Ticket.findOne({user_id}, async(error, result) => {
                if(result)
                {
                    if(result.tickets > 0)
                    {
                        result.tickets--;

                        await Ticket.findByIdAndUpdate(result._id, result);

                        message.guild.channels.create(message.author.username, 
                            {
                                type: 'text',
                                permissionOverwrites:[
                                    {
                                        id: message.author.id,
                                        allow: ['VIEW_CHANNEL']
                                    },
                                    {
                                        id: process.env.ADMIN_ROLE,
                                        allow: ['VIEW_CHANNEL']
                                    },
                                    {
                                        id: message.guild.roles.everyone.id,
                                        deny: ['VIEW_CHANNEL']
                                    }
                                ]
                            })
                            .then(async(result) => 
                            {
                                const channel_id = result.id;

                                result.setParent(message.channel.parentID);

                                const channel = new Channel({channel_id});
                                await channel.save();
                            });
                    }
                }
            });
            await message.delete();
        }

        if(command == 'S!close')
        {
            if(message.member.hasPermission('ADMINISTRATOR'))
            {
                const channels = await Channel.find();

                channels.forEach(async(element) => 
                {
                    if(message.channel.id === element.channel_id)
                    {
                        message.channel.delete();
                        await Channel.findByIdAndDelete(element._id);
                    }
                });
            }
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

const searchAndStoreInDB = (user_id, tickets, memb, msg) =>
{
    Ticket.findOne({user_id}, async(error, result) => {
        if(error)
        {
            console.log(error);
        }
        else if(result)
        {
            result.tickets += Number.parseInt(tickets);

            await Ticket.findByIdAndUpdate(result._id, result);

            msg.channel.send(tickets + ' Tickets will be added to the user ' + memb.toString());
        }
        else
        {
            const ticket = new Ticket({user_id, tickets});
            await ticket.save();

            msg.channel.send(tickets + ' Tickets will be added to the user ' + memb.toString());
        }
    });
}

client.login(process.env.TOKEN);