function SaveAsFile(t,f,m) {
    try {
        var b = new Blob([t],{type:m});
        saveAs(b, f);
    } catch (e) {
        window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
    }
}
// read json-------------------------------------------------------------------------------------------
var file, lim, fes, fake, flim, bf, mode = 0;
var tempRes = [{}, {}, {}, {}, {}, {}]; // 0:res021, 1:res022, 2:res023, 3:res024, 4:res025, 5:res026
var ranking=[]

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
    "https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/bf.json"
];

Promise.all(urls.map(url => fetch(url).then(response => response.json())))
    .then(data => {
        [file, tempRes[0], tempRes[1], tempRes[2], tempRes[3], tempRes[4], tempRes[5], lim, fes, fake, flim, bf] = data;
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

$(".gallery").on("click",".star",function(){
    mode = 1
    $('.stats').empty()
    putOnChara()
})
$(".gallery").on("click",".default",function(){
    mode = 0
    $('.stats').empty()
    putOnChara()
})

$("ul b").click(function(){
    stat()
    putOnChara()
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

$("ul p").click(function(i,v){
    SaveAsFile(JSON.stringify(collected),"collected.json","text/plain;charset=utf-8");
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
    $('.gallery').append("<label class = 'specialCard'><input type='checkbox' name='"+title+"'><span>" + title + "</span></label>");
    $('.gallery').append("<div class='aaa'></div>");
    for (var i = 0; i < numArray.length; i++) {
        $('.gallery').append(
            "<div class='special' style='background-image:url(small/" + numArray[i] + ".png)'></div>"
        );
    }
}
function putOnChara(){
    if(mode){
        $('.stats').append("<div class='default'>",)
        temp = Array.from(ranking)
        temp.sort((a,b)=>(b.number - a.number))
        for (let i = 0; i < 26; i++) {
            if(i%4==0&&i!=24)$('.stats').append("<div class=aaa>",)
            $('.stats').append("<p\>"+temp[i].name+" : "+temp[i].number.toString()+"("+temp[i].ratio.toString()+"%) ")
        }
    }
    else{
        $('.stats').append("<div class='star'>",)
        for (let i = 0; i < 26; i++) {
            if(i%4==0&&i!=24)$('.stats').append("<div class=aaa>",)
            $('.stats').append("<p\>"+ranking[i].name+" : "+ranking[i].number.toString())
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
    $('.hint').empty();
    lim_NUM=[]
    fes_NUM=[]
    flim_NUM=[]
    fake_NUM=[]
    bf_NUM=[]
    ranking=[]

    star4=0
    group=[0,0,0,0,0,0]
    groupV=[0,0,0,0,0,0,0]
    groupT=["L/N","MMJ","VBS","WS","ニ-ゴ","無團體V"]
    $('.gallery').empty()
    $('.gallery').append("<div class=stats>")
    $("body").css("background","url(https://assets.pjsek.ai/file/pjsekai-assets/startapp/story/background/epilogue-story/background.png) fixed");

    $("ul li").each(function(i,v){

        if (i==26) {
            return false;
        }

        prefix="res"+$(this).attr("index")
        $.merge(lim_NUM, $(collected[prefix]).filter(lim[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(fes_NUM, $(collected[prefix]).filter(fes[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(flim_NUM, $(collected[prefix]).filter(flim[prefix]).toArray().map(function(e){return prefix+"/"+e}))        
        $.merge(fake_NUM, $(collected[prefix]).filter(fake[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(bf_NUM, $(collected[prefix]).filter(bf[prefix]).toArray().map(function(e){return prefix+"/"+e}))             
        
        
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