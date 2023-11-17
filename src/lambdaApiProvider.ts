import ApiProvider from "./apiProvider";
import { getEnvVarSafe } from "./utils/getEnvVarSafe";
import { Playlist } from "./utils/requestHelpers";

const lambdaBaseURL = getEnvVarSafe("REACT_APP_LAMBDA_URL");

const fetchPlaylistURL = new URL("playlists", lambdaBaseURL);

async function fetchPlaylist(playlistId: string): Promise<Playlist[]> {
    const params = new URLSearchParams({
        
    })
    return (await fetch(fetchPlaylistURL + "?" + params, {
        method: "GET",
        
    }))
}

export const LambdaApiProvider: ApiProvider = {
    fetchPlaylist
}