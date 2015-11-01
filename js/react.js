var UserBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadData: function() {
    var scanParams = {
      TableName: 'users',
      AttributesToGet: ['id', 'name', 'age'],
    };

    dynamodb.scan(scanParams, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        return
      }

      this.setState({data: data.Items});
    }.bind(this));
  },
  componentDidMount: function() {
    this.loadData();
    setInterval(this.loadData, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="userBox">
        <UserForm />
        <UserList data={this.state.data} />
      </div>
    );
  }
});

var UserList = React.createClass({
  render: function() {
    var userNodes = this.props.data.map(function (user) {
      return (
        <User key={user.id.S} data={user} />
      );
    });
    return (
      <div className="userList">
        <h3>一覧</h3>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {userNodes}
          </tbody>
        </table>
      </div>
    );
  }
});

var User = React.createClass({
  handleClick: function(e) {
    e.preventDefault();

    var params = {
      TableName: 'users',
      Key: {
        id: {S: this.props.data.id.S},
      }
    };
    dynamodb.deleteItem(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        return
      }
    });
  },
  render: function() {
    return (
      <tr>
        <td>{this.props.data.name.S}</td>
        <td>{this.props.data.age.N}</td>
        <td><button className="btn btn-danger" onClick={this.handleClick}>削除</button></td>
      </tr>
    );
  }
});

var UserForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var name = ReactDOM.findDOMNode(this.refs.name).value.trim();
    var age = ReactDOM.findDOMNode(this.refs.age).value.trim();

    if (!name || !age) {
      return;
    }

    var putItemParams = {
      TableName: 'users',
      Item: {
        id: {S: chance.string()},
        name: {S: name},
        age: {N: age},
      },
    };

    dynamodb.putItem(putItemParams, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        return
      }

      $('#put_item_success').fadeIn(500, function() {
        $('#put_item_success').delay(2000).fadeOut(500);
      });
    });

    ReactDOM.findDOMNode(this.refs.name).value = '';
    ReactDOM.findDOMNode(this.refs.age).value = '';
    
    return;
  },
  render: function() {
    return (
      <div className="userForm">
        <h3>登録</h3>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label className="col-md-2 control-label">Name</label>
            <div className="col-md-10">
              <input type="name" name="name" className="form-control" ref="name"/>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">Age</label>
            <div className="col-md-10">
              <input type="number" name="age" min="0" max="150" className="form-control" ref="age"/>
            </div>
          </div>
          <div className="form-group">
            <div className="col-md-offset-2 col-md-10">
              <button type="submit" className="btn btn-primary">登録</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <UserBox pollInterval={3000} />,
  document.getElementById('react')
);
