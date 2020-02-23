let obj = JSON.parse($response.body);
obj = {
	"data": {
		"psnl_vip_property": {
			"expiry": "4092599349"
		}
	}
};
$done({
	body: JSON.stringify(obj)
});