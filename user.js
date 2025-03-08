function SaveAsFile() {
    record[userNameEncrypted] = CryptoJS.AES.encrypt(JSON.stringify(collected), Math.E.toString()).toString();
    $.ajax({
        
        url: "https://docs.google.com/forms/u/0/d/e/1FAIpQLScQSz-APwiTTyfzr63kHGc56nBaG-X25G9MLPkT9NZv3vl7_A/formResponse",
        crossDomain: true,
        data: {
          "entry.784132201": userNameEncrypted,
          "entry.1653586583": record[userNameEncrypted]
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
// read json-------------------------------------------------------------------------------------------
var file, lim, fes, fake, flim, bf, record, userName="", userData, userNameEncrypted,mode = 0, attr = 0;
var tempRes = [{}, {}, {}, {}, {}, {}]; // 0:res021, 1:res022, 2:res023, 3:res024, 4:res025, 5:res026
var displayFlag = [
    {"flag":0,"title":"限定","data":[]},
    {"flag":0,"title":"fes","data":[]},
    {"flag":0,"title":"尊爵不凡 bloom fes","data":[]},
    {"flag":0,"title":"近藤騙錢爛限定","data":[]},
    {"flag":0,"title":"假四星","data":[]},
]; //0:lim 1:fes 2:bf 3:fakelim 4:fake
var ranking = []

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
    'https://sheets.googleapis.com/v4/spreadsheets/1mUR2MkKO8fVWAGrwKsqTauvhPHX9Zy_9ELt7PW-QB6U/values/record?alt=json&key=AIzaSyBSdX63RDDUrBRO5jZ1EHd7VtbbwITMT1c'
];

Promise.all(urls.map(url => fetch(url).then(response => response.json())))
    .then(data => {
        [file, tempRes[0], tempRes[1], tempRes[2], tempRes[3], tempRes[4], tempRes[5], lim, fes, fake, flim, bf, record, userData] = data;
    })
    .catch(error => console.error('Error fetching data:', error));

//var definition ------------------------------------------------------------------------------------------------------------
collected = {};
for (let i = 1; i <= 26; i++) {
    const key = `res${String(i).padStart(3, '0')}`;
    collected[key] = [];
}
//collection----------------------------------------------------------------------------------------------------
$(".character").click(function(){
    $('.gallery').empty()
    $('.stats').empty();
    $('.hint').empty()

    $("body").css("background","url(small/res"+$(this).attr("index")+"/banner"+".jpg) 0% 0% / cover fixed");
    
    for(var i=0;i<file["res"+$(this).attr("index")].length;i++){
        let path=$(this).attr("index")+"/"+file["res"+$(this).attr("index")][i];

        if(collected["res"+$(this).attr("index")].indexOf(file["res"+$(this).attr("index")][i])==-1){
            $('.gallery').append(
                "<img src=\"small/res"+path+".png\" code=\""+file["res"+$(this).attr("index")][i]+"\"alt=\""+$(this).attr("index")+"\" />"
            )

            // console.log(collected["res"+$(this).attr("index")])
        }
        
        else
        $('.gallery').append(
            "<img src=\"small/res"+path+".png\" code=\""+file["res"+$(this).attr("index")][i]+"\"alt=\""+$(this).attr("index")+"\" class=\"collected\"/>"
        )
    }
});
//img action----------------------------------------------------------------------------------------------------
$('.gallery').on('mousedown',"img",function(e){
    if(e.which==3){
        if($(this).attr("class")=="collected"){
            $(this).attr("class","")
            collected["res"+$(this).attr("alt")].splice(collected["res"+$(this).attr("alt")].indexOf($(this).attr("code")),1)
            console.log(collected["res"+$(this).attr("alt")])
        }
    }
});
$(".gallery").on("click","img",function(){
    if($(this).attr("class")!="collected"){
        $(this).attr("class","collected")
        collected["res"+$(this).attr("alt")].push($(this).attr("code"))
    }
})
$('.gallery').on("contextmenu","img" ,function(){
    return false;
});
$('.gallery').on("mouseenter","img" ,function(){
    $(this).attr("src","small/res"+$(this).attr("alt")+"/"+$(this).attr("code")+"_normal.png")
});
$('.gallery').on("mouseleave","img" ,function(){
    $(this).attr("src","small/res"+$(this).attr("alt")+"/"+$(this).attr("code")+".png")
});
//---------------------------------------------------------------------------------------------------------------
$(".stats").on("change","select",function(){
    if($(this).attr('id')=="sorting"){
        mode = parseInt($('#sorting option:selected').attr('index'),10)
    }
    else{
        attr = parseInt($('#attr option:selected').attr('index'),10)
        console.log(attr)
    }
    putOnChara()
})

$("#total").click(function(){
    stat()
    putOnChara()
    //special cards display-----------------------------------------------------------------------------------------
    appendAllSpecialCards()
});

$("#save").click(function(i,v){
    SaveAsFile();
})

$("#download").click(function(i,v){
    DownloadAsFile(JSON.stringify(collected),"collected.json","text/plain;charset=utf-8");
})
$(".gallery").on("click","input",function(){
    if($(this).attr("id")!="check"){}
    else{
        displayFlag.forEach((e)=>{
            if(e["title"]==$(this).attr("name"))
                e["flag"]=$(this).is(":checked");
        })
        $('.gallery').empty()
        appendAllSpecialCards()
    }
    
})
function loaddata() {
	let url = URL.createObjectURL(filein.files[0]);
	openfile(url, function (str) {
		temp = JSON.parse(str);
        if(temp.hasOwnProperty("res001"))collected=temp;
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
    $('.gallery').append("<div class='aaa'></div>");
    if(e["flag"])
        $('.gallery').append("<label class = 'specialCard'><input type='checkedbox' id='check' name='"+e["title"]+"'><span>" + e["title"] + "</span></label>");
    else
        $('.gallery').append("<label class = 'specialCard'><input type='checkbox' id='check' name='"+e["title"]+"'><span>" + e["title"] + "</span></label>");
    $('.gallery').append("<div class='aaa'></div>");
    if(e["flag"]){
        for (var i = 0; i < e["data"].length; i++) {
            $('.gallery').append(
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
$(".btn1").click(function(i,v){
    userName = $("input[type=text][name=inputField]").val();
    if(userName==""){
        alert("請輸入名字")
        return
    }
    else{
        initRecord()
        if(Object.keys(record).some(isExisted)){
            $(".album").css("display","")
            $(".gallery").empty()
            $('.stats').empty();
            $(".hint").empty()
            $(".hint").css("font-size","20px")
            $(".hint").append("<p/>使用說明：點選上方角色名稱開始，左鍵選擇，右鍵取消，存檔會存在雲端，下載會存在本機")
            $(".hint").append("<p> 要離開之前記得按存檔</p>")
        }
        else{
            alert("尚未有存檔，先讀入檔案，或開始新的存檔")
            userNameEncrypted = CryptoJS.AES.encrypt(userName, Math.E.toString()).toString();
            $(".album").css("display","")
            $(".gallery").empty()
            $('.stats').empty();
            $(".hint").empty()

            $('.gallery').append(" <input type='file' id='filein' accept='application/JSON' onchange='loaddata();'/>")
            $('.hint').append("使用說明：點選上方角色名稱開始，左鍵選擇，右鍵取消，存檔會存在雲端，下載會存在本機")
        }
        
    }
})

function isExisted(e, index, array) {
    if (CryptoJS.AES.decrypt(e, Math.E.toString()).toString(CryptoJS.enc.Utf8)==userName){
        console.log(CryptoJS.AES.decrypt(e, Math.E.toString()).toString(CryptoJS.enc.Utf8))
        userNameEncrypted = e;
        collected = JSON.parse(CryptoJS.AES.decrypt(record[e], Math.E.toString()).toString(CryptoJS.enc.Utf8));
        return true;
    }
    
    else{
        return false;
    }
    
}

function initRecord(){
    array_temp = userData["values"]
    array_temp.forEach(function (item) {
        record[item[1]] = item[2];
    });
}
function putOnChara(){
    $('.stats').empty()
    addDropDown()
    if(mode == 1){
        temp = Array.from(ranking)
        temp.sort((a,b)=>(b.number - a.number))
        for (let i = 0; i < 26; i++) {
            if(i%4==0&&i!=24)$('.stats').append("<div class=aaa>",)
            $('.stats').append("<p\>"+temp[i].name+" : "+temp[i].number.toString())
        }
    }
    else if(mode == 0){
        for (let i = 0; i < 26; i++) {
            if(i%4==0&&i!=24)$('.stats').append("<div class=aaa>",)
            $('.stats').append("<p\>"+ranking[i].name+" : "+ranking[i].number.toString())
        }
    }
    else{
        temp = Array.from(ranking)
        temp.sort((a,b)=>(b.ratio - a.ratio))
        for (let i = 0; i < 26; i++) {
            if(i%4==0&&i!=24)$('.stats').append("<div class=aaa>",)
                $('.stats').append("<p\>"+temp[i].name+" : "+temp[i].ratio.toString()+"%("+temp[i].number.toString()+")")
        }
    }
//group------------------------------------------------------------------------------------------------------------------------------  
    $('.stats').append("<div class=aaa>",)
    $('.stats').append("<p\>加號左邊為原創角，右邊為V家")
    $('.stats').append("<div class=aaa>",)
    for(tempi=0;tempi<5;tempi++){
        $('.stats').append("<p\>"+groupT[tempi]+" : "+group[tempi]+" + "+groupV[tempi])
    }
    $('.stats').append("<p\>"+groupT[5]+" : "+groupV[5])
//total-----------------------------------------------------------------------------------------------------------------------------
    $('.stats').append("<div class=aaa>",)
    $('.stats').append("<p\>總共 : "+String(star4-groupV[6])+" + "+groupV[6]+" = "+star4)
}
function stat(){
    $('.gallery').empty();
    $('.stats').empty();
    $('.hint').empty();
    displayFlag = [
        {"flag":0,"title":"限定","data":[]},
        {"flag":0,"title":"fes","data":[]},
        {"flag":0,"title":"尊爵不凡 bloom fes","data":[]},
        {"flag":0,"title":"近藤騙錢爛限定","data":[]},
        {"flag":0,"title":"假四星","data":[]},
    ]; //0:lim 1:fes 2:bf 3:fakelim 4:fake
    ranking=[]

    star4=0
    group=[0,0,0,0,0,0]
    groupV=[0,0,0,0,0,0,0]
    groupT=["L/N","MMJ","VBS","WS","ニ-ゴ","無團體V"]
    
    
    $("body").css("background","url(https://assets.pjsek.ai/file/pjsekai-assets/startapp/story/background/epilogue-story/background.png) fixed");

    $(".character").each(function(i,v){

        if (i==26) {
            return false;
        }

        prefix="res"+$(this).attr("index")
        $.merge(displayFlag[0]["data"], $(collected[prefix]).filter(lim[prefix]).toArray().map( e => prefix+"/"+e))
        $.merge(displayFlag[1]["data"], $(collected[prefix]).filter(fes[prefix]).toArray().map( e => prefix+"/"+e))
        $.merge(displayFlag[2]["data"], $(collected[prefix]).filter(bf[prefix]).toArray().map( e => prefix+"/"+e))
        $.merge(displayFlag[3]["data"], $(collected[prefix]).filter(flim[prefix]).toArray().map( e => prefix+"/"+e))        
        $.merge(displayFlag[4]["data"], $(collected[prefix]).filter(fake[prefix]).toArray().map( e => prefix+"/"+e))         
        
        star4+=collected[prefix].length;

        ranking.push({"name":$(this).text(),"number":collected[prefix].length,"ratio":Math.round(collected[prefix].length*100/file[prefix].length)})

        if(i<20){
            group[Math.floor((i)/4)]+=collected[prefix].length;
        }
        else{
            //console.log(tempRes[i-20])
            collected["res0"+String(i+1)].forEach(function (item) {
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
    $(".stats").append("\
        <div class='selection'>\
          <select id='sorting'>\
            <option value='Default' index='0'>預設排序</option>\
            <option value='Star4' index='1'>4星數</option>\
            <option value='Percentage' index='2'>百分比</option>\
            <!--option value='Lim' index='3'>真限定數</option>\
            <option value='LimP' index='4'>真限定百分比</option--></select\
          ><!--select id='attr'>\
            <option value='all' index='0'>全部屬性</option>\
            <option value='green' index='1'>綠草🌱</option>\
            <option value='david' index='2'>藍星✡️</option>\
            <option value='star' index='3'>粉星🌟</option>\
            <option value='moon' index='4'>紫月🌙</option>\
            <option value='heart' index='5'>橘心🩷</option>\
          </select>\
        </div -->")
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