const Telegraf = require("telegraf");
const Map = require("es6-map");
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const admins = [["377961259", "Dominic"], ["426938277", "Zhi Xuan"]]

var userMap = initializeUserMap();
var questionSets = require("data-store")("questionSets", {
    cwd: "data"
});

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
  this.isLocked = false;
  this.questions = [];
}

function Question(questionString){
  this.question = questionString;
  this.users_response = [];    
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
    ctx.reply("\"" + questionString + "\" successfully added to question set " + questionSet + " as #" + arr.length); 
    console.log("\"" + questionString + "\" successfully added to question set " + questionSet + " as #" + arr.length); 
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

function editQuestionFromQuestionSet(questionSet, questionNum, questionString, ctx){

  var resultBool = false;
  
  if(questionSets.has(questionSet)){
    var arr = questionSets.get(questionSet).questions;
    if(questionNum <= arr.length){
      arr.splice(questionNum - 1, 1, new Question(questionString));
      ctx.reply("Question " + questionNum + " successfully edited from " + questionSet);
      console.log("Question " + questionNum + " successfully edited from " + questionSet);
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
    var print = "Here are your questions nyaa\n\n";
    var arr = questionSets.get(questionSet).questions;
    
    if (arr.length == 0) {
      print += "No questions found :(";
    } else {
      for(var x = 0; x < arr.length; x++){
        print += num + ". " +  arr[x].question + "\n";
        num++;
      }
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

function addUserResponseToQuestion(questionSet, questionNum, response, userID, ctx){
  
  var qSet = questionSets.get(questionSet);
  
  console.log("Inside aURTQ: ");
  console.log("qSet: " + qSet.name);
  
  if(0 < questionNum && questionNum <= qSet.questions.length){
    var q = qSet.questions[questionNum - 1];    
    var ur = q.users_response;
    if(mapHas(userID, ur)){

      //ur.set(userID, response);
      mapSet(userID, response, ur);
      
      ctx.reply(response + " overwrited in " + questionSet + " #" + questionNum);
      console.log(response + " overwrited in " + questionSet + " #" + questionNum + " from: " + userID);

    }else{
      //ur.set(userID, response);
      mapSet(userID, response, ur);
      
      //ctx.reply(response + " saved in " + questionSet + " #" + questionNum);
      console.log(response + " saved in " + questionSet + " #" + questionNum + " from: " + userID);
    }
    return true;
  }else{
    ctx.reply("Question number out of range");
    console.log("Question number out of range");
  }
}

function deleteUserResponseFromQuestion(questionSet, questionNum, userID, ctx){
  
  var qSet = questionSets.get(questionSet);
  if(0 < questionNum && questionNum <= qSet.questions.length){
    var q = qSet.questions[questionNum - 1];
    var ur = q.users_response;
    
    //ur.delete(userID);
    mapDel(userID, ur);
    
    ctx.reply("Deleted #" + questionNum + " from question set " + questionSet);
    console.log("Deleted #" + questionNum + " from questionSet " + questionSet + " from: " + userID);
    return true;
  }else{
    ctx.reply("Question number out of range");
    console.log("Question number out of range");
  }
}

// *********************************************************************************
// *         -----------             PRINTING                 -------------        *
// *********************************************************************************

function printUserResponsesToQuestionSet(questionSet, id, ctx){
  
  var qSet = questionSets.get(questionSet);
  var questions = qSet.questions;
  if(questions.length == 0){
     ctx.reply("No questions in question set");
     console.log("No questions in question set");
  }else{
     var print = "";
     for(var i = 1; i <= questions.length; i++){
        var q = questions[i - 1];
        var ur = q.users_response;
        if(mapHas(id, ur) != -1){
          var res = mapGet(id, ur);
          print += i + ". " + q.question + "\n" + res + "\n\n";
        }else{
          print += i + ". " + q.question + "\nNO ANSWER\n\n";
        }
     }
     ctx.reply(print);
  }
}

function listUserResponseFromQuestion(questionSet, questionNum, ctx){
  
  var qSet = questionSets.get(questionSet);
  var q = qSet.questions[questionNum - 1];
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
    this.id = String(id);
    this.name = name;
    this.state = "idle"; // idle, qSet, addQ, addQSet, ans
    this.currQSet = null;
    this.currQNum = -1;
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

function setCurrQSet(id, qSet){ //null qSet for idling
  
  var currUser = userMap.get(id);
  currUser.currQSet = qSet;
  
}

function getCurrQNum(id){
  
  var currUser = userMap.get(id);
  return currUser.currQNum;
}

function setCurrQNum(id, num){

  var currUser = userMap.get(id);
  currUser.currQNum = num;
}

function getQSets(id){
  var currUser = userMap.get(id);
  return currUser.QSets;
}

function setState (id, state) {
  var currUser = userMap.get(id);
  
  console.log(currUser.name + " state changed to " + state + ".");

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
  
    var tempMap = require("data-store")("userMap", {
      User,
      cwd: "data"
    });
  
    for (var i = 0; i < admins.length; i++) {
      
      if (!tempMap.has(admins[i][0])){
        var tempUser = new User(admins[i][0], admins[i][1]);
        tempUser.isAdmin = true;
        tempMap.set(admins[i][0], tempUser);
        console.log(tempUser.name + " added as admin.");
      }
    }
  
    console.log("User map initialized.");
  
    return tempMap;
}

function help(id, ctx){

  var result = "";
  
  if (isAdmin(id)) {
    result += "--- ADMINISTRATOR COMMANDS ---\n\n"
  
    result += "/qSet to manage your question sets. \n";
  }
  
  result += "\n--- USER COMMANDS ---\n\n";
  
  result += "/ans to answer question sets or manage responses. \n";
  result += "/help to view the manual\n";    
  
  ctx.reply(result);
  
}

function printQSetOptions(id, ctx) {
    var inlineKeyboardArray = [];
    var qSets = getQSets(id);
  
    inlineKeyboardArray.push([Markup.callbackButton('Add new Q set', "AddQSet")]);
  
    if (qSets.length == 0) {
        inlineKeyboardArray.push([Markup.callbackButton("No Q sets to show", "blank")]);
    } else {
      qSets.forEach(function(value){
        inlineKeyboardArray.push([Markup.callbackButton(value, "EditQSet " + value)]);
      })
    }
  
    inlineKeyboardArray.push([Markup.callbackButton("Save and Exit", "ExitQSetOptions")]);
  
    return ctx.reply("Add a new question set\n                  or\nSelect a question set to edit", Markup.inlineKeyboard(inlineKeyboardArray).extra());
}

function printQOptions(id, ctx) {
    
    var qSet = questionSets.get(getCurrQSet(id));
    var inlineKeyboardArray = [];
  
    inlineKeyboardArray.push([Markup.callbackButton('Add Question', "AddQ"), Markup.callbackButton('Edit Question', "EditQ")]);
    inlineKeyboardArray.push([Markup.callbackButton('Delete Question', "DelQ"), Markup.callbackButton('View Questions', "ViewQ")]);
    
    if(qSet.isLocked) {
      inlineKeyboardArray.push([Markup.callbackButton('Unlock Q Set', "LockQSet")]);  
    } else {
      inlineKeyboardArray.push([Markup.callbackButton('Lock Q Set', "LockQSet")]);
    }

    inlineKeyboardArray.push([Markup.callbackButton('Save and Exit', "ExitQOptions")]);
  
    return ctx.reply("Select an option to edit your question set " + getCurrQSet(id), Markup.inlineKeyboard(inlineKeyboardArray).extra());
}

function printAnswerOptions(id, ctx){
   var inlineKeyboardArray = [];
  
   inlineKeyboardArray.push([Markup.callbackButton('Add Answer', "AddAns"), Markup.callbackButton('Edit Answer', "EditAns")]);
   inlineKeyboardArray.push([Markup.callbackButton('Delete Answer', "DelAns"), Markup.callbackButton('View Answers', "ViewAns")]);
   inlineKeyboardArray.push([Markup.callbackButton('Save Answers and Exit', "ExitAns")]);
  
   return ctx.reply("Select an option to edit your answers to the question set " + getCurrQSet(id), Markup.inlineKeyboard(inlineKeyboardArray).extra());
}
function checkUniqueId(ctx){
    
    const id = String(ctx.from.id);
  
    if(!userMap.has(id)) {
        userMap.set(id, new User(id, ctx.from.first_name));
    }
     
    return ;
}

function saveUserMap(id){
    userMap.set(id, userMap.get(id)); 
}

function saveQSets(qSetName){
    questionSets.set(qSetName, questionSets.get(qSetName));  
}

//returns index if found, else returns -1
function mapHas(key, arr){
  for (var i = 0; i < arr.length; i++){
       if (arr[i][0] == key){
          return i;
       }
  }  
  return -1;

}

//pre-condition: key must exist
function mapGet(key, arr){
  for (var i = 0; i < arr.length; i++){
    if (arr[i][0] == key) {
      return arr[i][1];
    }
  }
  
  return null;
}

//replaces element if key exist, else pushes a new entry into map
function mapSet(key, ele, arr){
  
  var duplicate = mapHas(key, arr);
  
  if (duplicate == -1) {
    arr.push([key, ele]);  
  } else {
      arr[duplicate][1] = ele;
      return null;
  }
  
  return null;

}

function mapDel(key, arr){
  
  for (var i = 0; i < arr.length; i++){
    if (arr[i][0] == key){
      arr.splice(i, 1);
      console.log("Removed key: " + key + ".");
      
      return null;
    }
  }
  
  console.log("mapDel key: " + key + " not found.");
  return null;
}


// *********************************************************************************
// *         -----------          SWITCH STATEMENTS           -------------        *
// *********************************************************************************



bot.on("callback_query", (ctx) => {

  console.log("Callback from " + ctx.from.first_name + " with " + ctx.callbackQuery.data);
  
  var dataArr = ctx.callbackQuery.data.split(" ");
  var id = String(ctx.from.id);
  var choice = dataArr[0];

  switch(choice){
    case "AddQSet":
      setState(id, "addQSet");
      
      ctx.reply("Enter name of new question set: ");
            
      return;
      
    case "EditQSet":
      var qSet = dataArr[1];
      setState(id, "editQSet");
      setCurrQSet(id, qSet);
      printQOptions(id, ctx);
      
      return;
      
    case "ExitQSetOptions":
      setState(id, "idle");
      userMap.set(id, userMap.get(id));
      ctx.reply("Save Successful \n Exiting");
      return;
      
    case "AddQ":
      setState(id, "addQ");
      ctx.reply("Type out your questions, then type /finish to stop.");
      return;
    
    case "EditQ":
      var questionSet = questionSets.get(getCurrQSet(id));
      if(questionSet.questions.length == 0){
        ctx.reply("No Questions :("); 
        printQOptions(id, ctx);
      }else{
        setState(id, "editQ");
        listQuestionsFromQuestionSet(getCurrQSet(id), ctx);
        ctx.reply("Enter question number and the editted question seperated by a space.\n E.G \"7 Is SoCat cute?\"");
      }
      return;
    
    case "DelQ":
      var questionSet = questionSets.get(getCurrQSet(id));
      if(questionSet.questions.length == 0){
        ctx.reply("No Questions :(");
        printQOptions(id, ctx);
      }else{
        setState(id, "delQ");
        listQuestionsFromQuestionSet(getCurrQSet(id), ctx);
        ctx.reply("Enter question number to delete: ");
      }
      return;
      
    case "ViewQ":
      listQuestionsFromQuestionSet(getCurrQSet(id), ctx)
      printQOptions(id, ctx);
      return;
    
    case "LockQSet":
       var qSet = questionSets.get(getCurrQSet(id));
       qSet.isLocked = !qSet.isLocked;
       ctx.reply("Question Set is locked?: " + qSet.isLocked);
       printQOptions(id, ctx);
       return;
      
    case "ExitQOptions":
      saveUserMap(id);
      saveQSets(getCurrQSet(id));
      
      setState(id, "idle");
      setCurrQSet(id, null);
            
      ctx.reply("Successfully saved and exit");
      
      return;
      
    case "AddAns":
      var qSet = questionSets.get(getCurrQSet(id));
      setCurrQNum(id, 1);
      var currQNum = getCurrQNum(id);
      ctx.reply(currQNum + ". " + qSet.questions[currQNum - 1].question);
      setState(id, "addAns");
      return;
    
    case "DelAns":
      printUserResponsesToQuestionSet(getCurrQSet(id), id, ctx);
      ctx.reply("Enter question number to be delete:");
      setState(id, "delAns");
      return;
    
    case "EditAns":
      printUserResponsesToQuestionSet(getCurrQSet(id), id, ctx);
      ctx.reply("Enter question number and the editted response seperated by a space.\n E.G \"1 Yes, I love cats\"");
      setState(id, "editAns");
      return;
      
    case "ViewAns":
      printUserResponsesToQuestionSet(getCurrQSet(id), id, ctx);
      printAnswerOptions(id, ctx);
      return;
      
    case "ExitAns":
      setCurrQSet(id, "idle");
      setState(id, "idle");

      saveUserMap(id);
      saveQSets(getCurrQSet(id));
      
      ctx.reply("Succesfully saved and exit");
      return;
  }
})

bot.hears(/(.*)/, (ctx) => {
  
  var messageArr = ctx.message.text.split(" ");
  var command = messageArr[0];
  const id = String(ctx.from.id);
  
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
      
      case "/ans":
        setState(id, "chooseAnsQSet");
        ctx.reply("Enter question Set to answer: ");
        return;
      
      case "/finish":
        setState(id, "editQSet");
        printQOptions(id, ctx);
        return;
    default:
      textInput(ctx);
      return;
  }
})

function textInput(ctx){
  const id = String(ctx.from.id);
  const state = getState(id);
  const message = ctx.message.text;
  var currUser = userMap.get(id);
  var qSets = getQSets(id);  
  
  switch(state){
    case "addQSet":
      currUser.currQSet = message;
      qSets.push(message);
      addQuestionSet(message, ctx)      
      setState(id, "addQ");
      
      ctx.reply("Type out your questions one after another, then type /finish to stop.");
      
      return;
    case "addQ":
      addQuestionToQuestionSet(currUser.currQSet, message, ctx);
      return;
      
    case "delQ":
      deleteQuestionFromQuestionSet(currUser.currQSet, message, ctx);
      setState(id, "editQSet");
      printQOptions(id, ctx);
      return;
      
    case "editQ":
      var splitMessage = message.split(" ");
      var questionNum = parseInt(splitMessage[0]);
      var questionString = splitMessage.slice(1);
      questionString = questionString.join(" ");
      editQuestionFromQuestionSet(currUser.currQSet, questionNum, questionString, ctx);
      setState(id, "editQSet");
      printQOptions(id, ctx);
      return;
      
    case "chooseAnsQSet":
      if(questionSets.has(message)){
         if(!questionSets.get(message).isLocked){
           setCurrQSet(id, message);
           setState(id, "ansQSet");
           printAnswerOptions(id, ctx);
         }else{
            ctx.reply("Question Set " + message + " is locked for answering"); 
         }
      }else{
         ctx.reply("Question Set " + message + " does not exist");
        setState(id, "idle");
      }
      return;
    
    case "addAns":
      
      console.log("Inside addAns state from " + currUser.name);
      
      var currQNum = getCurrQNum(id);
      var currQSet = getCurrQSet(id)
      var qSet = questionSets.get(currQSet);
      var questions = qSet.questions;
      addUserResponseToQuestion(currQSet, currQNum, message, id, ctx);
      currQNum = currQNum + 1;
      setCurrQNum(id, currQNum);
      if(currQNum <= questions.length){
        ctx.reply(currQNum + ". " + questions[currQNum - 1].question);
      }else{ //No More Questions
        ctx.reply("You have finished answering. \n");
        setCurrQNum(id, -1);
        setState(id, "ansQSet");
        printUserResponsesToQuestionSet(currQSet, id, ctx);
        printAnswerOptions(id, ctx);
      }
      return;
      
    case "delAns":
      deleteUserResponseFromQuestion(getCurrQSet(id), parseInt(message), id, ctx)
      setState(id, "ansQSet");
      printAnswerOptions(id, ctx);
      return;
      
    case "editAns":
      var currQSet = getCurrQSet(id);
      var splitMessage = message.split(" ");
      var questionNum = parseInt(splitMessage[0]);
      var ansString = splitMessage.slice(1);
      ansString = ansString.join(" ");
      addUserResponseToQuestion(currQSet, questionNum, ansString, id, ctx);
      setState(id, "ansQSet");
      printAnswerOptions(id, ctx);
      return;
  }
}

        
bot.startPolling();