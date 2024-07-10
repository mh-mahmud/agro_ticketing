import React from "react";
import ApexCharts from 'react-apexcharts';

class WeeklyReport extends React.Component{
    constructor(props) {
        super(props);
        this.state = {

            series: [{
                name: 'Create Ticket',
                data: [10, 15, 30, 45, 60],
            },
                {
                    name: 'Open Ticket',
                    data: [11, 32, 45, 32, 34, 52, 41]
                }],

            options:{
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
                    height: 280,
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

            }


        }
    }


    render() {
        return (
            <ApexCharts options={this.state.options} series={this.state.series} type="line" height={280}/>
        );
    }


}

export default WeeklyReport;
