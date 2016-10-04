/* eslint-disable */
/* Let CRA handle linting for sample app */
import React, { Component } from 'react';
import Spinner from 'react-spinner';
import classNames from 'classnames';
import logo from './logo.svg';
import otAcc from './acc/api';
import config from './config.json';
import './App.css';
import 'opentok-solutions-css';

const otAccOptions = {
  credentials: {
    apiKey: config.apiKey,
    sessionId: config.sessionId,
    token: config.token,
  },
  // A container can either be a query selector or an HTMLElement
  containers: {
    publisher: {
      camera: '#publisherContainer',
      screen: '#publisherContainer',
    },
    subscriber: {
      camera: '#subscriberContainer',
      screen: '#subscriberContainer',
    },
    controls: '#controls',
    chat: '#chat'
  },
  packages: ['textChat', 'screenSharing', 'annotation', 'archiving'],
  communication: {
    callProperites: null, // Using default
  },
  textChat: {
    name: ['David', 'Paul', 'Emma', 'George', 'Amanda'][Math.random() * 5 | 0],
    waitingMessage: 'Messages will be delivered when other users arrive',
  },
  screenSharing: {
    extensionID: 'plocfffmbcclpdifaikiikgplfnepkpo',
    annotation: true,
    externalWindow: false,
    dev: true,
    screenProperties: null, // Using default
  },
  annotation: {

  },
  archiving: {
    startURL: 'https://example.com/startArchive',
    stopURL: 'https://example.com/stopArchive',
  }
};

const connectingMask = () =>
  <div className="App-mask">
  <Spinner />
    <div className="message with-spinner">Connecting</div>
  </div>

const startCallMask = start =>
  <div className="App-mask">
    <div className="message button clickable" onClick={start}>Click to Start Call</div>
  </div>



class App extends Component {

  constructor(props) {
    super(props);
    this.state = { connected: false, active: false, publishers: null, subscribers: null };
    this.startCall = this.startCall.bind(this);
  }

  startCall() {
    this.setState({ active: true });
    otAcc.startCall()
      .then(({ publishers, subscribers, meta }) => {
        this.setState({ publishers, subscribers, meta });
      }).catch(error => console.log(error));
  }

  componentDidMount() {
    otAcc.init(otAccOptions);
    otAcc.connect().then((remoteParticpant) => this.setState({ connected: true, remoteParticpant }));
    const events = [
      'subscribeToCamera',
      'unsubscribeFromCamera',
      'subscribeToScreen',
      'unsubscribeFromScreen',
      'startScreenShare',
      'endScreenShare',
    ];

    events.forEach(event => otAcc.on(event, ({ publishers, subscribers, meta }) => {
        this.setState({ publishers, subscribers, meta });
    }));
  }

  render() {
    const { connected, active, subscribers, publishers, meta } = this.state;
    const activeSubscribers = meta ? meta.subscriber.total : 0;
    const controlClass = classNames('App-control-container', { 'hidden': !active });
    const publisherClass = classNames('video-container', { 'small': !!activeSubscribers });
    const subscriberClass = classNames('video-container', { 'hidden': !activeSubscribers },
      `active-${activeSubscribers}`
    );

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>OpenTok Accelerator Core</h1>
        </div>
        <div className="App-main">
          <div id="controls" className={controlClass}></div>
          <div className="App-video-container">
            { !connected && connectingMask() }
            { connected && !active && startCallMask(this.startCall)}
            <div id="publisherContainer" className={publisherClass}></div>
            <div id="subscriberContainer" className={subscriberClass}></div>
            <div id="controls"></div>
          </div>
          <div id="chat" className="App-chat-container"></div>
        </div>
      </div>
    );
  }
}

export default App;