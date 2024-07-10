import React, {Component} from 'react'
import {Select, Alert, Spin, Input,Button, Modal, AutoComplete} from 'antd';
import {API_URL, CRM_API} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Helper from '../../services/Helper';
import {withRouter} from "react-router-dom";
import Joi from 'joi';
import $ from 'jquery'
import ReactHtmlParser from 'react-html-parser';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css';
import Auth from '../../services/Auth';

const {Option} = Select;
const {TextArea} = Input;

class TicketForm extends Component {

    constructor() {
        super();
        this.state = {
            isFormReady: false,
            isModalOpen: false,
            isViewModalVisible: false,
            action: 'create',
            dataTableSpinning: false,
            selectedFiles: [],
            givenFilesContainer: [],
            givenFiles: false,
            submitLoading: false,
            mobileSearch: '',
            mobileSearchErr: false,
            mobile: null,
            cif_ids: [],
            acc_nums: [],
            card_nums: [],
            contact: {
                selectOptions: [],
                defaultValue: null,
                notFoundMessage: 'Please Type Name or Email'
            },
            status: {
                selectOptions: [],
                defaultValue: 0
            },
            types: {
                selectOptions: [],
                defaultValue: 0
            },
            subTypes: {
                selectOptions: [],
                defaultValue: 0,
                value: null
            },
            questions: {
                selectOptions: [],
                defaultValue: 0,
                value: null
            },
            priorities: {
                selectOptions: [],
                defaultValue: 0
            },
            groups: {
                selectOptions: [],
                defaultValue: 0
            },
            agents: {
                selectOptions: [],
                defaultValue: null
            },
            source: {
                selectOptions: [],
                defaultValue: 0
            },
            tag: {
                selectOptions: [],
                defaultValue: 0
            },
            ticketFormData: {
                subject: 'Urmi Ticket',
                customer_name: '',
                mobile_no: '',
                address: '',
                customer_id: '',
                customer_type: '',
                type_id: '',
                sub_type_id: '',
                question_id: '',
                pre_question_id: '',
                answer: '',
                crm_user_id: null,
                crm_user_name: null,
                // remarks:'',
                status_id: '',
                priority_id: '',
                group_id: '',
                agent_id: '',
                source_id: '',
                tag_id: '',
                description: {
                    html: ''
                },
                files: []
            },
            checkDescription: '',
            validationError: {
                subject: '',
                contact_id: '',
                type_id: '',
                status_id: '',
                priority_id: '',
            },
            errors: null,
            timeout: null

        }
        // this.remarks_temp = '';
        this.Helper                     = new Helper();
        this.groupChangeHandler         = this.groupChangeHandler.bind(this);
        this.getAndSetContactOptions    = this.getAndSetContactOptions.bind(this);
        this.handelSubmit               = this.handelSubmit.bind(this);
        this.updateTicket               = this.updateTicket.bind(this);
        this.descriptionOnChange        = this.descriptionOnChange.bind(this);
        this.fileOnChange               = this.fileOnChange.bind(this);
        this.addNew                     = this.addNew.bind(this);
        /*this.showModal = this.showModal.bind(this);
        this.handleOk =this.handleOk.bind(this);
        this.handleCancel =this.handleCancel.bind(this);*/
    }

