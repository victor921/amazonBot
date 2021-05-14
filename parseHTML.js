const fs = require('fs');
const { resolve } = require('path');
const readline = require('readline')


let atcURL = ''

async function processLineByLine() {
    counter = 0
  
    idS = {
        offerListing: '',
        sessionID: ''
    }
    
    const fileStream = fs.createReadStream('source.html');
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.
        if (counter == 3)
        {
            idS.sessionID = line
        }

        if (counter == 2)
        {
            idS.offerListing = line
        }

        counter = counter + 1        
    }

    return idS
  }

  

  // res = Promise.resolve(processLineByLine())


  function grabListing(listingID) {

    listing = ''

    startingIndex = listingID.indexOf('value') + 7


    for (i = startingIndex; listingID.charAt(i) != '"'; i++) {
      listing += listingID.charAt(i)
    }

    if(listing === '') {
      return ''
    }

    return listing
  }

  function grabSession(sessionID) {
    session = ''

    startingIndex = sessionID.indexOf('value') + 7

    for (i = startingIndex; sessionID.charAt(i) != '"'; i++) {
      session += sessionID.charAt(i)
    }
    
    return session
  }

    async function final() {

      res = await processLineByLine()

      if (grabListing(res.offerListing) === '') {
        return ''
      } 
    
      atcURL = `https://www.amazon.com/gp/aws/cart/add.html?OfferListingId.1=${grabListing(res.offerListing)}&Quantity.1=1&SessionId=${grabSession(res.sessionID)}&confirmPage=confirm`


      return atcURL
    }
    module.exports = {final}
    
    



  

