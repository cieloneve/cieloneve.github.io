var filefakeC
var lim,fes,fake;
var tempRes = [{},{},{},{},{},{}]
function SaveAsFile(t,f,m) {
    try {
        var b = new Blob([t],{type:m});
        saveAs(b, f);
    } catch (e) {
        window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
    }
}
fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res001.json")
.then(response => {
   return response.json();
})
.then(jsondata => console.log(jsondata));

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/a.json")
.then(response => {
   return response.json();
})
.then(jsondata => {file=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res021.json")
.then(response => {
   return response.json();
})
.then(jsondata => {tempRes[0]=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res022.json")
.then(response => {
   return response.json();
})
.then(jsondata => {tempRes[1]=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res023.json")
.then(response => {
   return response.json();
})
.then(jsondata => {tempRes[2]=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res024.json")
.then(response => {
   return response.json();
})
.then(jsondata => {tempRes[3]=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res025.json")
.then(response => {
   return response.json();
})
.then(jsondata => {tempRes[4]=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/res026.json")
.then(response => {
   return response.json();
})
.then(jsondata => {tempRes[5]=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/lim.json")
    .then(response => {
    return response.json();
})
.then(jsondata => {lim=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/fes.json")
    .then(response => {
    return response.json();
})
.then(jsondata => {fes=jsondata});

fetch("https://raw.githubusercontent.com/cieloneve/cieloneve.github.io/main/data/fake.json")
    .then(response => {
    return response.json();
})
.then(jsondata => {fake=jsondata});

collected={
    "res001":[],
    "res002":[],
    "res003":[],
    "res004":[],
    "res005":[],
    "res006":[],
    "res007":[],
    "res008":[],
    "res009":[],
    "res010":[],
    "res011":[],
    "res012":[],
    "res013":[],
    "res014":[],
    "res015":[],
    "res016":[],
    "res017":[],
    "res018":[],
    "res019":[],
    "res020":[],
    "res021":[],
    "res022":[],
    "res023":[],
    "res024":[],
    "res025":[],
    "res026":[]
}

count={
    "lim":0,
    "fes":0,
    "fake":0
}

$("ul li").click(function(){
    $('.gallery').empty()
    $('.hint').empty()
    
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
    lim_NUM=[]
    fes_NUM=[]
    fake_NUM=[]
    star4=0
    group=[0,0,0,0,0,0]
    groupV=[0,0,0,0,0,0]
    groupT=["L/N","MMJ","VBS","WS","ニ-ゴ","無團體V"]
    $('.gallery').empty()

    $("ul li").each(function(i,v){

        if (i==26) {
            return false;
        }

        prefix="res"+$(this).attr("index")
        if(i%4==0&&i!=24)$('.gallery').append("<div class=aaa>",)
        $.merge(lim_NUM, $(collected[prefix]).filter(lim[prefix]).toArray().map(function(e){return prefix+"/"+e}))
        $.merge(fes_NUM, $(collected[prefix]).filter(fes[prefix]).toArray().map(function(e){return prefix+"/"+e}))    
        $.merge(fake_NUM, $(collected[prefix]).filter(fake[prefix]).toArray().map(function(e){return prefix+"/"+e}))           
        $('.gallery').append("<p\>"+$(this).text()+" : "+collected[prefix].length)
        star4+=collected[prefix].length;

        if(i<20){
            group[Math.floor((i)/4)]+=collected[prefix].length;
        }
        else{
            console.log(tempRes[i-20])
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
    
    $('.gallery').append("<div class=aaa>",)
    for(tempi=0;tempi<5;tempi++){
        $('.gallery').append("<p\>"+groupT[tempi]+" : "+group[tempi]+" + "+groupV[tempi])
    }
    $('.gallery').append("<p\>"+groupT[5]+" : "+groupV[5])

    $('.gallery').append("<div class=aaa>",)
    $('.gallery').append("<p\>總共 : "+String(star4))
    
    $('.gallery').append("<div class=aaa>")
    $('.gallery').append("<p\>限定")
    $('.gallery').append("<div class=aaa>")
    for(var i =0 ;i<lim_NUM.length;i++){
        $('.gallery').append(
            "<div class=\"special\" style=\"background-image:url(small/"+lim_NUM[i]+".png)\"/>"
        )
        
    }
    $('.gallery').append("<div class=aaa>")
    $('.gallery').append("<p\>fes")
    $('.gallery').append("<div class=aaa>")
    for(var i =0 ;i<fes_NUM.length;i++){
        $('.gallery').append(
            "<div class=\"special\" style=\"background-image:url(small/"+fes_NUM[i]+".png)\"/>"
        )
        
    }
    $('.gallery').append("<div class=aaa>")
    $('.gallery').append("<p\>假四星")
    $('.gallery').append("<div class=aaa>")
    for(var i =0 ;i<fake_NUM.length;i++){
        $('.gallery').append(
            "<div class=\"special\" style=\"background-image:url(small/"+fake_NUM[i]+".png)\"/>"
        )
        
    }
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