HIGHSTOCK_JSON_FORMATTER = {

    //Input should ALWAYS be a list of json coin objects even for a single coin to simplify implementation
    processAndPlot: function(coinToChartData, coinDataMap, dataMode) {

        //Hide all divs. We will show the ones with information in them later on
        var chartNamesPlotted = [];
        $('.CHARTDIV').addClass('hideChart');

        // Load the fonts
        Highcharts.createElement('link', {
           href: 'https://fonts.googleapis.com/css?family=Dosis:400,600',
           rel: 'stylesheet',
           type: 'text/css'
        }, null, document.getElementsByTagName('head')[0]);

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
                        d = rowObj[dataMode];
                    if (isNaN(d)) { //if row has no value entry i.e. '-' then skip
                        continue;
                    }
                    points.push([epoch, d]);
                }
                pointsArr.push(points);
            });

            var options = this.getOptions(plotDivId, dataMode),
                seriesData = [];

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

            options.series = seriesData;
            Highcharts.stockChart(plotDivId, options);
            chartNamesPlotted.push(plotDivId);
        }

        //Unhide charts that we have plotted
        $('.CHARTDIV').each(function() {
            if ($.inArray($(this)[0].id, chartNamesPlotted) != -1) {
                $(this).removeClass('hideChart');
            }
        })
    },

    getOptions: function(chartName, dataMode) {

        return {
            rangeSelector: {
                selected: 1
            },
            colors: ['#7cb5ec', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
                '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'
            ],
            credits: {
                enabled: false
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(219,219,216,0.8)',
                shadow: false,
                split: true
            },
            xaxis: {
                type: 'datetime',
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            plotOptions: {
                candlestick: {
                    lineColor: '#404048'
                }
            },
            yaxis: {
                gridLineColor: "#FFFFFF",
                lineColor: "#FFFFFF",
                minorGridLineColor: "#FFFFFF",
                tickColor: "#D7D7D8",
                tickWidth: 1,
                minorTickInterval: 'auto',
                title: {
                    style: {
                        textTransform: 'uppercase'
                    }
                },
                labels: {
                    style: {
                        fontSize: '12px'
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
                text: dataMode
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
//                        subtitle: {
//                            text: null
//                        },
                        navigator: {
                            enabled: false
                        }
                    }
                }]
            }
        };
    },
}