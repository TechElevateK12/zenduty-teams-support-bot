# zenduty teams support bot

alerting

This bot is used to send alerts to zenduty.


## Prerequisites

- [Node.js](https://nodejs.org) version 10.14.1 or higher

    ```bash
    # determine node version
    node --version
    ```

## To run the bot

- Install modules

    ```bash
    npm install
    ```

- Start the bot

    ```bash
    npm start
    ```

## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.9.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`


## Deploy the bot to Azure


### Registering bot in Azure



* Login to your azure account 
* Search for Azure Bot click on Azure Bot(under marketplace)
* Fill the required fields(ie.. Bot handle,subscription,resource group) select Type of App as **Multi Tenant**, click on review + create and then create bot 
* Search for bot services ,click on bot services,you can see that your Azure bot has been created.
* Click on your bot and click on configuration.**copy Microsoft App ID**, click on manage and create a secret and copy **Client Secret**



**Deploying Bot**


* Go Your Zenduty Account,go to teams, then services,click on add integration,create a **API integration** copy the  integration key 
* Pull zenduty-teams-support-bot and go to the .env file and add your **Microsoft App ID,Microsoft app password =Your Client Secret, MicrosoftAppType = MultiTenant, ZendutyIntegrationKey=your integration key , ZendutyServiceName=your team name**
* Deploy the Bot on any cloud service and copy the website url. 
    **Deploy the bot to Azure**
    * Go to your Azure account and seach for app services and click on app services then click on **create app service** 
    * Give a name to your webapp,and select runtime as **node.js** and click on **review + create** and then click on **create**
    * Go to App Service and click on the App Service You Created 
    * Click on **Configuration** under settings,click on **New Application Setting** and configute the names present in .env file  and click on **save**
    * Under Deployment click on **Deployment Center**  and connect to your git repository and click on **save**
    * Go to your repository you will see a worflow being executed.(eg:for github Click on Actions in your repository) When it is done,you will see a deployment in the deployment center.
        * if workflow has failed , remove lines  npm run build --if-present and npm run test --if-present in line number 27 and 28 respectively.and commit the changes.and new workflow will be executed.wait for the workflow to be completed.
    * GO to overview and copy the website url.


     	**OR**


    **For Testing**

    * Install requirements using (npm i) and start the bot using ->  npm start, **use** ngrok to tunnel it using (ngrok http 3978)
    * Copy the ngrok url 

**Integrating  Azure Bot and Deployed Bot**



* Go to your Azure Account and click on your bot to go to configuration and in Messaging endpoint paste the url you copied(ngrok or cloud url) the url will be ->  your copied url/api/messages.
* Click on apply to save changes.
* On the  left panel below **configuration**.click on Test in Web Chat.
* On successful connection a form will be shown and enter the message. And click on submit.go to zenduty and check for incident creation 


      

**Adding Azure Bot to Microsoft Teams:-**



* Open Microsoft teams and click on Apps 
* Search for App studio and open App studio 
* Click on  Create New App,Fill the required details.
* In Capabilities click on Bot,click on setup click on existing bot and select connect to a  different bot id and paste your  **Microsoft App ID** and **tick the required scopes for your account**
* In the Finish Section click on Test and Distribute , either install App for testing or click on Publish.
* Click on Publish to App Catalog. Click on submit 

  

    **Steps For IT admin to Accept the App**




    * Go to admin [https://admin.teams.microsoft.com/policies/manage-apps](https://admin.teams.microsoft.com/policies/manage-apps)  
    * Search for your app name and click on the app.accept the build and change status to allowed and publish app. 
    * Allow App to the Teams app store. The Bot will be Available  for your team to use 

     


**   **

**      **

