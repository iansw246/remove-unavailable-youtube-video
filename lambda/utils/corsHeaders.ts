// Headers required for CORS
const DEFAULT_RESPONSE_HEADERS = {
    "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

export { DEFAULT_RESPONSE_HEADERS };