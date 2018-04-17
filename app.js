const express = require('express');
const app = express();
const token = require('google-translate-token')
const got = require('got')
const querystring = require('querystring')
const safeEval = require('safe-eval')

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", "./views");

const server = require("http").Server(app);
server.listen(process.env.PORT || 1800, () => console.log('This app run in port 1800'));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/transapi/gettoken/:text", (req, res) => {
    token.get(decodeURI(req.params.text.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''))).then((token) => {
        res.json(token)
    }).catch((err) => {
        let e;
        e = new Error()
        if (err.statusCode !== undefined && err.statusCode !== 200) {
            e.code = 'BAD_REQUEST'
        } else {
            e.code = 'BAD_NETWORK'
        }
        throw e
    });
});

app.get("/transapi/gettext/:lang1/:lang2/:text", (req, res) => {
	let query = getCleanURI(req.params.text)
    token.get(query).then((token) => {
    	console.log(token)
        let url = 'https://translate.google.com/translate_a/single'
        let data = {
            client: 't',
            sl: req.params.lang1,
            tl: req.params.lang2,
            hl: req.params.lang2,
            dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
            ie: 'UTF-8',
            oe: 'UTF-8',
            otf: 1,
            ssel: 0,
            tsel: 0,
            kc: 7,
            q: query
        }
        data[token.name] = token.value
        console.log(url + '?' + querystring.stringify(data))
        return (url + '?' + querystring.stringify(data))
    })
    .then((url) => {
        got(url).then((resl) => {
            var result = {
                text: '',
                from: {
                    language: {
                        didYouMean: false,
                        iso: ''
                    },
                    text: {
                        autoCorrected: false,
                        value: '',
                        didYouMean: false
                    }
                },
                raw: ''
            }
            result.raw = resl.body
            let body = safeEval(resl.body)
            body[0].forEach(function (obj) {
                if (obj[0]) {
                    result.text += obj[0]
                }
            });
            if (body[2] === body[8][0][0]) {
                result.from.language.iso = body[2]
            } else {
                result.from.language.didYouMean = true
                result.from.language.iso = body[8][0][0]
            }
            if (body[7] && body[7][0]) {
                var str = body[7][0]

                str = str.replace(/<b><i>/g, '[')
                str = str.replace(/<\/i><\/b>/g, ']')
                result.from.text.value = str
                if (body[7][5] === true) {
                    result.from.text.autoCorrected = true
                } else {
                    result.from.text.didYouMean = true
                }
            }
			res.send(result)
        })
    })
    .catch(function(err) {
        let e;
        e = new Error();
        if (err.statusCode !== undefined && err.statusCode !== 200) {
            e.code = 'BAD_REQUEST'
        } else {
            e.code = 'BAD_NETWORK'
        }
        throw e
    })
});

app.get("/transapi/speech/:lang/:text", (req, res) => {
	let query = getCleanURI(req.params.text)
    token.get(query).then((token) => {
    	console.log(token)
        let url = 'https://translate.google.com/translate_tts'
        let data = {
            ie: 'UTF-8',
            q: query,
            tl: req.params.lang,
            total: '1',
            idx: '0',
            textlen: query.length,
            tk: token.value,
            client: 't',
            prev: 'input'
        }
        res.statusCode = 302;
 	 	res.setHeader("Location", url + '?' + querystring.stringify(data))
  		res.end()
    })
    .catch(function(err) {
        let e;
        e = new Error();
        if (err.statusCode !== undefined && err.statusCode !== 200) {
            e.code = 'BAD_REQUEST'
        } else {
            e.code = 'BAD_NETWORK'
        }
        throw e
    })
});

app.get("/transapi/srcspeech/:lang/:text", (req, res) => {
    let query = getCleanURI(req.params.text)
    token.get(query).then((token) => {
    	console.log(token)
        let url = 'https://translate.google.com/translate_tts'
        let data = {
            ie: 'UTF-8',
            q: query,
            tl: req.params.lang,
            total: '1',
            idx: '0',
            textlen: query.length,
            tk: token.value,
            client: 't',
            prev: 'input'
        }
 	 	res.send(url + '?' + querystring.stringify(data))
    })
    .catch(function(err) {
        let e;
        e = new Error();
        if (err.statusCode !== undefined && err.statusCode !== 200) {
            e.code = 'BAD_REQUEST'
        } else {
            e.code = 'BAD_NETWORK'
        }
        throw e
    })
});

function getCleanURI(text){
	return decodeURI(text.replace(/-[&\/\\#,+()$~%.'":*?<>{}]/g, '%20'))
}