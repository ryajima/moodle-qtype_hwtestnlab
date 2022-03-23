// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * JavaScript required by the multianswer question type.
 *
 * @package    qtype
 * @subpackage hwtestnlab
 * @copyright  2021 Ryo Yajima
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// 認識サーバ ホストアドレス
var recogUrl;

// 認識モデル
var modelType = "math";

// 要素
var canvas;
var sendBtn;
var clrBtn;
var undoBtn;
var ptnDisp;
var isMouseDown;

// ペンの色・太さ
var defosize = 1;
var defocolor = "#000000";
var defoalpha = 1.0;

//　ストロークオブジェクト
var answers = {};

// PHPからの変数
var initvalues;
var inputText;
var qaId;
var prevStroke = {};
var readonly;

// 解答欄初期化
function init(Y, initvariables) {
    initvalues = initvariables;
    qaId       = initvalues.qaId;
    recogUrl   = initvalues.recognitionurl;
    readonly   = initvalues.readonly;
    prevStroke[qaId] = initvalues.previousStroke;
    if (prevStroke[qaId] == ''){
        prevStroke[qaId] = [];
    } else {
        prevStroke[qaId] = JSON.parse(prevStroke[qaId]);
    }
    console.log(prevStroke);

    // element
    canvas    = document.getElementById('canvas' +qaId);
    if (!readonly){
        sendBtn   = document.getElementById('sendBtn'+qaId);
        clrBtn    = document.getElementById('clrBtn' +qaId);
        undoBtn   = document.getElementById('undoBtn'+qaId);
        ptnDisp   = document.getElementById('ptnDisp'+qaId);
    }

    // canvas style
    canvas.width  = 700;
    canvas.height = 175;
    canvas.style.border = "1px solid"; 
    canvas.style.background = "#fffefc";

    // Path
    var ctx = canvas.getContext('2d');
    ctx.beginPath();

    // イベントリスナー
    if (!readonly){
        // canvas
        canvas.addEventListener('mousemove', onMove, false);
        canvas.addEventListener('mousedown', onClick, false);
        canvas.addEventListener('mouseup', drawEnd, false);
        canvas.addEventListener('mouseout', drawEnd, false);
        canvas.addEventListener('touchmove', onTouchMove, false);
        canvas.addEventListener('touchstart', onTouch, false);
        canvas.addEventListener('touchend', drawEnd, false);    
        // 送信ボタン
        sendBtn.addEventListener('click', sendJson, false);
        // 消去ボタン
        clrBtn.addEventListener('click', clearCanvas, false);
        // Undoボタン
        undoBtn.addEventListener('click', undoBtnClk, false);
    }

    isMouseDown = false;

    // ストロークオブジェクト
    answers[qaId] = {
        'qaid': qaId,
        'XList': [],
        'YList': [],
        'PList': [],
        'points': prevStroke[qaId],
        'istroke' : false,
        'mouseX' : "",
        'mouseY' : "",
        'startTime' : "",
        'endTime' : "" };
    
    reflesh(qaId);
}



// レスポンシブサイズ
// if (screen.width < 860) {
//     canvas.width = 700 * screen.width / 860;
//     canvas.height = 400 * screen.width / 860;
// }
// var header_h = $('.header').outerHeight();
// var btns_h   = $('#btns').outerHeight();
// var footer_h = $('.footer').outerHeight();
// qimg.height   = (window.innerHeight - header_h - btns_h - footer_h - 40)/2;
// canvas.height = (window.innerHeight - header_h - btns_h - footer_h - 40)/2;

// $('#question').bind('load', function(){
//     canvas.width  = qimg.width;
//     canvas.height = qimg.height;
// });

// // canvasのスタイル
// canvas.width  = 700;
// canvas.height = 175;
// canvas.style.border = "1px solid"; 
// canvas.style.background = "#fffefc";
// 認識結果表示のスタイル
// ptnDisp.width = 400;
// ptnDisp.heigth = 100;
// ptnDisp.style.background = "ffeeee";


// キャンバスの背景カラーを決定
// var ctx = canvas.getContext('2d');
// ctx.beginPath();
//ctx.fillStyle = "#ffffff";
//ctx.fillRect(0, 0, 400, 100);


// スクロール止める止めないの関数
function handleTouchMove(event) {
    event.preventDefault();
}

