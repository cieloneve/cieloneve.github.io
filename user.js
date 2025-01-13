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
var file, lim, fes, fake, flim, bf, record, userName="", userData, userNameEncrypted;
var tempRes = [{}, {}, {}, {}, {}, {}]; // 0:res021, 1:res022, 2:res023, 3:res024, 4:res025, 5:res026

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

count={
    "lim":0,
    "fes":0,
    "flim":0,
    "fake":0
}
//collection------------------------------------------------------------------------------------------------------------
$("ul li").click(function(){
    $('.gallery').empty()
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

$("ul b").click(function(index, element){
    $('.gallery').empty();
    $('.hint').empty();
    lim_NUM=[]
    fes_NUM=[]
    flim_NUM=[]
    fake_NUM=[]
    bf_NUM=[]
    ranking = []

    star4=0
    group=[0,0,0,0,0,0]
    groupV=[0,0,0,0,0,0,0]
    groupT=["L/N","MMJ","VBS","WS","ニ-ゴ","無團體V"]
    $('.gallery').empty()

    $("body").css("background","url(https://assets.pjsek.ai/file/pjsekai-assets/startapp/story/background/epilogue-story/background.png) fixed");

    $("ul li").each(function(i,v){

        if (i==26) {
            return false;
        }

        prefix="res"+$(this).attr("index")
        if(i%4==0&&i!=24)$('.gallery').append("<div class=aaa>",)
        $.merge(lim_NUM, $(collected[prefix]).filter(lim[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(fes_NUM, $(collected[prefix]).filter(fes[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(flim_NUM, $(collected[prefix]).filter(flim[prefix]).toArray().map(function(e){return prefix+"/"+e}))        
        $.merge(fake_NUM, $(collected[prefix]).filter(fake[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(bf_NUM, $(collected[prefix]).filter(bf[prefix]).toArray().map(function(e){return prefix+"/"+e}))             
        $('.gallery').append("<p\>"+$(this).text()+" : "+collected[prefix].length)
        ranking.push({"name":$(this).text(),"number":collected[prefix].length,"ratio":collected[prefix].length*100/file[prefix].length})
        star4+=collected[prefix].length;

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
    ranking.sort((a,b)=>(b.number - a.number))
    putOnChara()
    console.log(ranking)
//group------------------------------------------------------------------------------------------------------------------------------  
    $('.gallery').append("<div class=aaa>",)
    $('.gallery').append("<p\>加號左邊為原創角，右邊為V家")
    $('.gallery').append("<div class=aaa>",)
    for(tempi=0;tempi<5;tempi++){
        groupV[6]+=groupV[tempi];
        $('.gallery').append("<p\>"+groupT[tempi]+" : "+group[tempi]+" + "+groupV[tempi])
    }
    groupV[6]+=groupV[5];
    $('.gallery').append("<p\>"+groupT[5]+" : "+groupV[5])
//total-----------------------------------------------------------------------------------------------------------------------------
    $('.gallery').append("<div class=aaa>",)
    $('.gallery').append("<p\>總共 : "+String(star4-groupV[6])+" + "+groupV[6]+" = "+star4)

//lim ------------------------------------------------------------------------------------------------------------------------------
appendGallerySection("限定", lim_NUM);
//fes ------------------------------------------------------------------------------------------------------------------------------
appendGallerySection("fes", fes_NUM);
//BF -------------------------------------------------------------------------------------------------------------------------------
appendGallerySection("尊爵不凡 bloom fes", bf_NUM);
//fake lim -------------------------------------------------------------------------------------------------------------------------
appendGallerySection("近藤騙錢爛限定", flim_NUM);
//fake -----------------------------------------------------------------------------------------------------------------------------
appendGallerySection("假四星", fake_NUM);

});

$("ul .save").click(function(i,v){
    SaveAsFile();
})

$("ul .download").click(function(i,v){
    DownloadAsFile(JSON.stringify(collected),"collected.json","text/plain;charset=utf-8");
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

function appendGallerySection(title, numArray) {
    $('.gallery').append("<div class='aaa'></div>");
    $('.gallery').append("<p>" + title + "</p>");
    $('.gallery').append("<div class='aaa'></div>");
    for (var i = 0; i < numArray.length; i++) {
        $('.gallery').append(
            "<div class='special' style='background-image:url(small/" + numArray[i] + ".png)'></div>"
        );
    }
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

