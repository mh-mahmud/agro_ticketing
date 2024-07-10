import React from "react";
import ApexCharts from "react-apexcharts";

class WeeklyServiceLevel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            series: [{
                name: 'Success',
                data: [44, 55, 41, 67, 22, 43]
            }, {
                name: 'Pending',
                data: [13, 23, 20, 8, 13, 27]
            }, {
                name: 'Expired',
                data: [11, 17, 15, 15, 21, 14]
            }],


            options: {
                colors: ['#00C486', '#FFC861', '#FF6060'],
                title: {
                    text: 'Weekly Service Level',
                    align: 'right',
                    style: {
                        fontSize: "14px",
                        color: '#4D4D4D',
                        fontWeight: 400
                    }
                },
                chart: {
                    type: 'bar',
                    height: 350,
                    stacked: true,
                    toolbar: {
                        show: false
                    },

                    zoom: {
                        enabled: true
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }],
                plotOptions: {
                    bar: {
                        horizontal: false,
                        borderRadius: 5
                    },
                },
                xaxis: {
                    type: 'datetime',
                    categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
                        '01/05/2011 GMT', '01/06/2011 GMT'
                    ],
                },
                legend: {
                    position: 'right',
                    offsetY: 40
                },
                fill: {
                    opacity: 1
                }
            },


        };
    }


    render() {
        return (


            <div>
                <ApexCharts options={this.state.options} series={this.state.series} type="bar" height={350}/>
            </div>


        );
    }

}

export default WeeklyServiceLevel;
