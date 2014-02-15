// Collect all the links
var allLinks = document.getElementsByTagName("a");

// Create the Text dictionary
var grammar = [];
for( var i = 0, len = allLinks.length; i < len; i++ ){
    grammar.push( allLinks[i].textContent );
}

tUnE({
    prefix: "ok cnn",
    prefixConfidence: 7,
    interimResults: false,
    prefixCallback: function() {
        console.log("%cListening!", "background:green;");
    },
    doneOperation: function() {
        console.log("%cDone!", "color:green;");
    },
    confidence: 6,
    operations: [
        {
          say: ["scroll down", "scroll up"],
          exec: function (exp, distance, ev){
            console.log("exp", exp);
            var count = 0,
                scrollBy = (exp === "scroll down") ? 10 : -10;
            var intVal = setInterval(function (){
                count += 10;
                if(count > window.innerHeight){
                    clearInterval(intVal);
                }
                window.scrollBy(0, scrollBy);
            }, 50);
          }
        },
        {
            say: grammar,
            confidence: 20,
            exec: function (exp, distance, ev){
                var element = allLinks[ grammar.indexOf( exp ) ];
                console.log("Yes!", exp, element);
                element.click();
            }
        }
    ]
});