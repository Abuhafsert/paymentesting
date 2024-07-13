import devices, { executablePath }  from 'puppeteer';
import puppeteer  from 'puppeteer-extra';
import StealthPlugin  from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import EventEmitter from 'node:events';
import * as fs from 'node:fs/promises';
import dotenv from 'dotenv';


dotenv.config();

const eventEmitter = new EventEmitter();





const INSTAGRAM_LOGIN_URL = 'https://instagram.com/accounts/login/';


import { uploadImage } from '../uploadingImage/uplaod.js'
const password = 'xaqasa';
const username = 'yeylqr';

function retries(){
  return {
    maxRetries: 3,
    retry: 0,
    success: false
  };
}


async function goingToPage(page){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await page.goto(INSTAGRAM_LOGIN_URL);
      await page.waitForNetworkIdle();

      success = true;
    } catch (error) {
      retry++;
      if(page.url() == INSTAGRAM_LOGIN_URL) success = true;
    }
  };
  return success;
}



async function loginToInstagram(page, username, password){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      const btn = await page.waitForSelector("button[type='submit']");
        
      await page.type('input[name="username"]', username, {delay: 30});
      await page.type('input[name="password"]', password, {delay: 30});
      
      await btn.click();
      await page.waitForNavigation();
      
      success = true;
    } catch (error) {
      if(page.url() == 'https://www.instagram.com/accounts/onetap/?next=%2F') return success == true;
      retry++;
      await goingToPage(page);
    }
  };
  return success;
}



async function twoFactorNavigation(page){
  try {
    await page.goto('https://accountscenter.instagram.com/password_and_security/two_factor/');
    eventEmitter.emit('dismiss-button', page);
  } catch (error) {
    return;
  };
}


async function navigatingToTwoFactor(page, selector){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await twoFactorNavigation(page);
      await page.waitForXPath(selector, {visible: true});
      
      console.log('visible');
      const element = await page.$x(selector);
      if(element.length > 0) await element[0].click();

      success = true;
    } catch (error) {
      retry++;
      await twoFactorNavigation(page);
    }
  };
  return success;
}


async function clickingNextFor2fa(page, password, selector){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      eventEmitter.emit('retype-password', page, password);
      await page.waitForXPath("//span[contains(text(),'Next')]");
  
      let next = await page.$x("//span[contains(text(),'Next')]");
      await next[0].click(); 

      success = true;
    } catch (error) {
      retry++;
      await navigatingToTwoFactor(page, selector);
    }
  };
  return success;
}


async function copyingTwoFactorText(page, password, selector, codeGenerator){
  let { maxRetries, retry, success } = retries();
  let generatedCode;

  while (retry < maxRetries && !success){
    try {
      await page.waitForXPath(codeGenerator, {visible: true});
  
      await page.waitForFunction(
        (codeGenerator) => {
          const element = document.evaluate(codeGenerator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return element && element.innerText.trim().length > 12;
        },
        {},
        codeGenerator
      );

      const codes = await page.$x(codeGenerator);

      if(codes.length > 0) {
        const elements = codes[0];
        generatedCode = await page.evaluate(el => el.innerHTML, elements);
        console.log(generatedCode);
      }

      success = true;
    } catch (error) {
      retry++;
      await clickingNextFor2fa(page, password, selector);
    }
  };
  return generatedCode;
}




async function clickNextAfterGeneratingCode(page, password, selector, codeGenerator){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await page.waitForXPath("//span[contains(text(),'Next')]");
  
      let nextGeneretor = await page.$x("//span[contains(text(),'Next')]");
      await nextGeneretor[3].click();

      success = true;
    } catch (error) {
      retry++;
      await copyingTwoFactorText(page, password, selector, codeGenerator);
    }
  };
  return success;
}




