$(function () {
    $("#staticBackdrop").modal("show");
    $(".btn").mouseup(function () {
        $(this).blur();
    })
    $("#submitBtn").on("click", function () {
        $("#statusForm").text("Connecting to server...   ");
        makeVis("spinnerForm");
        startConnection();
    })
    initBoard();
})

$(window).on("unload", function () {
    ws.close();
});

function initBoard() {
    for (let h = 0; h < 6; h++) {
        var html = "<div id=\"tableRow" + h + "\" class=\"row no-gutters\">";
        for (let w = 0; w < 7; w++) {
            html += "<div class=\"col\"><div class=\"cell\" onclick=\"sendChoice("+w+")\"><div class=\"customBorder\"id=\"cell" + h + "." + w + "\" ></div></div></div>";
        }
        html += "</div>";
        $("#tableBody").append(html);
    }
}

function startConnection() {
    var ws_uri = "wss://connectfourface.herokuapp.com/";
    websocket = new WebSocket(ws_uri);

    if ($("#nameInput").val().trim()) {
        name = $("#nameInput").val();
    } else name = "Player" + randomString();

    if ($("#codeInput").val().trim()) {
        passcode = $("#codeInput").val();
    } else passcode = randomString();

    websocket.onopen = function (event) {
        var data = { type: "session", name: name, passcode: passcode };
        send(data);
        $("#staticBackdrop").modal("hide");
        makeVis("spinner");
        $("#info").text("Waiting for someone to join your session (" + passcode + ")");
    };
    
    websocket.onerror = function (event) {
        makeInv("spinnerForm");
        $("#statusForm").text("Failed to connect to server. Try again later.");
    };

    websocket.onmessage = function (event) {
        var response = JSON.parse(event.data);
        switch (response.type) {
            case "BoardUpdate":
                printBoard(response.board);
                break;
            case "sessionConfirmation":
                makeVis("lblPl");
                $("#pColor").attr("class", ((response.color === 1) ? "tableValueYell" : "tableValueRed"));
                makeInv("spinner");
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
                    makeVis("lblTu");
                    $("#tColor").attr("class", ((response.turnColor === 1) ? "tableValueYell" : "tableValueRed"));
                    $("#info").text("It's " + response.turnName + " turn");
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

function sendChoice(choice){
    if (isClickable === true) {
        var data = { type: "choice", passcode: passcode, value: choice };
        send(data);
    }
}

function printBoard(board) {
    for (i = 0; i < 6; i++) {
        for (l = 0; l < 7; l++) {
            if (board[i][l] == 1) {
                //$("#cell" + i + "." + l).attr("class", "tableValueYell");
                document.getElementById("cell" + i + "." + l + "").className = "tableValueYell";
            }
            else if (board[i][l] == 2) {
                //$("#cell" + i + "." + l).attr("class", "tableValueRed");
                document.getElementById("cell" + i + "." + l + "").className = "tableValueRed";
            }
        }
    }
}

function calculateResult(reason) {
    var x = reason.x;
    var y = reason.y;
    for (let i = 0; i < 4; i++) {
        console.log("#cell" + x[i] + "." + y[i]);
        document.getElementById("cell" + x[i] + "." + y[i]).classList.add("animationLoop");
    }
}

function randomCode(){
    $("#codeInput").val(randomString);
}

function makeInv(componentName){$("#" + componentName).removeClass("visible").addClass("invisible");}

function makeVis(componentName){$("#" + componentName).removeClass("invisible").addClass("visible");}

function send(data) { websocket.send(JSON.stringify(data)); }

function randomString() { return Math.random().toString(36).substr(2, 5); }