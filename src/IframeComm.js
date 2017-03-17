import React, { Component, PropTypes } from "react";

class IframeComm extends Component {
    constructor() {
        super();
        this.onReceiveMessage = this.onReceiveMessage.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }
    componentDidMount() {
        window.addEventListener("message", this.onReceiveMessage);
        this._frame.addEventListener("load", this.onLoad);
    }
    componentWillUnmount() {
        window.removeEventListener("message", this.onReceiveMessage, false);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.postMessageData !== nextProps.postMessageData) {
            // send a message if postMessageData changed
            this.sendMessage(nextProps.postMessageData);
        }
    }
    onReceiveMessage(event) {
        const { handleReceiveMessage } = this.props;
        if (handleReceiveMessage) {
            handleReceiveMessage(event);
        }
    }
    onLoad() {
        const { handleReady } = this.props;
        if (handleReady) {
            handleReady();
            this.sendMessage();
        }
    }
    serializePostMessageData(data) {
        // serialize data since postMessage accepts a string only message
        if (typeof data === "object") {
            return JSON.stringify(data);
        } else if (typeof data === "string") {
            return data;
        } else {
            return `${data}`;
        }
    }
    sendMessage() {
        const { postMessageData, targetOrigin } = this.props;
        const serializedData = this.serializePostMessageData(postMessageData);
        this._frame.contentWindow.postMessage(serializedData, targetOrigin);
    }
    render() {
        const { attributes } = this.props;
        // define some sensible defaults for our iframe attributes
        const defaultAttributes = {
            allowFullScreen: false,
            frameBorder: 0
        };
        // then merge in the user's attributes with our defaults
        const mergedAttributes = Object.assign(
            {},
            defaultAttributes,
            attributes
        );
        return (
            <iframe
                id="_iframe"
                ref={el => {
                    this._frame = el;
                }}
                {...mergedAttributes}
            />
        );
    }
}

IframeComm.defaultProps = {
    targetOrigin: "*"
};

IframeComm.propTypes = {
    /*
        Iframe Attributes
        https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#Attributes
        React Supported Attributes
        https://facebook.github.io/react/docs/dom-elements.html#all-supported-html-attributes
        Note: attributes are camelCase, not all lowercase as usually defined.
    */
    attributes: PropTypes.shape({
        allowFullScreen: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]),
        frameBorder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        scrolling: PropTypes.string,
        // https://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
        sandbox: PropTypes.string,
        srcDoc: PropTypes.string,
        src: PropTypes.string.isRequired,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    handleReceiveMessage: PropTypes.func,
    handleReady: PropTypes.func,
    /*
        You can pass it anything you want, we'll serialize to a string
        preferablly use a simple string message or an object.
        If you use an object, you need to follow the same naming convention
        in the iframe so you can parse it accordingly.
     */
    postMessageData: PropTypes.any,
    topic: PropTypes.string,
    /*
        Always provide a specific targetOrigin, not *, if you know where the other window's document should be located. Failing to provide a specific target discloses the data you send to any interested malicious site.
     */
    targetOrigin: PropTypes.string
};

export default IframeComm;
