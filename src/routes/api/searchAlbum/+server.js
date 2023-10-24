import axios from 'axios';
import { env } from '$env/dynamic/private';

async function getAccessToken() {
    const spotify_client_id = env.SPOTIFY_CLIENT_ID;
    const spotify_client_secret = env.SPOTIFY_CLIENT_SECRET;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            Authorization: `Basic ${btoa(`${spotify_client_id}:${spotify_client_secret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `grant_type=client_credentials`,
    };

    try {
        const response = await axios(authOptions);
        console.log('Token Granted');
        return response.data.access_token;
    } catch (error) {
        console.log('Error getting Spotify Access Token : ' + error);
    }
}

export async function GET({ url }) {
    const query = url.searchParams.get('q');
    const token = await getAccessToken();

    const searchOptions = {
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const response = await axios(searchOptions);
        const album = response.data.albums.items[0];
        const tracksResponse = await axios({
            url: `https://api.spotify.com/v1/albums/${album.id}/tracks`,
            method: 'get',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const tracks = tracksResponse.data.items;
        console.log('Search successful');
        console.log(album);
        console.log(tracks);
        return new Response(JSON.stringify({ album, tracks }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error) {
        console.log('Error searching for album');
        console.log(error);
        return new Response('Error searching for album', { 
            status: 500, 
            headers: { 'Content-Type': 'text/plain' } 
        });
    }
}