    componentDidMount() {

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
                    let {ticketFormData} = this.state;
                    let ticketDataForEdit = response.data.ticket_info;

                    let {types} = this.state;
                    let {subTypes} = this.state;

                    ticketFormData.subject = ticketDataForEdit.subject;
                    ticketFormData.id = ticketDataForEdit.id;
                    ticketFormData.contact_id = ticketDataForEdit.contact_id;

                    if (ticketDataForEdit.type.parent == null) {
                        // Its a patent and there is no sub type
                        ticketFormData.type_id = ticketDataForEdit.type_id;
                        types.defaultValue = ticketDataForEdit.type_id;
                    } else {

                        // Its a sub type
                        ticketFormData.type_id = types.defaultValue = ticketDataForEdit.type.parent_id == 0 ? /* Type */ ticketDataForEdit.type.id : /* Sub type */ ticketDataForEdit.type.parent_id;
                        ticketFormData.sub_type_id = ticketDataForEdit.type.parent_id != 0 ? ticketDataForEdit.type.id : 0;
                        this.getAndSetSubTypes(ticketDataForEdit.type.parent.id);
                        subTypes.value = subTypes.defaultValue = ticketFormData.sub_type_id;

                    }
                    // Get questions
                    ticketFormData.sub_type_id != 0 ? this.getAndSetQuestion(ticketFormData.sub_type_id) : this.getAndSetQuestion(ticketFormData.type_id);
                    this.setState({types});
                    this.setState({subTypes});
                    ticketFormData.status_id = ticketDataForEdit.status_id;
                    ticketFormData.priority_id = ticketDataForEdit.priority_id;
                    ticketFormData.group_id = ticketDataForEdit.group_id;
                    ticketFormData.question_id = ticketFormData.pre_question_id = ticketDataForEdit.question ? ticketDataForEdit.question.question_id : '';
                    ticketFormData.answer = ticketDataForEdit.question ? ticketDataForEdit.question.answer : '';
                    // ticketFormData.remarks      = this.remarks_temp = ticketDataForEdit.remarks;
                    ticketFormData.agent_id = ticketDataForEdit.agent_id;
                    ticketFormData.source_id = ticketDataForEdit.source_id;
                    ticketFormData.tag_id = ticketDataForEdit.tag_id === null ? 0 : ticketDataForEdit.tag_id;
                    ticketFormData.description = {};
                    ticketFormData.description.html = ticketDataForEdit.description;
                    this.setState({givenFilesContainer: ticketDataForEdit.media}, () => {
                        this.generateGivenFiles();
                    });

                    let {contact} = _that.state;
                    contact.selectOptions = [];
                    let defaultOption = buildDefaultOption(ticketDataForEdit.contact_user);
                    contact.selectOptions = defaultOption.selectOptions;
                    contact.defaultValue = defaultOption.defaultValue;
                    this.setState({contact});

                    let {status} = this.state;
                    status.defaultValue = ticketDataForEdit.status_id;
                    this.setState({status});

                    let {priorities} = this.state;
                    priorities.defaultValue = ticketDataForEdit.priority_id;
                    this.setState({priorities});

                    let {groups} = this.state;
                    groups.defaultValue = ticketDataForEdit.group_id;
                    this.setState({groups});

                    let {questions} = this.state;
                    questions.defaultValue = questions.value = ticketDataForEdit.question ? parseInt(ticketDataForEdit.question.question_id) : null;
                    this.setState({questions});

                    let {source} = this.state;
                    source.defaultValue = ticketDataForEdit.source_id;
                    this.setState({source});

                    let {tag} = this.state;
                    tag.defaultValue = ticketDataForEdit.tag_id;
                    this.setState({tag});

                    if (ticketDataForEdit.agent_user) {
                        let {agents} = _that.state;
                        agents.selectOptions = [];
                        defaultOption = buildDefaultOption(ticketDataForEdit.agent_user);
                        agents.selectOptions = defaultOption.selectOptions;
                        agents.defaultValue = defaultOption.defaultValue;
                        this.setState({agents});
                    }

                    this.setState({action: 'edit'});
                    this.setState({ticketFormData: ticketFormData}, () => {
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
                    <strong> {full_name} </strong> <br/> <i className="bi bi-phone-fill"></i> {user.mobile}
                </div>
            </Option>);
            return obj;
        }

        // End Edit mode

        let allStatus = this.getAllStatus();
        allStatus.then((response) => {
            let {status} = this.state;
            let {selectOptions} = status;
            selectOptions = []; // Reset
            response.data.collections.map((status) => {
                selectOptions.push(<Option
                    key={status.id}
                    value={status.id}
                >
                    {status.name}
                </Option>);
            });
            status.selectOptions = selectOptions;
            this.setState({status});
        });

        let allPriorities = this.getAllPriorities();
        allPriorities.then((response) => {
            let {priorities} = this.state;
            let {selectOptions} = priorities;
            selectOptions = []; // Reset
            response.data.collections.map((priority) => {
                selectOptions.push(<Option
                    key={priority.id}
                    value={priority.id}
                >
                    {priority.name}
                </Option>);
            });
            priorities.selectOptions = selectOptions;
            this.setState({priorities});
        });

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

        let allTypes = this.getAllTypes();
        allTypes.then((response) => {
            let {types} = this.state;
            let {selectOptions} = types;
            selectOptions = []; // Reset
            response.data.collections.map((type) => {
                selectOptions.push(<Option
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </Option>);
            });
            types.selectOptions = selectOptions;
            this.setState({types});
        });

        let allSource = this.getAllSource();
        allSource.then((response) => {
            let {source} = this.state;
            let {selectOptions} = source;
            selectOptions = []; // Reset
            response.data.collections.map((type) => {
                selectOptions.push(<Option
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </Option>);
            });
            source.selectOptions = selectOptions;
            this.setState({source});
        });

        /* let allTag = this.getAllTag();
        allTag.then((response) => {
            let {tag} = this.state;
            let {selectOptions} = tag;
            selectOptions = []; // Reset
            response.data.collections.data.map((type) => {
                selectOptions.push(<Option
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </Option>);
            });
            tag.selectOptions = selectOptions;
            this.setState({tag});
        }); */

        if (typeof this.props.match.params.cli != 'undefined') {
            this.handleContactSearch(this.props.match.params.cli);
        }

        // For CRM agent user
        sessionStorage.removeItem('crm_user_id');
        sessionStorage.removeItem('crm_user_name');
        let agentInfo = this.getCrmAgentInfo();
        let _this = this;
        agentInfo.then(function(response){
            if(response.data){
                let id = response.data.split(":");
                if(id[0] == 'AGENT_ID'){
                    let {ticketFormData} = _this.state;
                    ticketFormData.crm_user_id = id[1];
                    sessionStorage.setItem('crm_user_id', id[1]);
                    if( id[2] ){
                        ticketFormData.crm_user_name = id[2];
                        sessionStorage.setItem('crm_user_name', id[2]);
                    }
                    _this.setState({ticketFormData});
                }
            }
        });

    }
    
    async getCrmAgentInfo(){
        return await (new Api()).call('GET', CRM_API + '?TYPE=GET_AGENT_INFO', [], (new Token()).get());
    }

    async getTicket(id) {
        return await (new Api()).call('GET', API_URL + '/tickets/' + id, [], (new Token()).get());
    }

    async getAllStatus() {
        return await (new Api()).call('GET', API_URL + `/getList/statuses?page=*`, [], (new Token()).get());
    }

    async getAllPriorities() {
        return await (new Api()).call('GET', API_URL + `/getList/priorities?page=*`, [], (new Token()).get());
    }

    async getAllGroups() {
        return await (new Api()).call('GET', API_URL + `/getList/groups?page=*`, [], (new Token()).get());
    }

    async getAllTypes() {
        return await (new Api()).call('GET', API_URL + `/getList/types?page=*`, [], (new Token()).get());
    }

