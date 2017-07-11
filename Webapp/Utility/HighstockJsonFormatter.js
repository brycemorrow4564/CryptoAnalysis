HIGHSTOCK_JSON_FORMATTER = {

    //Input should ALWAYS be a list of json coin objects even for a single coin to aid in simplicity of implementation
    processAndPlot: function(coinToChartData, coinDataMap) {

        for (var i = 0; i < coinToChartData.length; i++) {
            var coinChartObj    = coinToChartData[i],
                plotDivId       = coinChartObj['name'],
                coinList        = coinChartObj['data'],
                pointsArr       = []; //array of points objects to be passed to options.series.data

            coinList.forEach(function(coinName) {
                var priceHist   = coinDataMap[coinName]['priceHistory'],
                    points      = [];

                for (var x = priceHist.length - 1; x > 0; x--) {
                    var rowObj = priceHist[x],
                        date = rowObj['Date'].replace(',','').replace(' ','-'),
                        epoch = new Date(date).valueOf(),
                        markCap = rowObj['Market Cap'];
                    if (isNaN(markCap)) { //if row has no value entry i.e. '-' then skip
                        continue;
                    }
                    points.push([epoch, markCap]);
                }
                pointsArr.push(points);
            });

            var options = this.getOptions(),
                series = this.getSeries(),
                seriesData = [];

            pointsArr.forEach(function(points) {
                shallowSeriesObj = Object.assign({}, series); //create shallow copy of series
                shallowSeriesObj.data = points;
                seriesData.push(shallowSeriesObj);
            });

            options.series = seriesData;

            Highcharts.stockChart(plotDivId, options);
        }
    },

    getOptions: function() {

        var options = {
            colors: ["#6794a7", "#014d64", "#76c0c1",
                     "#01a2d9", "#7ad2f6", "#00887d",
                     "#adadad", "#7bd3f6", "#7c260b",
                     "#ee8f71", "#76c0c1", "#a18376"],
            credits: {
                enabled: false
            },
            tooltip: {
                backgroundColor: "#FFFFFF",
                borderColor: "#76c0c1",
                style: {
                    color: "#000000"
                }
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
                gridLineColor: "#FFFFFF",
                lineColor: "#FFFFFF",
                minorGridLineColor: "#FFFFFF",
                tickColor: "#D7D7D8",
                tickWidth: 1,
                title: {
                    style: {
                        color: "#A0A0A3"
                    }
                }
            },
            chart: {
                height: 400,
                backgroundColor: "#eff4f9",
                borderColor: "#000000",
                style: {
                    fontFamily: "Droid Sans",
                    color: "#3C3C3C"
                }
            },
            title: {
                text: 'Market Cap Over Time',
                align: 'left',
                style: {
                    fontWeight: 'bold'
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
            legendBackgroundColor: "rgba(0, 0, 0, 0.5)",
            background2: "#505053",
            dataLabelsColor: "#B0B0B3",
            textColor: "#C0C0C0",
            contrastTextColor: "#F0F0F3",
            maskColor: "rgba(255,255,255,0.3)",
            //series: [{data: points}, {data: points2}],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        chart: {
                            height: 300
                        },
                        subtitle: {
                            text: null
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

    getSeries: function() {

        var series = {
            name: 'Market Cap',
            type: 'area',
            threshold: null,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 1,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        };

        return series;
    }

}