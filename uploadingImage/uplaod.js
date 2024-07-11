

export async function uploadImage(page, image) {
    try {
            

        await page.waitForSelector("input[type='file']");

        // Set the value for the correct file input (last on the page is new post)
        let fileInputs = await page.$$('input[type="file"]');

        console.log(fileInputs);
        if(fileInputs.length >= 1){
          fileInputs[0].uploadFile(image)
        }
        // await delay(2500);

        await new Promise((resolve) => setTimeout(resolve, 1000));


          
          
        // let errorImage = await page.$x("//button[contains(text(),'Select other files')]");
        // if(errorImage.length >= 1){
        //     let fileInputs = await page.$$('input[type="file"]');
        //     let random2 = image[(Math.floor(Math.random() * (image.length)))]
            
        //     if(fileInputs.length >= 1){
        //     //   await delay(1000)
        //       fileInputs[0].uploadFile(random2)
        //     }
        //     // await delay(2500);
        // }

      await page.waitForXPath("//div[contains(text(),'Next')]");
      
      // console.debug('clicking next');
      
      // Get the next button
      let next = await page.$x("//div[contains(text(),'Next')]");
      await next[0].click();

      await page.waitForXPath("//div[contains(text(),'Next')]");
      let next2 = await page.$x("//div[contains(text(),'Next')]");
    //   await delay(2000)
      await next2[0].click();
      // console.debug('waiting for next');
      
      
      // Get the share button and click it
      await page.waitForXPath("//div[contains(text(),'Share')]");
      let share = await page.$x("//div[contains(text(),'Share')]");
    //   await delay(1000)
      // console.debug('clicking share');
      
      await share[0].click();
      
      
      // Wait for a little while before finishing
    //   await delay(9000);


      // await page.waitForSelector("//div[contains(text(),'Post shared')]");
      await page.waitForSelector("img[alt='Animated checkmark']");
      let postShared = await page.$("img[alt='Animated checkmark']");
      if(postShared){
          current++;
          errors = 0;
          await page.click("[aria-label='Close']");
      }
      
    //   await delay(3000)
      

    }catch(err){
  }

}