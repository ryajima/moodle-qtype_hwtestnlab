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

    // スタイル
    canvas.width  = 400;
    canvas.height = 100;
    canvas.style.border = "1px solid"; 
    canvas.style.background = "#fffefc";

    // キャンバスの背景カラーを決定
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    //ctx.fillStyle = "#ffffff";
    //ctx.fillRect(0, 0, 400, 100);
 
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
    var modelType = 'english';
    //var modelType = 'math';

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
            console.log(JSON.stringify(points));

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
            //var points = "[[[8096,4683],[8096,4604],[8070,4577],[8070,4551],[8043,4524],[8017,4498],[7964,4471],[7938,4471],[7858,4471],[7805,4471],[7726,4471],[7646,4471],[7567,4498],[7488,4524],[7329,4630],[7223,4736],[7064,4842],[6985,4948],[6906,5001],[6879,5106],[6826,5186],[6800,5212],[6800,5318],[6800,5398],[6800,5530],[6906,5662],[7064,5847],[7223,6059],[7382,6218],[7514,6350],[7673,6456],[7752,6509],[7858,6562],[7911,6588],[7964,6588],[7990,6588],[8070,6588],[8123,6562],[8176,6429],[8229,6244],[8281,6112],[8334,5953],[8334,5847],[8414,5689],[8414,5636],[8440,5530],[8440,5477],[8467,5424],[8467,5398],[8467,5450],[8573,5609],[8678,5794],[8811,6006],[8864,6165],[9022,6350],[9075,6456],[9181,6615],[9234,6668],[9287,6747],[9313,6773],[9313,6720],[9340,6694],[9340,6641],[9366,6588],[9366,6535]],[[9472,4657],[9472,4657],[9472,4683],[9631,4736],[9869,4763],[10001,4763],[10213,4763],[10398,4763],[10610,4763],[10795,4763],[10874,4763],[11007,4763],[11033,4736]],[[10213,3704],[10213,3704],[10213,3810],[10213,3916],[10186,4101],[10186,4233],[10186,4498],[10186,4657],[10186,4921],[10186,5186],[10213,5477],[10266,5741],[10372,5980],[10451,6218],[10530,6350],[10663,6456],[10769,6588],[10874,6694],[10901,6720],[10927,6773],[10954,6800]]]";
            var formdata = new FormData();
            formdata.append("typeData", "online");
            formdata.append("language", modelType);
            formdata.append("points", JSON.stringify(points));
            var requestOptions = {
                method: 'POST',
                //mode: 'cors',
                cache: 'no-store',
                redirect: 'follow',
                //headers: {"Accept": "application/json","Content-Type": "application/json"},
                body: formdata
            };
            fetch(recogUrl, requestOptions)
            .then((response) => response.json())
            .then((responsejson) => {
                //console.log(response.url); //レスポンスのURL
                //alert(response.status); //レスポンスのHTTPステータスコード
                console.log(JSON.stringify(responsejson));
                
                // 認識結果表示
                let resultText = responsejson.data.result.pattern;
                ctx.font = "36px serif";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText(resultText, canvas.width/2, canvas.height/2)

                // ストローク消去
                strokes=[];
                

            })
            .catch(() => alert('recognition server: request error'));

        } else {
            alert('解答を記入してください');
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
        // 再描画
        reflesh();
        // debug用　json表示
        //console.log(JSON.stringify(strokes,undefined,1));
    }
  

})();