// SDK initialization
var ImageKit = require("imagekit");


exports.initImagekit = ()=>{

    var imagekit = new ImageKit({
        publicKey : process.env.PUBLICKEY_IMAGEKIT,
        privateKey :process.env.PRIVATEKEY_IMAGEKIT,
        urlEndpoint : process.env.ENDPOINT_IMAGEKIT
    });

   return imagekit;
}

