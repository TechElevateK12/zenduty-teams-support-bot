// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const restify = require('restify');
const { MemoryStorage } = require('botbuilder');
const myStorage = new MemoryStorage();
const { readFile, writeFile,checkFileExists } = require('./helpers');
require('dotenv').config();

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder');

// This bot's main dialog.
const { EmptyBot } = require('./bot');

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

if (process.env.ZendutyIntegrationKey != null && process.env.ZendutyServiceName != null) {
   
    if  (!checkFileExists){
        writeFile('IntegrationKey.json', JSON.stringify({"Integrations":[{'name':`${process.env.ZendutyServiceName}(default)`,'key':process.env.ZendutyIntegrationKey}]}));
    }else if (checkFileExists){
        readFile('IntegrationKey.json').then(data => {
            let json = JSON.parse(data);
            let integrations = json.Integrations;
            let integration = integrations.find(integration => integration.name === `${process.env.ZendutyServiceName}(default)`);
            if (integration == null) {
                integrations.push({'name':`${process.env.ZendutyServiceName}(default)`,'key':process.env.ZendutyIntegrationKey});
                writeFile('IntegrationKey.json', JSON.stringify({"Integrations":integrations}));
            }
        }).catch(err => {
            console.log(err);
        });
    }
    
}else { 
    throw new Error('No Zenduty Integration Key or Team Name provided');

}

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Create the main dialog.
const myBot = new EmptyBot(myStorage);

// Listen for incoming requests.
server.post('/api/messages', async (req, res) => {
    // Route received a request to adapter for processing
    // console.log(req);
    // console.log(res);

    await adapter.process(req, res, (context) => myBot.run(context));
    // console.log('here bot');
});
