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


(function() {
    var qid = document.getElementById('qid');
    var canvas = document.getElementById('myCanvas');
    var sendBtn  = document.getElementById('sendBtn');
    var clrBtn  = document.getElementById('clrBtn');
    var undoBtn  = document.getElementById('undoBtn');


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

    
    canvas.width  = 400;
    canvas.height = 100;

    // キャンバスの背景カラーを決定
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 100);
 
    // ペンの色・太さ
    var defosize = 1;
    var defocolor = "#000000";
    var defoalpha = 1.0;
 
    // マウス継続値の初期値
    var mouseX = "";
    var mouseY = "";

    // ストローク座標のリスト
    var XList = [];
    var YList = [];
    var PList = [];
    // ストロークフラグ
    var isStroke = false;
    // ストロークのオブジェクト
    var strokes = [];
    var points = [];

    // 認識モデル
    var language = 'english';

    // 問題番号
    //var qname = getParam("qid");    
    // 正答
    //var results = '';

    // ホストアドレス（学外）
    //var hostUrl = 'https://d6y4bagh89.execute-api.ap-northeast-1.amazonaws.com/default/save-json-to-s3';
    // database ホスト（学内）
    //var hostUrl = 'https://rbk0uge9ra.execute-api.ap-northeast-1.amazonaws.com/default/save-json-to-s3-nlab';
    // recognision-server ホスト（学内）
    var recogUrl = 'http://ubuntu-z820:3000/api/v1/recognize'

    // 時間計測用
    var startTime;
    var endTime;

    // イベントリスナー
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
            draw(X, Y);
        };
    };
 
    //マウスが左クリックされると発火。
    function onClick(e) {
        if (e.button === 0) {
            var rect = e.target.getBoundingClientRect();
            var X = ~~(e.clientX - rect.left);
            var Y = ~~(e.clientY - rect.top);
            //draw 関数にマウスの位置を渡す
            draw(X, Y);
        }
    };

    //タッチして動いているときに発火
    function onTouchMove(e) {
        var rect = e.target.getBoundingClientRect();
        var touch = e.touches[0];
        var X = ~~(touch.clientX - rect.left);
        var Y = ~~(touch.clientY - rect.top);
        //draw 関数にタッチの位置を渡す
        draw(X, Y);
    };
    
    //タッチされると発火。
    function onTouch(e) {
        var rect = e.target.getBoundingClientRect();
        var touch = e.touches[0];
        var X = ~~(touch.clientX - rect.left);
        var Y = ~~(touch.clientY - rect.top);
        //draw 関数にタッチの位置を渡す
        draw(X, Y);
        //スクロール禁止
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
    };

    //渡されたマウス位置を元に直線を描く関数
    function draw(X, Y) {
        ctx.beginPath();
        ctx.globalAlpha = defoalpha;
        
        //マウス継続値によって場合分け、直線の始点を決定
        if (mouseX === "") {
            //継続値が初期値の場合は、現在のマウス位置を始点とする
            ctx.moveTo(X, Y);
            startTime = Date.now();
            isStroke = true;

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

        // 描画点の座標をリストに挿入
        XList.push(X);
        YList.push(Y);
        PList.push([X, Y]);

        //マウス継続値に現在のマウス位置、つまりゴール位置を代入
        mouseX = X;
        mouseY = Y;
    };
 
    //左クリック終了、またはマウスが領域から外れた際、継続値を初期値に戻す
    function drawEnd() {
        mouseX = "";
        mouseY = "";

        if(isStroke) {
            //console.log(XList);
            //console.log(YList);
            endTime = Date.now();
            strokes.push({type:'stroke',
                             x: XList, 
                             y: YList,
                             startTime: startTime,
                             endTime: endTime,
                             duration: endTime-startTime,
                             delete: 'No'});
            
            
            // let p = [];
            // for(let i in XList.length){
            //     p.push([XList[i], YList[i]]);
            // }
            points.push(PList);
            // debug用　json表示
            console.log(JSON.stringify(points,undefined,1));

            isStroke = false;
        }

        // ストローク座標リストの初期化
        XList = [];
        YList = [];
        PList = [];

        //スクロール復帰
        document.removeEventListener('touchmove', handleTouchMove, { passive: false });
    }

    // 再描画
    function reflesh(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i in strokes){
            for(let j in strokes[i].x) {

                let X = strokes[i].x[j];
                let Y = strokes[i].y[j];
                
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

    // 送信 AWS
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
    //                 // 次のページ
    //                 nextpage();
    //             }
    //         });
    //     } else {
    //         alert('回答を記入してください');
    //     }
    // }
    // 送信 -> 認識サーバ
    function sendJson(){
        if(strokes.length > 0){
            //var userid = sessionStorage.getItem('userid');
            //var userid = 'testuser';
            fetch(recogUrl, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-store',
                headers: {"Accept": "application/json","Content-Type": "application/json"},
                body: JSON.stringify({'typeData': 'online', 'language': language, 'points': points})
            }).then(function(response){
                if (response.ok) {
                    console.log(response.url); //レスポンスのURL
                    console.log(response.status); //レスポンスのHTTPステータスコード
                    console.log(response.json());
                    alert('解答を認識しました');
                    strokes=[];
                }
            })
            .catch(error => console.log('error', error));

        } else {
            alert('回答を記入してください');
        }
    }
    
    // function sendJson(){
    //     alert('debug: answerボタンが押されました')
    // }

    // Clearボタン押下
    function clearCanvas(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes=[];
        points=[];
    }

    // Undoボタン押下
    function undoBtnClk() {
        // 直前のストロークを削除
        strokes.pop();
        points.pop();
        //strokes.
        // 再描画
        reflesh();
        // debug用　json表示
        //console.log(JSON.stringify(strokes,undefined,1));
    }
  

})();