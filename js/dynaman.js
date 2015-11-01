var dynamodb = new AWS.DynamoDB({
  'endpoint': 'http://192.168.99.100:8000',
  'region': 'ap-northeast-1',
  'accessKeyId': 'local',
  'secretAccessKey': 'local',
});

dynamodb.listTables({}, function(err, data) {
  if (err) {
    console.log(err, err.stack);
    return
  }

  var names = _.filter(data.TableNames, function(name) {
    if (name == 'users') {
      return name;
    }
  });

  if (names.length == 0) {
    var createTableParams = {
      TableName: 'users',
      AttributeDefinitions: [
        {AttributeName: 'id', AttributeType: 'S'},
      ],
      KeySchema: [{
        AttributeName: 'id',
        KeyType: 'HASH',
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    };

    dynamodb.createTable(createTableParams, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        return
      }

      console.log(data);
    });
  }
});
