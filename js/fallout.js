var Fallout = function (container, chartWidth, chartHeight, config) {
  var w = chartWidth || 830,
      h = chartHeight || 500;
  var legendWidth = config && config.legendWidth || 200;
  var pointR = config && config.pointR || 10;
  var topAngle = config && config.topAngle || Math.PI * 2 / 3;
  var topCIR = config && config.topCircleInnerRadius || (1 - 0.2) * h / (2 - Math.cos(topAngle / 2));
  var topCOR = config && config.topCircleOuterRadius || topCIR + 0.1 * h;
  var downCR = config && config.downCircleRadius || topCIR * 0.9;
  var topCP = {};
  topCP.x = config && config.topCirclePointX || ((w - legendWidth) / 2);
  topCP.y = config && config.topCirclePointY || topCOR + 5;
  var downCP = {};
  downCP.x = config && config.downCirclePointX || ((w - legendWidth) / 2);
  downCP.y = config && config.downCirclePointY || h - topCIR;
  var container = $(container);
  var svg = d3.select(container[0]).append("svg")
    .attr("width", w)
    .attr("height", h);
  var legend = svg.append("g")
    .attr("width", legendWidth)
    .attr("height", h);
  var vis;
  var floatTag;

  var state = "normal"; // "pointClicked", "donutClicked"
  var animating = false;

  var color = d3.scale.ordinal()
    .range(["#9E0142", "#D53E4F", "#F46D43", "#FDAE61", "#FEE08B", "#E6F598", "#ABDDA4", "#66C2A5", "#3288BD", "#5E4FA2"]);
  
  //prepare data
  var data = {
    'category': ['性别', '年龄', '星座', '生肖'],
    '性别': [
      ['爱好', '男', '女'],
      ['摄影一族', 674434, 488340],
      ['数码一族', 1758358, 553991],
      ['家庭主妇', 826512, 1465307],
      ['户外一族', 1846335, 1432027],
      ['情趣一族', 1506723, 852520],
      ['宠物一族', 559653, 1027303],
      ['健美一族', 283972, 772774],
      ['花卉一族', 151969, 234356],
      ['零食一族', 2971481, 5304611],
      ['爱美女生', 2024833, 6328921],
      ['苹果迷', 2841458, 3902249],
      ['运动一族', 1972870, 1979325],
      ['收藏家', 380145, 379686]
    ],
    '年龄': [
      ["爱好", "<18", "18-24", "25-29", "30-34", "35-39", "40-49", "50-59", "60-"],
      ["摄影一族", 3, 270038, 351921, 260544, 123573, 117818, 29993, 8884],
      ["数码一族", 6, 585198, 704326, 519490, 243559, 201702, 43502, 14567],
      ["家庭主妇", 8, 415815, 670087, 602739, 301027, 239914, 47581, 14649],
      ["户外一族", 8, 602540, 903555, 812233, 471790, 404631, 66566, 17039],
      ["情趣一族", 7, 798387, 764775, 438821, 177290, 142485, 28909, 8569],
      ["宠物一族", 5, 465777, 504473, 273595, 134117, 159887, 40447, 8655],
      ["健美一族", 4, 246762, 310272, 236689, 126355, 113441, 19294, 3929],
      ["花卉一族", 1, 70865, 118645, 95566, 47922, 41220, 9406, 2700],
      ["零食一族", 24, 2171917, 2498264, 1787783, 850393, 772021, 152756, 42934],
      ["爱美女生", 33, 2687900, 2549935, 1608613, 719653, 648165, 113141, 26315],
      ["苹果迷", 41, 2219430, 2152229, 1267247, 517701, 478971, 86945, 21144],
      ["运动一族", 24, 1006128, 1085206, 810404, 489370, 482093, 63559, 15411],
      ["收藏家", 2, 144638, 215252, 185590, 100249, 90090, 18377, 5633]
    ],
    '星座': [
      ['爱好','摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手'],
      ['摄影一族',94285,97430,94871,88754,84772,88573,93524,96260,99731,113447,113881,97246],
      ['数码一族',188738,192520,189416,173560,166011,174668,180215,189738,202863,233029,224051,197541],
      ['家庭主妇',187365,193291,184500,172011,163619,173744,183270,186327,197174,223367,230297,196855],
      ['户外一族',267229,275371,267156,248960,237845,250110,259064,266175,282785,322935,321429,279303],
      ['情趣一族',193164,197398,193322,176070,169442,182238,187325,195636,206492,235367,224358,198431],
      ['宠物一族',130951,137343,131963,121468,114126,121088,128097,131564,134125,148427,152886,134918],
      ['健美一族',85725,87457,85944,79082,75614,80389,84234,87972,92159,104880,103414,89876],
      ['花卉一族',32134,33216,31752,29581,27881,28752,30156,30871,32645,37439,38671,33227],
      ['零食一族',676857,693412,668499,614734,587894,628515,661705,684779,719322,814329,818500,707546],
      ['爱美女生',681862,697962,676614,620490,594517,638156,669446,698737,731926,822483,812177,709385],
      ['苹果迷',544556,560034,541535,500101,481178,518505,545900,571035,594378,663194,657680,565612],
      ['运动一族',321951,327900,322363,295993,284116,300415,312810,326212,347874,394578,383957,334026],
      ['收藏家',62475,65227,62726,58355,55274,57978,60849,61520,64250,73152,74109,63916]
    ],
    '生肖': [
      ['爱好','鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'],
      ['摄影一族',87489,90650,102884,113492,106810,104870,100293,90703,88909,92878,96482,87314],
      ['数码一族',170259,176766,203695,222134,210138,213138,207392,188503,179167,185655,188634,166869],
      ['家庭主妇',179750,180198,198404,212636,197205,194488,188578,174734,172875,194044,211667,187241],
      ['户外一族',253498,258306,289085,312922,290355,285522,276226,252856,247714,269515,287414,254949],
      ['情趣一族',158858,172997,210048,239498,232014,238782,233800,199601,179227,174541,170396,149481],
      ['宠物一族',112624,122265,147388,171155,163878,159152,142892,117732,110492,111685,118359,109334],
      ['健美一族',75787,80707,94669,106392,101940,99374,92327,81989,79260,84049,84944,75308],
      ['花卉一族',30572,31770,35305,37809,34585,33429,30841,27971,27131,31097,34633,31182],
      ['零食一族',595364,622146,723861,810827,772787,779791,752970,667565,629749,653463,672517,595052],
      ['爱美女生',553404,595895,722214,832839,819812,845712,819949,707136,649977,640926,623606,542285],
      ['苹果迷',452108,487707,590821,682389,670451,680362,643740,553194,515824,520249,505237,441626],
      ['运动一族',288304,300670,343318,377757,357945,355713,346780,318703,319269,334345,326973,282418],
      ['收藏家',59488,60284,65952,71288,66942,66053,63775,57737,57237,62404,67730,60941]
    ]
  };
      
  var init = function () {
    var addCommas = function (nStr) {
    	nStr += '';
    	x = nStr.split('.');
    	x1 = x[0];
    	x2 = x.length > 1 ? '.' + x[1] : '';
    	var rgx = /(\d+)(\d{3})/;
    	while (rgx.test(x1)) {
    		x1 = x1.replace(rgx, '$1' + ',' + '$2');
    	}
    	return x1 + x2;
    };
    var createFloatTag = function () {
        var _mousemove = function (e) {
            var jqNode = e.data.jqNode;
            var container = e.data.container;
            var mouseToFloatTag = {x: 20, y: 20};
            var offset = $(container).offset();
            if (!(e.pageX && e.pageY)) {return false;}
            var x = e.pageX - offset.left,
                y = e.pageY - offset.top;
            var position = $(container).position();
    
            setContent.call(this);
    
            //set floatTag location
            floatTagWidth = jqNode.outerWidth();
            floatTagHeight = jqNode.outerHeight();
            if (floatTagWidth + x + 2 * mouseToFloatTag.x <=  $(container).width()) {
                x += mouseToFloatTag.x;
            } else {
                x = x - floatTagWidth - mouseToFloatTag.x;
            }
            if (y >= floatTagHeight + mouseToFloatTag.y) {
                y = y - mouseToFloatTag.y - floatTagHeight;
            } else {
                y += mouseToFloatTag.y;
            }
            jqNode.css("left",  x  + "px");
            jqNode.css("top",  y + "px");
        };
    
        var setContent = function () {};
    
        function floatTag(cont) {
            var container = cont;
            var jqNode = $("<div/>").css({
                "border": "1px solid",
                "border-color": $.browser.msie ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.8)",
                "background-color": $.browser.msie ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.75)",
                "color": "white",
                "border-radius": "2px",
                "padding": "12px 8px",
                //"line-height": "170%",
                //"opacity": 0.7,
                "font-size": "12px",
                "box-shadow": "3px 3px 6px 0px rgba(0,0,0,0.58)",
                "font-familiy": "宋体",
                "z-index": 10000,
                "text-align": "center",
                "visibility": "hidden",
                "position": "absolute"
            });
            $(container).append(jqNode)
                .mousemove({"jqNode": jqNode, "container": container}, _mousemove);
            return jqNode;
        }
    
        floatTag.setContent = function (sc) {
            if (arguments.length === 0) {
                return setContent;
            }
            setContent = sc;
        };
        return floatTag;
    };
    container.css({
        "position": "relative",
        "background-color": "#f5fff5",
        "width": w + "px",
        "height": h + "px"
    });
    floatTag = createFloatTag()(container);
    floatTag.css({"visibility": "hidden"});
    container.delegate(".arc", "mouseover", function () {
      var d = this.__data__;
      //set floatTag content
      floatTag.html('<div><p>' + d.arr[0] + '</p>'
          + '<p>' + addCommas(d.value) + '人</p>'
          + '</div>'
      );
      floatTag.css({"visibility": "visible"});
      $(this).css({"stroke-width": 2});
    });
    container.delegate(".arc", "mouseout", function () {
      floatTag.css({"visibility": "hidden"});
      $(this).css({"stroke-width": 1});
    });
    container.delegate(".wedge", "mouseover", function () {
      var d = this.__data__;
      //set floatTag content
      floatTag.html('<div><p>' + d.parent.arr[0] + " - " + d.point.name + '</p>'
          + '<p>' + addCommas(d.value) + '人</p>'
          + '<p>类别占比：' + (d.value / d.parent.value * 100).toFixed(2) + '%</p>'
          + '</div>'
      );
      floatTag.css({"visibility": "visible"});
      $(this).css({"opacity": 0.8});
    });
    container.delegate(".wedge", "mouseout", function () {
      floatTag.css({"visibility": "hidden"});
      $(this).css({"opacity": ''});
    });
  };
  init();

  var drawLegend = function () {
    var left = 20;
    var top = 10;
    var padding = 25;
    var width = 150;
    var selectCate;
    data[data.category[0]].slice(1).forEach(function (d) {
      legend.append("rect")
        .attr("x", left)
        .attr("y", top )
        .attr("width", padding * 3 / 4)
        .attr("height", padding * 3 / 4)
        .attr("fill", color(d[0]));
      legend.append("text")
        .attr("x", left + padding)
        .attr("y", top + 7)
        .attr("dominant-baseline", "central") 
        .attr("font-family", "微软雅黑") 
        .text(d[0]);
      top += padding;
    });
    top += 40;
    padding = 30;
    selectCate = legend.selectAll(".selectCate")
        .data(data.category)
      .enter().append("g")
        .attr("class", "selectCate")
        .attr("fill", function (d, i) { return i === 0 ? "white" : "gray"; })
        .style("cursor", function (d, i) { return i === 0 ? "auto" : "pointer"; });
    selectCate.on("click", function () {
      var d = this.__data__;
      selectCate.style("fill", "gray")
        .style("cursor", "pointer");
      $(this).css({
        "fill": "white",
        "cursor": "auto"
      });
      render(d);
    });
    selectCate.append("rect")
        .attr("class", "selectCateRect")
        .attr("x", left)
        .attr("y", function (d, i) { return top + i * padding;})
        .attr("width", width)
        .attr("height", padding * 3 / 4);
    selectCate.append("text")
        .attr("x", left + width / 2)
        .attr("y", function (d, i) { return top + i * padding + 9;})
        .attr("dominant-baseline", "central") 
        .attr("font-family", "微软雅黑") 
        .attr("text-anchor", "middle") 
        .attr("pointer-event", "none")
        .attr("fill", "black")
        .text(function (d) { return d; });
    container.delegate(".selectCateRect", "mouseover", function () {
        $(this).css("opacity", 0.8);
    });
    container.delegate(".selectCateRect", "mouseout", function () {
        $(this).css("opacity", 1);
    });

  };
  drawLegend();  

  //draw 
  var draw = function (rawData) {
    //d3 obj
    vis = svg.append("g")
    .attr("width", w - legendWidth)
    .attr("height", h)
    .attr("transform", "translate(" + legendWidth + ",0)");

    var wedgeArea = vis.append("g");
    var topCircle = vis.append("g")
        .attr("transform", "translate(" + topCP.x + "," + topCP.y + ")");
    var downCircle = vis.append("g");
    var textCenter = vis
      .append("text")
        .attr("class", "textCenter")
        .attr("x", topCP.x)
        .attr("y", topCP.y - (topCIR * 0.6 + topCOR * 0.4))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("pointer-events", "none")
        .attr("font-family", "微软雅黑")
        .attr("opacity", 0);
  
    //layout obj
    var rowJson = [];
    var sum = 0;
    rawData.slice(1).forEach(function (d) {
      var row = {};
      d.forEach(function (d, i) {
        row[rawData[0][i]] = d;
      });
      row.start = sum;
      row.value= d3.sum(d.slice(1));
      sum += row.value;
      row.arr = d;
      rowJson.push(row);
    });
    rowJson.forEach(function (d) {
      d.sum = sum;
    });
    var startAngle = -topAngle / 2;
    var endAngle = topAngle / 2;
    var downCirclePoints = [];
    //rawData[0] = d3.range(20);
    rawData[0].slice(1).forEach(function (d, i) {
      var p = {};
      p.name = d;
      p.columnIndex = "c" + i;
      p.angle = Math.PI * (1 - (i + 1) / ((rawData[0].length - 1) + 1));
      p.x = downCP.x + downCR * Math.cos(p.angle);
      p.y = downCP.y + downCR * Math.sin(p.angle);
      downCirclePoints.push(p);
    });
    var pie = [];
    rowJson.forEach(function (row) {
      var sum = 0;
      row.pie = [];
      row.arr.slice(1).forEach(function (d, i) {
        var wedge = {};
        wedge.columnIndex = "c" + i;
        wedge.start = row.start + sum;
        wedge.value = d;
        wedge.parent = row;
        wedge.point = downCirclePoints[i];
        sum += d;
        pie.push(wedge);
        row.pie.push(wedge);
      });
    });
  
    var getAngle = d3.scale.linear()
      .range([startAngle, endAngle]);
  
    var donutArc = d3.svg.arc()
        .startAngle(function(d) { return getAngle(d.start / d.sum); })
        .endAngle(function(d) { return getAngle((d.start + d.value) / d.sum); })
        .innerRadius(topCIR)
        .outerRadius(topCOR);
  
    var donut = topCircle.selectAll(".arc")
        .data(rowJson)
    	.enter().append("path")
        .attr("d", donutArc)
        .attr("class", "arc")
        .style("fill", function(d, i) { return color(d.arr[0]);})
        .style("stroke", "white")
        .style("cursor", "pointer");
  
    var downPoint = downCircle.selectAll(".downPoint")
        .data(downCirclePoints)
      .enter().append("g")
        .attr("class", function (d) { return "downPoint " + "downPoint_" + d.columnIndex; })
        .style("cursor", "pointer");
  
    downPoint.append("circle")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", pointR)
        .attr("title", function (d) { return d.name; });
  
    downPoint.append("text")
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y + 2 * pointR; })
        .style("cursor", "pointer")
        .text(function (d) { return d.name; })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("pointer-events", "none")
        .attr("font-family", "微软雅黑");
  
    var wedge = wedgeArea.selectAll(".wedge")
        .data(pie)
      .enter().append("path")
        .attr("class", function (d) { return "wedge " + "wedge_" + d.columnIndex; })
        .attr("d", function (d) {
            var sAngle = getAngle(d.start / sum);
            var eAngle = getAngle((d.start + d.value) / sum);
            var sp = [topCP.x + topCIR * Math.sin(sAngle), topCP.y - topCIR * Math.cos(sAngle)];
            var ep = [topCP.x + topCIR * Math.sin(eAngle), topCP.y - topCIR * Math.cos(eAngle)];
            return "M" + sp[0] + "," + sp[1] + "A" + topCIR + "," + topCIR + " 0 0,1 " + ep[0] + "," + ep[1] + "L" + d.point.x + "," + d.point.y + "Z";
        })
        .attr("fill", function (d) { return color(d.parent.arr[0]);})
        .attr("fill-opacity", 0.6);

  
    // click arc
    container.delegate(".arc", "click", function () {
      if (state !== 'normal' || animating === true) {
        return;
      }
      //start animating
      animating = true;
      state = 'donutClicked';
      downPoint.style("cursor", "auto")
        .attr("opacity", 0.5);
  
      var donutData = this.__data__;
      var singleDonut;
      var singleDonutWedge;
      wedge.attr("display", 'none');
      singleDonut = topCircle.selectAll(".singleDonut")
          .data([donutData])
        .enter().append("path")
          .attr("d", donutArc)
          .attr("class", "arc singleDonut")
          .style("fill", function(d, i) { return color(d.arr[0]);})
          .style("stroke", "white")
          .style("cursor", "pointer")
          .on("click", function () {
            // recover
            state = 'normal';
            animating = true;
            textCenter.attr("opacity", 0);
            singleDonutWedge.remove();
            singleDonut.transition()
              .duration(1000)
              .attr("d", donutArc)
              .each('end', function () {
                wedge.attr("display", '');
                singleDonut.remove();
                //animating end
                downPoint.style("cursor", "pointer")
                  .attr("opacity", 1);
                animating = false;
              });
          });
      singleDonut.transition()
          .duration(1000)
          .attr("d", donutArc({start: 0, value: sum, sum: sum}))
          .each('end', function (d) {
            //new wedge
            singleDonutWedge = wedgeArea.selectAll(".wedge_")
              .data(donutData.pie)
            .enter().append("path")
              .attr("class", "wedge wedge_")
              .attr("d", function (d) {
                  var sAngle = getAngle((d.start - d.parent.start) / d.parent.value);
                  var eAngle = getAngle((d.start - d.parent.start + d.value) / d.parent.value);
                  var sp = [topCP.x + topCIR * Math.sin(sAngle), topCP.y - topCIR * Math.cos(sAngle)];
                  var ep = [topCP.x + topCIR * Math.sin(eAngle), topCP.y - topCIR * Math.cos(eAngle)];
                  return "M" + sp[0] + "," + sp[1] + "A" + topCIR + "," + topCIR + " 0 0,1 " + ep[0] + "," + ep[1] + "L" + ((sp[0] + ep[0]) / 2) + "," + ((sp[1] + ep[1]) / 2) + "Z";
              })
              .attr("fill", function (d) { return color(d.parent.arr[0]);})
              .attr("fill-opacity", 0.6);
  
            //new wedge animate
            singleDonutWedge.transition()
              .duration(300)
              .attr("d", function (d) {
                  var sAngle = getAngle((d.start - d.parent.start) / d.parent.value);
                  var eAngle = getAngle((d.start - d.parent.start + d.value) / d.parent.value);
                  var sp = [topCP.x + topCIR * Math.sin(sAngle), topCP.y - topCIR * Math.cos(sAngle)];
                  var ep = [topCP.x + topCIR * Math.sin(eAngle), topCP.y - topCIR * Math.cos(eAngle)];
                  return "M" + sp[0] + "," + sp[1] + "A" + topCIR + "," + topCIR + " 0 0,1 " + ep[0] + "," + ep[1] + "L" + d.point.x + "," + d.point.y + "Z";
              })
              .each('end', function () {
                //animating end
                textCenter.text(donutData.arr[0].split('').join(" "))
                  .attr("opacity", 1);
                animating = false;
              });
          });
    });
  
    // click downPoint
    container.delegate(".downPoint", "click", function () {
      if (state !== 'normal' || animating === true) {
        return;
      }
      //animating start
      state = 'pointClicked';
      animating = true;
      donut.style("cursor", "auto");
  
      var dpData = this.__data__;
      var newPie = [];
      var wedge_;
      var donut_;
      var sum_ = 0;
      var recover = function () {
        if (state !== 'pointClicked') {
          return;
        }
        state = "normal";
        animating = true;
        newPie.forEach(function (d) {
          d.start = d.start_;
          d.sum = d.sum_;
        });
        d3.selectAll(".wedge_" + dpData.columnIndex).transition()
          .duration(1000)
          .attr("d", function (d) {
            var sAngle = getAngle(d.start / d.parent.sum);
            var eAngle = getAngle((d.start + d.value) / d.parent.sum);
            var sp = [topCP.x + topCIR * Math.sin(sAngle), topCP.y - topCIR * Math.cos(sAngle)];
            var ep = [topCP.x + topCIR * Math.sin(eAngle), topCP.y - topCIR * Math.cos(eAngle)];
            return "M" + sp[0] + "," + sp[1] + "A" + topCIR + "," + topCIR + " 0 0,1 " + ep[0] + "," + ep[1] + "L" + d.point.x + "," + d.point.y + "Z";
          })
          .each('end', _.after(newPie.length, function () {
            //animating end
            //downPoint.attr("display", '');
            downPoint.attr("opacity", 1)
              .style("cursor", "pointer");
            wedge.attr("display", '');
            donut.style("cursor", "pointer");
            animating = false;
          }));
        donut.transition()
          .duration(1000)
          .attr("d", donutArc);
      };
  
      //downPoint.attr("display", "none");
      downPoint.attr("opacity", 0.3)
        .style("cursor", 'auto');
      wedge.attr("display", "none");
      d3.selectAll(".downPoint_" + dpData.columnIndex)
        .attr("opacity", 1)
        .style("cursor", "pointer")
        //.attr("display", '')
        .on("click", recover);
      wedge_ = d3.selectAll(".wedge_" + dpData.columnIndex)
        .attr("display", function (d) {
          newPie.push(d);
          return '';
        });
  
      newPie = newPie.slice();
      newPie.forEach(function (d) {
        d.start_ = d.start;
        d.start = sum_;
        sum_ += d.value;
      });
      newPie.forEach(function (d) {
        d.sum_ = d.sum;
        d.sum = sum_;
      });
      wedge_.transition()
        .duration(1000)
        .attr("d", function (d) {
          var sAngle = getAngle(d.start / sum_);
          var eAngle = getAngle((d.start + d.value) / sum_);
          var sp = [topCP.x + topCIR * Math.sin(sAngle), topCP.y - topCIR * Math.cos(sAngle)];
          var ep = [topCP.x + topCIR * Math.sin(eAngle), topCP.y - topCIR * Math.cos(eAngle)];
          return "M" + sp[0] + "," + sp[1] + "A" + topCIR + "," + topCIR + " 0 0,1 " + ep[0] + "," + ep[1] + "L" + d.point.x + "," + d.point.y + "Z";
        });
  
      donut.transition()
        .duration(1000)
        .attr("d", function (d, i) { return donutArc(newPie[i]);})
        .each('end', _.after(newPie.length, function () {
          //animating end
          animating = false;
        }));
  
    });
  };
  
  var clean = function () {
    state = 'normal';
    animating = false;
    container.undelegate(".arc", "click");
    container.undelegate(".downPoint", "click");
    vis && vis.remove && vis.remove();
  };

  var render = function (cate) {
    clean();
    draw(data[cate]);
  };
  render(data.category[0]);
  /*
  draw(data[data.category[0]]);
  setTimeout(function () {
      clean();
      draw(data[data.category[1]]);
  }, 2000);
  */

  
  this.startAnim = function () {
  };
  this.stopAnim = function () {
  };
}
