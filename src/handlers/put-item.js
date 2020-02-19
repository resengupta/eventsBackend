// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const moment = require('moment');
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putItemHandler = async (event) => {
	if (event.httpMethod !== 'POST') {
		throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
	}

	// All log statements are written to CloudWatch
	console.info('received:', event);

	// Get id and name from the body of the request
	const body = JSON.parse(event.body)

	function Response(dataContent, errorMessage) {
		this.dataContent = dataContent;
		this.errorContent = errorMessage;
	}

	function Event(body) {
		this.id = body.id;
		this.name = body.name;
		this.desc = body.desc;
		this.date = body.date;
		this.capability = body.capability;
		this.tags = body.tags;
		this.imageUrl = body.imageUrl;
		this.eventUrl = body.eventUrl;
		this.location = body.location;
		this.speaker = body.speaker;
		this.type = body.type;

		this.validate = function () {
			console.info('validation 1:', this.date);
			if (this.date != null && !moment(this.date, 'MM-DD-YYYY', true).isValid()) {
				return "Data Format is incorrect. Should be MM-DD-YYYY";
			} else {
				return null;
			}
		}
	}

	var event = new Event(body)

	const error = event.validate();
	console.info('received error:', error);

	if (error != null) {
		const response = {
			statusCode: 400,
			body: JSON.stringify(new Response(null, error))
		};

		console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
		return response;
	}

	// Creates a new item, or replaces an old item with a new item
	// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
	var params = {
		TableName: tableName,
		Item: event
	};
	console.info('received params:', params);

	const result = await docClient.put(params).promise();

	console.info('received results:', result);
	const response = {
		statusCode: 200,
		body: 'Success'
	};

	console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
	return response;
}

