/*Recycle Bin

function getNextQuestionSetID(ctx)     m.callbackButton('Add new question set', 'test{
  if (typeof getNextQuestionSetID.nextID == 'undefined') {
    getNextQuestionSetID.nextID = 0;
    console.log('new ID chain started');
  }
  
  getNextQuestionSetID.nextID++;
  console.log('Returning requested qSet ID: ' + getNextQuestionSetID.nextID);
  return getNextQuestionSetID.nextID;

*/
const Telegraf = require("telegraf");
const Map = require("es6-map");
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const admins = [[377961259, "Dominic"], [426938277, "Zhi Xuan"]]

var userMap = initializeUserMap();
var qSetMap = new Map();
var questionSets = new Map();

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => {
  console.log("started:", ctx.from.id);
  return ctx.reply("Hello " + ctx.from.first_name + ", I manage questions sets nya! Type /help to begin.");
})

bot.catch((err) => {
  console.log("Ooops someone fucked up! Error here: \n", err)
})

// *********************************************************************************
// *         -----------      QUESTION SET DATA STRUCTURE      -------------       *
// *********************************************************************************



function QuestionSet(questionSetName){
  this.name = questionSetName;
  this.questions = [];
}

function Question(questionString){
  this.question = questionString;
  this.users_response = new Map();    //Map(User, Response)
}

function addQuestionSet(questionSetName, ctx){
  
  var resultString = " successfully added";
  var resultBool = true;
  
  if(questionSets.has(questionSetName)){
    resultString = " already exists";
    resultBool = false;
    
  } else {
    questionSets.set(questionSetName, new QuestionSet(questionSetName));
  }
  
  ctx.reply(questionSetName + resultString);
  console.log(questionSetName + resultString);
  return resultBool;
  
}

