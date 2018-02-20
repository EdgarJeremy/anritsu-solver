const express = require("express");
const app = express();
const port = 8083;
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const bases = require("bases");
const ip = require("ip");
const cidrlist = require("./src/cidr.json");

app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/hitung", function (req, res) {
    var body = req.body;
    var main_ip = `${body.main_ip_1}.${body.main_ip_2}.${body.main_ip_3}.${body.main_ip_4}`;
    var subnet = body.subnet;
    var pbg = [];
    for (var i = 1; i <= 8; i++) {
        pbg.push(body[`input${i}`]);
    }
    nohs = pbg.map((item) => item * 1).sort((a,b) => a - b).reverse();
    
    var main = ip.cidrSubnet(`${main_ip}/${subnet}`);
    main.networkAddressBin = ipDecToBin(main.networkAddress);
    main.subnetMaskBin = ipDecToBin(main.subnetMask);
    main.ipAddress = main_ip;
    main.ipAddressBin = ipDecToBin(main_ip);

    var lastNetwork = main.networkAddress;
    var results = [];

    for(var i = 0; i<nohs.length; i++) {
        var noh = nohs[i];
        var info = findNetmaskByNoh(noh);
        info.noh = noh;
        var bagian = ip.cidrSubnet(`${lastNetwork}/${info.cidr}`);
        var iterInfo = {};
        iterInfo.ip_subnet = bagian.networkAddress;
        iterInfo.first_ip_host = bagian.firstAddress;
        iterInfo.last_ip_host = bagian.lastAddress;
        iterInfo.broadcast = bagian.broadcastAddress;
        iterInfo.subnetmask = info.subnet;
        iterInfo.cidr = info.cidr;
        iterInfo.number_of_hosts = noh;
        lastNetwork = nextSubnet(iterInfo.broadcast);
        results.push(iterInfo);
    }
    console.log(pbg);
    lastResults = [];
    for(var i = 0; i < pbg.length; i++) {
        var pb = pbg[i];
        for(var j = 0; j < results.length; j++) {
            if(results[j].number_of_hosts === pb * 1) {
                lastResults.push(results[j]);
            }
        }
    }

    res.json({
        main: main,
        pembagian: lastResults
    });

});

app.listen(8083, function () {
    console.log(`App start at : ${port}`);
});



// ------- FUNCTIONS
function ipDecToBin(ip) {
    let octets = ip.split(".");
    return `${binLeadingZero(bases.toBase2(octets[0]))}.${binLeadingZero(bases.toBase2(octets[1]))}.${binLeadingZero(bases.toBase2(octets[2]))}.${binLeadingZero(bases.toBase2(octets[3]))}`
}

function binLeadingZero(bin) {
    if(bin.length < 8) {
        var num = 8 - bin.length;
        var zeros = "";
        for(var i = 0; i<num; i++) {
            zeros += "0";
        }
        return zeros + bin;
    } else {
        return bin;
    }
}

function findNetmaskByNoh(numberOfHosts) {
    var cidr = null;
    for(var i = 0; i<cidrlist.length; i++) {
        var iCidr = cidrlist[i];
        if(iCidr.val >= numberOfHosts){
            cidr = {
                cidr: iCidr.cidr,
                subnet: iCidr.subnet
            };
            break;
        }
    }
    if(cidr) {
        return cidr;
    } else {
        throw new Error("CIDR tidak ditemukan");
    }
}

function nextSubnet(ip){
    var octets = ip.split(".");
    octets = octets.map((item) => item * 1);
    octets[3] = (octets[3] === 255) ? 0 : octets[3] + 1;
    octets[2] = (octets[3] === 0) ? ((octets[2] === 255) ? 0 : octets[2] + 1) : octets[2];
    octets[1] = (octets[2] === 0) ? ((octets[1] === 255) ? 0 : octets[1] + 1) : octets[1];
    octets[0] = (octets[1] === 0) ? ((octets[0] === 255) ? 0 : octets[0] + 1) : octets[0];
    return octets.map((item) => item + "").join(".");
}