async function clickNextAfterCodeGenerated(page, nextGenereted, codeInput, generated){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await codeInput.click();
      await page.keyboard.type(generated, { delay: 20 });
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await nextGenereted.click();
      success = true;
    } catch (error) {
      retry++;
    }
  };
  return success;
}


async function clickingBackupCode(page){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await page.waitForXPath("//span[contains(text(),'backup codes')]");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let [nextGeneretedCode] = await page.$x("//span[contains(text(),'backup codes')]");
      await nextGeneretedCode.click();
      success = true;
    } catch (error) {
      retry++;
    }
  };
  return success;
}



async function copyingBackupCode(page, backupCodeSelector){
  let { maxRetries, retry, success } = retries();
  let generatedBackupCode;

  while (retry < maxRetries && !success){
    try {
      await page.waitForXPath(backupCodeSelector, {visible: true});

      const [backupCodes] = await page.$x(backupCodeSelector);
        generatedBackupCode = await page.evaluate(el => el.innerHTML, backupCodes);
        console.log(generatedBackupCode);

      success = true;
    } catch (error) {
      retry++;
    }
  };
  return generatedBackupCode;
}

async function navigatingToChangePasswordPage(page, selector){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await page.goto('https://accountscenter.instagram.com/password_and_security/password/change/');

      await page.waitForXPath(selector)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const [passwordElement] = await page.$x(selector);
      
      await passwordElement.click();
      success = true;
    } catch (error) {
      retry++;
    }
  };
  return success;
}


async function changingPassword(page, selector, password, generated){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await page.waitForXPath('//span[contains(text(),"Change password")]');

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.click('input[type="password"]');
      await page.keyboard.type(password, { delay: 20 });

      await new Promise((resolve) => setTimeout(resolve, 500));
      let newPassword = await page.$x('//label[contains(text(), "New password")]');
      
      await newPassword[0].click();
      await page.keyboard.type(generated, { delay: 20 });
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      
      let repeatedPassword = await page.$x('//label[contains(text(), "Retype new password")]');
      let repeatedPasswordAgain = repeatedPassword[0] ? repeatedPassword: await page.$x('//label[contains(text(),"Re-type new password")]');
      await repeatedPasswordAgain[0].click();
      await page.keyboard.type(generated, { delay: 20 });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      let passwordChange = await page.$x("//span[contains(text(),'Change Password')]");
      let passwordChangeAgain = passwordChange[0] ? passwordChange: await page.$x('//span[contains(text(),"Change password")]');
      await passwordChangeAgain[passwordChangeAgain.length - 1].click();

      success = true;
    } catch (error) {
      retry++;
      await navigatingToChangePasswordPage(page, selector);
    }
  };
  return success;
}


async function confirmingPasswordChange(page, selector, generated, password){
  let { maxRetries, retry, success } = retries();

  let passwordChanged;
  while (retry < maxRetries && !success){
    try {
      await page.waitForNavigation();
      passwordChanged = page.url() === 'https://accountscenter.instagram.com/password_and_security/' ? generated: password;
      success = true;
    } catch (error) {
      retry++;
      page.reload();
      await changingPassword(page, selector, password, generated);
    }
  };
  return passwordChanged;
}








