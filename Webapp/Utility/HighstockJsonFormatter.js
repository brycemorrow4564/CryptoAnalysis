HIGHSTOCK_JSON_FORMATTER = {

    colorsSetup: false,
    colorSetMap: {},

    setupColorSets: function() {

        var colors = ['#90ccff','#0024ff','#00d5ff','#b5ffcb','#98ff52','#008d02','#ffbb0c','#ff560c'];

        this.colorsSetup = true;
        for (var x = 1; x <= 25; x++) {
            this.colorSetMap['Chart ' + x] = colors;
        }
    },

    randShuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },

    //Input should ALWAYS be a list of json coin objects even for a single coin to simplify implementation
    processAndPlot: function(coinToChartData, coinDataMap, dataMode) {

        //Randomly shuffle base color set and assign variants to charts randomly
        if (!this.colorsSetup) {
            this.setupColorSets();
        }

        console.log(this.colorSetMap)

        //Hide all divs. We will show the ones with information in them later on
        var chartNamesPlotted = [];

        // Load the fonts
        Highcharts.createElement('link', {
           href: 'https://fonts.googleapis.com/css?family=Dosis:400,600',
           rel: 'stylesheet',
           type: 'text/css'
        }, null, document.getElementsByTagName('head')[0]);

        var dataPlottedForChartMap  = {};

        for (var i = 0; i < coinToChartData.length; i++) {
            var coinChartObj            = coinToChartData[i],
                plotDivId               = coinChartObj['name'],
                coinList                = coinChartObj['data'],
                pointsArr               = []; //array of points objects to be passed to options.series.data

            coinList.forEach(function(coinName) {
                var priceHist   = coinDataMap[coinName]['priceHistory'],
                    points      = [];

                for (var x = priceHist.length - 1; x > 0; x--) {
                    var rowObj = priceHist[x],
                        date = rowObj['Date'].replace(',','').replace(' ','-'),
                        epoch = new Date(date).valueOf(),
                        d = rowObj[dataMode];
                    if (isNaN(d)) { //if row has no value entry i.e. '-' then skip
                        continue;
                    }
                    points.push([epoch, d]);
                }
                pointsArr.push(points);
            });

            //This variable is used so that we only remove the hidden class for charts where data is plotted
            dataPlottedForChartMap[plotDivId] = pointsArr.length !== 0;

            var options = this.getOptions(plotDivId, dataMode, coinList, pointsArr);

            Highcharts.stockChart(plotDivId, options);
            chartNamesPlotted.push(plotDivId);
        }

        //Unhide charts that we have plotted
        $('.CHARTDIV').each(function() {
            var chartName = $(this)[0].id;
            if ($.inArray(chartName, chartNamesPlotted) != -1 && dataPlottedForChartMap[chartName]) {
                $(this).removeClass('hideChart');
            }
        })
    },

    getOptions: function(chartName, dataMode, coinList, pointsArr) {

        var seriesData = [];

        //coinList and pointsArr have the same length and there is 1 to 1 between coinname and data
        for (var y = 0; y < coinList.length; y++) {
            var coinName = coinList[y],
                points = pointsArr[y];

            seriesData.push({
                 name: coinName,
                 type: 'line',
                 data: points
            });
        }

        var options = {

            rangeSelector: {
                selected: 0
            },
            colors: this.colorSetMap[chartName],
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    showInNavigator: true // Global value
                }
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(219,219,216,0.8)',
                shadow: false,
                formatter: function() {
                    var s = [];
                    $.each(this.points, function(i, point) {
                        var obj = {};
                        obj.sortProp = point.y;
                        obj.data = '<br/><span style="color:' + this.point.color + '">\u25CF</span> ' +
                                    point.series.name +' : $'+ point.y.toLocaleString();

                        s.push(obj);
                    });

                    //Sort so that coin with largest value is at top of tooltip
                    s.sort(function(a,b) {
                        return a.sortProp === b.sortProp ? 0 : (a.sortProp > b.sortProp ? -1 : 1);
                    });

                    var dArr = (new Date(this.x)).toLocaleDateString('en-GB', {
                            day : 'numeric',
                            month : 'short',
                            year : 'numeric'
                        }).split(' ');

                    return ['<span>' + dArr[1] + ' ' + dArr[0] + ', ' + dArr[2] + "</span><br>"].concat(s.map(function(obj) { return obj.data; }));
                },
                shared: true
            },
            series: seriesData,
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%Y<br/>%b %e',
                    week: '%Y<br/>%b %e',
                    month: '%Y<br/>%b %e',
                },
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yAxis: {
                lineColor: "#FFFFFF",
                tickColor: "#D7D7D8",
                tickWidth: 1,
                minorTickInterval: 'auto',
                labels: {
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold'
                    },
                    formatter: function() {
                        return '$' + this.value.toLocaleString();
                    }
                }
            },
            chart: {
                height: 400,
                backgroundColor: null,
                borderColor: "#000000",
                style: {
                    fontFamily: "Dosis, sans-serif",
                    color: "#3C3C3C"
                }
            },
            title: {
                text: chartName,
                align: 'left',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }
            },
            subtitle: {
                text: dataMode === "Open" ? 'Daily Price' : dataMode,
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }
            },
            labels: {
                style: {
                    color: "#D7D7D8"
                }
            },
            drilldown: {
                activeAxisLabelStyle: {
                    color: "#F0F0F3"
                },
                activeDataLabelStyle: {
                    color: "#F0F0F3"
                }
            },
            navigation: {
                buttonOptions: {
                    symbolStroke: "#DDDDDD",
                    theme: {
                        fill: "#505053"
                    }
                }
            },
            legend: {
                itemStyle: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            },
            background2: "#505053",
            dataLabelsColor: "#B0B0B3",
            textColor: "#C0C0C0",
            contrastTextColor: "#F0F0F3",
            maskColor: "rgba(255,255,255,0.3)",
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        chart: {
                            height: 300
                        },
                        navigator: {
                            enabled: false
                        }
                    }
                }]
            }
        };

        return options;
    },
}