//マウスが動いていて、かつ左クリック時に発火
function onMove(e) {
    if (e.buttons === 1 || e.witch === 1) {
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        //draw 関数にマウスの位置を渡す
        draw(X, Y, e.target.getContext('2d'), e.target.id.replace('canvas', ''));
        isMouseDown = true;
    };
};

//マウスが左クリックされると発火。
function onClick(e) {
    if (e.button === 0) {
        var qaid = e.target.id.replace('canvas', '');
        // if(!answers.hasOwnProperty(qaid)) 
        //     answers[qaid] = {
        //         'qaid': qaid,
        //         'XList': [],
        //         'YList': [],
        //         'PList': [],
        //         'points': [],
        //         'istroke' : false,
        //         'mouseX' : "",
        //         'mouseY' : "",
        //         'startTime' : "",
        //         'endTime' : "" };
        var rect = e.target.getBoundingClientRect();
        var X = ~~(e.clientX - rect.left);
        var Y = ~~(e.clientY - rect.top);
        //draw 関数にマウスの位置を渡す
        draw(X, Y, e.target.getContext('2d'), qaid);
        isMouseDown = true;
    }
};

//タッチして動いているときに発火
function onTouchMove(e) {
    var rect = e.target.getBoundingClientRect();
    var touch = e.touches[0];
    var X = ~~(touch.clientX - rect.left);
    var Y = ~~(touch.clientY - rect.top);
    //draw 関数にタッチの位置を渡す
    draw(X, Y, e.target.getContext('2d'), e.target.id.replace('canvas', ''));
};

//タッチされると発火。
function onTouch(e) {
    var rect = e.target.getBoundingClientRect();
    var touch = e.touches[0];
    var X = ~~(touch.clientX - rect.left);
    var Y = ~~(touch.clientY - rect.top);
    //draw 関数にタッチの位置を渡す
    draw(X, Y, e.target.getContext('2d'), e.target.id.replace('canvas', ''));
    //スクロール禁止
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
};

//渡されたマウス位置を元に直線を描く関数
function draw(X, Y, ctx, qaid) {
    //console.log(qaid);
    ctx.beginPath();
    ctx.globalAlpha = defoalpha;
    
    //マウス継続値によって場合分け、直線の始点を決定
    if (answers[qaid].mouseX === "") {
        //継続値が初期値の場合は、現在のマウス位置を始点とする
        ctx.moveTo(X, Y);
        answers[qaid].startTime = Date.now();
        answers[qaid].isStroke = true;

    } else {
        //継続値が初期値ではない場合は、前回の終点を次の始点とする
        ctx.moveTo(answers[qaid].mouseX, answers[qaid].mouseY);
    
    }
    //現在のマウス位置を終点とする
    ctx.lineTo(X, Y);
    
    //直線のスタイル
    ctx.lineCap = "round";
    ctx.lineWidth = defosize * 2;
    ctx.strokeStyle = defocolor;
    ctx.stroke();

    // 描画点の座標をリストに挿入
    answers[qaid].XList.push(X);
    answers[qaid].YList.push(Y);
    answers[qaid].PList.push([X, Y]);

    //マウス継続値に現在のマウス位置、つまりゴール位置を代入
    answers[qaid].mouseX = X;
    answers[qaid].mouseY = Y;
};

//左クリック終了、またはマウスが領域から外れた際、継続値を初期値に戻す
function drawEnd(e) {
    if (isMouseDown)
    {
        var qaid = e.target.id.replace('canvas', '');
        answers[qaid].mouseX = "";
        answers[qaid].mouseY = "";
    
        if(answers[qaid].isStroke) {
            answers[qaid].endTime = Date.now();
            answers[qaid].points.push(answers[qaid].PList); 
            answers[qaid].isStroke = false;
        }
    
   
        // ストローク座標リストの初期化
        answers[qaid].XList = [];
        answers[qaid].YList = [];
        answers[qaid].PList = [];
        isMouseDown = false;
    }
    //スクロール復帰
    document.removeEventListener('touchmove', handleTouchMove, { passive: false });
}


