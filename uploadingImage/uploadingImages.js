import devices  from 'puppeteer';
import puppeteer  from 'puppeteer-extra';
import StealthPlugin  from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import * as fs from 'node:fs/promises';
const INSTAGRAM_LOGIN_URL = 'https://instagram.com/accounts/login';


import { uploadImage } from '../uploadingImage/uplaod.js'



export async function run(image) {
    // Configure puppeteer options
    let options = {
        defaultViewport: {
            width: 720,
            height: 570,
        },
        args: ['--no-sandbox', '--lang=en'],
        headless: false,
        // isMobile: true
    };
    const browser = await puppeteer.launch(options);
    try {
        const page = await browser.newPage();

        await page.goto(INSTAGRAM_LOGIN_URL);
        await page.waitForNetworkIdle();

        const btn = await page.waitForSelector("button[type='submit']");



        await page.type('input[name="username"]', 'reylqr21', {delay: 30});

        await page.type('input[name="password"]', 'vaqasa', {delay: 30});

        await btn.click();

        await page.waitForNavigation();


        const imageBtn = await page.waitForSelector('[aria-label="New post"]');


        imageBtn.click();

        // await page.waitForNetworkIdle();


        await uploadImage(page, image);
        
        // const contaext = await page.content();

        // console.log(contaext);

        // await fs.writeFile('./thrift/context', contaext)

        // await browser.close();
      } 
      catch (error) {
        // await browser.close();
    }
    
}

