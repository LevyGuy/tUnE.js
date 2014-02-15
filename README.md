# tUnE.js 
Speech recognition grammar POC for webkit using the Levenshtein distance algorithm

## About
After playing around a bit with the speech recognition API I've found out that the API fail to detect the correct sentence when encountering a person with bag English like myself :) ( [here is a funny video to demonstrate that](http://youtu.be/5FFRoYhTJQQ) ).

This could be a problem when the app is waiting for the user input and the API fail to deliver.

The correct way to tackle this would be using the speech recognition grammar API, however I could not get it to work for some reason.

So I've decided to write a little POC on a speech recognition grammar API using the [Levenshtein distance algorithm](http://en.wikipedia.org/wiki/Levenshtein_distance). 
The app will pass an array of strings and the admissible distance between each string and the speech API results. Thus even if the speech recognition API failed to deliver the accurate phrase we can still say that the distance between our expected input and the API results is a valid distance and execute any relevant callback.

## Examples
I've created a little “cube test” to test the results.
The first test can be viewed here: http://youtu.be/SrXxLkWRf8A
it compares the results between 


1. a cube with the grammar plugin with no intrim results

2. a cube with the grammar plugin with intrim results


The second test is a little plugin for cnn. You can view the demo here: http://youtu.be/2nnhcHqt4Vk
the plugin will collect all the links on the page and will pass them to the grammar plugin. Once we get a valit input the plugin will click the article link.

## How to use

```javascript
tUnE({
    prefix: "ok google",    // Prefix to start listening
    prefixConfidence: 7,    // The distance for the prefix
    interimResults: false,  // Check against Intermediate results (I'm still testing that).
    prefixCallback: function (){
        // Listening
    },
    doneOperation: function (){
        // Stop
    },
    confidence: 4,          // Global confidence. default is 5.
    operations: [
        {
            say: ["move left", "move right"],       // Commands
            confidence: 5,  // Private confidence
            exec: function(phrase, confidence, event){
                console.log("moving", phrase, confidence, event); // We have results
            }
        },
        {
            say: "i'm done",    // We can have an array or a string
            exec: function(){
                console.log("I'm done");
                tUnE.reInit();  // Re-init the listener
            }
        }                            
    ]
});
```

