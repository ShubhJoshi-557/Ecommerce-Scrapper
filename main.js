// npm init --yes
// npm install axios
// npm install minimist
// npm install jsdom

const express = require("express")
const minimist = require("minimist")
const axios = require("axios")
const bodyParser = require("body-parser")
let jsdom = require("jsdom");
const path = require('path');
let ejs = require('ejs')
const puppeteer = require('puppeteer')

const app = express();

app.set("views", path.join(__dirname,"views"));
app.set('view engine','ejs');
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}))

app.get('/',function(req,res){
    res.sendFile('index.html',{root: __dirname+'/public'});
});

app.get('/api/:url',async(req,res) => {
    let dirtyurl = String(req.params.url); 
    let cleanurl = dirtyurl.split("__uwu__").join("/");
    cleanurl = cleanurl.split("__uvu__").join("?");;
    console.log(cleanurl);
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });
    
    // get the tabs (there is only one tab)
    let pages = await browser.pages();
    let page = pages[0];
    
    // open the url
    

    if(cleanurl.includes("www.amazon.in")){
        console.log("AMAZON URL");
        await page.goto(cleanurl);
        await page.waitForSelector('input[name="submit.add-to-cart"]',{timeout: 3000});
        await page.click('input[name="submit.add-to-cart"]');
    }else if(cleanurl.includes("www.flipkart.com")){
        console.log("FLIPKART URL");
        await page.goto(cleanurl);
        await page.waitForSelector('button._2KpZ6l._2U9uOA._3v1-ww',{timeout: 3000});
        await page.click('button._2KpZ6l._2U9uOA._3v1-ww');
    }
    

    res.send("Success");
})

app.post('/search',(req,response) => {
    console.log(req.body.search);
    var flipkart_data;
    var amazon_data;
    axios.get('https://www.flipkart.com/search?q='+req.body.search).then((res) =>{
        let html = res.data;
        let dom = new jsdom.JSDOM(html);
        let document = dom.window.document;
        let maindiv = document.querySelectorAll('[class="_1YokD2 _3Mn1Gg"]')
        let product = maindiv[1].querySelectorAll('[class="_1AtVbE col-12-12"]')
        let divType = product[0].querySelectorAll('[data-id]');
        console.log(divType.length);
        let productName = [];
        let productPrice = [];
        let productRating = [];
        let productImg = [];
        let productLink = [];
        let finalProduct
        if(divType.length==1){
            finalProduct = product;
            for (let i = 2; i < 5; i++) {
                productName.push(finalProduct[i].querySelector('[class="_4rR01T"]').textContent);
                productPrice.push(finalProduct[i].querySelector('[class="_30jeq3 _1_WHN1"]').textContent);
                productRating.push(finalProduct[i].querySelector('[class="_3LWZlK"]').textContent);
                productImg.push(finalProduct[i].querySelector('img').src);
                productLink.push("https://www.flipkart.com"+finalProduct[i].querySelector('a').href);
            }
        }else{
            finalProduct = divType;
            for (let i = 0; i < 3; i++) {
                productName.push(finalProduct[i].querySelector('[class="s1Q9rs"]').textContent);
                productPrice.push(finalProduct[i].querySelector('[class="_30jeq3"]').textContent);
                productRating.push(finalProduct[i].querySelector('[class="_3LWZlK"]').textContent);
                productImg.push(finalProduct[i].querySelector('img').src);
                productLink.push("https://www.flipkart.com"+finalProduct[i].querySelector('a').href);
            }
        }
        flipkart_data = [productName,productPrice,productRating,productImg,productLink]
    });
    delay(3000);
    axios.get('https://www.amazon.in/s?k='+req.body.search).then((res) =>{
        let html = res.data;
        let dom = new jsdom.JSDOM(html);
        let document = dom.window.document;
        let product = document.querySelectorAll('[data-index]')
        let am_productName = [];
        let am_productPrice = [];
        let am_productRating = [];
        let am_productImg = [];
        let am_productLink = [];
        for (let i = 2; i < 5; i++) {
            am_productName.push(product[i].querySelector('h2 span').textContent);
            am_productPrice.push(product[i].querySelector('i span').textContent);
            am_productRating.push(product[i].querySelector('[class="a-price-whole"]').textContent);
            am_productImg.push(product[i].querySelector('span a div img').src);
            am_productLink.push("www.amazon.in"+product[i].querySelector('h2 a').href);
        }   
        amazon_data = [am_productName,am_productPrice,am_productRating,am_productImg,am_productLink] 
        console.log(amazon_data);
        console.log(flipkart_data);
        response.render('index.ejs',{root: __dirname+'/views', tite: 'Search Results', amazon_data, flipkart_data});
    });
});


let args = minimist(process.argv);

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