// 再描画
function reflesh(qaid){
    // コンテキスト取得
    var canvas = document.getElementById('canvas'+ qaid);
    var ctx = canvas.getContext('2d');
       
    // 解答欄の消去
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 再描画
    var mouseX = "";
    var mouseY = "";
    for (let stroke of answers[qaid].points){
        for(let coordinate of stroke) {
            
            let X = coordinate[0];
            let Y = coordinate[1];
            
            ctx.beginPath();
            ctx.globalAlpha = defoalpha;
            
            //マウス継続値によって場合分け、直線の始点を決定
            if (mouseX === "") {
                //継続値が初期値の場合は、現在のマウス位置を始点とする
                ctx.moveTo(X, Y);

            } else {
                //継続値が初期値ではない場合は、前回の終点を次の始点とする
                ctx.moveTo(mouseX, mouseY);
            
            }
            //現在のマウス位置を終点とする
            ctx.lineTo(X, Y);
            
            //直線のスタイル
            ctx.lineCap = "round";
            ctx.lineWidth = defosize * 2;
            ctx.strokeStyle = defocolor;
            ctx.stroke();

            //マウス継続値に現在のマウス位置、つまりゴール位置を代入
            mouseX = X;
            mouseY = Y;
        
        }
        mouseX = "";
        mouseY = "";
    }
}

// 送信 -> AWSデータサーバ
// 2021-02-01: データサーバは認識サーバと一本化．AWSは使用しない．
// function sendJson(){
//     if(strokes.length > 0){
//         var userid = sessionStorage.getItem('userid');
//         fetch(hostUrl, {
//             method: 'POST',
//             mode: 'cors',
//             cache: 'no-store',
//             headers: {"Accept": "application/json","Content-Type": "application/json"},
//             body: JSON.stringify({'qid': qname,'userid': userid, 'stroke': strokes,'result' : results})
//         }).then(function(response){
//             if (response.ok) {
//                 console.log(response.url); //レスポンスのURL
//                 console.log(response.status); //レスポンスのHTTPステータスコード
//                 // alert('回答を送信しました');
//                 strokes=[];
//             }
//         });
//     } else {
//         alert('回答を記入してください');
//     }
// }

// 認識ボタンが押された
function sendJson(e){
    var qaid = e.target.id.replace('sendBtn', '');
    var canvas  = document.getElementById('canvas' + qaid);
    var ptnDisp = document.getElementById('ptnDisp'+ qaid);
    var ctx = canvas.getContext('2d');
    var inputText = document.getElementById(qaid);

    if(answers[qaid].points.length > 0){

        // 認識サーバ送信オプション
        var formdata = new FormData();
        formdata.append("typeData", "online");
        formdata.append("language", modelType);
        formdata.append("points", JSON.stringify(answers[qaid].points));
        var requestOptions = {
            method: 'POST',
            mode: 'cors',
            cache: 'no-store',
            redirect: 'follow',
            //headers: {"Accept": "application/json","Content-Type": "application/json"},
            body: formdata
        };

        // HTTP POST->認識サーバ（非同期１）
        fetch(recogUrl, requestOptions)
        .then((response) => response.json())
        .then((responsejson) => {
            //debug
            //console.log(JSON.stringify(responsejson));
            
            // 認識結果表示
            let resultText = responsejson.data.result.pattern;
            if(modelType == "math"){    // 数式
                ctx.font = "36px serif";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                // MathJax
                ptnDisp.innerHTML =  "$$" + resultText +"$$";
                MathJax.Hub.Typeset(ptnDisp);
                // 解答保存               
                inputText.value = resultText;

            }else{
                ctx.font = "36px serif";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText(resultText, canvas.width/2, canvas.height/2)
                    
            }
        })
        .catch((error) => alert(error.message+'\n'+recogUrl+'にアクセスできません．'));

        // HTTP POST->Moodleサーバ（非同期２）
        fetch('../../question/type/hwtestnlab/strokestore.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers[qaid]) 
        })
        .then((responsemoodle) => responsemoodle.json())
        .then((responsejsonmoodle) => console.log(responsejsonmoodle))
        .catch((error) => console.log(error));

    } else {
        alert('解答を入力してください');
    }
}


// 消去ボタン押下
function clearCanvas(e){
    var qaid = e.target.id.replace('clrBtn', '');
    var canvas = document.getElementById('canvas'+ qaid);
    var ctx = canvas.getContext('2d');    
    // 全ストロークを削除
    answers[qaid].points=[];
    // 解答欄を初期化
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 戻すボタン押下
function undoBtnClk(e) {
    var qaid = e.target.id.replace('undoBtn', '');
    // 直前のストロークを削除
    answers[qaid].points.pop();
    // 解答欄を再描画
    reflesh(qaid);
}


