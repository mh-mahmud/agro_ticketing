import React from "react";
import ApexCharts from 'react-apexcharts';

class MonthlyStatement extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            series: [{
                name: 'sales',
                data: [10, 20, 30, 40, 50, 60,]
            }],

            options: {
                colors : ['#0DC3F8'],
                chart: {
                    type: 'bar',
                    height: 280
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '30%',
                        endingShape: 'rounded'
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
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

                fill: {
                    opacity: 1
                },

                tooltip: {
                    y: {
                        formatter: function (val) {
                            return "$ " + val
                        }
                    }
                }
            },

        };
    }


    render() {
        return (
            <ApexCharts options={this.state.options} series={this.state.series} type="bar" height={280}/>
        );
    }
}

export default MonthlyStatement;
