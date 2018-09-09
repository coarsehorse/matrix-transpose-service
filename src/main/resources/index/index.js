// Panel collapse on click
$(document).on('click', '.panel div.clickable', function (e) {
    var $this = $(this); // heading
    var $panel = $this.parent('.panel');
    var $panel_body = $panel.children('.panel-body');
    var $display = $panel_body.css('display');

    if ($display === 'block') {
        $panel_body.slideUp();
    } else if ($display === 'none') {
        $panel_body.slideDown();
    }
});

$(document).ready(function (e) {
    var $classy = '.panel.autocollapse';
    var $found = $($classy);

    $found.find('.panel-body').hide();
    $found.removeClass($classy);
});

function buildMatrix(jsonMatrix, tableClass) {
    $.each(jsonMatrix, function (rowInd, row) {
        $("table." + tableClass + " tbody").append("<tr></tr>");
        $.each(row, function (colInd, col) {
            $("table." + tableClass + " tbody tr").last().append("<td>" + col + "</td>");
        });
    });
}

function generateRequestExampleJson() {
    function download(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    var jsonRequest = {
        "id": "1",
        "sourceMatrix": [[1, 2, 3, 4, 5, 6], [-1, -2, -3, -4, -5, -6], [11, 12, 13, 14, 15, 16]]
    };

    download(JSON.stringify(jsonRequest, null, 2), "requestExample.json", "application/json");
}

function highlightTransposedCells() {
    $("table tbody tr td").hover(function () {
        var x = $(this).parent().index();
        var y = $(this).index();

        if ($(this).parents().hasClass("transposed-matrix")) {
            $("table.transposed-matrix tr").eq(x).find("td").eq(y).each(function () {
                $(this).addClass('highlighted');
            });
            $("table.source-matrix tr").eq(y).find("td").eq(x).each(function () {
                $(this).addClass('highlighted');
            });
        }
        if ($(this).parents().hasClass("source-matrix")) {
            $("table.source-matrix tr").eq(x).find("td").eq(y).each(function () {
                $(this).addClass('highlighted');
            });
            $("table.transposed-matrix tr").eq(y).find("td").eq(x).each(function () {
                $(this).addClass('highlighted');
            });
        }
    }, function () {
        var x = $(this).parent().index();
        var y = $(this).index();

        if ($(this).parents().hasClass("transposed-matrix")) {
            $("table.transposed-matrix tr").eq(x).find("td").eq(y).each(function () {
                $(this).removeClass('highlighted');
            });
            $("table.source-matrix tr").eq(y).find("td").eq(x).each(function () {
                $(this).removeClass('highlighted');
            });
        }
        if ($(this).parents().hasClass("source-matrix")) {
            $("table.source-matrix tr").eq(x).find("td").eq(y).each(function () {
                $(this).removeClass('highlighted');
            });
            $("table.transposed-matrix tr").eq(y).find("td").eq(x).each(function () {
                $(this).removeClass('highlighted');
            });
        }
    })
}

function showTables() {
    $(".show-button").click(function () {
        $(".table-wrapper, .empty-label").each(function () {
            $(this).toggleClass("hidden")
        })
    })
}

function readMatrixFromFile() {
    $(".read-matrix").on('change', function(evt) {
        var file = evt.target.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (ev) {
                var content = ev.target.result;
                $.ajax({
                    url: "http://localhost:8080/transpose",
                    type: 'POST',
                    data: content,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    success: function (data, status) {
                        alert("2Data: " + data + "\nStatus: " + status);
                    }
                });
            };

            reader.readAsText(file);
        } else {
            alert("Failed to load file!")
        }
    });
}

$(document).ready(function () {
    $(".post-button").click(function () {
        /*$.get("http://localhost:8080/test", function (data, status) {
            /!*buildMatrix(data["transposedMatrix"], "transposed-matrix");
            buildMatrix(data["sourceMatrix"], "source-matrix");*!/
            alert("status: " + status + "\n" + "source-matrix: " + data["sourceMatrix"]);
        });*/
        /*$.post("http://localhost:8080/transpose",
            {
                "sourceMatrix": [[1, 2, 3, 4, 5, 6], [-1, -2, -3, -4, -5, -6]]
            },
            function(data, status){
                alert("1Data: " + data + "\nStatus: " + status);
            });*/

    });

    var json = {
        "id": "1",
        "sourceMatrix": [[1, 2, 3, 4, 5, 6], [-1, -2, -3, -4, -5, -6], [11, 12, 13, 14, 15, 16]],
        "transposedMatrix": [[1, -1, 11], [2, -2, 12], [3, -3, 13], [4, -4, 14], [5, -5, 15], [6, -6, 16]]
    };
    buildMatrix(json["transposedMatrix"], "transposed-matrix");
    buildMatrix(json["sourceMatrix"], "source-matrix");

    readMatrixFromFile();

    highlightTransposedCells();
    showTables();
});
