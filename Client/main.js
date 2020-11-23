

$(function () {
    $(".overlay").show();
});


function sendChoice(choice) {
    if (isClickable === true) {
        var data = { type: "choice", passcode: passcode, value: choice };
        websocket.send(JSON.stringify(data));
    }
}


function startConnection() {
    var ws_uri = "ws://192.168.1.100:9601";
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
        isClickable = true;
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
            case "gameOver":
                $("#info").text(response.winner + " has won.");
                isClickable = false;
                break;
            case "info":
                if (response.code == "i_Turn") {
                    $(".lblTurn").show();
                    $("#turnColor").attr("class", ((response.turnColor === 1)? "tableValueYell" : "tableValueRed"));
                    $("#color").attr("class", ((response.color === 1)? "tableValueYell" : "tableValueRed"));
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


function printBoard(board) {
    for (i = 0; i < 7; i++) {
        var strHTML = "";
        $("#tableCol" + i).empty();
        for (l = 0; l < 6; l++) {
            if (board[l][i] == 1) {
                strHTML += "<div class=\"tableCell\"><div class=\"tableValueYell\"></div></div>"
            }
            else if (board[l][i] == 2) {
                strHTML += "<div class=\"tableCell\"><div class=\"tableValueRed\"></div></div>"
            }
        }
        $("#tableCol" + i).append(strHTML);
    }
}

function randomString() {
    return Math.random().toString(36).substr(2, 5);
}
