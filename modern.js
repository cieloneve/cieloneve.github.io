// Modern UI Adapter for user.js
// 這個檔案是原始 user.js 的現代化 UI 適配版本
// 所有核心邏輯保持不變，只修改 UI 相關的 DOM 操作

// ===== 原始函數 - 保持不變 =====
function SaveAsFile() {
    $.ajax({
        url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLScQSz-APwiTTyfzr63kHGc56nBaG-X25G9MLPkT9NZv3vl7_A/formResponse",
        crossDomain: true,
        data: {
          "entry.784132201": userNameEncrypted,
          "entry.1653586583": CryptoJS.AES.encrypt(JSON.stringify(collected), Math.E.toString()).toString(),
          "entry.1505504360": CryptoJS.AES.encrypt(JSON.stringify(bg_list), Math.E.toString()).toString()
        },
        type: "POST", 
        dataType: "JSONP",
        complete: function () {
            alert("已存檔")
        }
    });
}

function DownloadAsFile(t,f,m){
    try {
        var b = new Blob([t],{type:m});
        saveAs(b, f);
    } catch (e) {
        window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
    }
}

// ===== 原始變數定義 - 保持不變 =====
var file, lim, fes, fake, flim, bf, record, userName="", userData, userNameEncrypted, mode = 0, attr = 0;
var tempRes = [{}, {}, {}, {}, {}, {}];
var displayFlag = [
    {"flag":0,"title":"限定","data":[]},
    {"flag":0,"title":"fes","data":[]},
    {"flag":0,"title":"尊爵不凡 bloom fes","data":[]},
    {"flag":0,"title":"近藤騙錢爛限定","data":[]},
    {"flag":0,"title":"假四星","data":[]},
];
var ranking = [], attr_list, bg_list;

const sepBlock = "<div class = 'aaa'></div>"
const urls = [
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/a.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res021.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res022.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res023.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res024.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res025.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res026.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/lim.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/fes.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/fake.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/fakelim.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/bf.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/user/record.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/attr.json",
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/bg.json",
    'https://sheets.googleapis.com/v4/spreadsheets/1mUR2MkKO8fVWAGrwKsqTauvhPHX9Zy_9ELt7PW-QB6U/values/record?alt=json&key=AIzaSyBSdX63RDDUrBRO5jZ1EHd7VtbbwITMT1c'
];

// 顯示載入畫面
$("#loadingOverlay").addClass("active");

Promise.all(urls.map(url => fetch(url).then(response => response.json())))
    .then(data => {
        [file, tempRes[0], tempRes[1], tempRes[2], tempRes[3], tempRes[4], tempRes[5], lim, fes, fake, flim, bf, record, attr_list, bg_list, userData] = data;
        $("#loadingOverlay").removeClass("active");
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        $("#loadingOverlay").removeClass("active");
        alert("資料載入失敗，請重新整理頁面");
    });

// ===== 初始化收集資料 - 保持不變 =====
collected = {};
for (let i = 1; i <= 26; i++) {
    const key = `res${String(i).padStart(3, '0')}`;
    collected[key] = [];
}

// ===== 現代化 UI 事件綁定 =====

// 登入按鈕
$("#loginBtn").click(function(){
    userName = $("input[type=text][name=inputField]").val();
    if(userName==""){
        alert("請輸入名字")
        return
    }
    
    initRecord()
    if(Object.keys(record).some(isExisted)){
        // 有存檔，直接進入
        $("#loginSection").hide();
        $("#appSection").show();
        $("#userNameDisplay").text(userName);
        showWelcomeMessage();
    } else {
        // 無存檔，詢問是否要開始新存檔或載入檔案
        if(confirm("尚未有雲端存檔。\n\n點選「確定」開始新的存檔\n點選「取消」載入本機檔案")){
            userNameEncrypted = CryptoJS.AES.encrypt(userName, Math.E.toString()).toString();
            $("#loginSection").hide();
            $("#appSection").show();
            $("#userNameDisplay").text(userName);
            showWelcomeMessage();
        } else {
            // 顯示檔案輸入
            $("#gallery").html('<input type="file" id="filein" accept="application/JSON" onchange="loaddata();" style="margin: 2rem auto; display: block;"/>');
            $("#loginSection").hide();
            $("#appSection").show();
            $("#userNameDisplay").text(userName);
        }
    }
    localStorage.setItem("NeveUserName", userName);
});

