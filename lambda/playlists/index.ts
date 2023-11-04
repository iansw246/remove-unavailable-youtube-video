import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { GaxiosPromise, youtube, youtube_v3 } from "@googleapis/youtube";
import { DEFAULT_RESPONSE_HEADERS } from "../utils/corsHeaders";
import getEnvVarSafe from "../utils/getEnvVarSafe";

const googleApiKey = getEnvVarSafe("GOOGLE_API_KEY");

const playlistParts = [
    "contentDetails",
    "id",
    "snippet",
    "status",
];

const youtubeClient = youtube({
    version: "v3",
    auth: googleApiKey,
    http2: true,
});

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
    if (!event.queryStringParameters || !event.queryStringParameters["oauthToken"]) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing parameter oauthToke",
            }),
            headers: DEFAULT_RESPONSE_HEADERS,
        };
    }

    const oauthToken = event.queryStringParameters["oauthToken"];

    let response: Awaited<GaxiosPromise<youtube_v3.Schema$PlaylistListResponse>>;

    try {
        response = await youtubeClient.playlists.list({
            access_token: oauthToken,
            part: playlistParts,
            maxResults: 50,
            mine: true,
        });
    } catch (error: any) {
        return createErrorResponse(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            playlists: response.data
        }),
        headers: DEFAULT_RESPONSE_HEADERS,
    }
}

function createErrorResponse(error: any): APIGatewayProxyResultV2 {
    if (error && typeof error.status === "number") {
        if (error.status === 404) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Playlist with given id could not be found",
                }),
                headers: DEFAULT_RESPONSE_HEADERS,
            };
        } else if (error.status === 403) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: "Invalid OAuth token",
                }),
                headers: DEFAULT_RESPONSE_HEADERS,
            }
        }
    }
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: `An error occured fetching playlists: ${error.code ?? "Unknown error"}`,
        }),
        headers: DEFAULT_RESPONSE_HEADERS,
    };
}