try {
	const i = $request.url;
	let e = $response.body;
	e || $done({}), e = JSON.parse(e);
	const t = {
		"resource/show/tab/v2": function(i) {
			i.data.tab = [{
				pos: 1,
				id: 731,
				name: "直播",
				tab_id: "直播tab",
				uri: "bilibili://live/home"
			}, {
				pos: 2,
				id: 477,
				name: "推荐",
				tab_id: "推荐tab",
				uri: "bilibili://pegasus/promo",
				default_selected: 1
			}, {
				pos: 3,
				id: 478,
				name: "热门",
				tab_id: "热门tab",
				uri: "bilibili://pegasus/hottopic"
			}, {
				pos: 4,
				id: 545,
				name: "动画",
				tab_id: "bangumi",
				uri: "bilibili://pgc/home"
			}, {
				pos: 5,
				id: 151,
				name: "影视",
				tab_id: "film",
				uri: "bilibili://pgc/cinema-tab"
			}], i.data.top = [{
				pos: 1,
				id: 176,
				name: "消息",
				tab_id: "消息Top",
				uri: "bilibili://link/im_home",
				icon: "http://i0.hdslb.com/bfs/archive/d43047538e72c9ed8fd8e4e34415fbe3a4f632cb.png"
			}], i.data.bottom = [{
				pos: 1,
				id: 177,
				name: "首页",
				tab_id: "home",
				uri: "bilibili://main/home/",
				icon: "http://i0.hdslb.com/bfs/archive/63d7ee88d471786c1af45af86e8cb7f607edf91b.png",
				icon_selected: "http://i0.hdslb.com/bfs/archive/e5106aa688dc729e7f0eafcbb80317feb54a43bd.png"
			}, {
				pos: 2,
				id: 179,
				name: "动态",
				tab_id: "dynamic",
				uri: "bilibili://following/home/",
				icon: "http://i0.hdslb.com/bfs/archive/86dfbe5fa32f11a8588b9ae0fccb77d3c27cedf6.png",
				icon_selected: "http://i0.hdslb.com/bfs/archive/25b658e1f6b6da57eecba328556101dbdcb4b53f.png"
			}, {
				pos: 5,
				id: 181,
				name: "我的",
				tab_id: "我的Bottom",
				uri: "bilibili://user_center/",
				icon: "http://i0.hdslb.com/bfs/archive/4b0b2c49ffeb4f0c2e6a4cceebeef0aab1c53fe1.png",
				icon_selected: "http://i0.hdslb.com/bfs/archive/a54a8009116cb896e64ef14dcf50e5cade401e00.png"
			}], $done({
				body: JSON.stringify(i)
			})
		},
		"v2/splash": function(i) {
			if(!i.data) return;
			["show", "event_list"].forEach((e => {
				i.data[e] && (i.data[e] = [])
			})), $done({
				body: JSON.stringify(i)
			})
		},
		"feed/index?": function(i) {
			Array.isArray(i.data.items) && (i.data.items = i.data.items.filter((i => !i.banner_item && !i.ad_info && !i.card_goto?.startsWith("ad") && ["small_cover_v2", "large_cover_single_v9", "large_cover_v1"].includes(i.card_type))));
			$done({
				body: JSON.stringify(i)
			})
		},
		"feed/index/story?": function(i) {
			Array.isArray(i.data.items) && (i.data.items = i.data.items.reduce(((i, e) => (e.ad_info || e.card_goto?.startsWith("ad") || (delete e.story_cart_icon, i.push(e)), i)), []));
			$done({
				body: JSON.stringify(i)
			})
		},
		"account/mine": function(i) {
			const e = {
				sections_v2: [{
					items: [{
						id: 396,
						title: "离线缓存",
						uri: "bilibili://user_center/download",
						icon: "http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png",
						common_op_item: {}
					}, {
						id: 397,
						title: "历史记录",
						uri: "bilibili://user_center/history",
						icon: "http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png",
						common_op_item: {}
					}, {
						id: 3072,
						title: "我的收藏",
						uri: "bilibili://user_center/favourite",
						icon: "http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png",
						common_op_item: {}
					}, {
						id: 2830,
						title: "稍后再看",
						uri: "bilibili://user_center/watch_later_v2",
						icon: "http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png",
						need_login: 1,
						common_op_item: {}
					}],
					style: 1,
					button: {}
				}, {
					title: "更多服务",
					items: [{
						id: 410,
						title: "设置",
						uri: "bilibili://user_center/setting",
						icon: "http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png",
						common_op_item: {}
					}],
					style: 2,
					button: {}
				}],
				ipad_sections: [{
					id: 747,
					title: "离线缓存",
					uri: "bilibili://user_center/download",
					icon: "http://i0.hdslb.com/bfs/feed-admin/9bd72251f7366c491cfe78818d453455473a9678.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}, {
					id: 748,
					title: "历史记录",
					uri: "bilibili://user_center/history",
					icon: "http://i0.hdslb.com/bfs/feed-admin/83862e10685f34e16a10cfe1f89dbd7b2884d272.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}, {
					id: 749,
					title: "我的收藏",
					uri: "bilibili://user_center/favourite",
					icon: "http://i0.hdslb.com/bfs/feed-admin/6ae7eff6af627590fc4ed80c905e9e0a6f0e8188.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}, {
					id: 750,
					title: "稍后再看",
					uri: "bilibili://user_center/watch_later",
					icon: "http://i0.hdslb.com/bfs/feed-admin/928ba9f559b02129e51993efc8afe95014edec94.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}],
				ipad_upper_sections: [{
					id: 752,
					title: "创作首页",
					uri: "/uper/homevc",
					icon: "http://i0.hdslb.com/bfs/feed-admin/d20dfed3b403c895506b1c92ecd5874abb700c01.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}],
				ipad_recommend_sections: [{
					id: 755,
					title: "我的关注",
					uri: "bilibili://user_center/myfollows",
					icon: "http://i0.hdslb.com/bfs/feed-admin/fdd7f676030c6996d36763a078442a210fc5a8c0.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}, {
					id: 756,
					title: "我的消息",
					uri: "bilibili://link/im_home",
					icon: "http://i0.hdslb.com/bfs/feed-admin/e1471740130a08a48b02a4ab29ed9d5f2281e3bf.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}],
				ipad_more_sections: [{
					id: 764,
					title: "设置",
					uri: "bilibili://user_center/setting",
					icon: "http://i0.hdslb.com/bfs/feed-admin/34e8faea00b3dd78977266b58d77398b0ac9410b.png",
					mng_resource: {
						icon_id: 0,
						icon: ""
					}
				}]
			};
			Object.keys(e).forEach((t => {
				i.data[t] && (i.data[t] = e[t])
			})), delete i.data.answer, delete i.data.live_tip, delete i.data.vip_section, delete i.data.vip_section_v2, i.data.vip && !i.data.vip.status && (i.data.vip_type = 2, Object.assign(i.data.vip, {
				status: 1,
				type: 2,
				vip_pay_type: 1,
				due_date: 466982416e4
			}));
			$done({
				body: JSON.stringify(i)
			})
		},
		"account/myinfo": function(i) {
			i.data.vip && !i.data.vip.status && Object.assign(i.data.vip, {
				status: 1,
				type: 2,
				vip_pay_type: 1,
				due_date: 466982416e4
			});
			$done({
				body: JSON.stringify(i)
			})
		}
	};
	for(const c in t)
		if(i.includes(c)) {
			t[c](e);
			break
		}
} catch (i) {
	console.log(i.toString())
} finally {
	$done({})
}