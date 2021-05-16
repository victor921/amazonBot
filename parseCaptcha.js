const fs = require('fs');
const { resolve } = require('path');
const readline = require('readline')
var colors = require('colors')

function timeStamp() {
  return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()
}




async function processLineByLine(fileName) {
    
    const fileStream = fs.createReadStream(`./html/${fileName}Captch.html`);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const line of rl) {

        if (line.includes('.jpg') && line.includes('captcha'))
        {
            return getCaptcha(line)
        }
    }


    return ''
}

function getCaptcha(line)
{
    captcha = ''

    startingIndex = line.indexOf('src') + 5

    for (i = startingIndex; line.charAt(i) !== '"'; i++)
    {
        captcha += line.charAt(i)
    }

    return captcha
}

module.exports = {processLineByLine}