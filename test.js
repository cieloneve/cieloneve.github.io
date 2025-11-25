// -------------------- 全域變數 --------------------
let file, lim, fes, fake, flim, bf, record = {}, userData, userName = "", userNameEncrypted;
let tempRes = [{}, {}, {}, {}, {}, {}]; // 0:res021 ~ 5:res026
let displayFlag = [];
let ranking = [], attr_list, bg_list;
let collected = {};
let star4 = 0;
let group = [0, 0, 0, 0, 0, 0];
let groupV = [0, 0, 0, 0, 0, 0, 0];
let groupT = ["L/N", "MMJ", "VBS", "WS", "ニ-ゴ", "無團體V"];
let mode = 0, attr = 0;

// -------------------- 常數 --------------------
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

// -------------------- 初始化 collected --------------------
for (let i = 1; i <= 26; i++) {
    const key = `res${String(i).padStart(3, '0')}`;
    collected[key] = [];
}

// -------------------- 資料載入 --------------------
async function loadAllData() {
    try {
        const data = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));

        [file, tempRes[0], tempRes[1], tempRes[2], tempRes[3], tempRes[4], tempRes[5], 
         lim, fes, fake, flim, bf, record, attr_list, bg_list, userData] = data;

        console.log("All data loaded");
        // 你可以在這裡觸發後續初始化，比如 putOnChara() 或 stat()
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// 立即執行
loadAllData();


// -------------------- 儲存 / 下載 --------------------
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
        complete: function () { alert("已存檔"); }
    });
}

function DownloadAsFile(t, f, m) {
    try {
        const b = new Blob([t], { type: m });
        saveAs(b, f);
    } catch (e) {
        window.open("data:" + m + "," + encodeURIComponent(t), '_blank', '');
    }
}

// -------------------- DOM 建立函數 --------------------
function createGalleryImg(prefix, code, collectedFlag) {
    return $('<img>', {
        src: `small/${prefix}/${code}.png`,
        code,
        alt: prefix.slice(-3),
        class: collectedFlag ? 'collected' : ''
    });
}

function appendGallerySection(e) {
    $('.gallery').append("<div class='aaa'></div>");
    const inputType = e.flag ? 'checkedbox' : 'checkbox';
    const checkedAttr = e.flag ? 'checked' : '';
    $('.gallery').append(
        `<label class='specialCard'><input type='${inputType}' id='check' name='${e.title}' ${checkedAttr}><span>${e.title}</span></label>`
    );
    $('.gallery').append("<div class='aaa'></div>");
    if (e.flag) {
        e.data.forEach(item => {
            $('.gallery').append(`<div class='special' style='background-image:url(small/${item}.png)'></div>`);
        });
    }
}

function appendAllSpecialCards() {
    displayFlag.forEach(e => appendGallerySection(e));
}

// -------------------- 角色點擊事件 --------------------
$('.character').on('click', function () {
    const index = $(this).attr("index");
    const prefix = `res${index}`;

    $('.gallery, .stats, .hint').empty();
    $("body").css("background", `url(${bg_list[prefix] || "gray.jpg"}), url(gray.jpg)`);

    file[prefix].forEach(code => {
        const collectedFlag = collected[prefix].includes(code);
        $('.gallery').append(createGalleryImg(prefix, code, collectedFlag));
    });
});

// -------------------- 圖片事件 --------------------
$('.gallery').on('click', 'img', function () {
    const $img = $(this);
    const prefix = `res${$img.attr('alt')}`;
    const code = $img.attr('code');

    if (!$img.hasClass('collected')) {
        $img.addClass('collected');
        collected[prefix].push(code);
    }
});

$('.gallery').on('mouseenter', 'img', function () {
    const $img = $(this);
    $img.attr("src", `small/res${$img.attr("alt")}/${$img.attr("code")}_normal.png`);
});
$('.gallery').on('mouseleave', 'img', function () {
    const $img = $(this);
    $img.attr("src", `small/res${$img.attr("alt")}/${$img.attr("code")}.png`);
});

// -------------------- 統計選單 --------------------
function addDropDown() {
    const html = `
    <div class='selection'>
        <select id='sorting'>
            <option value='Default' index='0'>預設排序</option>
            <option value='Star4' index='1'>4星數</option>
            <option value='Percentage' index='2'>百分比</option>
            <option value='Lim' index='3'>真限定數</option>
            <option value='LimP' index='4'>真限定百分比</option>
        </select>
        <select id='attr'>
            <option value='all' index='0'>全部屬性</option>
            <option value='green' index='1'>綠草🌱</option>
            <option value='david' index='2'>藍星✡️</option>
            <option value='star' index='3'>粉星🌟</option>
            <option value='moon' index='4'>紫月🌙</option>
            <option value='heart' index='5'>橘心🩷</option>
        </select>
    </div>`;
    $(".stats").append(html);

    $('#sorting').val($('#sorting option').eq(mode).val());
    $('#attr').val($('#attr option').eq(attr).val());
}

$('.stats').on('change', 'select', function () {
    if ($(this).attr('id') === "sorting") {
        mode = parseInt($('#sorting option:selected').attr('index'), 10);
        putOnChara();
    } else {
        attr = parseInt($('#attr option:selected').attr('index'), 10);
        stat();
        putOnChara();
        appendAllSpecialCards();
    }
});

// -------------------- Context Menu --------------------
$(function () {
    $.contextMenu({
        selector: '.gallery img',
        build: function ($trigger) {
            const alt = $trigger.attr('alt');
            const code = $trigger.attr('code');
            return {
                items: {
                    uncollect: {
                        name: "移除收藏",
                        icon: "delete",
                        callback: () => {
                            if ($trigger.hasClass('collected')) {
                                $trigger.removeClass('collected');
                                const prefix = `res${alt}`;
                                collected[prefix].splice(collected[prefix].indexOf(code), 1);
                            }
                        }
                    },
                    after: {
                        name: "設為背景圖片(花前)",
                        icon: "edit",
                        callback: () => {
                            bg_list[`res${alt}`] = `bg/res${alt}/${code}_normal.webp`;
                            $("body").css("background", `url(${bg_list[`res${alt}`]}), url(gray.jpg)`);
                        }
                    },
                    normal: {
                        name: "設為背景圖片(花後)",
                        icon: "edit",
                        callback: () => {
                            bg_list[`res${alt}`] = `bg/res${alt}/${code}.webp`;
                            $("body").css("background", `url(${bg_list[`res${alt}`]}), url(gray.jpg)`);
                        }
                    },
                    sep1: "---------",
                    quit: { name: "取消", icon: "quit" }
                }
            };
        }
    });

    $.contextMenu({
        selector: '*',
        items: {
            disappear: { name: "隱藏收藏", icon: "cut", callback: () => $('.gallery').hide() },
            appear: { name: "顯示收藏", icon: "loading", callback: () => $('.gallery').show() },
            sep1: "---------",
            quit: { name: "取消", icon: "quit" }
        }
    });
});

// -------------------- 按鈕 --------------------
$("#save").on('click', SaveAsFile);
$("#download").on('click', () => DownloadAsFile(JSON.stringify(collected), "collected.json", "text/plain;charset=utf-8"));
$(".stats").on("change","select",function(){
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

$("#total").click(function(){
    stat()
    putOnChara()
    //special cards display-----
    appendAllSpecialCards()
});
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