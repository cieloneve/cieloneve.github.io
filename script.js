var file
var lim,limC,fes,fesC,fake,fakeC;
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

$("ul b").click(function(index, element){
    lim_NUM=[]
    
    $('.gallery').empty()

    $("ul li").each(function(i,v){
        prefix="res"+$(this).attr("index")
        if(i%4==0&&i!=24)$('.gallery').append("<div class=aaa>",)
        $.merge(lim_NUM, $(collected[prefix]).filter(lim[prefix]).toArray().map(function(e){return prefix+"/"+e}))       
        $('.gallery').append("<p>",$(this).text()+" : "+collected[prefix].length)
    })
    
    $('.gallery').append("<div class=aaa>")
    for(var i =0 ;i<lim_NUM.length;i++){
        $('.gallery').append(
            "<div class=\"special\" style=\"background-image:url(small/"+lim_NUM[i]+".png)\"/>"
        )
        
    }
    console.log(lim_NUM)
});