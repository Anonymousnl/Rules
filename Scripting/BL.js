const path1 = "\/x\/v2\/view\?access_key";
const path2 = "\/x\/v2\/feed\/index\?access_key";
const path3 = "\/x\/v2\/account\/mine\?access_key";
const path4 = "\/x\/resource\/show\/tab\?access_key";

const url = $request.url;
let body = $response.body;

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    obj.data.relates = obj.data.relates.filter(function(item) {
        if (item.goto == "cm" || item.goto == "game" || item.goto == "is_ad" || item.goto == "special") {
            return false;
        }
            return true;
    });
    obj.data.cms = [];
    body = JSON.stringify(obj);
} else if (url.indexOf(path2) != -1) {
    let obj = JSON.parse(body);
    obj.data.items = obj.data.items.filter(function(item) {
        if (item.card_goto == "ad_info" || item.card_goto == "ad_web" || item.card_goto == "ad_web_s" || item.card_goto == "banner" || item.card_goto == "live" || item.card_goto == "search_subscribe") {
            return false;
        }
            return true;
    });
    body = JSON.stringify(obj);
} else if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    obj.data.sections_v2 = [
        {
            "items": [
                {
                    "id": 396,
                    "title": "离线缓存",
                    "icon": "http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png",
                    "uri": "bilibili://user_center/download"
                },
                {
                    "id": 397,
                    "title": "历史记录",
                    "icon": "http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png",
                    "uri": "bilibili://user_center/history"
                },
                {
                    "id": 398,
                    "title": "我的收藏",
                    "icon": "http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png",
                    "uri": "bilibili://user_center/favourite"
                },
                {
                    "id": 399,
                    "title": "稍后再看",
                    "icon": "http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png",
                    "need_login": 1,
                    "uri": "bilibili://user_center/watch_later"
                }
            ],
            "style": 1,
            "button": {}
        },
        {
            "title": "更多服务",
            "items": [
                {
                    "id": 410,
                    "title": "设置",
                    "icon": "http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png",
                    "uri": "bilibili://user_center/setting"
                }
            ],
            "style": 2,
            "button": {}
        }
    ];
    body = JSON.stringify(obj);
} else if (url.indexOf(path4) != -1) {
    let obj = JSON.parse(body);
    obj.data.tab = [
        {
            "id": 39,
            "tab_id": "直播tab",
            "name": "直播",
            "uri": "bilibili://live/home",
            "pos": 1
        },
        {
            "id": 40,
            "tab_id": "推荐tab",
            "default_selected": 1,
            "name": "推荐",
            "uri": "bilibili://pegasus/promo",
            "pos": 2
        },
        {
            "id": 42,
            "tab_id": "追番Tab",
            "name": "追番",
            "uri": "bilibili://pgc/home",
            "pos": 3
        },
        {
            "id": 151,
            "tab_id": "影视tab",
            "name": "影视",
            "uri": "bilibili://pgc/cinema-tab",
            "pos": 5
        }
    ];
    obj.data.top = [
        {
            "id": 176,
            "icon": "http://i0.hdslb.com/bfs/archive/d43047538e72c9ed8fd8e4e34415fbe3a4f632cb.png",
            "tab_id": "消息Top",
            "name": "消息",
            "uri": "bilibili://link/im_home",
            "pos": 1
        }
    ];
    obj.data.bottom = [
        {
            "uri": "bilibili://main/home/",
            "tab_id": "首页Bottom",
            "pos": 1,
            "id": 177,
            "icon_selected": "http://i0.hdslb.com/bfs/archive/e5106aa688dc729e7f0eafcbb80317feb54a43bd.png",
            "icon": "http://i0.hdslb.com/bfs/archive/63d7ee88d471786c1af45af86e8cb7f607edf91b.png",
            "name": "首页"
        },
        {
            "uri": "bilibili://pegasus/channel/",
            "tab_id": "频道Bottom",
            "pos": 2,
            "id": 178,
            "icon_selected": "http://i0.hdslb.com/bfs/archive/79d29e6ac3b6e52652881b050e63988e2038130f.png",
            "icon": "http://i0.hdslb.com/bfs/archive/9c453a54eb83f5140cd098bf2e8ed8a599edc7fe.png",
            "name": "频道"
        },
        {
            "uri": "bilibili://following/home/",
            "tab_id": "动态Bottom",
            "pos": 3,
            "id": 179,
            "icon_selected": "http://i0.hdslb.com/bfs/archive/25b658e1f6b6da57eecba328556101dbdcb4b53f.png",
            "icon": "http://i0.hdslb.com/bfs/archive/86dfbe5fa32f11a8588b9ae0fccb77d3c27cedf6.png",
            "name": "动态"
        },
        {
            "uri": "bilibili://user_center/",
            "tab_id": "我的Bottom",
            "pos": 4,
            "id": 181,
            "icon_selected": "http://i0.hdslb.com/bfs/archive/a54a8009116cb896e64ef14dcf50e5cade401e00.png",
            "icon": "http://i0.hdslb.com/bfs/archive/4b0b2c49ffeb4f0c2e6a4cceebeef0aab1c53fe1.png",
            "name": "我的"
        }
    ];
    body = JSON.stringify(obj);
}

$done({ body });