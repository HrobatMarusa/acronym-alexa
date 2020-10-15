const Alexa = require("ask-sdk");
var AWS = require("aws-sdk");
AWS.config.update({ region: "eu-west-1" });
const doc = require("dynamodb-doc");
const dynamo = new doc.DynamoDB();
let output;
let definition;
let description;

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Welcome to the acronym bot! You can ask me for the meaning of numerous acronyms commonly used within BBC R and D!";
    const repromptText =
      'You can also say help to find out how I work';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withStandardCard("Welcome to the acronym bot!", "Ask me for the meaning of acronyms", 'https://media.makeameme.org/created/acronyms-acronyms-everywhere-5981993604.jpg')
      .getResponse();
  },
};

const AcronymIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetAcronym"
    );
  },
  async handle(handlerInput) {
    const acronym =
      handlerInput.requestEnvelope.request.intent.slots.acronym.value; //acro (primary key)

    var params = {
      Key: {
        acro: acronym,
      },
      TableName: "acronymbot",
    };

    var result = await dynamo.getItem(params).promise();
    data = Object.values(result);
    output = await data[0].output;
    definition = await data[0].definition;
    description = await data[0].description;

    //check if description is empty and formulate the spoken response accordingly
    if (description.length <= 1) {
      speechText = "The acronym " + output + " stands for " + definition;
    } else {
      speechText =
        "The acronym " +
        output +
        " stands for " +
        definition +
        ". It means " +
        description;
    }
    const repromptText = "Ask for another acronym or say; 'repeat'; to hear the definition of the previous acronym again!";

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.lastResult = speechText;
    handlerInput.attributesManager.setSessionAttributes(attributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard("Here's the requested acronym information: ", speechText)
      .getResponse();   
  },
};

const RepeatIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    let speechText = '';
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    if (attributes.lastResult){
      speechText = "I said: " + attributes.lastResult;
    };
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    const repromptText = "Ask for another acronym or say 'repeat'; to hear the definition of the previous acronym again!";

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(repromptText)
    .withSimpleCard("Here's the requested acronym information again: ", speechText)
    .getResponse();
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      'You can ask me for the meaning of an acronym by saying, "what does an acronym stand for", or, "what does an acronym mean". To close this skill, simply say "goodbye" ';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Help", speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Thank you for using the acronym bot. Come back soon!";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("Goodbye", speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`); // log to CloudWatch console

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please try again.")
      .reprompt("Sorry, I can't understand the command. Please try again.")
      .getResponse();
  },
};

let skill;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`); // log to CloudWatch console
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        AcronymIntentHandler,
        RepeatIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`); // log to CloudWatch console

  return response;
};
