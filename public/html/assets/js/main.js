(function () {
    let options = {
        chart: {
            type: 'bar',
            height: 300
        },
        title: {
            text: 'Monthly Statements Charts, 2021',
            align: 'left',
            style: {
                fontSize: "14px",
                color: '#4D4D4D',
                fontWeight: 400
            }
        },
        series: [{
            name: 'sales',
            data: [10, 20, 30, 40, 50, 60,]
        }],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        dataLabels: {
            enabled: false,
            style: {
                colors: ['#0DC3F8']
            },

        }
    }

    let chart = new ApexCharts(document.querySelector("#ts-msc"), options);

    chart.render();
})();


(function () {
    var options = {
        series: [{
            name: 'Create Ticket',
            data: [10, 15, 30, 45, 60],
        },
            {
                name: 'Open Ticket',
                data: [11, 32, 45, 32, 34, 52, 41]
            }],
        title: {
            text: 'WEEKLY GRAPH REPORT',
            align: 'left',
            style: {
                fontSize: "14px",
                color: '#4D4D4D',
                fontWeight: 400
            }
        },
        chart: {
            height: 300,
            type: 'line',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                }
            }
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            lineCap: 'butt',
            colors: ['#FF6060', '#0DC3F8'],
            width: 3,
            dashArray: 0,
        },
        xaxis: {
            categories: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            },
        },

        markers: {
            show: true,
            size: 6,
            colors: ['#FF6060', '#0DC3F8'],
            strokeColors: '#fff',
            strokeWidth: 2,
            strokeOpacity: 0.9,
            strokeDashArray: 0,
            fillOpacity: 1,
            discrete: [],
            shape: "circle",
            radius: 2,
            offsetX: 0,
            offsetY: 0,
            onClick: undefined,
            onDblClick: undefined,
            showNullDataPoints: true,
            hover: {
                size: undefined,
                sizeOffset: 3
            }
        },


    };

    var chart = new ApexCharts(document.querySelector("#ts-wgr"), options);
    chart.render();
})();
