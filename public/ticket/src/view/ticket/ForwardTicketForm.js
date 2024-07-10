import React, {Component} from 'react'
import {Select, message, Alert} from 'antd';
import BreadCrumbs from "../../components/common/BreadCrumbs";
// import RichEditor from './RichEditor';
import {API_URL,ANTD_MESSAGE_MARGIN_TOP} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Helper from '../../services/Helper';
import {withRouter} from "react-router-dom";
import Joi from 'joi';
import $ from 'jquery'
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css';
import {Input, Spin, Button} from 'antd';

const { TextArea } = Input;

const {Option} = Select;



class ForwardTicketForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
             //breadcrumb
             locationPath                        : {
                base                            : 'Dashboard',
                basePath                        : '/',
                name                            : 'Forward Ticket',
                path                            : 'forward-ticket',
            },
            isFormReady         : false,
            action              : 'create',
            dataTableSpinning   : false,
            selectedFiles       : [],
            givenFilesContainer : [],
            givenFiles          : false,
            ticket              : {},
            submitLoading       : false,
            forwordButtonText   : 'Forward Ticket',
            contact: {
                selectOptions: [],
                defaultValue: null,
                notFoundMessage: 'Please Type Name or Email'
            },

            groups: {
                selectOptions: [],
                defaultValue: 0
            },
            agents: {
                selectOptions: [],
                defaultValue: null
            },

            ticketForwardFormData: {
                ticket_id: '',
                group_id: '',
                agent_id: '',

            },
            checkDescription : '',
            validationError: {
                group_id: '',



            },
            errors: null,
            timeout: null

        }
        this.Helper = new Helper();
        this.groupChangeHandler         = this.groupChangeHandler.bind(this);

        this.handelSubmit               = this.handelSubmit.bind(this);


    }


    componentDidMount() {
        // $(document).click((e)=>{
        //     console.log(e)
        //     $('.note-editable img').click((e)=>{
        //         console.log(e.target)
        //     })
        // })

        this.setState({dataTableSpinning: true});
        // Edit mode
        if (this.props.match.params.id != undefined) {
            const id = this.props.match.params.id;
            this.getTicket(id).then((response) => {
                if (response.data.status == 404) {
                    sessionStorage.setItem('error', "Ticket not found!");
                    this.props.history.push('/tickets');
                } else {
                    // If ticket Found
                    console.log(response.data.ticket_info);
                    let {ticketForwardFormData} = this.state;
                    let ticketDataForEdit = response.data.ticket_info;

                    ticketForwardFormData.ticket_id = id;
                    // ticketForwardFormData.contact_id = ticketDataForEdit.contact_id;

                    // ticketForwardFormData.group_id = ticketDataForEdit.group_id;
                    // ticketForwardFormData.agent_id = ticketDataForEdit.agent_id;


                    // this.setState({givenFilesContainer: ticketDataForEdit.media}, ()=>{
                    //     this.generateGivenFiles();
                    // });

                    let {contact} = _that.state;
                    contact.selectOptions = [];
                    let defaultOption = buildDefaultOption(ticketDataForEdit.contact_user);
                    contact.selectOptions = defaultOption.selectOptions;
                    contact.defaultValue = defaultOption.defaultValue;
                    this.setState({contact});



                    let {groups} = this.state;
                    groups.defaultValue = ticketDataForEdit.group_id;
                    this.setState({groups});


                    if (ticketDataForEdit.agent_user) {
                        let {agents} = _that.state;
                        agents.selectOptions = [];
                        defaultOption = buildDefaultOption(ticketDataForEdit.agent_user);
                        agents.selectOptions = defaultOption.selectOptions;
                        agents.defaultValue = defaultOption.defaultValue;
                        this.setState({agents});
                    }

                    this.setState({action: 'edit'});
                    this.setState({ticketForwardFormData: ticketForwardFormData}, () => {
                        this.setState({isFormReady: true}, () => {
                            this.setState({dataTableSpinning: false});
                        });
                    });
                }
            });
        } else {
            this.setState({isFormReady: true}, () => {
                this.setState({dataTableSpinning: false});
            });
        }

        let _that = this;

        function buildDefaultOption(user) {
            let obj = {};
            let full_name = _that.Helper.getFullName(user);
            obj.defaultValue = user.id.toString();
            obj.selectOptions = [];
            obj.selectOptions.push(<Option
                value={user.id.toString()}
                key={user.id.toString()}
            >
                <div className="demo-option-label-item">
                    <i className="bi bi-person-circle"></i>
                    <strong> {full_name} </strong> <br/> {user.email}
                </div>
            </Option>);
            return obj;
        }
        // End Edit mode



        let allGroups = this.getAllGroups();
        allGroups.then((response) => {
            let {groups} = this.state;
            let {selectOptions} = groups;
            selectOptions = []; // Reset
            response.data.group_list.map((group) => {
                selectOptions.push(<Option
                    key={group.id}
                    value={group.id}
                >
                    {group.name}
                </Option>);
            });
            groups.selectOptions = selectOptions;
            this.setState({groups});
        });






    }

    async getTicket(id) {
        return await (new Api()).call('GET', API_URL + '/tickets/' + id, [], (new Token()).get());
    }

    async getAllGroups() {
        return await (new Api()).call('GET', API_URL + `/getList/groups?page=*`, [], (new Token()).get());
    }

    async getAgents(groupId) {
        return await (new Api()).call('GET', API_URL + `/getAgentByGroup/` + groupId, [], (new Token()).get());
    }

    groupChangeHandler(value) {
        if (value !== '') {
            let {ticketForwardFormData} = this.state;
            ticketForwardFormData.group_id = value;
            this.setState({ticketForwardFormData}, () => {
                let allAgents = this.getAgents(value);
                allAgents.then((response) => {
                    let {agents} = this.state;
                    let {selectOptions} = agents;
                    selectOptions = []; // Reset
                    response.data.collection.users.map((agent) => {
                        let full_name = this.Helper.getFullName(agent.user_details);
                        selectOptions.push(<Option
                            value={agent.id}
                            key={agent.id}
                            searchableData={full_name + agent.email}
                        >
                            <div className="demo-option-label-item">
                                <i className="bi bi-person-circle"></i>
                                <strong> {full_name} </strong> <br/> {agent.email}
                            </div>
                        </Option>);
                    });
                    agents.selectOptions = selectOptions;
                    this.setState({agents});
                });
            });
        } else {
            let {ticketForwardFormData} = this.state;
            ticketForwardFormData.group_id = '';
            this.setState({ticketForwardFormData});
        }
    }

    onChangeHandler = (event, key) => {
        const {ticketForwardFormData} = this.state;
        ticketForwardFormData[event.target.name] = event.target.value;
        this.setState({ticketForwardFormData});
    }

    handleSelectOnChange = (target, value) => {
        //console.log(value)
        let {ticketForwardFormData} = this.state;
        ticketForwardFormData[target] = value;
        this.setState({ticketForwardFormData});
    }

    validateTicketForwardData() {
        let rules = {
            ticket_id       : Joi.any(),
            group_id        : Joi.number().label('Group').required(),
            agent_id        : Joi.any(),

        }
        return Joi.object(rules);
    }

    async handelSubmit(e) {
        this.setState({submitLoading: true});
        this.setState({forwordButtonText: 'Forwording...'});
        e.preventDefault();
        let schema = this.validateTicketForwardData();

        try {
            let data = await schema.validateAsync(this.state.ticketForwardFormData);
            let response = await (new Api()).call('POST', API_URL + `/ticket-forward`,data, (new Token()).get());
            if (response.data.status_code == 201) {
                sessionStorage.setItem('success', "Ticket Forward Successfully.");
                this.props.history.push('/tickets');
            } else if (response.data.status_code == 400 || response.data.status_code == 424) {
                this.setState({submitLoading: false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }
            this.setState({submitLoading: false});
            this.setState({forwordButtonText: 'Forward Ticket'});
        } catch (err) {
            const {validationError} = this.state;
            this.setState({submitLoading: false});
            this.setState({forwordButtonText: 'Forward Ticket'});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({validationError: validationError});
            validationError[err.details[0].context.key] = '';
        }
    }
  /* makeformData(data) {
        let formData = new FormData();

        formData.append('group_id', data.group_id === null ? 0 : data.group_id );
        let agent_ids = [];
        agent_ids.push(data.agent_id);
        formData.append('agent_id', agent_ids);
        console.log(data.agent_id)
        formData.append('ticket_id',this.props.match.params.id);

        return formData;
    } */

    makeForm() {
        let {locationPath} = this.state

        return <>
         <BreadCrumbs locationPath={locationPath}/>
            <form id="ts-d-create-form" className={"p-1 p-md-5"}>
                {
                    this.state.errors ?
                        <>
                            <div className="text-center p-3">
                                <Alert
                                    message="Something Wrong !"
                                    description={this.state.errors}
                                    type="error"
                                    closable
                                />
                            </div>
                        </>
                        : ''
                }

                <div className="row">
                    <div className="col-lg-6">

                    <div className="form-group">
                            <label>Groups </label>
                            {/*{console.log(this.state.groups.defaultValue)}*/}
                            <Select
                                // defaultValue={this.state.groups.defaultValue}
                                placeholder={"Groups"}
                                onChange={this.groupChangeHandler}
                                style={{width: '100%'}}
                            >
                                {/* <Option
                                    value={0}
                                    searchableData='---'
                                >
                                    ---
                                </Option> */}
                                {this.state.groups.selectOptions}
                            </Select>
                        </div>

                        {
                            this.state.ticketForwardFormData.group_id !== '' ?
                                <div className="form-group ts-d-input-fix">
                                    <label>Agents </label>
                                    <Select
                                     mode="multiple"
                                        showSearch
                                        // defaultValue={this.state.agents.defaultValue}
                                        style={{width: '100%'}}
                                        placeholder="Assign agents to this group"
                                        optionFilterProp="children"
                                        onChange={(value) => this.handleSelectOnChange('agent_id', value)}
                                        filterOption={(input, option) =>
                                            option.searchableData.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        filterSort={(optionA, optionB) =>
                                            optionA.searchableData.toLowerCase().localeCompare(optionB.searchableData.toLowerCase())
                                        }
                                    >
                                        {/* <Option
                                            value={''}
                                            searchableData='---'
                                        >
                                            ---
                                        </Option> */}
                                        {this.state.agents.selectOptions}
                                    </Select>
                                </div> : ''
                        }
                        <div className="col-md-4 col-xs-12 mx-md-auto p-0">
                        <Button onClick={this.handelSubmit} type="primary" loading={this.state.submitLoading}>
                            {this.state.forwordButtonText}
                        </Button>
                    </div>


                    </div>


                </div>

            </form>
        </>
    }

    render() {
        return (
            <>
                <div className="text-center p-1">
                    <Spin size="medium" tip="Please Wait..." spinning={this.state.dataTableSpinning}></Spin>
                </div>
                    {this.state.isFormReady ? this.makeForm() : null}

            </>
        )
    }
}

export default withRouter(ForwardTicketForm);
