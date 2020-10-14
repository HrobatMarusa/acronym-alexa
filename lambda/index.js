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
    const speechText = "Welcome to the acronym bot!";
    const repromptText =
      'You can ask me for the meaning of an acronym by saying "what does an acronym stand for" or "what does an acronym mean" ';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard("Welcome!", speechText)
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
    //acron = await data[0].acro;
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
    const repromptText = "Which acronym are you interested in?";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard("Here's the requested acronym information: ", speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "You can ask me for the meaning of numerous acronyms commonly used within BBC R and D!";

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
    //any cleanup logic goes here
    //e.g. deleting any database entires lying around
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
