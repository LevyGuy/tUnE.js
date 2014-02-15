// ------------ JSLint Globals to hide errors ----------------
/* global console, webkitSpeechRecognition  */
/* jslint plusplus: true, unused:false */
// ------------ JSLint Globals to hide errors ----------------

(function( window ){

    "use strict";

    var debugMode = true;

    
    // Private
    var yArDs = {

        // params holder
        options: {

            noSupportCallback: null,
            interimResults: false,

            lang: 'en-US',

            confidence: 5,

            prefix: null,
            prefixDistance: 0,
            prefixCallback: null, // A Callback once the prefix is initiated

            operations: []

        },


        prefixInput: false,

        

        // Init the plugin
        init: function(params){
            var self = this;

            // Check for Speech Recognition Browser feature
            if( self.checkCompatibility() ){
                
                // If Speech Recognition exist.
                // 
                // 1. Get the params from the user and set them
                self.setParams(params);

                // 2. set the prefix 
                self.prefixInput = !self.options.prefix;
                
                // 2. create the dictionary from the user params
                self.createGrammar();

                // 3. listen to user input
                self.listen();
                
            }

        },

        // Check if the brwser have speech recognition enabled
        checkCompatibility: function(){
            var self = this;

            self.speechRecogObj = window.webkitSpeechRecognition;

            if(!self.speechRecogObj){
                
                if(debugMode){ console.log("%cNo Speech recognition for you! Come back, one year!", "color:red;"); }
                
                if( typeof self.options.noSupportCallback === "function" ){
                    self.options.noSupportCallback();
                }
                
                return false;
                
            } else {
                
                if(debugMode){ console.log("%cSpeech recognition exist!", "color:green;"); }
                
                return true;
                
            }

        },


        /*
         * Set the params from the user suplied options
         */
        setParams: function(params){
            var o = this.options;

            if(params){
                for(var i in params){
                    if(params.hasOwnProperty(i)){
                        o[i] = params[i];
                    }
                }
            }

        },
            
                
        /*
         * Create the dictionary for the speech recognition from the user specified operations 
         */
        createGrammar: function(){
            var self = this,
                op = self.options.operations,
                dictArr = [],
                opArr = [];

            for(var i = 0, len = (op.length) ? op.length : 0; i<len; i++){
                
                var say = op[ i ].say;
                
                if( typeof say === "string" ){
                
                    // The grammar
                    dictArr.push( say );

                    // The functions
                    opArr.push( op[ i ] );   
                    
                } else {
                    
                    // Array
                    for(var j=0, l = say.length; j < l; j++){
                        
                        dictArr.push( say[ j ] );
                        
                        opArr.push( op[ i ] );  
                        
                    }
                    
                }

                
            }

            // Hold all the operations in the dictionary
            
            // The grammar
            self.grammar = [].concat.apply( [], dictArr );
            
            // all the functions in the same order
            self.ops = [].concat.apply( [], opArr );
            
        },
                          

        // Listen for user voice input
        listen: function(){
            var self = this;

            // Set the voice input
            self.speechObj = new self.speechRecogObj;
            self.speechObj.continuous = true;
            self.speechObj.interimResults = self.options.interimResults;
            self.speechObj.lang = self.options.lang;
            self.speechObj.onresult = function(ev) {
                
                    // Once we have speech results
                    var input = ev.results[ev.results.length-1][0].transcript;
                    self.ev = ev;
                    
                    if(debugMode){
                        console.log("%cUser input: " + input, "color:green;");
                    }
                    

                    if( !self.prefixInput ){
                        
                        // If prefix exist. listen to prefix input
                        self.getPrefixInput(input);
                        
                    } else {
                        
                        // Else just get the input with the dictionary
                        self.checkSpeechInput(input);
                        
                    }

                };
                
                
            self.speechObj.onend = function(){ 
                
                // Restart only on ssl
                if( location.protocol === "https:" ){
                    self.speechObj.start();
                }
                
            }
            
            self.speechObj.start();
 
        },

        // Listen to the prefix input to initiate the operation listeners
        getPrefixInput: function(input){
            var self = this,
                o = self.options;
      
            if( o.prefix.indexOf( input ) !== -1 ){
                
                self.execPrefixInput();
                return;
                
            }

            var confidence = self.levenshteinDistance( o.prefix, input );
            if( confidence <= o.prefixConfidence ){
                
                self.execPrefixInput();
                
            }
            

        },
            
        // Exec prefix
        execPrefixInput: function (){
            var self = this,
                o = self.options;

            self.prefixInput = true;

            // Callback once we got the prefix
            if (typeof o.prefixCallback === "function") {

                o.prefixCallback();

            }            
            
        },
        

        /*
         * Once we passed the prefix 
         *  Check for the operations
         */
        checkSpeechInput: function(input){
            var self = this,
                o = self.options;
        
            var results = self.getDistanceFromArray( input ); 

            var res = self.ops[ results.index ];
            var confidence = res.confidence || o.confidence;

            if(results.confidence <= confidence){

                // On ssl only
                if( o.interimResults ){
                    self.speechObj.abort();
                }
                
                res.exec( self.grammar[ results.index ], results.confidence, self.ev );
                
            }

        },


        // TODO -> add a strign comparison with indexof
        getDistanceFromArray: function ( input ){
    
            var confidenceArr = [],
                grammar = this.grammar,
                len = grammar.length;

            while (len--) {
                confidenceArr[len] = this.levenshteinDistance( grammar[len], input );
            }

            var minDistance = Math.min.apply( Math, confidenceArr ),
                index = confidenceArr.indexOf( minDistance );

            return {
                confidence: minDistance,
                index: index
            };
            
        },
                
          
        reInitListen: function(){
            var self = this;
                        
            // Execute the function
            if( typeof self.options.doneOperation === "function" ){
                
                self.options.doneOperation();
                
            }
            
            // Destroy the prefix after the callback is done
            self.prefixInput = !self.options.prefix;
            
            self.speechObj.abort();
            
        },

        levenshteinDistance: function (s, t){
            var d = []; //2d matrix

            // Step 1
            var n = s.length;
            var m = t.length;

            if (n === 0) {
                return m;
            }
            if (m === 0) {
                return n;
            }

            var i = n;
            //Create an array of arrays in javascript (a descending loop is quicker)
            for (; i >= 0; i--) {
                d[i] = [];
            }

            // Step 2
            for (i = n; i >= 0; i--) {
                d[i][0] = i;
            }
            var j = m;
            for (; j >= 0; j--) {
                d[0][j] = j;
            }

            // Step 3
            for (i = 1; i <= n; i++) {
                var s_i = s.charAt(i - 1);

                // Step 4
                for (j = 1; j <= m; j++) {

                    //Check the jagged ld total so far
                    if (i === j && d[i][j] > 4) {
                        return n;
                    }

                    var t_j = t.charAt(j - 1);
                    var cost = (s_i === t_j) ? 0 : 1; // Step 5

                    //Calculate the minimum
                    var mi = d[i - 1][j] + 1;
                    var b = d[i][j - 1] + 1;
                    var c = d[i - 1][j - 1] + cost;

                    if (b < mi) {
                        mi = b;
                    }
                    if (c < mi) {
                        mi = c;
                    }

                    d[i][j] = mi; // Step 6

                    //Damerau transposition
                    if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
                        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                    }
                }
            }

            // Step 7
            return d[n][m];
        }


    };

    window.tUnE = function(params){
        yArDs.init(params);
    };
    
    window.tUnE.reInit = function(){
        yArDs.reInitListen();
    };

})( window );