function editQuestionSetName(oldQuestionSetName, newQuestionSetName, ctx){
  
  var resultBool = false;
  
  if(questionSets.has(oldQuestionSetName)){
    if(!questionSets.has(newQuestionSetName)){
      questionSets.set(newQuestionSetName, new QuestionSet(newQuestionSetName));
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

function addQuestionToQuestionSet(questionSet, questionString, ctx){
  
  var resultBool = false;
  if(questionSets.has(questionSet)){
    var arr = questionSets.get(questionSet).questions;
    arr.push(new Question(questionString))
    ctx.reply("Successfully added question to question set " + questionSet);
    console.log("Successfully added question to question set " + questionSet); 
    resultBool = true;
  }else{
    ctx.reply("Question set " + questionSet + " does not exist");
    console.log("Question set " + questionSet + " does not exist");
  }
  
  return resultBool
}

function deleteQuestionFromQuestionSet(questionSet, questionNum, ctx){

  var resultBool = false;
  
  if(questionSets.has(questionSet)){
    var arr = questionSets.get(questionSet).questions;
    if(questionNum <= arr.length){
      arr.splice(questionNum - 1, 1);
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

function listQuestionsFromQuestionSet(questionSet, ctx){
  
  var resultBool = false;
  
  if(questionSets.has(questionSet)){
    var num = 1;
    var print = "";
    var arr = questionSets.get(questionSet).questions;
    for(var x = 0; x < arr.length; x++){
      print += num + ". " +  arr[x].question + "\n";
      num++;
    }
    ctx.reply(print);
    console.log(print);
    resultBool = true;
  }else{
    ctx.reply("Question set " + questionSet + " does not exist");
    console.log("Question set " + questionSet + " does not exist");
  }
  
  return resultBool;
}

function addUserResponseToQuestion(questionSet, question, response, userID, ctx){
  
  var qSet = questionSets.get(questionSet);
  
  console.log("Inside aURTQ: ");
  console.log("qSet: " + qSet.name);
  
  var q = qSet.questions[parseInt(question)];
  var ur = q.users_response;
  if(ur.has(userID)){
    ctx.reply("Replaced response by userID " + userID + " to question " + question + " from questionSet " + questionSet);
    console.log("Replaced response by userID " + userID + " to question " + question + " from questionSet " + questionSet);
  }else{
    ur.set(userID, response);
    ctx.reply("Response by userID " + userID + " added to question " + question + " from questionSet " + questionSet);
    console.log("Response by userID " + userID + " added to question " + question + " from questionSet " + questionSet);
  }
  return true;
}

function deleteUserResponseFromQuestion(questionSet, question, userID, ctx){
  
  var qSet = questionSets.get(questionSet);
  var q = qSet.questions[question];
  var ur = q.users_response;
  ur.delete(userID);
  ctx.reply("Response by userID " + userID + " deleted from question " + question + " from questionSet " + questionSet);
  console.log("Response by userID " + userID + " deleted from question " + question + " from questionSet " + questionSet);
  return true;
}

function listUserResponseFromQuestion(questionSet, question, ctx){
  
  var qSet = questionSets.get(questionSet);
  var q = qSet.questions[question];
  var ur = q.users_response;
  if(ur.size != 0){
    var print = "";
     ur.forEach(function(key, value){
        print = print + "User " + value + " : " + key + "\n";
     });
    ctx.reply(print);
    console.log(print);
  }else{
      ctx.reply("No response to question");
      console.log("No response to question");
  }
}

// *********************************************************************************
// *         -----------        USER CLASS AND METHODS        -------------        *
// *********************************************************************************


function User (id, name) {
    this.isAdmin = false;
    this.id = id;
    this.name = name;
    this.state = "idle"; // idle, Qset, Ans
    this.currQSet = null;
    this.QSets = [];
}

function getState(id){
  var currUser = userMap.get(id);
  return currUser.state;
}

function getCurrQSet(id){
  var currUser = userMap.get(id);
  return currUser.currQSet;
}

function getQSets(id){
  var currUser = userMap.get(id);
  return currUser.QSets;
}

function setState (id, state) {
  var currUser = userMap.get(id);
  currUser.state = state;
}
  
function isAdmin(id){
  var currUser = userMap.get(id);
  return currUser.isAdmin;
}


// *********************************************************************************
// *         -----------            HELPER FUNCTIONS          -------------        *
// *********************************************************************************


function initializeUserMap(){
    
    console.log("Creating new user map.");
  
    var tempMap = new Map();
  
    for (var i = 0; i < admins.length; i++) {
        var tempUser = new User(admins[i][0], admins[i][1]);
        tempUser.isAdmin = true;
      
        tempMap.set(admins[i][0], tempUser);
        
        console.log(tempUser.name + " added as admin.");
    }
  
    console.log("User map initialized");
  
    return tempMap;
}

function help(id, ctx){

  var result = "";
  
  if (isAdmin(id)) {
    result += "--- ADMINISTRATOR COMMANDS ---\n\n"
  
    result += "/qSet to manage your question sets. \n";
  }
  
  result += "\n--- USER COMMANDS ---\n\n";
  
  result += "/res to answer question sets or manage responses. \n";
  result += "/help to view the manual\n";    
  
  ctx.reply(result);
  
}

function printQSetOptions(id, ctx) {
    var inlineKeyboardArray = [Markup.callbackButton('Add new Q set', "AddQSet")];
    var qSets = getQSets(id);
  
    if (qSets.length == 0) {
        inlineKeyboardArray.push(Markup.callbackButton("No Q sets to show", "blank"));
    } else {
      qSets.forEach(function(value){
        inlineKeyboardArray.push(Markup.callbackButton(value, "EditQSet " + value));
      })
    }
  
    inlineKeyboardArray.push(Markup.callbackButton("Save and exit", "EXIT"));
  
    return ctx.reply("Add a new question set\n\n OR \n\n Select a question set to edit", Markup.inlineKeyboard(inlineKeyboardArray).extra());
}

function checkUniqueId(ctx){
    
    const id = ctx.from.id;
  
    if(!userMap.has(id)) {
        userMap.set(id, new User(id, ctx.from.first_name));
    }
     
    return ;
}



// *********************************************************************************
// *         -----------          SWITCH STATEMENTS           -------------        *
// *********************************************************************************



bot.on("callback_query", (ctx) => {
  var dataArr = ctx.callbackQuery.data.split(" ");
  var id = ctx.from.id;
  var choice = dataArr[0];
  
  switch(choice){
    case "AddQSet":
      ctx.reply("Enter name of QSet: ");
      setState(id, "addQSet");      
      return;
    case "EditQSet":
      
      var qSet = dataArr[1];
      return;
  }
})

bot.hears(/(.*)/, (ctx) => {
  
  var messageArr = ctx.message.text.split(" ");
  var command = messageArr[0];
  const id = ctx.from.id;
  
  checkUniqueId(ctx);
  
  console.log("Command received: " + command);
  
  if(isAdmin(id)){
    switch(command){
      case "/qSet":
        setState(id, "qSet");
        printQSetOptions(id, ctx);
        return;
    }
  } 
  //For All
  switch(command){
      case "/help":
        help(id, ctx);
        return;
      
      case "/res" :
        setState(id, "res");
        //Do ans protocol
        return;
      
    default:
      textInput(ctx);
      return;
  }
})

function textInput(ctx){
  const id = ctx.from.id;
  const state = getState(id);
  const message = ctx.from.message;
  var currUser = userMap.get(id);
  var qSets = getQSets(id);
  
  switch(state){
    case "addQSet":
      currUser.currQSet = message;
      qSets.push(message);
      
      
      
      setState(id, "AddQ");
      
      return;
  }
}

        
bot.startPolling();