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

function slideUpHelpPanel() {
    $('#help-panel').slideUp();
}

function slideDownHelpPanel() {
    $('#help-panel').slideDown();
}

function slideUpMatrixPanel(matrixClassName) {
    $('.' + matrixClassName).parents().eq(1).first().each(function() {
        $(this).slideUp();
    });
}

function slideDownMatrixPanel(matrixClassName) {
    $('.' + matrixClassName).parents().eq(1).first().each(function() {
        $(this).slideDown();
    });
}

function listenResetButton() {
    $('.reset-button').click(function() {
        slideUpMatrixPanel('transposed-matrix');
        slideUpMatrixPanel('source-matrix');
        wipeMatrixTable("transposed-matrix");
        wipeMatrixTable("source-matrix");
        setTableInvisible("transposed-matrix");
        setTableInvisible("source-matrix");
        slideDownHelpPanel();
    });
}

function fillMatrixTable(tableClass, jsonMatrix) {
    $.each(jsonMatrix, function (rowInd, row) {
        $("table." + tableClass + " tbody").append("<tr></tr>");
        $.each(row, function (colInd, col) {
            $("table." + tableClass + " tbody tr").last().append("<td>" + col + "</td>");
        });
    });
}

function listenGenerateExampleButton() {
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
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    var jsonRequest = {
        "sourceMatrix": [[1, 2, 3], [-1, -2, -3], [11, 12, 13]]
    };

    $(".generate-example").click( function () {
        download(JSON.stringify(jsonRequest, null, 2), "requestExample.json", "application/json")
    });
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

/* Set table visible and special info label invisible.
*  When page loads at the first time - there is no data to build table,
*  thus page shows "empty label" instead.
*  When table will be first time builded this method will hide the label
*  and set the table visible. */
function setTableVisible(tableName) {
    $("." + tableName).parent().first().each(function () {
        $(this).removeClass("hidden")
    });
    $("." + tableName).parents().eq(1).find(".empty-label").each(function () {
        $(this).addClass("hidden")
    });
}

/* Reverse for the setTableVisible function.
*  For more details, look at setTableVisible description. */
function setTableInvisible(tableName) {
    $("." + tableName).parent().first().each(function () {
        $(this).addClass("hidden")
    });
    $("." + tableName).parents().eq(1).find(".empty-label").each(function () {
        $(this).removeClass("hidden")
    });
}

function wipeMatrixTable(tableName) {
    $("." + tableName + " tbody").each(function () {
        $(this).remove()
    });
    $("." + tableName).each(function () {
        $(this).append("<tbody></tbody>")
    });
}

function listenTransposeMatrixButton() {
    $(".read-matrix").on('change', function (evt) {
        var input = $(this);
        var file = evt.target.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (ev) {
                var content = ev.target.result;

                $.ajax({
                    url: "/transpose",
                    type: 'POST',
                    data: content,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    success: function (data, status) {
                        setTableVisible("source-matrix");
                        setTableVisible("transposed-matrix");
                        wipeMatrixTable("source-matrix");
                        wipeMatrixTable("transposed-matrix");
                        fillMatrixTable("source-matrix", data["sourceMatrix"]);
                        fillMatrixTable("transposed-matrix", data["transposedMatrix"]);
                        highlightTransposedCells();
                        slideUpHelpPanel();
                        slideDownMatrixPanel('source-matrix');
                        slideDownMatrixPanel('transposed-matrix');
                    }
                });
                // Reset the input element to be able to trigger on the same file
                input.val("");
            };

            reader.readAsText(file);
        } else {
            alert("Failed to load file!")
        }
    });
}

function listenTransposeExampleMatrixButton() {
    $(".transpose-example-matrix").click(function () {
        var exampleMatrix = {
            "sourceMatrix":[
                [1,2,3,4,5,6],
                [-1,-2,-3,-4,-5,-6],
                [11,12,13,14,15,16],
                [7,8,9,10,11,12],
                [-11,-12,-13,-14,-15,-16]]
        };

        $.ajax({
            url: "/transpose",
            type: 'POST',
            data: JSON.stringify(exampleMatrix),
            headers: {
                'Content-Type': 'application/json'
            },
            success: function (data, status) {
                setTableVisible("source-matrix");
                setTableVisible("transposed-matrix");
                wipeMatrixTable("source-matrix");
                wipeMatrixTable("transposed-matrix");
                fillMatrixTable("source-matrix", data["sourceMatrix"]);
                fillMatrixTable("transposed-matrix", data["transposedMatrix"]);
                highlightTransposedCells();
                slideUpHelpPanel();
                slideDownMatrixPanel('source-matrix');
                slideDownMatrixPanel('transposed-matrix');
            }
        });
    })
}

$(document).ready(function () {
    listenTransposeMatrixButton();
    listenTransposeExampleMatrixButton();
    listenGenerateExampleButton();
    listenResetButton();
});
