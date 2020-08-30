//testing purposes only
function drawTable(xSelection, ySelection)
{
    console.log(xSelection);
    console.log(ySelection);
}

window.onload = function() {
    document.getElementById("button").addEventListener("click", function()
    {
        //can only select a single element.
        var ySelection = document.querySelector('.yAx:checked').value;
        var xSelection = document.querySelector('.xAx:checked').value;

        drawTable(xSelection, ySelection);
    });
}