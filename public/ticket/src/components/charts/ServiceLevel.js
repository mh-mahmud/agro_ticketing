import React from "react";
import ApexCharts from "react-apexcharts";


class ServiceLevel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [44, 55, 41],
            options: {
                colors: ['#00C486', '#FFC861', '#FF6060'],
                chart: {
                    type: 'donut',
                    height: '350',
                    expandOnClick: true,
                },
                labels: ['Success', 'Pending', 'Expired'],
                title: {
                    text: 'Average Service Level',
                    align: 'left',
                    style: {
                        fontSize: "14px",
                        color: '#4D4D4D',
                        fontWeight: 400
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }],
                legend: {
                    position: 'left',
                    offsetY: 40
                }
            },


        };
    }


    render() {
        return (
            <div>
                <ApexCharts
                    options={this.state.options}
                    series={this.state.series}
                    type="donut"
                    height="350px"
                />
            </div>

        );
    }


}

export default ServiceLevel;
