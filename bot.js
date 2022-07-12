// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, CardFactory } = require('botbuilder');
const IntegrationFormCard = require('./deploymentTemplates/IntegrationFormCard.json');
const incidentCard = require('./deploymentTemplates/IncidentFormCard.json');
const deleteIntegrationFormCard = require('./deploymentTemplates/DeleteIntegrationFormCard.json');
const axios = require('axios');
const { readFile ,writeFile  } = require('./helpers');
var ACData = require("adaptivecards-templating");



class EmptyBot extends ActivityHandler {
    constructor(myStorage) {
        super();
        this.storage = myStorage;
        this.onMessage(async (context, next) => {
            // console.log('No message received');
            var IntegrationData = await getIntegrations();
            var send_incident_form = false;

            if (typeof(context.activity.text) === 'string' && context.activity.text.toLowerCase() === 'add integration'){

                await context.sendActivity(`send your API Key`);
                const IntegrationCard = CardFactory.adaptiveCard(IntegrationFormCard);
                await context.sendActivity({ attachments: [IntegrationCard] });

                // send_incident_form = true;

            }else if ( typeof(context.activity.text) === 'string' && context.activity.text.toLowerCase() === 'delete integration'){

                var IntegrationData = await getIntegrations();
                if (IntegrationData['Integrations'] == undefined || IntegrationData['Integrations'].length === 0) { 
                    await context.sendActivity('No integrations found to delete.');
                    await context.sendActivity('Please add an integration');
                    const IntegrationCard = CardFactory.adaptiveCard(IntegrationFormCard);
                    await context.sendActivity({ attachments: [IntegrationCard] });
                } else{

                    const template = new ACData.Template(deleteIntegrationFormCard);
                    const card = template.expand({
                        $root: IntegrationData
                    });
                    const inputCard = CardFactory.adaptiveCard(card);
                    await context.sendActivity({ attachments: [inputCard] });
                }

            } else if (context.activity.value != undefined && context.activity.value.delete_integration == true) {
                if (IntegrationData['Integrations'].length === 1) {
                    await context.sendActivity('You cannot delete the last integration.');
                    send_incident_form = true;
                }else{
                    for  (var i = 0; i < IntegrationData['Integrations'].length; i++) {
                        if (IntegrationData['Integrations'][i]['name'] == context.activity.value.integration) {
                            IntegrationData['Integrations'].splice(i, 1);
                        }
                    }
                    await writeFile('IntegrationKey.json', JSON.stringify(IntegrationData));
                    await context.sendActivity('Integration deleted successfully.');
                    send_incident_form = true;
                }
                
            
            } else if (context.activity.value != undefined && context.activity.value.incident == true) {
                
                if (IntegrationData['Integrations'] == undefined || IntegrationData['Integrations'].length === 0) { 
                    await context.sendActivity('No integrations found');
                    await context.sendActivity('Please add an integration');
                    const IntegrationCard = CardFactory.adaptiveCard(IntegrationFormCard);
                    await context.sendActivity({ attachments: [IntegrationCard] });

                } else{
                    send_incident_form = true;
                   
                    try {
                        const response = await axios.post(`https://www.zenduty.com/api/events/${context.activity.value.integration}/`, {
                            "message":`${context.activity.value.message}`,"alert_type":"critical","summary":`${context.activity.value.summary}`.concat(`  -> ${context.activity.from.name}`)
                        });
                       
    
                        if (response.status === 201 || response.status === 200) {
                            await context.sendActivity(`Alert sent successfully`);
                            await context.sendActivity(`title: ${context.activity.value.message} \n\n\n summary: ${context.activity.value.summary} \n\n\n from: ${context.activity.from.name} \n\n\n`);
                        } else {
                            
                            await context.sendActivity(`Error in sending alerts: ${response.status}`);
                        }
                        
                        // await context.sendActivity({ attachments: [inputCard] });
                    } catch (e) {
                      
                       
                        await context.sendActivity(`Error in sending alert: ${e}`);
                        
                        // await context.sendActivity({ attachments: [inputCard] });
                    }
                }
            } else if (context.activity.value != undefined && context.activity.value.integration == true) {
                var name = context.activity.value.name;
                var key = context.activity.value.apiKey;
                var integrationname = context.activity.value.integrationName;
               
                if (IntegrationData['Integrations'] == undefined || IntegrationData['Integrations'].length === 0) {
                    writeFile('IntegrationKey.json', JSON.stringify({"Integrations":[{'name':name,'key':key}]}));
                    await context.sendActivity(`Integration added successfully`);
                   
                    send_incident_form = true;
                    
                }else {
                    try{
                        var data = JSON.parse(await readFile('IntegrationKey.json'));

                        let check_integration = IntegrationData.Integrations.find(integration => integration.name.toLowerCase() === `${name}(${integrationname})`.toLocaleLowerCase());
                        if (check_integration == null){
                            data['Integrations'].push({'name':`${name}(${integrationname})`,'key':key});
                            writeFile('IntegrationKey.json', JSON.stringify(data));
                            await context.sendActivity(`Integration added successfully`);

                            send_incident_form = true;
                        }else{
                            throw new Error(`name already exists ${name}(${integrationname})`);
                            
                        }
                        
                    }catch(e){
                        context.sendActivity(`Error in adding integration: ${e}`);
                        const IntegrationCard = CardFactory.adaptiveCard(IntegrationFormCard);
                        await context.sendActivity({ attachments: [IntegrationCard] });
                    }

                }
                
            } else{
                await context.sendActivity(`No command found`);

                if (IntegrationData['Integrations'] == undefined || IntegrationData['Integrations'].length === 0) {
                    await context.sendActivity('No integrations found');
                    await context.sendActivity('Please add an integration');
                    const IntegrationCard = CardFactory.adaptiveCard(IntegrationFormCard);
                    await context.sendActivity({ attachments: [IntegrationCard] });
                }else{
                    send_incident_form = true;
                   
                }
            }

            if (send_incident_form){ 
                var IntegrationData = await getIntegrations();
        
                const template = new ACData.Template(incidentCard);
                const card = template.expand({
                    $root: IntegrationData
                });
                const inputCard = CardFactory.adaptiveCard(card);
                await context.sendActivity({ attachments: [inputCard] });
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        async function getIntegrations() {
            var cc = async () => readFile('IntegrationKey.json').then(key => {
                try{
                    IntegrationData = JSON.parse(key.toString());
            
                    return IntegrationData;
                }catch(e){
                    return {};
                }
            }).catch((err) => {
                console.log(err);
            });
            var IntegrationData = await cc();
            return IntegrationData;
        }
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    console.log('Welcome to the bot');
                
                    var IntegrationData = await getIntegrations();
                    // console.log(IntegrationData['ddd'].length);
                    if (IntegrationData['Integrations'] == undefined || IntegrationData['Integrations'].length === 0) { 
                        await context.sendActivity('No integrations found');
                        await context.sendActivity('Please add an integration');
                        const IntegrationCard = CardFactory.adaptiveCard(IntegrationFormCard);
                        await context.sendActivity({ attachments: [IntegrationCard] });

                    }else {
                        const template = new ACData.Template(incidentCard);
                        const card = template.expand({
                            $root: IntegrationData
                        });
                        const inputCard = CardFactory.adaptiveCard(card);
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
