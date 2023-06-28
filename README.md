# Remove Unavailable Videos
[![Netlify Status](https://api.netlify.com/api/v1/badges/765ede59-349a-47c7-afcb-0e6faa3376e0/deploy-status)](https://app.netlify.com/sites/ruv/deploys)

This web app gets all YouTube playlists and the unavailable videos in each video. Unavailable videos
can be removed from playlists or downloaded.

# Usage

To get started, click on the "Show Playlists" button on the home page. Click the login button if the
popup appears to login to Google.

Next, select the region you watch videos in. This is required to get an accurate list of
unavailable videos because video availability depends on the region. In other words, videos are
available in some countries but not others.

A list of playlists will be displayed. For each playlist, click on the "Get unavailable videos"
button to retrieve all unavailable videos. The popup will show a list of unavailable videos and
give options to download the list of videos or remove the videos. Due to limitations of Youtube,
videos that are deleted will have no information.

# Building
Install dependencies with `pnpm i`. Set required environment variables in build: 
- `REACT_APP_GAPI_CLIENT_ID`: Google API OAuth Client ID
- `REACT_APP_GAPI_API_KEY`: Google API API Key

Build with run `pnpm build`. 


# Details
Unavailable videos are videos that are deleted, privated, blocked due to copyright grounds, or other
reasons. Videos availability, mostly for videos blocked for copyright, is different in each country.

Uses [google-api-javascript-client](https://github.com/google/google-api-javascript-client) for YouTube API requests.

Uses the [Google 3P Authorization library for authentication and authorization](https://developers.google.com/identity/oauth2/web/guides/load-3p-authorization-library) (sign-in with Google)

The page components (App.tsx, privacyPolicy.tsx) are put directly into the layout component. To reduce nesting, you may want to return a fragment with the content.

# Todo
- Get app approved by Google
- Add unit tests
- Add privacy policy or other information
- Link to Github?