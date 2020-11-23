

$(function () {
    $(".overlay").show();
    initBoard();
});

$(window).on("unload", function () {
    ws.close();
});


function sendChoice(choice) {
    if (isClickable === true) {
        var data = { type: "choice", passcode: passcode, value: choice };
        websocket.send(JSON.stringify(data));
    }
}

function initBoard() {
    for (let w = 0; w < 7; w++) {
        var html = "<div id=\"tableCol" + w + "\" class=\"tableCol\" onclick=\"sendChoice(" + w + ")\">";
        for (let h = 0; h < 6; h++) {
            html += "<div class=\"tableCell\"> <div id=\"cell" + w + "." + h + "\"></div></div>";
        }
        html += "</div>";
        $("#tableBody").append(html);
    }
}

function startConnection() {
    //var ws_uri = "ws://connectfourface.herokuapp.com/:24803";
    var ws_uri = "ws://127.0.0.1:9601";
    websocket = new WebSocket(ws_uri);
    if ($("#codeInputText").val().trim()) {
        passcode = $("#codeInputText").val();
    } else passcode = randomString();

    if ($("#nameInputText").val().trim()) {
        name = $("#nameInputText").val();
    } else name = "Player";

    $(".overlay").css("pointer-event", "none");
    $(".overlay").css("display", "none");


    websocket.onopen = function (event) {
        var data = { type: "session", name: name, passcode: passcode };
        websocket.send(JSON.stringify(data));
        $("#info").text("Waiting for opponent... (Passcode: " + passcode + ")");
    };

    websocket.onerror = function (event) {
        console.log("Error.");
    };

    websocket.onmessage = function (event) {
        var response = JSON.parse(event.data);
        switch (response.type) {
            case "BoardUpdate":
                printBoard(response.board);
                break;
            case "sessionConfirmation":
                $("#color").attr("class", ((response.color === 1) ? "tableValueYell" : "tableValueRed"));
                document.title = response.name;
                isClickable = true;
                break;
            case "gameOver":
                $("#info").text(response.winner + " has won.");
                calculateResult(response.reason);
                isClickable = false;
                break;
            case "info":
                if (response.code == "i_Turn") {
                    $(".lblTurn").show();
                    $("#turnColor").attr("class", ((response.turnColor === 1) ? "tableValueYell" : "tableValueRed"));
                    $("#info").text("It's " + response.turnName + "' turn");
                } else {
                    $("#info").text(response.msg);
                } break;
            case "error":
                $("#info").text(response.error);
                break;
            default:
                break;
        }
    };

}

function calculateResult(reason) {
    var x = reason.x;
    var y = reason.y;
    console.log(x);
    console.log(y);
    for (let i = 0; i < 4; i++) {
        console.log("#cell" + y[i] + "." + x[i]);
        document.getElementById("cell" + y[i] + "." + x[i]).classList.add("animationLoop");
    }   
}

function printBoard(board) {
    for (i = 0; i < 7; i++) {
        for (l = 0; l < 6; l++) {
            if (board[l][i] == 1) {
                document.getElementById("cell" + i + "." + l).className = "tableValueYell";
            }
            else if (board[l][i] == 2) {
                document.getElementById("cell" + i + "." + l).className = "tableValueRed";
            }
        }
    }
}

function randomString() {
    return Math.random().toString(36).substr(2, 5);
}
