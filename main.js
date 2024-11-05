#!/usr/bin/env node
const { Client } = require('@notionhq/client');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

// Spotify credentials
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

// Notion credentials
const notion = new Client({ auth: process.env.NOTION_AUTH });
const databaseId = process.env.DATABASE_ID; // Set your Notion database ID as an environment variable

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function getAlbumDetails(albumName, accessToken) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    if (data.albums.items.length > 0) {
        const album = data.albums.items[0];
        const albumDetails = {
            imageUrl: album.images[0]?.url,
            artistName: album.artists.map(artist => artist.name).join(', '),
            trackNames: await getTrackNames(album.id, accessToken),
            albumName: album.name
        };
        return albumDetails;
    } else {
        return null;
    }
}

async function getTrackNames(albumId, accessToken) {
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    return data.items.map(track => track.name);
}

async function updateNotionPage(pageId, albumDetails) {
    await notion.pages.update({
        page_id: pageId,
        cover: {
            type: 'external',
            external: {
                url: albumDetails.imageUrl
            }
        },
        properties: {
            'Updated': {
                checkbox: true
            },
            'Artist': {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: albumDetails.artistName
                        }
                    }
                ]
            },
            'Favorite Songs': {
                multi_select: albumDetails.trackNames.map(trackName => ({ name: trackName.replace(",", "") }))
            },
            'Album Name': {
                title: [
                    {
                        type: 'text',
                        text: {
                            content: albumDetails.albumName
                        }
                    }
                ]
            }
        }
    });
}

async function fetchAndStoreAlbumDetails(albumName, notionPageId) {
    const accessToken = await getAccessToken();
    if (accessToken) {
        const albumDetails = await getAlbumDetails(albumName, accessToken);
        if (albumDetails) {
            await updateNotionPage(notionPageId, albumDetails);
            console.log(`Updated Notion page with album details for "${albumName}".`);
        } else {
            console.log(`No album details found for "${albumName}".`);
        }
    } else {
        console.log("Failed to retrieve access token.");
    }
}

async function updateAllPagesWithoutAlbumArt() {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            property: 'Updated',
            checkbox: {
                equals: false
            }
        }
    });

    const pages = response.results;

    for (const page of pages) {
        const albumNameProperty = page.properties['Album Name'];
        const albumName = albumNameProperty && albumNameProperty.title.length > 0
            ? albumNameProperty.title.map(item => item.text.content).join(' ')
            : null;

        const pageId = page.id;
        if (albumName) {
            await fetchAndStoreAlbumDetails(albumName, pageId);
        } else {
            console.log(`No album name found for page ID: ${pageId}`);
        }
    }
}

// Run the update for all pages
updateAllPagesWithoutAlbumArt();
