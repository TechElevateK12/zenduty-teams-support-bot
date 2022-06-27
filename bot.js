// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, CardFactory } = require('botbuilder');
const card = require('./deploymentTemplates/InputFormCard.json');
const apicard = require('./deploymentTemplates/APICard.json');
const axios = require('axios');

class EmptyBot extends ActivityHandler {
    constructor(myStorage) {
        super();
        this.storage = myStorage;
        this.onMessage(async (context, next) => {
            // console.log('No message received');
            if (context.activity.text === 'hard reset') {
                await myStorage.delete(['apiKey']);
                await context.sendActivity(`API Key deleted by - ${context.activity.from.name}`);
    
            }
            const inputCard = CardFactory.adaptiveCard(card);
            const storageToken = await myStorage.read(['apiKey']);
            // console.log(storageToken);

            var envToken;
            // console.log(Object.values(storageToken)[0][0], 'token from storage');
            try {
                envToken = Object.values(storageToken)[0][0];
            } catch (e) {
                envToken = undefined;
            }

            if (envToken) {
                try {
                    // console.log(envToken);

                    const response = await axios.post(`https://www.zenduty.com/api/events/${envToken}/`, {
                        "message":`${context.activity.value.message}`,"alert_type":"critical","summary":`${context.activity.value.summary}`.concat(`  -> ${context.activity.from.name}`)
                    });

                    if (response.status === 201 || response.status === 200) {
                        await context.sendActivity(`Alert sent successfully`);
                        await context.sendActivity(`message: ${context.activity.value.message} \n\n\n summary: ${context.activity.value.summary} \n\n\n from: ${context.activity.from.name} \n\n\n`);
                    } else {
                        await context.sendActivity(`Error in sending alerts: ${response.status}`);
                    }

                    await context.sendActivity({ attachments: [inputCard] });
                } catch (e) {
                    if (!TypeError) {
                        await context.sendActivity(`Error in sending alert: ${e}`);
                    }
                    await context.sendActivity({ attachments: [inputCard] });
                }
                await next();
            } else {
                // console.log('No API Key');
                try {
                    var token = context.activity.value.apiKey;
                } catch (e) {
                    if (context.activity.text === 'hard reset') {
                        const existing = await myStorage.read(['apiKey']);
                        if (existing && existing.apiKey) {
                            await myStorage.delete(['apiKey']);
                            await context.sendActivity(`API Key deleted by - ${context.activity.from.name}`);
                        }
                    }
                }
                // console.log(token, 'this token');
                if (token) {
                    // console.log(token, 'this token inside if');
                    const existing = await myStorage.read(['apiKey']);
                    existing['apiKey'] = [token];
                    await myStorage.write(existing);
                    await context.sendActivity('Saving API Key');
                    await context.sendActivity(`New API Key added by - ${context.activity.from.name}`); 
                    await context.sendActivity({ attachments: [inputCard] });
                } else {
                    await context.sendActivity('Please provide a api key');
                    const ApiCard = CardFactory.adaptiveCard(apicard);
                    await context.sendActivity({ attachments: [ApiCard] });
                }
            }

            await next();
        });
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    console.log('Welcome to the bot');
                    let apiKey = await myStorage.read(['apiKey']);
                    apiKey = Object.keys(apiKey);
                    if (apiKey.length === 0) {
                        await context.sendActivity('Enter your Zenduty API Key');
                        const ApiCard = CardFactory.adaptiveCard(apicard);
                        await context.sendActivity({ attachments: [ApiCard] });
                    } else {
                        const inputCard = CardFactory.adaptiveCard(card);

                        // await context.sendActivity('Hello world!');
                        await context.sendActivity({ attachments: [inputCard] });
                    }
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EmptyBot = EmptyBot;