// 顯示歡迎訊息
function showWelcomeMessage() {
    $("#gallery").html(`
        <div class="welcome-message">
            <div class="welcome-icon">🎴</div>
            <h3>歡迎使用卡面收集器</h3>
            <p>點擊上方角色名稱開始收集</p>
            <div class="tips">
                <p><strong>使用說明：</strong></p>
                <ul>
                    <li>左鍵點擊圖片標記為已收集</li>
                    <li>右鍵點擊可移除收藏或設定背景</li>
                    <li>使用統計按鈕查看收集進度</li>
                    <li>記得定期點擊存檔按鈕保存進度</li>
                </ul>
            </div>
        </div>
    `);
}

// 角色按鈕點擊 - 核心邏輯保持不變，只改 UI 選擇器
$(".char-btn").click(function(){
    // 移除所有按鈕的 active 類
    $(".char-btn").removeClass("active");
    // 為當前按鈕添加 active 類
    $(this).addClass("active");
    
    $('#gallery').empty()
    $('#statsPanel').empty();
    $('#hintSection').empty()

    // 設定背景 - 使用 data-index 而非 index 屬性
    $("body").css("background","url("+bg_list["res"+$(this).data("index")] + "), url(gray.jpg)");
    $("body").addClass("custom-bg");
    
    for(var i=0;i<file["res"+$(this).data("index")].length;i++){
        let path=$(this).data("index")+"/"+file["res"+$(this).data("index")][i];

        if(collected["res"+$(this).data("index")].indexOf(file["res"+$(this).data("index")][i])==-1){
            $('#gallery').append(
                "<img src=\"small/res"+path+".png\" code=\""+file["res"+$(this).data("index")][i]+"\"alt=\""+$(this).data("index")+"\" />"
            )
        } else {
            $('#gallery').append(
                "<img src=\"small/res"+path+".png\" code=\""+file["res"+$(this).data("index")][i]+"\"alt=\""+$(this).data("index")+"\" class=\"collected\"/>"
            )
        }
    }
});

// 圖片點擊 - 邏輯保持不變
$("#gallery").on("click","img",function(){
    if($(this).attr("class")!="collected"){
        $(this).attr("class","collected")
        collected["res"+$(this).attr("alt")].push($(this).attr("code"))
    }
})

// 圖片滑鼠移入移出 - 邏輯保持不變
$('#gallery').on("mouseenter","img" ,function(){
    $(this).attr("src","small/res"+$(this).attr("alt")+"/"+$(this).attr("code")+"_normal.png")
});
$('#gallery').on("mouseleave","img" ,function(){
    $(this).attr("src","small/res"+$(this).attr("alt")+"/"+$(this).attr("code")+".png")
});

// 下拉選單變更 - 邏輯保持不變
$("#statsPanel").on("change","select",function(){
    if($(this).attr('id')=="sorting"){
        mode = parseInt($('#sorting option:selected').attr('index'),10)
        putOnChara()
    }
    else{
        attr = parseInt($('#attr option:selected').attr('index'),10)
        console.log(attr)
        stat()
        putOnChara()
        appendAllSpecialCards()
    }
})

// 統計按鈕
$("#totalBtn").click(function(){
    $(".char-btn").removeClass("active");
    stat()
    putOnChara()
    appendAllSpecialCards()
});

// 存檔按鈕
$("#saveBtn").click(function(){
    SaveAsFile();
})

