const path = require("path");
const ENV_FILE = path.join(__dirname, ".env");
require("dotenv").config({ path: ENV_FILE });

const restify = require("restify");


const {
    ActivityTypes,
    CloudAdapter,
    MemoryStorage,
    TurnContext,
    UserState,
    ConfigurationBotFrameworkAuthentication,
} = require("botbuilder");


const { MultilingualBot } = require("./bots/multilingualBot");


const LANGUAGE_PREFERENCE = "language_preference";

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    process.env
);


const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {

    console.error(`\n [onTurnError] unhandled error: ${error}`);

    await context.sendTraceActivity(
        "OnTurnError Trace",
        `${error}`,
        "https://www.botframework.com/schemas/error",
        "TurnError"
    );

    const conversationReference = TurnContext.getConversationReference(
        context.activity
    );
    await context.adapter.sendActivities(context, [
        TurnContext.applyConversationReference(
            {
                type: ActivityTypes.Message,
                text: "The bot encountered an error or bug.",
            },
            conversationReference
        ),
        TurnContext.applyConversationReference(
            {
                type: ActivityTypes.Message,
                text: "To continue to run this bot, please fix the bot source code.",
            },
            conversationReference
        ),
    ]);
};


const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);

const languagePreferenceProperty =
    userState.createProperty(LANGUAGE_PREFERENCE);

const bot = new MultilingualBot(userState, languagePreferenceProperty);


const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}.`);
    console.log(
        "\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator"
    );
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});


server.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});
