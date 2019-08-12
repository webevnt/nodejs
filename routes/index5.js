'use strict';

let dataArray = require('./student.json');
let ansArray = require('./answers.json');

const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'] });
// Adds the utterances and intents for the NLP

//dataArray[0].input;

//manager.addDocument('en', 'can you tell me 2nd sem syllabus', 'greetings.sem2');
//manager.addDocument('en', 'can you tell me 3rd sem syllabus', 'greetings.sem3');
//manager.addDocument('en', 'can you tell me 4th sem syllabus', 'greetings.sem4');
//manager.addDocument('en', 'can you tell me 5th sem syllabus', 'greetings.sem5');
//manager.addDocument('en', 'goodbye for now', 'greetings.bye');
//manager.addDocument('en', 'bye bye take care', 'greetings.bye');
//manager.addDocument('en', 'okay see you later', 'greetings.bye');
//manager.addDocument('en', 'bye for now', 'greetings.bye');
//manager.addDocument('en', 'i must go', 'greetings.bye');
//manager.addDocument('en', 'hello', 'greetings.hello');
//manager.addDocument('en', 'hi', 'greetings.hello');
//manager.addDocument('en', 'howdy', 'greetings.hello');



// Train also the NLG
//manager.addAnswer('en','greetings.sem2', '2nd sem');
//manager.addAnswer('en','greetings.sem3', '3rd sem');
//manager.addAnswer('en', 'greetings.bye', 'Till next time');
//manager.addAnswer('en', 'greetings.bye', 'see you soon!');
//manager.addAnswer('en', 'greetings.hello', 'Hey there!');
//manager.addAnswer('en', 'greetings.hello', 'Greetings!');



for (let j = 0; j < dataArray.length; j += 1) {
	manager.addDocument('en',dataArray[j].input , dataArray[j].intent);
 //console.log(dataArray[j].name);         
}



for (let j = 0; j < ansArray.length; j += 1) {
	manager.addAnswer('en',ansArray[j].intent,ansArray[j].output);
 //console.log(dataArray[j].name);         
}


// Train and save the model.
(async() => {
    await manager.train();
    manager.save();
    const response = await manager.process('en', 'i love you');
    const threshold = 0.5;

const answer =
        response.score > threshold && response.answer
          ? response.answer
          : "Sorry, I don't understand";    
    console.log(answer);
})();  