    async getAgents(groupId) {
        return await (new Api()).call('GET', API_URL + `/getAgentByGroup/` + groupId, [], (new Token()).get());
    }

    async getAllSource() {
        return await (new Api()).call('GET', API_URL + `/getList/sources?page=*`, [], (new Token()).get());
    }

    async getAllTag() {
        return await (new Api()).call('GET', API_URL + `/getList/tags?page=*`, [], (new Token()).get());
    }

    generateGivenFiles() {
        let {givenFiles} = this.state;
        givenFiles = [];
        this.state.givenFilesContainer.forEach((media, key) => {
            let fileName = /[^/]*$/.exec(media.url)[0];

            givenFiles.push(<div className="ts-d-show-attach-files">
                <span>{fileName}</span>
                <span onClick={() => this.removeGivenFiles(fileName)}> X </span>
            </div>);
        });
        this.setState({givenFiles});
    }

    removeGivenFiles(name) {
        let {givenFilesContainer} = this.state;
        givenFilesContainer.forEach((media, key) => {
            let fileName = /[^/]*$/.exec(media.url)[0];
            if (fileName === name) {
                givenFilesContainer.splice(key, 1);
            }
        });
        this.setState({givenFilesContainer}, () => {
            this.generateGivenFiles();
        });
    }

    async getAndSetContactOptions(query, callback) {
        if (this.state.timeout) {
            clearTimeout(this.state.timeout);
            this.state.timeout = null;
        }
        let {contact} = this.state;
        let selectOptions = [];
        let defaultValue = '';
        let _this = this;
        let mobile = null;

        // Reset
        contact.selectOptions = [];
        contact.notFoundMessage = 'Searching...';
        callback(contact);

        async function call() {
            let response = await (new Api()).call('POST', API_URL + `/user/search?query=` + query, [], (new Token()).get());
            defaultValue = ' ';
            if (response.data.listing) {
                response.data.listing.map((contact) => {
                    let full_name = _this.Helper.getFullName(contact);
                    defaultValue = contact.id;
                    mobile = contact.mobile;
                    selectOptions.push(<Option
                        value={contact.id}
                        key={contact.id}
                    >
                        <div className="demo-option-label-item">
                            <i className="bi bi-person-circle"></i>
                            <strong> {full_name} </strong> <br/>
                            <i className="bi bi-phone-fill"></i> {contact.mobile}
                        </div>
                    </Option>);
                });
            }
            contact.selectOptions = selectOptions;
            contact.defaultValue = defaultValue.toString();
            let regCustomer = await _this.getOrRegisterCustomer(mobile);
            _this.setState({mobile});
            if(Array.isArray(regCustomer.data.customer_ids) && regCustomer.data.customer_ids.length){
                _this.setCifOptions(regCustomer.data.customer_ids);
            }
            let {ticketFormData} = _this.state;
            ticketFormData['contact_id'] = defaultValue;
            _this.setState({ticketFormData});
            contact.notFoundMessage = 'Not Found!';
            callback(contact);
        }

        this.state.timeout = setTimeout(call, 500);
    }

    onChangeHandler = (event, key) => {
        const {ticketFormData} = this.state;
        ticketFormData[event.target.name] = event.target.value;

        /* switch(event.target.name) {
            case "answer":
                ticketFormData.remarks = this.remarks_temp + '\n' + event.target.value;
                break;
            case "remarks":
                this.remarks = event.target.value;
                break;
        } */

        this.setState({ticketFormData});
    }

