// Import the config variables
import { config } from "../config.js";

// Import the required packages
import Discord from "discord.js";
import fetch from "node-fetch";

import dayjs from "dayjs";
import dayjs_utc from "dayjs/plugin/utc.js";
import dayjs_timezone from "dayjs/plugin/timezone.js";
dayjs.extend(dayjs_utc);
dayjs.extend(dayjs_timezone);

// Import helper functions
import * as main from "./index.js";
import * as helper from "./helper.js";

export const balance = async (message: Discord.Message) => {
    const balanceData = await helper.rpc("getbalance", [message.author.id, 1]);
    if (balanceData[0]) {
        main.log(`Error while fetching balance for user ${message.author.id}: ${balanceData[0]}`);
        helper.sendErrorMessage(message,
            `**:bank::money_with_wings::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) balance :moneybag::money_with_wings::bank:**`,
            `An errror occured while fetching your balance.`);
        return;
    } else {
        if (message.channel.type !== `DM`) {
            message.channel.send({
                embeds: [{
                    description: `**:bank::money_with_wings::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) Balance sent!:moneybag::money_with_wings::bank:**`,
                    color: 1363892,
                    fields: [
                        {
                            name: `__User__`,
                            value: `<@${message.author.id}>`,
                            inline: false,
                        },
                        {
                            name: `Success!`,
                            value: `**:lock: Balance sent via DM**`,
                            inline: false,
                        },
                    ],
                }],
            }).then((sentMessage) => {
                // If the message was sent in the spam channel, delete it after the timeout specified in the config file.
                // If it was sent in a DM, don't delete it.
                if (sentMessage.channel.type === `DM`) {
                    return;
                } else {
                    setTimeout(() => {
                        sentMessage.delete();
                    }, config.bot.msgtimeout);
                }
            });
        }

        // Send the balance via DM
        message.author.send({
            embeds: [{
                description: `**:bank::money_with_wings::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) Your balance!:moneybag::money_with_wings::bank:**`,
                color: 1363892,
                fields: [
                    {
                        name: `__User__`,
                        value: `<@${message.author.id}>`,
                        inline: false,
                    },
                    {
                        name: `__Balance__`,
                        value: `**${JSON.stringify(balanceData[1])}**`,
                        inline: false,
                    },
                ],
            }],
        }).catch(() => { // If the user has their DMs disabled, send an error message
            helper.sendErrorMessage(message,
                `**:bank::money_with_wings::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) balance :moneybag::money_with_wings::bank:**`,
                `**:x:  Balance was not able to be sent via DM, do you have DM\'s disabled?**`);
        });
    }
};

export const deposit = async (message: Discord.Message) => {
    // Check if the user already has a deposit address
    const addressesByAccount = await helper.rpc("getaddressesbyaccount", [message.author.id]);
    if (addressesByAccount[0]) {
        main.log(`Error while generating new address for user ${message.author.id}: ${addressesByAccount[0]}`);
        helper.sendErrorMessage(message,
            `**:moneybag::card_index::bank: ${config.coin.coinname} (${config.coin.coinsymbol}) deposit address :moneybag::card_index::bank:**`,
            `An error occured while generating a new deposit address.`);
        return;
    }

    if (addressesByAccount[1].length > 0) { // If the user already has a deposit address, send it
        if (message.channel.type !== `DM`) {
            message.channel.send({
                embeds: [{
                    description: `**:bank::card_index::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) Deposit address sent!:moneybag::card_index::bank:**`,
                    color: 1363892,
                    fields: [
                        {
                            name: `__User__`,
                            value: `<@${message.author.id}>`,
                            inline: false,
                        },
                        {
                            name: `Success!`,
                            value: `**:lock: Deposit address sent via DM**`,
                            inline: false,
                        },
                    ],
                }],
            }).then((sentMessage) => {
                // If the message was sent in the spam channel, delete it after the timeout specified in the config file.
                // If it was sent in a DM, don't delete it.
                if (sentMessage.channel.type === `DM`) {
                    return;
                } else {
                    setTimeout(() => {
                        sentMessage.delete();
                    }, config.bot.msgtimeout);
                }
            });
        }

        message.author.send({
            embeds: [{
                description: `**:bank::card_index::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) Your deposit address!:moneybag::card_index::bank:**`,
                color: 1363892,
                fields: [
                    {
                        name: `__User__`,
                        value: `<@${message.author.id}>`,
                        inline: false,
                    },
                    {
                        name: `__Deposit Address__`,
                        value: `**${JSON.stringify(addressesByAccount[1][0])}**`,
                        inline: false,
                    },
                ],
            }],
        }).catch(() => { // If the user has their DMs disabled, send an error message
            helper.sendErrorMessage(message,
                `**:moneybag::card_index::bank: ${config.coin.coinname} (${config.coin.coinsymbol}) deposit address :moneybag::card_index::bank:**`,
                `**:x:  Deposit address was not able to be sent via DM, do you have DM\'s disabled?**`);
        });
    } else { // If the user doesn't have a deposit address, generate one and send it
        const newAddress = await helper.rpc("getnewaddress", [message.author.id]);
        if (newAddress[0]) {
            main.log(`Error while generating new address for user ${message.author.id}: ${newAddress[0]}`);
            helper.sendErrorMessage(message,
                `**:moneybag::card_index::bank: ${config.coin.coinname} (${config.coin.coinsymbol}) deposit address :moneybag::card_index::bank:**`,
                `An error occured while generating a new deposit address.`);
            return;
        }

        if (message.channel.type !== `DM`) {
            message.channel.send({
                embeds: [{
                    description: `**:bank::card_index::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) Deposit address sent!:moneybag::card_index::bank:**`,
                    color: 1363892,
                    fields: [
                        {
                            name: `__User__`,
                            value: `<@${message.author.id}>`,
                            inline: false,
                        },
                        {
                            name: `Success!`,
                            value: `**:lock: Deposit address sent via DM**`,
                            inline: false,
                        },
                    ],
                }],
            }).then((sentMessage) => {
                // If the message was sent in the spam channel, delete it after the timeout specified in the config file.
                // If it was sent in a DM, don't delete it.
                if (sentMessage.channel.type === `DM`) {
                    return;
                } else {
                    setTimeout(() => {
                        sentMessage.delete();
                    }, config.bot.msgtimeout);
                }
            });
        }

        message.author.send({
            embeds: [{
                description: `**:bank::card_index::moneybag: ${config.coin.coinname} (${config.coin.coinsymbol}) Your deposit address!:moneybag::card_index::bank:**`,
                color: 1363892,
                fields: [
                    {
                        name: `__User__`,
                        value: `<@${message.author.id}>`,
                        inline: false,
                    },
                    {
                        name: `__Deposit Address__`,
                        value: `**${JSON.stringify(newAddress[1])}**`,
                        inline: false,
                    },
                ],
            }],
        }).catch(() => { // If the user has their DMs disabled, send an error message
            helper.sendErrorMessage(message,
                `**:moneybag::card_index::bank: ${config.coin.coinname} (${config.coin.coinsymbol}) deposit address :moneybag::card_index::bank:**`,
                `**:x:  Deposit address was not able to be sent via DM, do you have DM\'s disabled?**`);
        });
    }
};