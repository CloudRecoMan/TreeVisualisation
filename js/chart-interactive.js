var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(100,0)");

var tree = d3.tree()
    .size([height, width - 600]);

var cluster = d3.cluster()
    .size([height, width - 700]);

var stratify = d3.stratify()
    .parentId(function (d) { return d.id.substring(0, d.id.lastIndexOf(".")); });


window.onload = function start() {
    showValues('./csv/providers.csv');
};

function handleClick(myRadio) {
    file = "../TreeVisualisation/csv/" + myRadio.value + ".csv";

    $(document).ready(function () {
        $("svg").html("");
    });

    showValues(file);
    svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(100,0)");

    tree = d3.tree()
        .size([height - 400, width - 300]);

    cluster = d3.cluster()
        .size([height, width - 350]);

    stratify = d3.stratify()
        .parentId(function (d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
}

function showValues(filename) {

    d3.csv(filename, function (error, data) {
        if (error) throw error;

        var root = stratify(data)
            .sort(function (a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        cluster(root);

        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        node.append("circle")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", 3)
            .attr("x", function (d) { return d.children ? -8 : 8; })
            .style("text-anchor", function (d) { return d.children ? "end" : "start"; })
            .text(function (d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });

        d3.selectAll("input")
            .on("change", changed);

        var timeout = setTimeout(function () {
            d3.select("input[value=\"tree\"]")
                .property("checked", true)
                .dispatch("change");
        }, 1000);

        function changed() {
            timeout = clearTimeout(timeout);
            (this.value === "tree" ? tree : cluster)(root);
            var t = d3.transition().duration(750);
            node.transition(t).attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });
            link.transition(t).attr("d", diagonal);
        }
    });
}

function diagonal(d) {
    return "M" + d.y + "," + d.x
        + "C" + (d.parent.y + 100) + "," + d.x
        + " " + (d.parent.y + 100) + "," + d.parent.x
        + " " + d.parent.y + "," + d.parent.x;
}