    groupChangeHandler(value) {
        if (value !== 0) {
            let {ticketFormData} = this.state;
            ticketFormData.group_id = value;
            this.setState({ticketFormData}, () => {
                let allAgents = this.getAgents(value);
                allAgents.then((response) => {
                    let {agents} = this.state;
                    let {selectOptions} = agents;
                    selectOptions = []; // Reset
                    response.data.collection.users.map((agent) => {
                        let full_name = this.Helper.getFullName(agent.user_details);
                        // console.log(agent);
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
            let {ticketFormData} = this.state;
            ticketFormData.group_id = '';
            this.setState({ticketFormData});
        }
    }

    handleContactSearch = query => {
        if (query) {
            let {ticketFormData} = this.state;
            if (query.length > 0) {
                this.getAndSetContactOptions(query, contact => this.setState({contact}));
            } else {
                ticketFormData.contact_id = [];
                this.setState({ticketFormData});
            }
        }
    }

    async getSubTypes(type_id) {

        return await (new Api()).call('GET', API_URL + '/getList/sub-types/' + type_id, [], (new Token()).get());

    }

    async getQuestions(type_id) {

        return await (new Api()).call('GET', API_URL + '/getQuestionsByCategory/' + type_id, [], (new Token()).get());

    }

    handleSelectOnChange = (target, value) => {
        let {ticketFormData} = this.state;
        ticketFormData[target] = value;
        let {subTypes} = this.state;
        let {questions} = this.state;
        let _this = this;

        switch (target) {
            // Get sub type
            case "type_id":
                this.getAndSetSubTypes(value);
                subTypes.value = null;
                this.setState({subTypes});
                questions.value = null;
                this.setState({questions});
                ticketFormData.type_id = value;
                // reset others value
                ticketFormData.sub_type_id = '';
                ticketFormData.question_id = '';
                ticketFormData.answer = '';
                this.getAndSetQuestion(value);
                break;
            case "sub_type_id":
                this.getAndSetQuestion(value);
                subTypes.value = value;
                ticketFormData.sub_type_id = value;
                this.setState({subTypes});
                break;
            case "question_id":
                questions.value = value;
                this.setState({questions});
                break;
            // case "cif_id":
            //     ticketFormData['cif_id'] = value;
            //     if( value != '' ){
            //         let accounts = this.getAccountByCustomerId(value);
            //         accounts.then(function(info){
            //             if(Array.isArray(info.data) && info.data.length){
            //                 _this.setAccNoOptions(info.data);
            //             }
            //         });

            //         let cards = this.getCardsByCustomerId(value);
            //         cards.then(function(card){
            //             if(Array.isArray(card.data) && card.data.length){
            //                 _this.setCardNoOptions(card.data);
            //             }
            //         });
            //     }
            //     break;
            // case "account_no":
            //     ticketFormData['account_no'] = value;
            //     break;
            // case "card_no":
            //     ticketFormData['card_no'] = value;
            //     break;
            // Get contact information
            case "contact_id":
                // Reset fields
                // ticketFormData.account_no   = '';
                // ticketFormData.card_no      = '';
                // ticketFormData.cif_id       = '';
                this.setState({cif_ids : []});
                this.setState({acc_nums : []});
                this.setState({card_nums : []});
                
                this.getUser(value).then(async function (response) {
                    let regCustomer = await _this.getOrRegisterCustomer(response.data.user_info.mobile);
                    _this.setState({mobile: response.data.user_info.mobile});
                    if(Array.isArray(regCustomer.data.customer_ids) && regCustomer.data.customer_ids.length){// If customer id exist
                        _this.setCifOptions(regCustomer.data.customer_ids);
                    }
                    /* ticketFormData.account_no = response.data.user_info.account_no ?? '';
                    ticketFormData.card_no = response.data.user_info.card_no ?? '';
                    ticketFormData.cif_id = response.data.user_info.cif_id ?? '';
                    _this.setState({ticketFormData}); */
                });
                break;
        }
        this.setState({ticketFormData});

    }

    async getUser(user_id) {

        return await (new Api()).call('GET', API_URL + '/user/' + user_id, [], (new Token()).get());

    }

    getAndSetQuestion(type_id) {
        let questions = this.getQuestions(type_id);
        questions.then((response) => {
            let {questions} = this.state;
            let {selectOptions} = questions;
            selectOptions = []; // Reset
            response.data.collections.map((question) => {
                selectOptions.push(<Option
                    key={question.id}
                    value={question.id}
                >
                    {question.question}
                </Option>);
            });
            questions.selectOptions = selectOptions;
            this.setState({questions});
        });
    }

    getAndSetSubTypes(type_id) {
        let sub_types = this.getSubTypes(type_id);
        sub_types.then((response) => {
            let {subTypes} = this.state;
            let {selectOptions} = subTypes;
            selectOptions = []; // Reset
            response.data.collections.data.map((type) => {
                selectOptions.push(<Option
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </Option>);
            });
            subTypes.selectOptions = selectOptions;
            this.setState({subTypes});
        });
    }

    validateTicketData(additionalRule = null) {
        let rules = {
            subject: Joi.string().min(3).max(200).label('Title').required().messages({
                'string.empty': `Title cannot be an empty`
            }),
            contact_id: Joi.number().label('Contact').required().messages({
                'number.empty': `Contact cannot be an empty`,
                // 'number.min': `"a" should have a minimum length of {#limit}`,
                // 'any.required': `"a" is a required`
            }),
            type_id: Joi.number().label('Type').required().messages({
                'number.empty': `Type cannot be an empty`
            }),
            // status_id: Joi.number().label('Status').required().messages({
            //     'number.empty': `Status cannot be an empty`
            // }),
            priority_id: Joi.number().label('Priorities').required().messages({
                'number.empty': `Priorities cannot be an empty`
            }),
            group_id: Joi.number().label('Group').required().messages({
                'number.empty': `Priorities cannot be an empty`
            }),
            status_id: Joi.any(),
            source_id: Joi.any(),
            crm_user_id: Joi.any(),
            crm_user_name: Joi.any(),
            sub_type_id: Joi.any(),
            question_id: Joi.any(),
            pre_question_id: Joi.any(),
            answer: Joi.any(),
            // remarks         : Joi.any(),
            agent_id: Joi.any(),
            description: Joi.any(),
            tag_id: Joi.any(),
            files: Joi.any()
        }
        if (this.state.action === 'edit') {
            rules.status_id = Joi.number().label('Status').required().messages({
                'number.empty': `Status cannot be empty`
            });
        } else {
            rules.status_id = Joi.any();
        }
        rules = {...rules, ...additionalRule};
        // console.log('rules', rules)
        return Joi.object(rules);
    }

    async handelSubmit(e) {
        this.setState({submitLoading: true});
        e.preventDefault();
        let schema = this.validateTicketData();

        try {
            let data = await schema.validateAsync(this.state.ticketFormData);

            let formData = this.makeformData(data);
            let response = await (new Api()).call('POST', API_URL + `/tickets`, formData, (new Token()).get());
            if (response.data.status == 201) {
                sessionStorage.setItem('success', "Ticket Created Successfully.");
                if (!(new Auth()).isApiUser()) {
                    this.props.history.push('/tickets');
                } else {
                    this.props.history.push('/crm/crm-ticket-reply/' + response.data.info.id + '/' + (new Token()).get());
                }
            } else if (response.data.status == 400 || response.data.status == 424) {
                this.setState({submitLoading: false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }
            this.setState({submitLoading: false});
        } catch (err) {
            const {validationError} = this.state;
            this.setState({submitLoading: false});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({validationError: validationError});
            validationError[err.details[0].context.key] = '';
        }
    }

    async updateTicket(e) {
        this.setState({submitLoading: true});
        e.preventDefault();
        let additionalRule = {
            id: Joi.any()
        };
        let schema = this.validateTicketData(additionalRule);
        try {
            let data = await schema.validateAsync(this.state.ticketFormData);
            let formData = this.makeformData(data);
            formData.append('givenFilesContainer', JSON.stringify(this.state.givenFilesContainer));
            formData.append('_method', "PUT");
            let response = await (new Api()).call('POST', API_URL + '/tickets/' + this.state.ticketFormData.id, formData, (new Token()).get());
            if (response.data.status == 200) {
                sessionStorage.setItem('success', "Ticket Updated Successfully.");
                this.props.history.push('/tickets');
            } else if (response.data.status == 424) {
                this.setState({submitLoading: false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }
            this.setState({submitLoading: false});
        } catch (err) {
            const {validationError} = this.state;
            this.setState({submitLoading: false});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({validationError: validationError});
            validationError[err.details[0].context.key] = '';
        }
    }

    fileOnChange(file) {
        let {ticketFormData} = this.state;
        // let {selectedFiles} = this.state;

        for (let i = 0; i < file.target.files.length; i++) {
            ticketFormData.files.push(file.target.files[i]);
            // selectedFiles.push(<div>{file.target.files[i].name}<span onClick={()=>this.removeSelectedFile(i)}> X</span></div>);
        }

        this.setState({ticketFormData}, () => {
            this.showSelectedFiles();
        });
        // this.setState({selectedFiles});
    }

    showSelectedFiles(removeItem = false) {
        let {ticketFormData} = this.state;
        let {selectedFiles} = this.state;
        selectedFiles = [];

        if (removeItem) {
            ticketFormData.files.forEach((obj, key) => {
                if (obj.name === removeItem) {
                    ticketFormData.files.splice(key, 1);
                }
            });
        }

        for (let i = 0; i < ticketFormData.files.length; i++) {
            selectedFiles.push(<div className="ts-d-show-attach-files"><span>{ticketFormData.files[i].name}</span> <span
                onClick={() => this.removeSelectedFile(ticketFormData.files[i].name)}> X </span>
            </div>);
        }

        this.setState({selectedFiles});
    }

    removeSelectedFile(name) {
        this.showSelectedFiles(name);
    }

    makeformData(data) {

        let formData = new FormData();
        formData.append('subject', data.subject);
        formData.append('customer_name', data.customer_name);
        formData.append('mobile_no', data.mobile_no);
        formData.append('address', data.address);
        formData.append('customer_id', data.customer_id);
        formData.append('customer_type', data.customer_type);
        formData.append('sub_type_id', data.sub_type_id);
        formData.append('type_id', data.type_id);
        formData.append('question_id', data.question_id);
        formData.append('pre_question_id', data.pre_question_id);
        formData.append('answer', data.answer);
        // formData.append('remarks',      data.remarks);
        if (this.state.action === 'edit') {
            formData.append('status_id', data.status_id);

        }
        formData.append('priority_id', data.priority_id);
        formData.append('group_id', data.group_id === null ? 0 : data.group_id);
        formData.append('agent_id', data.agent_id);
        formData.append('crm_user_id', data.crm_user_id);
        formData.append('crm_user_name', data.crm_user_name);
        formData.append('source_id', data.source_id === null ? 0 : data.source_id);
        formData.append('tag_id', data.tag_id === null ? 0 : data.tag_id);
        formData.append('description', data.description.html);
        for (let i = 0; i < data.files.length; i++) {
            formData.append(`file[${i}]`, data.files[i])
        }
        return formData;
    }

    descriptionOnChange(content) {
        let {ticketFormData} = this.state;
        let desc = {html: content};
        ticketFormData.description = desc;
        this.setState({ticketFormData});
    }

    onImageUpload = (files) => {
        // console.log(files)
        this.uploadImage(files);
    }

    uploadImage(image) {

        let data = new FormData();

        for (let i = 0; i < image.length; i++) {
            data.append("file", image[i]);
            data.append("attachment_save_path", 'ticket/media');

            $.ajax({
                data: data,
                type: "POST",
                url: `${API_URL}/ticket/upload-files`,
                headers: {
                    'Authorization': 'Bearer ' + (new Token()).get()
                },
                cache: false,
                contentType: false,
                processData: false,
                dataType: 'json',
                success: function (data) {
                    if (data.status_code == 200) {
                        ReactSummernote.insertImage(data.file_path, $image => {
                            $image.css("width", Math.floor($image.width() / 2));
                            $image.attr("alt", data.file_path.split("/").pop());
                            // $image.attr("id", "image_"+i);
                        });
                    }
                }
            });
        }

    }

    /* const showModal = () => {
        this.setState({IsModalOpen:true})
    }; */
    handleOk = () => {
        // this.setState({IsModalOpen:false});
    };
    handleCancel = () => {
        this.setState({mobileSearch: ''});
        this.setState({mobileSearchErr: null});
        this.setState({isViewModalVisible: false});
    };

    resetModal() {
        this.setState({mobileSearch: ''});
        this.setState({mobileSearchErr: null});
        this.setState({isViewModalVisible: false});
        this.setState({viewSpinning: false});
        this.setState({isViewTableReady: false});
        this.setState({submitLoading: false});
        this.setState({targetedUser: null});
        this.setState({errors: null});
    }

    addNew(){
        this.setState({isViewModalVisible: true});
    }

    async searchForNonRegisterCustomer(){
        this.setState({submitLoading: true});
        let response = await this.getOrRegisterCustomer(this.state.mobileSearch);
        // console.log( response );
        if( response.data.user_info && response.data.user_info.status == 200 ){
            let {contact} = this.state;
            contact.defaultValue = null;
            this.setState({contact});
            this.handleContactSearch( response.data.user_info.user_created.mobile );
            if(Array.isArray(response.data.customer_ids) && response.data.customer_ids.length){// If customer id exist
                this.setCifOptions(response.data.customer_ids);
            }
            this.resetModal();
        }else if( response.data.user_info && response.data.user_info.errors != undefined ){
            this.setState({submitLoading: false});
            this.setState({mobileSearchErr: (new Helper).arrayToErrorMessage( response.data.user_info.errors )});
        }
    }

    async getOrRegisterCustomer(mobile){
        return await (new Api()).call('GET', CRM_API + '?TYPE=STORE_CUSTOMER&CLI=' + mobile, [], (new Token()).get());
    }

    async getAccountByCustomerId(id){
        return await (new Api()).call('GET', CRM_API + '?TYPE=GET_ACCOUNT_BY_ID&CLI=' + this.state.mobile + '&CID=' + id, [], (new Token()).get());
    }

    async getCardsByCustomerId(id){
        return await (new Api()).call('GET', CRM_API + '?TYPE=GET_CARD_BY_ID&CLI=' + this.state.mobile + '&CID=' + id, [], (new Token()).get());
    }

    setCifOptions(customer_ids){
        let {cif_ids} = this.state;
        cif_ids = [];
        customer_ids.forEach(function(item, index){
            cif_ids.push({value: item});
        });
        this.setState({cif_ids});
    }

    setAccNoOptions(accounts){
        let {acc_nums} = this.state;
        acc_nums = [];
        accounts.forEach(function(item, index){
            acc_nums.push({value: item});
        });
        this.setState({acc_nums});
    }

    setCardNoOptions(accounts){
        let {card_nums} = this.state;
        card_nums = [];
        accounts.forEach(function(item, index){
            card_nums.push({value: item});
        });
        this.setState({card_nums});
    }

    getContactDom() {

        return <>
            <div className="ts-create-contact">
                <div>
                    <label><i className="bi bi-star-fill"></i> Contact</label>
                    {
                        typeof this.props.match.params.cli == 'undefined' || this.state.contact.defaultValue ? 
                        <>
                            <Select
                                showSearch
                                placeholder={"Contact"}
                                style={{width: '100%'}}
                                defaultValue={this.state.contact.defaultValue}
                                defaultActiveFirstOption={false}
                                filterOption={false}
                                onSearch={this.handleContactSearch}
                                onChange={(value) => this.handleSelectOnChange('contact_id', value)}
                                notFoundContent={this.state.contact.notFoundMessage}
                            >
                                {this.state.contact.selectOptions}
                            </Select>
                            <small className="text-danger">{this.state.validationError.contact_id}</small>
                        </>
                        : 
                        <> Loading ... <a href="#" onClick={(e)=>{ e.preventDefault(); let {contact} = this.state; contact.defaultValue = ' '; this.setState({contact}); }}><small>x (Cancel)</small></a></>
                    }
                </div>

                <div className="ts-create-contact-button">
                    <span onClick={this.addNew} className="btn"><i className="bi bi-plus-circle-fill"></i></span>
                </div>
            </div>

            <Modal
                zIndex="1050"
                width={500}
                centered
                title={'Quick Contact Create'}
                visible={this.state.isViewModalVisible}
                onOk={this.handleOk}
                footer={[
                    <Button key="back" onClick={this.handleCancel}>
                        Close
                    </Button>,
                    <Button
                        loading={this.state.submitLoading}
                        key="Store"
                        type="primary"
                        onClick={() => this.searchForNonRegisterCustomer()}
                    >
                        Submit
                    </Button>
                ]}
                bodyStyle={{paddingLeft: '5vmin', paddingRight: '5vmin'}}
                onCancel={this.handleCancel}>

                <label htmlFor="ts-d-ticket-acc-no">Mobile</label>
                <input type="text" className="form-control" id="ts-d-ticket-acc-no"
                        placeholder={"Mobile"}
                        name="mobile"
                        onChange={(e,k)=>{ this.setState({mobileSearch: e.target.value}) }}
                        value={this.state.mobileSearch}/>
                {this.state.mobileSearchErr ? <strong className='text-danger'>{ this.state.mobileSearchErr }</strong> : null}

                {/* {
                    this.state.errors ?
                        <>
                            <Alert
                                message="Something Wrong !"
                                description={this.state.errors}
                                type="error"
                                closable
                            />
                        </>
                        : ''
                } */}

                {/* <div className="spinner-centered mt-2">
                    <div className="text-center">
                        <Spin size="large" spinning={this.state.viewSpinning}></Spin>
                    </div>
                    {this.state.isViewTableReady ? this.getModalView() : ''}
                </div> */}
            </Modal>
        </>;
    }

    makeForm() {
        return <>
            <form id="ts-d-create-form" className={"p-2 p-md-5"}>
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

                <div className="form-row">

                    <div className="form-group col-lg-6 ts-d-input-fix">
                        {
                            this.getContactDom()
                        }
                    </div>
                    {/* <div className="form-group col-lg-6">
                        <label htmlFor="ts-d-ticket-user"><i className="bi bi-star-fill"></i>Customer Name</label>
                        <input type="text" 
                            className="form-control" 
                            id="ts-d-customer_name" 
                            placeholder={"Customer Name"}
                            name="customer_name" 
                            onChange={this.onChangeHandler}
                            value={this.state.ticketFormData.customer_name}
                        />

                    </div> */}
                    {/* <div className="form-group col-lg-6">
                        <label htmlFor="ts-d-ticket-user"><i className="bi bi-star-fill"></i>Mobile NO</label>
                        <input type="text" 
                            className="form-control" 
                            id="ts-d-mobile_no" 
                            placeholder={"Mobile NO"}
                            name="mobile_no" 
                            onChange={this.onChangeHandler}
                            value={this.state.ticketFormData.mobile_no}
                        />
                        <small className="text-danger">{this.state.validationError.subject}</small>

                    </div> */}
                    {/* <div className="form-group col-lg-6">

                        <label htmlFor="ts-d-ticket-answer">Address</label>
                        <TextArea
                            rows={2}
                            placeholder="Address"
                            id="ts-d-address"
                            name="address"
                            onChange={this.onChangeHandler}
                            value={this.state.ticketFormData.address}
                        />
                        <small className="text-danger">{this.state.validationError.answer}</small>

                    </div> */}
                    {/* <div className="form-group col-lg-6">
                        <label htmlFor="ts-d-ticket-user">Customer Id</label>
                        <input type="text" 
                            className="form-control" 
                            id="ts-d-customer_id" 
                            placeholder={"Customer Id"}
                            name="customer_id" 
                            onChange={this.onChangeHandler}
                            value={this.state.ticketFormData.customer_id}
                        />
                        <small className="text-danger">{this.state.validationError.subject}</small>

                    </div> */}
                    {/* <div className="form-group col-lg-6 d-flex align-items-center">Customer Type:
                        <div className="mx-2"></div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="customer_type1" name="customer_type" value="N" onChange={this.onChangeHandler} checked={this.state.ticketFormData.customer_type === "N"}/>
                            <label className="form-check-label" htmlFor="customer_type1">New Customer</label>
                        </div>
                        <div className="mx-2"></div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" id="customer_type2" name="customer_type" value="R" onChange={this.onChangeHandler} checked={this.state.ticketFormData.customer_type === "R"} />
                            <label className="form-check-label" htmlFor="customer_type2">Registered Customer</label>
                        </div>
                    </div> */}
                    <div className="form-group col-lg-6">
                        <label><i className="bi bi-star-fill"></i>Category </label>
                        <Select
                            defaultValue={this.state.types.defaultValue}
                            placeholder={"Category"}
                            onChange={(value) => this.handleSelectOnChange('type_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.types.selectOptions}
                        </Select>
                        <small className="text-danger">{this.state.validationError.type_id}</small>
                    </div>

                    <div className="form-group col-lg-6">
                        <label>Sub Category </label>
                        <Select
                            value={this.state.subTypes.value}
                            defaultValue={this.state.subTypes.defaultValue}
                            placeholder={"Sub Category"}
                            onChange={(value) => this.handleSelectOnChange('sub_type_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.subTypes.selectOptions}
                        </Select>
                        <small className="text-danger">{this.state.validationError.type_id}</small>
                    </div>

                    <div className="form-group col-lg-6">

                        <label htmlFor="ts-d-ticket-question">Question</label>
                        <Select
                            defaultValue={this.state.questions.defaultValue}
                            placeholder={"Question"}
                            value={this.state.questions.value}
                            onChange={(value) => this.handleSelectOnChange('question_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.questions.selectOptions}
                        </Select>

                    </div>

                    <div className="form-group col-lg-6">

                        <label htmlFor="ts-d-ticket-answer">Answer</label>
                        <TextArea
                            rows={2}
                            placeholder="Answer"
                            id="ts-d-ticket-answer"
                            name="answer"
                            onChange={this.onChangeHandler}
                            value={this.state.ticketFormData.answer}
                        />
                        <small className="text-danger">{this.state.validationError.answer}</small>

                    </div>

                    {/* <div className="form-group col-lg-12">

                                <label htmlFor="ts-d-ticket-remarks">Remarks</label>
                                <TextArea
                                    rows={4}
                                    placeholder="Remarks"
                                    value={this.state.ticketFormData.remarks}
                                    name="remarks"
                                    onChange={this.onChangeHandler}
                                />
                                <small className="text-danger">{this.state.validationError.remarks}</small>

                            </div> */}

                    <div className="form-group col-lg-6">
                        <label><i className="bi bi-star-fill"></i>Priorities </label>
                        <Select
                            defaultValue={this.state.priorities.defaultValue}
                            placeholder={"Priorities"}
                            onChange={(value) => this.handleSelectOnChange('priority_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.priorities.selectOptions}
                        </Select>
                        <small className="text-danger">{this.state.validationError.priority_id}</small>
                    </div>

                    {this.state.action === 'edit' && (
                    <div className="form-group col-lg-6">
                        <label><i className="bi bi-star-fill"></i>Status </label>
                        <Select
                            defaultValue={this.state.status.defaultValue}
                            placeholder={"Status"}
                            onChange={(value) => this.handleSelectOnChange('status_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={0}
                                searchableData='---'
                                disabled={true}
                            >
                                --Select--
                            </Option>
                            {this.state.status.selectOptions}
                        </Select>
                        <small className="text-danger">{this.state.validationError.status_id}</small>
                    </div>
                    )}
                    {
                        // If ticket already created the group will not be changed, it can be forward to another group
                        this.state.action !== 'edit' ?
                            <>
                                <div className="form-group col-lg-6">
                                    <label><i className="bi bi-star-fill"></i>Groups </label>
                                    {/*{console.log(this.state.groups.defaultValue)}*/}
                                    <Select
                                        defaultValue={this.state.groups.defaultValue}
                                        placeholder={"Groups"}
                                        onChange={this.groupChangeHandler}
                                        style={{width: '100%'}}
                                    >
                                        <Option
                                            // value={this.state.groups.defaultValue === '' ? 0 : this.state.groups.defaultValue}
                                            value={0}
                                            searchableData='---'
                                            disabled={true}
                                        >
                                            --Select--
                                        </Option>
                                        {this.state.groups.selectOptions}
                                    </Select>
                                    <small className="text-danger">{this.state.validationError.group_id}</small>
                                </div>

                                <div className="form-group col-lg-6 ts-d-input-fix">
                                    <label>Agents </label>
                                    <Select
                                        showSearch
                                        defaultValue={this.state.agents.defaultValue}
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
                                        <Option
                                            value={''}
                                            searchableData='---'
                                        >
                                            ---
                                        </Option>
                                        {this.state.agents.selectOptions}
                                    </Select>
                                </div>
                            </>
                            : null
                    }

                    <div className="form-group col-lg-6">
                        <label>Source </label>
                        <Select
                            defaultValue={this.state.source.defaultValue}
                            placeholder={"Source"}
                            onChange={(value) => this.handleSelectOnChange('source_id', value)}
                            style={{width: '100%'}}
                        >
                            <Option
                                value={this.state.source.defaultValue === '' ? 0 : this.state.source.defaultValue}
                                searchableData='---'
                            >
                                ---
                            </Option>
                            {this.state.source.selectOptions}
                        </Select>
                    </div>

                    {/* <div className="form-group">
                            <label>Tag </label>
                            <Select
                                defaultValue={this.state.tag.defaultValue}
                                placeholder={"Tag"}
                                onChange={(value) => this.handleSelectOnChange('tag_id', value)}
                                style={{width: '100%'}}
                            >
                                <Option
                                    value={this.state.tag.defaultValue === '' ? 0 : this.state.tag.defaultValue}
                                    searchableData='---'
                                >
                                    ---
                                </Option>
                                {this.state.tag.selectOptions}
                            </Select>
                        </div> */}
                    {/* <div className="text-danger">{this.state.validationError.files}</div> */}

                    <div className="form-group col-lg-6">

                        <label htmlFor="ts-d-ticket-user"><i className="bi bi-star-fill"></i>Title</label>
                        <input type="text" 
                               className="form-control" 
                               id="ts-d-ticket-user" 
                               placeholder={"Title"}
                               name="subject" 
                               onChange={this.onChangeHandler}
                               value={this.state.ticketFormData.subject}
                        />
                        <small className="text-danger">{this.state.validationError.subject}</small>

                    </div>
                    <div className="col-lg-12">
                        <div className="form-group ts-d-textarea-fix">
                            <label htmlFor="ts-d-descriptions">
                                Description
                            </label>
                            <ReactSummernote
                                // children={<div dangerouslySetInnerHTML={{__html: this.state.ticketFormData.description.html}}></div>}
                                children={ReactHtmlParser(this.state.ticketFormData.description.html)}
                                options={{
                                    placeholder: 'Write here!',
                                    lang: 'en-US',
                                    height: 300,
                                    dialogsInBody: true,
                                    toolbar: [
                                        ['style', ['style']],
                                        ['font', ['bold', 'underline', 'clear', 'strikethrough', 'superscript', 'subscript']],
                                        ['fontname', ['fontname']],
                                        ['para', ['ul', 'ol', 'paragraph']],
                                        ['table', ['table']],
                                        ['color', ['color']],
                                        ['insert', ['link', 'picture', 'video']],
                                        ['view', ['fullscreen', 'codeview']],
                                        ['height', ['height']],
                                        ['fontsize', ['fontsize']]
                                    ]
                                }}
                                onChange={this.descriptionOnChange}

                                onImageUpload={this.onImageUpload}
                                onFocus={(e) => {
                                    this.state.checkDescription = e.target;
                                }}

                                // removeMedia={(e)=>{
                                //     console.log(e)
                                // }}

                                shouldComponentUpdate={() => {
                                }}
                            />
                        </div>
                        <div className="form-group">

                            <label className="ts-d-attachment" htmlFor="ts-d-attachment">
                                <input type="file" name="" id="ts-d-attachment"
                                       onChange={(file) => this.fileOnChange(file)} multiple/>
                                <span className="ts-d-attachment-text">Attachments</span>
                                <p className="ts-d-attachment-button">
                                    <span>Attach File</span>
                                    <span className="bi bi-upload"> </span>
                                </p>
                            </label>

                            <p className="text-right w-100">
                                <small>File Allow: jpg, png, doc, pdf</small>
                            </p>

                        </div>

                        <div className="ts-d-attach-file-list mb-4">
                            {/* Uploaded files */}
                            {
                                this.state.selectedFiles
                            }
                            {/* End Uploaded files */}
                        </div>
                        {
                            this.state.givenFiles ?
                                <>
                                    <p>Given Files :</p>
                                    <div className="ts-d-attach-file-list mb-4">
                                        {/* Given files */}
                                        {
                                            this.state.givenFiles
                                        }
                                        {/* End Given files */}
                                    </div>
                                </>
                                : null
                        }

                    </div>
                    <div className="col-md-3 mx-md-auto">
                        <Button
                            className="ts-common-btn" type="submit"
                            onClick={this.state.action === 'create' ? this.handelSubmit : this.updateTicket}
                            loading={this.state.submitLoading}
                            disabled={this.state.submitLoading}
                        >
                            {this.state.action === 'create' ? 'Create' : 'Update'} Ticket
                        </Button>
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

export default withRouter(TicketForm);
