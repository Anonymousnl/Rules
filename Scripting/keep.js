if(-1 != $request.url.indexOf("people/my")) {
	let e = JSON.parse($response.body);
	e.data.floatingInfo = {}, e.data.memberInfo && delete e.data.memberInfo, $done({
		body: JSON.stringify(e)
	})
} else if(-1 != $request.url.indexOf("start")) {
	let a = JSON.parse($response.body);
	a.data.status = !0, $done({
		body: JSON.stringify(a)
	})
} else if(-1 != $request.url.indexOf("preview")) {
	let t = JSON.parse($response.body);
	t.data.detailSections = Object.values(t.data.detailSections).filter(e => "recommendation" != e.sectionType), t.data.extendInfo.startEnable = !0, t.data.extendInfo.hasPaid = !0, $done({
		body: JSON.stringify(t)
	})
} else if(-1 != $request.url.indexOf("twins/v4/feed/course")) {
	let o = JSON.parse($response.body);
	o.data.modules = Object.values(o.data.modules).filter(e => !("homepageCommonContainer" == e.code || "homepageLive" == e.code)), $done({
		body: JSON.stringify(o)
	})
} else if(-1 != $request.url.indexOf("config/v3/basic")) {
	let d = JSON.parse($response.body);
	d.data.bottomBarControl.defaultTab = "home", d.data.bottomBarControl.tabs = Object.values(d.data.bottomBarControl.tabs).filter(e => "home" == e.tabType || "dynamic_sports" == e.tabType || "personal" == e.tabType), d.data.homeTabs = [{
		type: "homeRecommend",
		order: 1,
		name: "推荐",
		schema: "keep://homepage/homeRecommend",
		showInFewDays: 7,
		reverseSwitch: !1,
		default: !0
	}], $done({
		body: JSON.stringify(d)
	})
} else $done();