// 下載按鈕
$("#downloadBtn").click(function(){
    DownloadAsFile(JSON.stringify(collected),"collected.json","text/plain;charset=utf-8");
})

// 特殊卡片開關 - 邏輯保持不變
$("#gallery").on("click","input",function(){
    if($(this).attr("id")!="check"){}
    else{
        displayFlag.forEach((e)=>{
            if(e["title"]==$(this).attr("name"))
                e["flag"]=$(this).is(":checked");
        })
        $('#gallery').empty()
        appendAllSpecialCards()
    }
})

// ===== 原始函數 - 保持不變 =====

function loaddata() {
	let url = URL.createObjectURL(filein.files[0]);
	openfile(url, function (str) {
		temp = JSON.parse(str);
        if(temp.hasOwnProperty("res001")){
            collected=temp;
            alert("檔案載入成功！");
            showWelcomeMessage();
        }
	});
}

function openfile(url, callback) {
	if (typeof callback == "undefined") {
		callback = function (str) {};
	}
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", function () {
		if (oReq.status != 404) {
			callback(this.responseText);
		} else {
			callback('{}');
		}
	});
	oReq.addEventListener("error", function () {
		callback('{}');
	});
	oReq.open("GET", url);
	oReq.send();
}

function appendGallerySection(e) {
    $('#gallery').append(sepBlock);
    if(e["flag"])
        $('#gallery').append("<label class = 'specialCard'><input type='checkedbox' id='check' name='"+e["title"]+"'><span>" + e["title"] + "</span></label>");
    else
        $('#gallery').append("<label class = 'specialCard'><input type='checkbox' id='check' name='"+e["title"]+"'><span>" + e["title"] + "</span></label>");
    $('#gallery').append(sepBlock);
    if(e["flag"]){
        for (var i = 0; i < e["data"].length; i++) {
            $('#gallery').append(
                "<div class='special' style='background-image:url(small/" + e["data"][i] + ".png)'></div>"
            );
        }
    }
}

function appendAllSpecialCards(){
    displayFlag.forEach((e)=>{
        appendGallerySection(e)
    })
}

function isExisted(e, index, array) {
    if (CryptoJS.AES.decrypt(e, Math.E.toString()).toString(CryptoJS.enc.Utf8)==userName){
        console.log(CryptoJS.AES.decrypt(e, Math.E.toString()).toString(CryptoJS.enc.Utf8))
        userNameEncrypted = e;
        collected = JSON.parse(CryptoJS.AES.decrypt(record[e][0], Math.E.toString()).toString(CryptoJS.enc.Utf8));
        bg_list = JSON.parse(CryptoJS.AES.decrypt(record[e][1], Math.E.toString()).toString(CryptoJS.enc.Utf8));
        return true;
    } else {
        return false;
    }
}

function initRecord(){
    array_temp = userData["values"]
    array_temp.forEach(function (item) {
        record[item[1]] = [item[2], item[3]];
    });
}

