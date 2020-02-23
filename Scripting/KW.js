const path1 = "\/vip\/v2\/user\/vip";
const path2 = "\/vip\/spi\/mservice";

const url = $request.url;
let body = $response.body;

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    obj.data.isNewUser = 2;
    obj.data.isYearUser = 2;
    obj.data.time = 1961170340993;
    obj.data.vip3Expire = 1835312949000;
    obj.data.vipExpire = 1835312949000;
    obj.data.vipLuxuryExpire = 1835312949000;
    obj.data.vipOverSeasExpire = 1835312949000;
    obj.data.vipmExpire = 1835312949000;
    body = JSON.stringify(obj);
} else if (url.indexOf(path2) != -1) {
    let obj = JSON.parse(body);
    obj.data.isVIPLuxAutoPay = 2;
    obj.data.isVIPMAutoPay = 2;
    body = JSON.stringify(obj);
}

$done({ body });