export async function uploadToInstagram(username, password) {
  for(let i = 0; i < username.length; i++){
    let options = {
        defaultViewport: {
            width: 820,
            height: 570,
        },
        args: ['--no-sandbox',
           '--lang=en',
          "--disable-setuid-sandbox",
          "-single-process",
          "--no-zygote",
        ],
        headless: false,
        executablePath:
        process.env.NODE_ENV === "production" 
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    };

    const selector = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[2]/div/div/div/div/div/div/div/div[3]/div[2]/div[4]/div/div/div[2]/div/div/div[1]';
    const codeGenerator = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[2]/div/div/div/div/div/div[3]/div/div[3]/div[2]/div[4]/div/div/div[4]/div/div[2]/div/div/div[1]/span'
    const backupCodeSelector = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[2]/div/div/div/div/div/div[6]/div/div[3]/div[2]/div[4]/div/div/div/div[3]/div/div[1]/span';

    const browser = await puppeteer.launch(options);

    let productChange = '';
    try {
        const page = await browser.newPage();

        console.log('searching for instagram');
        const navigatingToPage = await goingToPage(page);

        if(!navigatingToPage) throw new Error("Error occured while navigating to instagram");

        console.log('login username');
        const loginUser = await loginToInstagram(page, username[i], password);
        if(!loginUser) throw new Error("Error occured while login user");

        console.log('navigating to next page');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const twoFactorNavigation = await navigatingToTwoFactor(page, selector);
        
        if(!twoFactorNavigation) throw new Error("Error occured while navigating to two-factor");

        console.log('waiting for next');
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const clickNext2fa = await clickingNextFor2fa(page, password, selector);

        if(!clickNext2fa) throw new Error("Error occured while clicking next to two-factor");

        console.log('copying 2fa code');
  
        const twoFactorCode = await copyingTwoFactorText(page, password, selector, codeGenerator);

        if(!twoFactorCode) throw new Error("Error occured while copying two-factor code");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const clickNextAfterGenerating = await clickNextAfterGeneratingCode(page, password, selector, codeGenerator);

        if(!clickNextAfterGenerating) throw new Error("Error occured while clicking next to break two-factor");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const generated = await generated2faCode(browser, twoFactorCode);

        if(!generated) throw new Error("Error occured while breaking two-factor code");
  
        console.log(generated);
        await new Promise((resolve) => setTimeout(resolve, 1000));
  
        let [codeInput] = await page.$x('//label[contains(text(),"Enter code")]');
        let nextGenereted = await page.$x("//span[contains(text(),'Next')]");

        const twoFactorCreated = await clickNextAfterCodeGenerated(page, nextGenereted[4], codeInput, generated);
        if(!twoFactorCreated) throw new Error("Error occured while creating two-factor on account");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        productChange = `${username[i]}:${password}:${twoFactorCode}`;

        const clickBackupCode = await clickingBackupCode(page);
        if(!clickBackupCode) throw new Error("Error occured while clicking backup code");

        const BackupCodeCopied = await copyingBackupCode(page, backupCodeSelector);

        if(!BackupCodeCopied) throw new Error("Error occured while copying backup code");
        productChange = `${username[i]}:${password}:${twoFactorCode}:${BackupCodeCopied}`;
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const navigatingToPasswordChange = navigatingToChangePasswordPage(page, selector);

        if(!navigatingToPasswordChange) throw new Error("Error occured while navigating to password ");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const passwordChange = await changingPassword(page, selector, password, generated);
        if(!passwordChange) throw new Error("Error occured while changing password ");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const passwordChanged = await confirmingPasswordChange(page, selector, generated, password);
        console.log(passwordChanged);

        productChange = `${username[i]}:${passwordChanged}:${twoFactorCode}:${BackupCodeCopied}`;
        await savingChanges(productChange);

        await new Promise((resolve) => setTimeout(resolve, 3000));
        await browser.close();
      } 
      catch (error) {
        productChange && productChange.split(':').length >= 3 ? await savingChanges(productChange): console.log(`${username[i]} have issue ${productChange}`);
        console.log(error);
        await browser.close();
    }

  };
}




async function savingChanges(product){
  await fs.appendFile('./accountsChanged', `${product}\n`,
    function(err, data){
      if(err) console.log(product);
    });
}

async function goingToCodeGeneratorPage(page){
  let { maxRetries, retry, success } = retries();

  while (retry < maxRetries && !success){
    try {
      await page.goto('https://2fa.live');
      await page.waitForNetworkIdle();
      success = true;
    } catch (error) {
      if(page.url() === 'https://2fa.live') success = true;
      retry++;
    }
  };
  return success;
}



