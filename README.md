# fake-google-trans
Using google-translate-token to use it google translate free
# Instruction
* Run node app.js or npm test
* Go to localhost:1800||[process.env.port] to get views
* Get [process.env.port]/transapi/gettoken/:text to get token
* Get [process.env.port]/transapi/gettext/:lang1/:lang2/:text to get text translate
* Get [process.env.port]/transapi/speech/:lang/:text to get audio
* Get [process.env.port]/transapi/srcspeech/:lang/:text to get link that get audio
Powered by express and google-translate-token!
April 17th 2018
