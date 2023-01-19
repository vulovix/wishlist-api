const puppeteer = require("puppeteer");
const WishlistModel = require("../models/wishlist.model");
const AccountModel = require("../models/account.model");
const { browserPath } = require("../config");

module.exports = {
  create: async (req, res) => {
    const content = req.value.body;
    content.createdAt = Date.now();
    content.modifiedAt = Date.now();
    content.createdBy = req.decoded.user;
    content.modifiedBy = req.decoded.user;
    const objToSave = new WishlistModel(content);
    let savedObj = await objToSave.save();
    res.status(200).send(savedObj);
  },
  list: async (req, res) => {
    const arr = await WishlistModel.find({ createdBy: req.decoded.user }, { modifiedBy: 0, createdBy: 0, __v: 0 }).sort("-modifiedAt");
    res.status(200).send(arr);
  },
  listForUser: async (req, res) => {
    const { id } = req.value.params;
    const user = await AccountModel.findOne({ email: id ? id.toLowerCase() : "" });
    if (!user) {
      return res.status(403).json({ status: 403, message: "User with such email does not exist." });
    }
    const arr = await WishlistModel.find({ createdBy: user._id }, { _id: 0, modifiedBy: 0, createdBy: 0, __v: 0 }).sort("-modifiedAt");
    res.status(200).send(arr);
  },
  listAll: async (req, res) => {
    const arr = await WishlistModel.find();
    res.status(200).send(arr);
  },
  remove: async (req, res) => {
    const { id } = req.value.params;
    await WishlistModel.findByIdAndRemove(id);
    res.status(200).send({ _id: id });
  },
  update: async (req, res) => {
    const { id } = req.value.params;
    const content = req.value.body;
    content.modifiedBy = req.decoded.user;
    content.modifiedAt = Date.now();
    const objToSave = await WishlistModel.findByIdAndUpdate(id, content);
    res.status(200).send({ ...objToSave._doc, ...content });
  },
  fetch: async (req, res) => {
      const { url } = req.value.body;
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--use-gl=egl"],
        executablePath: browserPath,
        // dumpio: true,
        // defaultViewport: {
        //   width: 1920,
        //   height: 1050,
        // },
        devtools: false,
      });

      const [page] = await browser.pages();
      
      await page.goto(url, {
        timeout: 0,
        waitUntil: 'load'
      });
      // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#code-transpilation-issues
      let response = await page.evaluate(`(async ()=>{
        let r = {};
        try{
          const UNKNOWN = "UNKNOWN";
          const imgElement = document.querySelector("meta[property='og:image']");
          const titleElement = document.querySelector("meta[property='og:title']");
          const url = imgElement ? imgElement.getAttribute('content') : UNKNOWN;
          const isFileSystemUrl = url && url.startsWith("//");
          const finalUrl = isFileSystemUrl ? url.slice(2) : url;
          r = {
            errorCount: 0,
            message: null,
            title: titleElement ? titleElement.getAttribute('content') : document.title || UNKNOWN,
            image: finalUrl,
          };
        } catch(err){
          
        }
        return r;
      })()`);
    response.url = url;
    await browser.close();
    res.status(200).send(response);
  },
};