async function CodeGeneratorInput(page){
  let { maxRetries, retry, success } = retries();

  let btn;
  while (retry < maxRetries && !success){
    try {
      btn = await page.waitForSelector('a[id="submit"]');
      console.log('waiting for textarea');
      let codeInput = await page.$('textarea[id="listToken"]');
      
      await codeInput.click();
      success = true;
    } catch (error) {
      retry++;
      await goingToCodeGeneratorPage(page);
    }
  };
  return btn;
}

async function CopyingGeneratedCode(page){
  let { maxRetries, retry, success } = retries();

  let codeGenerated;
  while (retry < maxRetries && !success){
    try {
      
      const textareaSelector = 'textarea[id="output"]'
      await page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && element.value && element.value.trim() !== '';
        },
        {},
        textareaSelector
      );

      const generatedCode = await page.$eval('textarea[id="output"]', code => code.value);
      codeGenerated = generatedCode ? generatedCode.split('|')[1]: null;
      success = true;
    } catch (error) {
      retry++;
      await goingToCodeGeneratorPage(page);
      await CodeGeneratorInput(page);
    }
  };
  return codeGenerated;
}


async function generated2faCode(browser, code){
  const page = await browser.newPage();
  try {
    const codeGenereted = await goingToCodeGeneratorPage(page);
    if(!codeGenereted) throw new Error("Error occured while navigating to break two-factor");


    const codeGeneretorInp = await CodeGeneratorInput(page);
    if(!codeGeneretorInp) throw new Error("Error occured while click input to break two-factor");

    await page.keyboard.type(code, { delay: 20 });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    await codeGeneretorInp.click();
  
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const generatedCode = await CopyingGeneratedCode(page);

    return generatedCode;
  } catch (error) {
    await page.close();
    return;
  } finally {
    await page.close();
  };
}

eventEmitter.on('dismiss-button', async (page) => {
  try {
    await page.waitForXPath("//span[contains(text(),'Dismiss')]");
  
    let dismissBtn = await page.$x("//span[contains(text(),'Dismiss')]");
    await dismissBtn[0].click();
  
    await page.goto('https://accountscenter.instagram.com/password_and_security/two_factor/');
  } catch (error) {
    return;
  }
});


eventEmitter.on('retype-password', async (page, password) => {
  try {
    await page.waitForSelector('input[type="password"]');
    let currentPassword = await page.$('input[type="password"]');

    let passwordChange = await page.$x("//span[contains(text(),'Submit')]");

    await currentPassword.click();
    await page.keyboard.type(password, { delay: 20 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    await passwordChange[0].click();

  } catch (error) {
    return;
  }
});


// uploadToInstagram();
// export async function uploadToInstagram(image) {
//     // Configure puppeteer options
//     let o ptions = {
//         defaultViewport: {
//             width: 720,
//             height: 570,
//         },
//         args: ['--no-sandbox', '--lang=en'],
//         headless: false,
//         // isMobile: true
//     };
//     const browser = await puppeteer.launch(options);
//     try {
//         const page = await browser.newPage();

//         console.log('searching for instagram');

//         await page.goto(INSTAGRAM_LOGIN_URL);
//         await page.waitForNetworkIdle();

//         const btn = await page.waitForSelector("button[type='submit']");



//         await page.type('input[name="username"]', 'reylqr35', {delay: 30});

//         await page.type('input[name="password"]', 'vaqasa', {delay: 30});

//         await btn.click();

//         console.log('navigating to next page');
//         await page.waitForNavigation();


//         const imageBtn = await page.waitForSelector('[aria-label="New post"]');


//         imageBtn.click();

//         // await page.waitForNetworkIdle();


//         await uploadImage(page, image);
        
//         // const contaext = await page.content();

//         // console.log(contaext);

//         // await fs.writeFile('./thrift/context', contaext)

//         await browser.close();
//       } 
//       catch (error) {
//         await browser.close();
//     }
    
// }


