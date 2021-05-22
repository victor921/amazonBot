const fs = require('fs');
const { resolve } = require('path');
const readline = require('readline')
var colors = require('colors')
const path = require('path');

function timeStamp() {
  return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()
}

let atcURL = ''
let sessionID = ''

async function processLineByLine(fileName) {
    counter = 0
    prevCounter = -1

    products = []
  
    product = {
        offerListing: '',
        seller: ''
    }
    
    const fileStream = fs.createReadStream(`./html/${fileName}.html`);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
  
    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.\

      // Search seller
      // if (line.includes('sellerProfileTriggerId')){
      //   console.log(line + '\n')
      //   console.log('counter: ', counter)
      // }

      // console.log(line)

      

      if (line.includes('offeringID.1'))
      {
        product.offerListing = grabListing(line)
      }

      if (line.includes('Opens a new page'))
      {

        if (line.includes('Warehouse'))
        {
          continue
        }
        else if (line.includes('Amazon.com.'))
        {
          prevCounter = -2
        }
        else 
        {
          prevCounter = counter
        }
        // console.log('Seller: ', grabSeller(line))
      }

      
      if ((prevCounter + 1 == counter) && (prevCounter != -1) || prevCounter == -2)
      {
        if (prevCounter == -2)
        {
          product.seller = 'Amazon.com'
          prevCounter = -1
        }
        
        else 
        {
          product.seller = grabSeller(line)
          prevCounter = -1
        }
      }


      if (line.includes('session-id=')) 
      {
        // if (!isNaN(parseInt(sessionID.charAt(0))))
        // {
        //   continue
        // }
        sessionID = grabSession(line)
      }


      if (product.offerListing !== '' && product.seller !== '')
      {
        products.push(product)

        product = {
          offerListing: '',
          seller: ''
        }
      }


      counter = counter + 1        
    }

    

    return products
  }


  function grabSeller(sellerInfo) {
    seller = ''

    for (i = 0; sellerInfo.charAt(i) !== '<'; i++) {
      seller += sellerInfo.charAt(i)
    }

    return seller
  }
 

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

    startingIndex = sessionID.indexOf('session-id=') + 11

    for (i = startingIndex; sessionID.charAt(i) != '&'; i++) {
      session += sessionID.charAt(i)
    }

    return session
  }

    async function final(asin) {

      res = await processLineByLine(asin)


      if (res.length == 0)
      {
        console.log(`[${timeStamp()}] ` + 'No seller found'.red)
        return atcURL = ''
      }

      for (i = 0; i < res.length; i++)
      {
        if (res[i].seller === 'Amazon.com')
        {
          console.log(`[${timeStamp()}] ` + 'Seller Found: Amazon.com'.green)
          atcURL = `https://www.amazon.com/gp/aws/cart/add.html?OfferListingId.1=${res[i].offerListing}&Quantity.1=1&SessionId=${sessionID}&confirmPage=confirm`
          
          return atcURL
        }
      }

      console.log(`[${timeStamp()}] ` + 'Seller: Amazon.com not found..'.red)

      // console.log(`[${timeStamp()}] ` + `Seller Found: ${res[0].seller}`.yellow)

      // atcURL = `https://www.amazon.com/gp/aws/cart/add.html?OfferListingId.1=${res[0].offerListing}&Quantity.1=1&SessionId=${sessionID}&confirmPage=confirm`

      return atcURL

      // if (grabListing(res.offerListing) === '') {
      //   return ''
      // } 
    


      // return atcURL
    }

    // console.log(final('B08166SLDF'))
    module.exports = {final}
    
  