const url = $request.url;
if(!$response.body) $done({});
let body = $response.body;
let obj = JSON.parse(body);
//滴滴青桔
if(url.includes("htwkop.xiaojukeji.com")) {
	delete obj.data.bannerInfoConfig;
	//喜茶
} else if(url.includes("go.heytea.com")) {
	delete obj.data.ad;
	delete obj.data.brands;
}
body = JSON.stringify(obj);
$done({
	body
});