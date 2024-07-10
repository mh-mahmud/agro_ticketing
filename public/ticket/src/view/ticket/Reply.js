import React, { Component } from 'react'
import {Tooltip, Select,Alert} from 'antd';
import {API_URL, TICKET_REPLY_CHECK_INTERVAL} from "../../Config";
import Api from '../../services/Api';
import Token from '../../services/Token';
import Helper from '../../services/Helper';
import Joi from 'joi';
import {withRouter} from "react-router-dom";
import ScrollToBottom from 'react-scroll-to-bottom';
import { Input, Spin } from 'antd';
import {BellOutlined } from '@ant-design/icons';
import NO_PHOTO from "../../assets/images/no-photo.png";
import Auth from '../../services/Auth';

const { TextArea } = Input;
const { Option } = Select;
const icon = <BellOutlined />;

class Reply extends Component {
    
    constructor(props){
        super(props);
        this.messagesEnd = React.createRef();
        this.state = {
            ticket              : {},
            isMessageViewReady  : false,
            messageView         : [],
            question            : null,
            fileSpinning        : false,
            action              : 'create',
            errors              : null,
            ticketReplyFormData: {
                messages: '',
                crm_user_id  : null,
                crm_user_name  : null,
            },
            validationError: {
                messages: '',
            },
            cannedMessages: {
                selectOptions   : [],
                defaultValue    : "Select Canned Message"
            },
        }
        this.Helper = new Helper();
        this.handelReplySubmit      = this.handelReplySubmit.bind(this);
        this.handleKeypress         = this.handleKeypress.bind(this);
        this.cannedMessageOnChange  = this.cannedMessageOnChange.bind(this);
    }  

