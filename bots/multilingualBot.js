const {
    ActivityHandler,
    ActionTypes,
    CardFactory,
    MessageFactory,
} = require("botbuilder");




const WelcomeCard = require("../cards/welcomeCard.json");
const getTranslation = require("./getTranslation");
const translationLangs = require("../translation/translationLangs");
const detectLanguage = require("./detectLang");
const languageNamesCodes = require("../utils/languagecodes");

class MultilingualBot extends ActivityHandler {
    /**
     * Creates a Multilingual bot.
     * @param {Object} userState User state object.
     * @param {Object} languagePreferenceProperty Accessor for language preference property in the user state.
     *
     */
    textToBeTranslates = "";
    textInLangFromTranslate = "";
    constructor(userState, languagePreferenceProperty) {
        super();
        if (!userState) {
            throw new Error(
                "[MultilingualBot]: Missing parameter. userState is required"
            );
        }
        if (!languagePreferenceProperty) {
            throw new Error(
                "[MultilingualBot]: Missing parameter. languagePreferenceProperty is required"
            );
        }

        this.userState = userState;
        this.languagePreferenceProperty = languagePreferenceProperty;

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                    await context.sendActivity({ attachments: [welcomeCard] });
                    await context.sendActivity(
                        "This bot will introduce you to translation middleware. Say 'hi' to get started."
                    );
                }
            }
            await next();
        });

        this.onMessage(async (context, next) => {
            try {
                if (translationLangs[context._activity.text]) {
                    let translatedText = await getTranslation(
                        this.textToBeTranslates,
                        context._activity.text,
                        this.textInLangFromTranslate
                    );
                    await context.sendActivity(
                        `Your text in ${translationLangs[context._activity.text]
                        }: ${translatedText}`
                    );
                    this.textToBeTranslates = "";
                } else {
                    let res = await detectLanguage(context._activity.text);
                    let detectedLanguage = JSON.parse(res)[0].language;
                    let cardActions = [
                        {
                            type: ActionTypes.PostBack,
                            title: "Español",
                            value: "es",
                        },
                        {
                            type: ActionTypes.PostBack,
                            title: "Français",
                            value: "fr",
                        },
                        {
                            type: ActionTypes.PostBack,
                            title: "Deutsch",
                            value: "de",
                        },
                        {
                            type: ActionTypes.PostBack,
                            title: "اردو",
                            value: "ur"
                        }



                    ];
                    cardActions = cardActions.filter(obj => obj.value !== JSON.parse(res)[0].language);
                    const reply = MessageFactory.suggestedActions(
                        cardActions,
                        `Your current language is  ${(languageNamesCodes[detectedLanguage + ""]) ? languageNamesCodes[detectedLanguage + ""] : detectedLanguage}. Choose your language for transaltion:`
                    );
                    this.textInLangFromTranslate = JSON.parse(res)[0].language;
                    await context.sendActivity(reply);
                }
                this.textToBeTranslates = context._activity.text;
                await next();
            }
            catch (err) {
                console.log(err);
                await context.sendActivity("I appologize as a bot. I am unable to process this. I am confused  but believe me I am not dumb");

            }
        });
    }

    async run(context) {
        await super.run(context);
        await this.userState.saveChanges(context);
    }
}

/**

 * @param {string} utterance the current turn utterance.
 */


module.exports.MultilingualBot = MultilingualBot;
