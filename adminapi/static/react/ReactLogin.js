var LoginContainer = React.createClass({displayName: 'ReactLogin',
    handleLoginSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
               xhr.setRequestHeader('Authorization', 'Basic ' + btoa(data.username + ':' + data.password));
               this.setState({infoMessage: ''});
            }.bind(this),
            cache: false,
            success: function(data) {
                console.log('Login success')
                this.setState({infoMessage: 'Success token: ' + data.token});
                console.log('state set');
                Cookies.set('token', data, { expies: 1 }, { secure: true });
                console.log('Cookie data set');

                // Make a GET request to a view that requires auth token header
                this.testAuthToken(data);
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
                this.setState({infoMessage: jsonError.detail});
            }.bind(this)
        });
    },
    // Test the recieved auth token
    testAuthToken: function(data) {
        $.ajax({
            url: '/test-view/',
            dataType: 'json',
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Token ' + Cookies.getJSON('token').token);
                this.setState({infoMessage: ''});
                Cookies.remove('token');
            }.bind(this),
            cache: false,
            success: function(data) {
                this.setState({infoMessage: 'Success: ' + data.detail});
            }.bind(this),
            error: function(xhr, status, err) {
                jsonError = JSON.parse(xhr.responseText);
                console.error(this.props.url, status, err.toString(), ' Reason: ' + jsonError.detail);
                this.setState({infoMessage: jsonError.detail});
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {infoMessage: ''};
    },
    render: function() {
        return (
            <div className="login-container" >
                <LoginForm onLoginSubmit={ this.handleLoginSubmit } />
                <p id="info-block">{ this.state.infoMessage }</p>
            </div>
        );
    }
});

var LoginForm = React.createClass({displayName: 'LoginForm',
    handleSubmit: function(e) {
        e.preventDefault();
        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value.trim();
        // TODO form validation
        if (!password || !username) {
            return;
        }
        this.props.onLoginSubmit({username: username, password: password});
        React.findDOMNode(this.refs.username).value = '';
        React.findDOMNode(this.refs.password).value = '';
    },
    render: function() {
        return (
            <form className="login-form" onSubmit={ this.handleSubmit } >
                <input type="text" placeholder="Username" ref="username" required/>
                <input type="password" placeholder="Password" ref="password" required/>
                <input type="submit" value="Post" />
            </form>
        );
    }
});

React.render(
    React.createElement(LoginContainer,{url: '/login-auth/'}),
    document.getElementById('login-div')
);

