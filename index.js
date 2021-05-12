const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
require('dotenv/config')
var colors = require('colors')


let url = 'https://www.amazon.com/Duracell-Batteries-Alkaline-Household-Resealable/dp/B089RDSML3/ref=sr_1_1_sspa?dchild=1&keywords=double+a&qid=1620779723&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzMzMwUUJDUUxOSEVUJmVuY3J5cHRlZElkPUEwNzYyMTY4MzVGT1FXRVlVRkVWTiZlbmNyeXB0ZWRBZElkPUEwNjQyOTIwMzEyUk1TSTJaT1JQMyZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU='
let cartUrl = 'https://www.amazon.com/gp/cart/view.html/ref=lh_cart';
// let testURL = 'https://www.amazon.com/ap/signin?_encoding=UTF8&openid.assoc_handle=amazon_checkout_us&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fbuy%2Fsignin%2Fhandlers%2Fcontinue.html%3Fie%3DUTF8%26brandId%3D%26cartItemIds%3D%26eGCApp%3D%26hasWorkingJavascript%3D0%26isEGCOrder%3D0%26isFresh%3D%26oldCustomerId%3D0%26oldPurchaseId%3D%26preInitiateCustomerId%3D%26purchaseInProgress%3D%26ref_%3Dcart_signin_submit%26siteDesign%3D&pageId=amazon_checkout_us&showRmrMe=0&siteState=isRegularCheckout.1%7CIMBMsgs.%7CisRedirect.1&suppressSignInRadioButtons=0';
// let url = 'https://www.amazon.com/AmazonBasics-Performance-Alkaline-Batteries-Count/dp/B00MNV8E0C/ref=sr_1_5?crid=3DOR3I1FLHU68&dchild=1&keywords=double+a+batteries&qid=1620757615&rdc=1&sprefix=double+a+ba%2Caps%2C177&sr=8-5';
// const url = prompt('Enter the product URL: ');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timeStamp() {
  return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()
}

(async () => {

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 920 });
    await page.goto(url);

    maxPrice = 50

    console.log(`[${timeStamp()}] Opened browser..`.green)

    let producData = await page.evaluate(() => ({
        name: document.querySelector('#a-page h1#title').innerText,
        price: document.querySelector('#a-page #price_inside_buybox').innerText
      }));

    newPrice = parseFloat(producData.price.replace(/[^\w.]|_/g, ''))
    

    console.log(colors.yellow(`[${timeStamp()}] ` + 'Found product: ' + producData.name))
    console.log(colors.yellow(`[${timeStamp()}] ` + 'Price: ' + producData.price))

    if (newPrice > maxPrice) {
      console.log(`${timeStamp()}] Product price found is greater than the max price set by user ($${maxPrice}), Aborting...`.red)
      browser.close()
      return

    } else {
      console.log(`[${timeStamp()}] ` + 'Product price is lower than max price, Continuing script...'.green)
    }

    await page.click('#add-to-cart-button')
    await page.waitForNavigation();

    let productCount = await page.evaluate(() => ({
      count: document.querySelector('#a-page #nav-cart-count').innerText,
    }));

    if (productCount.count == 1) {
      console.log(`[${timeStamp()}] ` + 'Product added To cart!'.green)
      console.log(`[${timeStamp()}] ` + 'Going to checkout...'.yellow)

      await page.reload()
      // await page.waitForNavigation();
      
      await page.goto(cartUrl);
      await page.click('#sc-buy-box-ptc-button')

      console.log(`[${timeStamp()}] ` + 'Signing in...'.yellow)
          
      await page.waitForNavigation();
      await page.type('#ap_email', '')  // enter email here
      await page.click('#continue')
      await page.waitForNavigation(); 
      await page.type('#ap_email', ''); // enter password here
      
      const x = await Promise.all([
        page.click('#signInSubmit'),
        page.waitForNavigation({ waitUntil: 'networkidle0'}),
      ]);
      
      if (x[1]._url === 'https://www.amazon.com/ap/signin') {
        console.log(`[${timeStamp()}] ` + 'Sign in unsuccesfull'.red)
        browser.close()
        return
      }
      
      else {
        console.log(`[${timeStamp()}] ` + 'Sucessfully signed in!'.green)
        console.log(`[${timeStamp()}] ` + 'Attempting checkout...'.yellow)
      }

      // await page.waitForNavigation();
      page.click('#submitOrderButtonId')

      await page.waitForNavigation();

      await sleep(2000)

      currPage = await page.url()

      if (currPage.includes('thankyou')) {
        console.log(`[${timeStamp()}] ` + 'Checkout Succesful, check you email!'.rainbow)
      } else {
        console.log(`[${timeStamp()}] ` + 'Error during checkout.'.red)
      }
      
      browser.close()
      
      return
      
    } else {
      console.log(`[${timeStamp()}] ` + 'Error could not add to cart :('.red)
    }

  } catch(err) {
    console.log(colors.red(`[${timeStamp()}]  \n` + err))
  }    
    
    
})();