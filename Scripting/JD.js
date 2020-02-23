const path1 = "\/client\.action\?functionId=start";
const path2 = "\/client\.action\?functionId=myOrderInfo";
const path3 = "\/client\.action\?functionId=orderTrackBusiness";

const url = $request.url;
let body = $response.body;

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    obj.data.images = [];
    obj.data.showTimesDaily = 0;
    body = JSON.stringify(obj);
} else if (url.indexOf(path2) != -1 || url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    obj.data.floors = obj.data.floors.filter(function(item) {
        if (item.mId == "bannerFloor" || item.mId == "commonBanner" || item.mId == "jdDeliveryBanner" || item.mId == "orderQuestionAnswer" || item.mId == "orderTrackPush") {
            return false;
        }
            return true;
    });
    body = JSON.stringify(obj);
}

$done({ body });