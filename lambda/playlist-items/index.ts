import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GaxiosPromise, youtube, youtube_v3 } from "@googleapis/youtube";

const googleApiKey = process.env["GOOGLE_API_KEY"];

if (!googleApiKey) {
    throw new Error("Environment variable GOOGLE_API_KEY not defined");
}

const youtubeClient = youtube({
    version: "v3",
    auth: googleApiKey,
    http2: true,
});

interface FetchPlaylistItemsEvent { 
    playlistId?: string;
    oauthToken?: string;
}

const playlistItemParts: string[] = [
    "contentDetails",
    "id",
    "snippet",
    "status",
];

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    console.log(JSON.stringify(event, null, 2))

    if (!event.queryStringParameters || !event.queryStringParameters["playlistId"]) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing parameter playlistId",
            }),
        }
    }

    const playlistId = event.queryStringParameters["playlistId"];
    const oauthToken = event.queryStringParameters["oauthToken"];

    // I can't find the youtube GaxiosResponse type directly
    let response: Awaited<GaxiosPromise<youtube_v3.Schema$PlaylistItemListResponse>>;
   
    try {
        response = await youtubeClient.playlistItems.list({
            playlistId,
            access_token: oauthToken,
            part: playlistItemParts,
            maxResults: 50,
        });
    } catch (err: any) {
        if (err && typeof err.status === "number" && err.status === 404) {
            return {
                statusCode: 404,
                message: JSON.stringify({
                    message: "Playlist with given id could not be found",
                }),
            };
        } else {
            return {
                statusCode: 500,
                message: JSON.stringify({
                    message: `An error occured fetching playlist items from the given playlist: ${err.code}`,
                }),
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
        };
    }

    resultsArrays.push(items);
    console.log(resultsArrays);

    while (response.data.nextPageToken) {
        response = await youtubeClient.playlistItems.list({
            playlistId,
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
            };
        }
        items = response.data.items;
        if (items) {
            resultsArrays.push(items);
        }
    }

    console.log(resultsArrays);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Ok",
            playlistItems: resultsArrays.flat()
        }),
    };
}