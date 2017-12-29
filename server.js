/*Recycle Bin

function getNextQuestionSetID(ctx) {
  if (typeof getNextQuestionSetID.nextID == 'undefined') {
    getNextQuestionSetID.nextID = 0;
    console.log('new ID chain started');
  }
  
  getNextQuestionSetID.nextID++;
  console.log('Returning requested qSet ID: ' + getNextQuestionSetID.nextID);
  return getNextQuestionSetID.nextID;
}


Dominic ID = 377961259
Zhi Xuan ID = 426938277

*/

const Telegraf = require('telegraf');
const Map = require('es6-map');
const genesisAdmin = 426938277;

const bot = new Telegraf(process.env.TOKEN)
bot.start((ctx) => {
  console.log('started:', ctx.from.id);
  return ctx.reply('Your command is my will ' + ctx.from.first_name + '.');
})

/*Variable Declaration*/
var questionSets = new Map();   //Map(questionSetName, questionSet);
var userMap = initializeUserMap();

function initializeUserMap(){
  var tempMap = new Map();
  tempMap.set(genesisAdmin, true);
  
  console.log('Starting Server');
  console.log('Admin initialized: ' + tempMap.get(genesisAdmin));
  
  return tempMap;
}

/*Object Definitions*/
function QuestionSet(questionSetName){
  this.name = questionSetName;
  this.numQuestions = 0;
  this.questions = [];
}

function Question(questionString){
  this.question = questionString;
  this.users_response = new Map();    //Map(User, Response)
}

/*_________________________________*/

/*Function Definitions*/

/*
PreReq:
var- questionSetName (does not already exist)
*/
function addQuestionSet(questionSetName, ctx){
  
  var resultString = " successfully added";
  var resultBool = true;
  
  if(questionSets.has(questionSetName)){
    resultString = " already exists";
    resultBool = false;
    
  } else {
    questionSets.set(questionSetName, QuestionSet(questionSetName));
  }
  
  ctx.reply(questionSetName + resultString);
  console.log(questionSetName + resultString);
  return resultBool;
  
}

/*
PreReq:
var- oldQuestionSetName (already exists)
var- newQuestionSetName (does not already exists)
*/
function editQuestionSetName(oldQuestionSetName, newQuestionSetName, ctx){
  
  var resultBool = false;
  
  if(questionSets.has(oldQuestionSetName)){
    if(!questionSets.has(newQuestionSetName)){
      questionSets.set(newQuestionSetName, new QuestionSet(newQuestionSetName));
      questionSets.get(newQuestionSetName).numQuestions = questionSets.get(oldQuestionSetName).numQuestions;
      questionSets.get(newQuestionSetName).questions = questionSets.get(oldQuestionSetName).questions;
      questionSets.delete(oldQuestionSetName);
      resultBool = true;
    }else{
      ctx.reply(newQuestionSetName + " already exists");
      console.log(newQuestionSetName + " already exists");
    }
  }else{
    ctx.reply(oldQuestionSetName + " already exists");
    console.log(oldQuestionSetName + " already exists");
  }
  
  return resultBool;
}

/*
PreReq:
var- questionSetName (already exists)
*/
function deleteQuestionSet(questionSetName, ctx){
  
  var resultString = " successfully deleted";
  var resultBool = true;
  
  if(!questionSets.has(questionSetName)){
    resultBool = false;
    resultString = " doesnt exist";
  }else{
    questionSets.delete(questionSetName); 
  }
  
  ctx.reply(questionSetName + resultString);
  console.log(questionSetName + resultString);
  
  return resultBool;
  
}

function listQuestionSets(ctx){
  if(questionSets.size != 0){
    var print = "";
     questionSets.forEach(function(value, key){
        print = print + key + "\n";
     });
    ctx.reply(print);
    console.log(print);
  }else{
      ctx.reply("No question sets");
      console.log("No question sets");
  }
}

/*
PreReq:
var- questionString
QuestionSet - questionSet (QuestionSet exists)
*/
function addQuestionToQuestionSet(questionString, questionSet, ctx){
  
  var resultString = "Successfull question addition"
  var resultBool = true;
      
  if(typeof questionSets.get(questionSet).questions.push(new Question(questionString) != ++questionSet.numQuestions)){
    questionSet.numQuestions--;
    resultString = "Fail to add " + questionString;
    resultBool = false;
  }
  
  ctx.reply(resultBool + " to QuestionSet " + questionSet.id);
  console.log(resultBool + " to QuestionSet " + questionSet.id);
  return resultBool;
}

