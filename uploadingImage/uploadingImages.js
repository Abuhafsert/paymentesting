// import devices  from 'puppeteer';
// import puppeteer  from 'puppeteer-extra';
// import StealthPlugin  from 'puppeteer-extra-plugin-stealth';
// puppeteer.use(StealthPlugin());
// import * as fs from 'node:fs/promises';
// const INSTAGRAM_LOGIN_URL = 'https://instagram.com/accounts/login';


// import { uploadImage } from '../uploadingImage/uplaod.js'



// export async function run(image) {
//     // Configure puppeteer options
//     let options = {
//         defaultViewport: {
//             width: 720,
//             height: 570,
//         },
//         args: ['--no-sandbox', '--lang=en'],
//         headless: 'new',
//         // isMobile: true
//     };
//     const browser = await puppeteer.launch(options);
//     try {
//         const page = await browser.newPage();

//         console.log('searching for instagram');

//         await page.goto(INSTAGRAM_LOGIN_URL);
//         await page.waitForNetworkIdle();

//         const btn = await page.waitForSelector("button[type='submit']");



//         await page.type('input[name="username"]', 'reylqr27', {delay: 30});

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



import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import 'chromedriver';
import path, { resolve } from 'path';
import { Module } from 'module';


import { fileURLToPath } from 'url';


// Resolve the __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);
// Instagram credentials
const username = 'reylqr27';
const password = 'vaqasa';
// const imagePath = `C:\\Users\\Aliyu\\Image Upload\\instagram-poster\\abaya.jpeg`;
const caption = 'Your caption here';

export async function uploadToInstagram(imagePath) {
  // Set up Chrome options
  let options = new chrome.Options();
  // options.addArguments('--headless'); // Run in headless mode
  options.addArguments('--disable-notifications');
  
  options.addArguments('--disable-gpu'); // Disable GPU acceleration (necessary for some environments)
  options.addArguments('--no-sandbox'); // Disable the sandbox for better compatibility (necessary for some environments)
  // Initialize the Selenium WebDriver
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {

    console.log('navigating to login');
    // Navigate to Instagram's login page
    await driver.get('https://www.instagram.com/accounts/login/');

    // Wait for the login fields to load
    await driver.wait(until.elementLocated(By.name('username')), 10000);

    console.log('searching for username');

    // Enter the username and password
    await driver.findElement(By.name('username')).sendKeys(username);
    await driver.findElement(By.name('password')).sendKeys(password, Key.RETURN);
    console.log('click new post');

    // Wait for the login process to complete
    // await driver.wait(until.urlContains('https://www.instagram.com/accounts/onetap/?next=%2F'), 20000);
    await driver.wait(until.elementLocated(By.css('svg[aria-label="New post"]')), 20000).click();

    // console.log('click new post');
    // Click on the "New Post" button
    // await driver.findElement(By.css('svg[aria-label="New post"]')).click();

    console.log('posting');
    // Wait for the file input to be available and upload the image
    let fileInput = await driver.wait(until.elementLocated(By.css('input[type="file"]')), 10000);
    await fileInput.sendKeys(imagePath);

    console.log('upload success going to next');

    // await new Promise(resolve => setTimeout(resolve, 10000000))
    // Click the "Next" button
    await driver.wait(until.elementLocated(By.xpath('//div[text()="Next"]')), 10000).click();

    await driver.wait(until.elementLocated(By.xpath('//div[text()="Next"]')), 10000).click();

    // Add a caption to the post
    // let captionField = await driver.wait(until.elementLocated(By.css('textarea[aria-label="Write a caption…"]')), 10000);
    // await captionField.sendKeys(caption);

    // Click the "Share" button
    await driver.wait(until.elementLocated(By.xpath('//div[text()="Share"]')), 10000).click();

    console.log('Image uploaded successfully!');
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.log(error);
    console.error('Error uploading image:');
  } finally {
    // Quit the driver
    await driver.quit();
  }
};



// console.log(_dirname);