    async getAllCannedMessages() {
        return await (new Api()).call('GET', API_URL + `/canned-messages?page=*`, [], (new Token()).get());
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidMount(){

        let allCannedMessages = this.getAllCannedMessages();
        allCannedMessages.then((response) => {
            let {cannedMessages} = this.state;
            let {selectOptions} = cannedMessages;
            selectOptions = []; // Reset
            response.data.collections.map((cannedMessage) => {
                selectOptions.push(<Option
                    key={cannedMessage.id}
                    value={cannedMessage.description}
                >
                    {cannedMessage.title}
                </Option>);
            });
            cannedMessages.selectOptions = selectOptions;
            this.setState({cannedMessages});
        });

        this.setState({isMessageViewReady: false});
        this.setState({ticket: this.props.ticket}, () => {
            this.makeMessageView();
        });

        this.interval = setInterval(() => {
            this.refreshMessages();
        }, TICKET_REPLY_CHECK_INTERVAL);

        // For CRM agent user
        if(sessionStorage.getItem("crm_user_id") !== null) {
            let {ticketReplyFormData} = this.state;
            ticketReplyFormData.crm_user_id = sessionStorage.getItem("crm_user_id");
            if( sessionStorage.getItem("crm_user_name") !== null ){
                ticketReplyFormData.crm_user_name = sessionStorage.getItem("crm_user_name");
            }
            this.setState({ticketReplyFormData});
        }

    }

    cannedMessageOnChange(value){
        let {ticketReplyFormData} = this.state;
        if(ticketReplyFormData.messages != ''){
            ticketReplyFormData.messages += '\n' + value;
        }else{
            ticketReplyFormData.messages += value;
        }
        this.setState({ticketReplyFormData});
    }

    refreshMessages(){
        this.props.getTicket(this.props.ticket.id).then((response)=>{
            this.setState({ticket: response.data.ticket_info}, ()=>{
                this.makeMessageView();
            });
        });
    }

    onChangeHandler = (event, key) => {
        const {ticketReplyFormData} = this.state;
        ticketReplyFormData[event.target.name] = event.target.value;
        this.setState({ticketReplyFormData});
    }

    validateViewInfoData() {
        let rules = {
            messages          : Joi.string().label('Message'),
            crm_user_id: Joi.any(),
            crm_user_name: Joi.any()
        }
        return Joi.object(rules);
    }

    handleKeypress(e) {
        
        if (e.ctrlKey) {
            this.addNewLineToTextArea()
        }else if(e.key === 'Enter') {
            e.preventDefault();
            this.handelReplySubmit();
        }

    }

    addNewLineToTextArea(){
        let {ticketReplyFormData} = this.state;
        ticketReplyFormData.messages = ticketReplyFormData.messages + "\r\n";
        this.setState({ticketReplyFormData});
    }

    async handelReplySubmit() {

        this.setState({errors: null});
        let schema = this.validateViewInfoData();
        try {
            let data = await schema.validateAsync(this.state.ticketReplyFormData);
            let formData = this.makeformData(data);
            let response = await (new Api()).call('POST', API_URL + `/messages`, formData, (new Token()).get());
            if (response.data.status_code == 201) {
                let {ticketReplyFormData} = this.state;
                ticketReplyFormData.messages = '';
                this.setState({ticketReplyFormData});
                this.refreshMessages();
            } else if (response.data.status_code == 400 || response.data.status_code == 424) {
                this.setState({submitLoading: false});
                this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
            }
        } catch (err) {
            const {validationError} = this.state;
            this.setState({submitLoading: false});
            validationError[err.details[0].context.key] = err.details[0].message;
            this.setState({validationError: validationError});
            validationError[err.details[0].context.key] = '';
        }

    }

    makeformData(data){
        let formData = new FormData();
        formData.append('ticket_id',this.state.ticket.id);
        formData.append('message', data.messages);
        formData.append('crm_user_id', data.crm_user_id);
        formData.append('crm_user_name', data.crm_user_name);
        return formData;
    }

    async fileOnChange(file){
        this.setState({errors: null});
        this.setState({fileSpinning: true});
        let formData = new FormData();
        formData.append('ticket_id',this.state.ticket.id);
        formData.append('message', '');
        formData.append('files', file.target.files[0]);
        
        let response = await (new Api()).call('POST', API_URL + `/messages`, formData, (new Token()).get());
        if (response.data.status_code == 201) {
            this.refreshMessages();
        } else if (response.data.status_code == 400 || response.data.status_code == 424) {
            this.setState({errors: ((new Helper).arrayToErrorMessage(response.data.errors))});
        }
        
        this.setState({fileSpinning: false});
    }

    getFileView(media){
        return <>
                <div><u>Attached Files</u> :</div>
                {
                    media.map((attachedFile)=>{
                        return <><i className="bi bi-file-earmark-fill"></i> <a target="_blank" href={attachedFile.url} download>{attachedFile.url.split('/').reverse()[0]}</a><br/></>
                    })
                }
            </>
    }

    async getQuestion(id) {

        return await (new Api()).call('GET', API_URL + '/questions/' + id, [], (new Token()).get());

    }

    async makeMessageView(){
        let {messageView} = this.state;
        messageView = [];
        
        if(!this.state.question && this.state.ticket.question){
            let question = await this.getQuestion( this.state.ticket.question.question_id );
            let _this = this;
            _this.setState({question});
            
            // Question answer
            if( this.state.question.data.info.question ){
                messageView.push( 
                    <li className="ts-d-m-common" key={this.state.question.data.info.id}>
                        <div className="ts-d-m-other ts-d-message-text-area">
                            <div className="ts-d-message-text">
                                Question: {this.state.question.data.info.question}?<br />
                                Answer  : {this.state.ticket.question ? this.state.ticket.question.answer : '-'}
                            </div>
                        </div>
                        <div className="ts-d-message-time">
                            <span className="mr-2">Time</span> <small>{this.state.ticket.created_at_formed}</small>
                        </div>
                    </li>
                );
            }
        }        

        // Ticket details
        messageView.push(
            <li className="ts-d-m-common" key={this.state.ticket.id}>
                <div className="ts-d-m-other ts-d-message-text-area">
                    <div className="ts-d-message-text">

                        <div dangerouslySetInnerHTML={{__html: this.state.ticket.description}}></div>
                        {
                            this.state.ticket.media.length > 0 ?
                                this.getFileView(this.state.ticket.media)    
                            : null
                        }

                    </div>
                    <div className="ts-d-m-author">
                    {
                        this.state.ticket.crm_user_name && this.state.ticket.crm_user_name!= 'null' ? 
                            <Tooltip placement="topLeft" title={this.state.ticket.crm_user_name}>
                                <img src={ NO_PHOTO} alt=""/>
                            </Tooltip>
                        :
                            <Tooltip placement="topLeft" title={this.Helper.getFullName(this.state.ticket.create_user)}>
                                <img src={this.state.ticket.create_user.media ? this.state.ticket.create_user.media.url : NO_PHOTO} alt=""/>
                            </Tooltip>
                    }
                    </div>
                </div>
                <div className="ts-d-message-time">
                    <span className="mr-2">Time</span> <small>{this.state.ticket.created_at_formed}</small>
                </div>
            </li>
        )

        this.state.ticket.messages.map((message)=>{
            if(this.state.ticket.contact_id === message.replied_by){
                // Contact Reply
                messageView.push(<li className="ts-d-m-common" key={message.id}>
                    <div className="ts-d-m-other ts-d-message-text-area">
                        <div className="ts-d-message-text">
                            {/* {message.message} */}
                            {message.message ? <div dangerouslySetInnerHTML={{__html: message.message.replace(/\n\r?/g, '<br/>')}}></div> : null}
                            {
                                message.media ?
                                    this.getFileView([message.media])    
                                : null
                            }
                        </div>
                        <div className="ts-d-m-author">
                            <Tooltip placement="topLeft" title={this.Helper.getFullName(message.user.user_details)}><img
                                src={message.user.media ? message.user.media.url : NO_PHOTO} alt=""/></Tooltip>
                        </div>
                    </div>
                    <div className="ts-d-message-time">
                        <span className="mr-2">Time</span> <small>{message.created_at}</small>
                    </div>
                </li>)
            } else {
                // Agent Reply
                messageView.push(<li className="ts-d-m-common" key={message.id}>
                    <div className="ts-d-m-self ts-d-message-text-area">
                        <div className="ts-d-message-text">
                            {/* {message.message} */}
                            {message.message ? <div dangerouslySetInnerHTML={{__html: message.message.replace(/\n\r?/g, '<br/>')}}></div> : null}
                            {
                                message.media ?
                                    this.getFileView([message.media])    
                                : null
                            }
                        </div>
                        <div className="ts-d-m-author">
                            <Tooltip placement="topLeft" title={this.Helper.getFullName(message.user.user_details)}><img
                                src={message.user.media ? message.user.media.url : NO_PHOTO} alt=""/></Tooltip>
                        </div>
                    </div>

                    <div className="ts-d-message-time">
                        <span className="mr-2">Time</span> <small>{message.created_at}</small>
                    </div>
                </li>)
                
            }
        });
        this.setState({messageView}, () => {
            this.setState({isMessageViewReady: true});
        });
    }

    processRendering() {
        return <>
            <div className="col-lg-8">

                <div className="ts-d-message-main">

                    <ul className="ts-d-message-list">
                        <ScrollToBottom
                            className="reply-message"
                            initialScrollBehavior="auto"
                        >
                            {this.state.messageView}
                        </ScrollToBottom>
                    </ul>
                    {
                        this.state.ticket.status.slug === "closed" ?
                            <div className="col-md-10"><Alert icon={icon} style={{color:"white",background:"#f75676"}}                          
                                description="Ticket is Closed. You cannot reply to this ticket! (Reopen ticket to reply)"
                                type="warning"
                                showIcon                           
                            />
                            </div> : null
                    }
                    {
                        this.state.ticket.status.slug !== "closed" ?
                        <>
                            <div className="ts-d-message-footer-area">
                                {/*Canned Message*/}
                                <div className="ts-d-canned-message">
                                    <Select 
                                        autoFocus={false} 
                                        defaultValue={this.state.cannedMessages.defaultValue} 
                                        onChange={this.cannedMessageOnChange} 
                                        showArrow={true} 
                                        size={"large"}
                                    >
                                        <Option
                                            key={"---"}
                                            value={""}
                                        >
                                            ---
                                        </Option>
                                        {this.state.cannedMessages.selectOptions}
                                    </Select>
                                </div>
                                {/*End Canned Message*/}

                                <div className="ts-d-message-footer">
                                    <label className="ts-d-c-attachment" htmlFor="ts-d-chat-attachment">
                                        <input type="file" name="" id="ts-d-chat-attachment" onChange={(file) => this.fileOnChange(file)}/>
                                        <i className="bi bi-paperclip"> </i>
                                    </label>
                                    <Spin size="small" spinning={this.state.fileSpinning}></Spin>
                                    <TextArea
                                        className='fixedTextarea'
                                        type="text"
                                        name="messages"
                                        id="ts-d-chat-input"
                                        placeholder="Type Your Reply"
                                        value={this.state.ticketReplyFormData.messages}
                                        onChange={this.onChangeHandler}
                                        onKeyPress={this.handleKeypress}
                                    />
                                    <button className="mr-3" id="ts-d-chat-button" onClick={this.handelReplySubmit}> Send <i className="bi bi-send"> </i></button>
                                </div>
                            </div>

                            <small className="text-black-50">For new line press ctrl+enter</small>
                            <small className="text-danger my-2">
                            {
                                this.state.errors ? this.state.errors : null
                            }
                            </small>
                            <small className="text-danger my-2">{this.state.validationError.messages}</small>

                        </> : null
                    }
                </div>

            </div>
        </>
    }

    render() {
        return (
            <>
                {this.state.isMessageViewReady ? this.processRendering() : null}
            </>
        )
    }
}

export default withRouter(Reply);