/*
PreReq:
var- questionNum  (question exists)
QuestionSet - questionSet (QuestionSet exists)
*/
function deleteQuestionFromQuestionSet(questionNum, questionSet, ctx){

  var resultBool = false;
  
  if(questionSets.has(questionSet)){
    if(questionSets.get(questionSet).numQuestions <= questionNum){
      questionSets.get(questionSet).questions.splice(questionNum - 1, 1);
      ctx.reply("Question " + questionNum + " successfully deleted from " + questionSet);
      console.log("Question " + questionNum + " successfully deleted from " + questionSet);
      resultBool = true;
    }else{
      ctx.reply("Question number " + questionNum + " does not exist");
      console.log("Question number " + questionNum + " does not exist");
    }
  }else{
    ctx.reply("Question set " + questionSet + " does not exist");
    console.log("Question set " + questionSet + " does not exist");
  }
  
  return resultBool
}

/*
PreReq:
QuestionSet - questionSet (QuestionSet exists)
*/
function listQuestionsFromQuestionSet(questionSet, ctx){
  
  var resultBool = false;
  
  if(questionSets.has(questionSet)){
    questionS
    resultBool = true;
  }else{
    ctx.reply("Question set " + questionSet + " does not exist");
    console.log("Question set " + questionSet + " does not exist");
  }
  
  return resultBool;
}

/*
PreReq:
var - UserID 
var - Response 
QuestionSet - questionSet
*/
function addUserResponseToQuestion(UserID, Response, Question, ctx){
  
  var resultString = "Successfull UserResponse addition"
  var resultBool = true;
  
  if(typeof Question.users_response.set(UserID, Response) != 'Map'){
    resultString = "Fail to add " + UserID + "'s response";
    resultBool = false;
  }
  
  ctx.reply(resultString + " to Question : " + Question.question);
  console.log(resultString + " to Question : " + Question.question);
  return resultBool;
}

function isAlphaNumeric(string){
  var regex = /^[a-z0-9]+$/i; 
  return regex.test(string);
}

function checkAdmin(userID){
  return (userMap.has(userID) && userMap.get(userID));
}

function adminReply(boolean){
  if (boolean) {
    return "Yes, my master.";
  } else {
    return "No, peasant.";
  }
}

function help(){
  var result = "";
  
  result += "--- ADMIN ONLY COMMANDS ---\n\n"
  
  result += "/addQSet to start a new set of questions. \n";
  result += "/delQSet to remove a question set you don't want\n";
  result += "/listQSet to show all your question sets\n";
  
  result += "\n--- USER COMMANDS ---\n\n";
  
  result += "/admin to check if you are one of my masters. \n";
  result += "/slut to see if you are one or not\n";
  result += "/help to view the manual\n";
  
  return result;

}

/*_________________________________*/

bot.hears(/(.*)/, (ctx) => {
  
  var messageArr = ctx.message.text.split(" ");
  var command = messageArr[0];
  var fromId = ctx.from.id;
  
  if (checkAdmin(fromId)) {
    switch (command) {
        case "/admin":
            ctx.reply(adminReply(checkAdmin(fromId)));
            return;
        
        case "/addQSet":
            
            if (messageArr.length == 2 && isAlphaNumeric(messageArr[1])) {
              addQuestionSet(messageArr[1], ctx);
            } else {
              ctx.reply("Invalid name or number of arguments after command.\nTry /addQSet \"alphanumerical_name\"")
            }
            return;
        
        case "/delQSet":
            
            if (messageArr.length == 2 && isAlphaNumeric(messageArr[1])) {
              deleteQuestionSet(messageArr[1], ctx);
            } else {
              ctx.reply("Invalid name or number of arguments after command.\nTry /addQSet alphanumerical_name")
            }
            return;
        
        case "/listQSet":
        
            listQuestionSets(ctx);
            return;
        
        case "/slut":
            ctx.reply('We both are ;)');
            return;
        
        case "/help":
            
            ctx.reply(help());
            return;
        
        default:
            ctx.reply('Sorry master, I do not understand.');
            return;
    }
    
  } else { //For the non-admins 
      switch (command) {
        case "/slut":
          ctx.reply('We both are ;)');
          return;

        case "/admin":
          ctx.reply(adminReply(checkAdmin(fromId)));
          return;
          
        case "/help":
          ctx.reply(help());
          return;

        default:
          ctx.reply('Wadafaq you say?');
          return;
      }
  }
  
});

bot.startPolling()
  
  