function putOnChara(){
    $('#statsPanel').empty()
    addDropDown()
    temp = Array.from(ranking)
    switch (mode) {
        case 0:
            for (let i = 0; i < 26; i++) {
                if(i%4==0&&i!=24)$('#statsPanel').append(sepBlock,)
                $('#statsPanel').append("<p>"+temp[i].name+" : "+temp[i].number.toString()+"</p>")
            }
            break;
        case 1:
            temp.sort((a,b)=>(b.number - a.number))
            for (let i = 0; i < 26; i++) {
                if(i%4==0&&i!=24)$('#statsPanel').append(sepBlock,)
                $('#statsPanel').append("<p>"+temp[i].name+" : "+temp[i].number.toString()+"</p>")
            }
            break;
        case 2:
            temp.sort((a,b)=>(b.ratio - a.ratio))
            for (let i = 0; i < 26; i++) {
                if(i%4==0&&i!=24)$('#statsPanel').append(sepBlock,)
                $('#statsPanel').append("<p>"+temp[i].name+" : "+temp[i].ratio.toString()+"%("+temp[i].number.toString()+")</p>")
            }
            break;
        case 3:
            temp.sort((a,b)=>(b.lim - a.lim))
            for (let i = 0; i < 26; i++) {
                if(i%4==0&&i!=24)$('#statsPanel').append(sepBlock,)
                $('#statsPanel').append("<p>"+temp[i].name+" : "+temp[i].lim.toString()+"</p>")
            }
            break;
        case 4:
            temp.sort((a,b)=>(b.lim_ratio - a.lim_ratio))
            for (let i = 0; i < 26; i++) {
                if(i%4==0&&i!=24)$('#statsPanel').append(sepBlock,)
                $('#statsPanel').append("<p>"+temp[i].name+" : "+temp[i].lim_ratio.toString()+"%("+temp[i].lim.toString()+")</p>")
            }
            break;    
        default:
            break;
    }
    
    // Group 統計
    $('#statsPanel').append(sepBlock,)
    $('#statsPanel').append("<p>加號左邊為原創角，右邊為V家</p>")
    $('#statsPanel').append(sepBlock,)
    for(tempi=0;tempi<5;tempi++){
        $('#statsPanel').append("<p>"+groupT[tempi]+" : "+group[tempi]+" + "+groupV[tempi]+"</p>")
    }
    $('#statsPanel').append("<p>"+groupT[5]+" : "+groupV[5]+"</p>")
    
    // Total
    $('#statsPanel').append(sepBlock,)
    $('#statsPanel').append("<p>總共 : "+String(star4-groupV[6])+" + "+groupV[6]+" = "+star4+"</p>")
}

function stat(){
    $('#gallery').empty();
    $('#statsPanel').empty();
    $('#hintSection').empty();
    displayFlag = [
        {"flag":0,"title":"限定","data":[]},
        {"flag":0,"title":"fes","data":[]},
        {"flag":0,"title":"尊爵不凡 bloom fes","data":[]},
        {"flag":0,"title":"近藤騙錢爛限定","data":[]},
        {"flag":0,"title":"假四星","data":[]},
    ];
    ranking=[]

    star4=0
    group=[0,0,0,0,0,0]
    groupV=[0,0,0,0,0,0,0]
    groupT=["L/N","MMJ","VBS","WS","ニ-ゴ","無團體V"]
    
    $("body").css("background","url(https://assets.pjsek.ai/file/pjsekai-assets/startapp/story/background/epilogue-story/background.png) fixed");

    $(".char-btn").each(function(i,v){
        if (i==26) {
            return false;
        }

        prefix="res"+$(this).data("index")
        cards = $(collected[prefix]).filter(attr_list[attr][prefix]).toArray()
        
        $.merge(displayFlag[0]["data"], $(cards).filter(lim[prefix]).toArray().map( e => prefix+"/"+e))
        $.merge(displayFlag[1]["data"], $(cards).filter(fes[prefix]).toArray().map( e => prefix+"/"+e))
        $.merge(displayFlag[2]["data"], $(cards).filter(bf[prefix]).toArray().map( e => prefix+"/"+e))
        $.merge(displayFlag[3]["data"], $(cards).filter(flim[prefix]).toArray().map( e => prefix+"/"+e))        
        $.merge(displayFlag[4]["data"], $(cards).filter(fake[prefix]).toArray().map( e => prefix+"/"+e))         
        
        star4+=cards.length;

        ranking.push({"name":$(this).text(),"number":cards.length,"ratio":Math.round(cards.length*100/file[prefix].length),"lim":$(cards).filter(lim[prefix]).toArray().length,'lim_ratio':Math.round($(cards).filter(lim[prefix]).toArray().length*100/lim[prefix].length)})

        if(i<20){
            group[Math.floor((i)/4)]+=cards.length;
        }
        else{
            cards.forEach(function (item) {
                if(tempRes[i-20][item]["group"]=="ln")groupV[0]++;
                else if(tempRes[i-20][item]["group"]=="mmj")groupV[1]++;
                else if(tempRes[i-20][item]["group"]=="vbs")groupV[2]++;
                else if(tempRes[i-20][item]["group"]=="ws")groupV[3]++;
                else if(tempRes[i-20][item]["group"]=="25")groupV[4]++;
                else if(tempRes[i-20][item]["group"]=="na")groupV[5]++;                
            });
        }
    })
    for(tempi=0;tempi<5;tempi++){
        groupV[6]+=groupV[tempi];
    }
    groupV[6]+=groupV[5];
}

