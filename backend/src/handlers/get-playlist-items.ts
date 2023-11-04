import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GaxiosPromise, youtube, youtube_v3 } from "@googleapis/youtube";
import getEnvVarSafe from "../utils/getEnvVarSafe";
import { DEFAULT_RESPONSE_HEADERS } from "../utils/corsHeaders";

const googleApiKey = getEnvVarSafe("GOOGLE_API_KEY");

const maxPlaylistItems = parseInt(getEnvVarSafe("MAX_PLAYLIST_ITEMS"));

const reservedTimeMillisecondsForFinalResponse = parseInt(getEnvVarSafe("RESERVED_TIME"));

const youtubeClient = youtube({
    version: "v3",
    auth: googleApiKey,
    http2: true,
});

const playlistItemParts: string[] = [
    "contentDetails",
    "id",
    "snippet",
    "status",
];

/**
 * The playlist-items GET route
 * API parameters are:
 *  - playlistId: query string
 *  - Authorization: HTTP header with oauth access token
 * @param event 
 * @param context 
 * @returns 
 */
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(JSON.stringify(event, null, 2))

    if (!event.queryStringParameters || !event.queryStringParameters["playlistId"]) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing parameter playlistId",
            }),
            headers: DEFAULT_RESPONSE_HEADERS,
        }
    }

    const playlistId = event.queryStringParameters["playlistId"];
    // AWS API Gateway appears to make all headers lowercase. Doing this in just that isn't a correct assumption or
    // conditions change
    const oauthToken = event.headers["authorization"] || event.headers["Authorization"];

    console.log("oauthToken:", oauthToken);

    // I can't find the youtube GaxiosResponse type directly
    let response: Awaited<GaxiosPromise<youtube_v3.Schema$PlaylistItemListResponse>>;
   
    try {
        response = await youtubeClient.playlistItems.list({
            playlistId,
            access_token: oauthToken,
            part: playlistItemParts,
            maxResults: 50,
        });
    } catch (error: any) {
        if (error && typeof error.status === "number" && error.status === 404) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Playlist with given id could not be found",
                }),
                headers: DEFAULT_RESPONSE_HEADERS,
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `An error occured fetching playlist items from the given playlist: ${error.code}`,
                }),
                headers: DEFAULT_RESPONSE_HEADERS,
            };
        }
    }

    const resultsArrays: youtube_v3.Schema$PlaylistItem[][] = [];

    // Should have thrown error if not successful
    console.assert(response.status === 200, response);
    let items = response.data.items;
    
    if (!items || response.status !== 200) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error fetching playlist items",
            }),
            headers: DEFAULT_RESPONSE_HEADERS,
        };
    }

    // Whether the calls took too long and are expected to timeout the AWS Lambda time.
    // If so, return early, letting client know that we "timed out"
    let timedOut = false;

    resultsArrays.push(items);
    console.log(resultsArrays);

    while (response.data.nextPageToken) {
        if (context.getRemainingTimeInMillis() < reservedTimeMillisecondsForFinalResponse) {
            timedOut = true;
            break;
        }

        response = await youtubeClient.playlistItems.list({
            playlistId,
            access_token: oauthToken,
            part: playlistItemParts,
            maxResults: 50,
            pageToken: response.data.nextPageToken,
        });
        if (response.status !== 200) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Error fetching playlist items. Code: ${response.status}, ${response.statusText}`,
                }),
                headers: DEFAULT_RESPONSE_HEADERS,
            };
        }
        items = response.data.items;
        if (items) {
            resultsArrays.push(items);
        }
    }

    console.log(resultsArrays);

    if (timedOut) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Time limit exceeded. There are too many items in the requested playlist",
                playlistItems: resultsArrays.flat(),
            }),
            headers: DEFAULT_RESPONSE_HEADERS,
        };
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Ok",
                playlistItems: resultsArrays.flat(),
            }),
            headers: DEFAULT_RESPONSE_HEADERS,
        };
    }
}