const puppeteer = require('puppeteer');
var colors = require('colors')

let baseURl = 'https://www.amazon.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=usflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&'

function timeStamp() {
    return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ':' + new Date().getMilliseconds()
  }

async function closeTab(page) {
    await page.goto('about:blank')
    await page.close()
}

async function signin(browser) {

    try {

        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 920 });
        await page.goto(baseURl), { waitUntil: 'networkidle0' };

        console.log(`[${timeStamp()}] ` + 'Signing in...'.yellow)

      
    //   await page.waitForNavigation();
      await page.type('#ap_email', process.env.EMAIL)  // enter email here
      await page.click('#continue')
      await page.waitForNavigation(); 
      await page.type('#ap_password', process.env.PASSWORD); // enter password here
      
      
      const x = await Promise.all([
        page.click('#signInSubmit'),
        page.waitForNavigation({ waitUntil: 'networkidle0'}),
      ]);
      
      if (x[1]._url === 'https://www.amazon.com/ap/signin') {
        console.log(`[${timeStamp()}] ` + 'Sign in unsuccesfull'.red)
        closeTab(page)
        return false
      }
      
      else {
        console.log(`[${timeStamp()}] ` + 'Sucessfully signed in!'.green)
        // console.log(`[${timeStamp()}] ` + 'Attempting checkout...'.yellow)
        closeTab(page)
        return true
      }

      

    } catch (err) {
        console.log(err)
        closeTab(page)
        return false
    }


}

module.exports = {signin}