function addDropDown(){
    $("#statsPanel").append("\
        <div class='selection'>\
          <select id='sorting'>\
            <option value='Default' index='0'>預設排序</option>\
            <option value='Star4' index='1'>4星數</option>\
            <option value='Percentage' index='2'>百分比</option>\
            <option value='Lim' index='3'>真限定數</option>\
            <option value='LimP' index='4'>真限定百分比</option></select\
          ><select id='attr'>\
            <option value='all' index='0'>全部屬性</option>\
            <option value='green' index='1'>綠草🌱</option>\
            <option value='david' index='2'>藍星✡️</option>\
            <option value='star' index='3'>粉星🌟</option>\
            <option value='moon' index='4'>紫月🌙</option>\
            <option value='heart' index='5'>橘心🩷</option>\
          </select>\
        </div>")
    $('#sorting').children().each(function(){
        if(parseInt($(this).attr('index'),10)==mode){
            $(this).attr("selected", true);
        }
    })
    $('#attr').children().each(function(){
        if(parseInt($(this).attr('index'),10)==attr){
            $(this).attr("selected", true);
        }
    })
}

// ===== 右鍵選單 - 邏輯保持不變 =====
$(function() {
    $.contextMenu({
        selector: '#gallery img',
        items: {
            "uncollect": {name: "移除收藏", icon: "delete", callback:function(key, opt){    
                if($(this).attr("class").indexOf("collected")!=-1){
                    $(this).attr("class","")
                    collected["res"+$(this).attr("alt")].splice(collected["res"+$(this).attr("alt")].indexOf($(this).attr("code")),1)
                    console.log(collected["res"+$(this).attr("alt")])
                }  
            }},
            "after": {name: "設為背景圖片(花前)", icon: "edit",callback: function(key, opt){
                bg_list["res"+$(this).attr("alt")] = "bg/res" + $(this).attr("alt") + "/" + $(this).attr("code") + "_normal.webp"
                $("body").css("background","url("+bg_list["res"+$(this).attr("alt")] + "), url(gray.jpg)");
                $("body").addClass("custom-bg");
            }},
            "normal": {name: "設為背景圖片(花後)", icon: "edit",callback: function(key, opt){
                bg_list["res"+$(this).attr("alt")] = "bg/res" + $(this).attr("alt") + "/" + $(this).attr("code") + ".webp"
                $("body").css("background","url("+bg_list["res"+$(this).attr("alt")] + "), url(gray.jpg)");
                $("body").addClass("custom-bg");
            }},
            "sep1": "---------",
            "quit": {name: "取消", icon: "quit", callback: function(key, opt){
                console.log("quit")
            }}
        }
    });
    $.contextMenu({
        selector: '*',
        items: {
            "disappear": {name:"隱藏收藏", icon:"cut", callback:function(k,o){
                $('#gallery').css("display","none")
            }},
            "appear": {name:"顯示收藏", icon:"loading", callback:function(k,o){
                $("#gallery").css("display","flex")
            }},
            "sep1": "---------",
            "quit": {name: "取消", icon: "quit", callback: function(key, opt){
                console.log("quit")
            }}
        }
    });
});
