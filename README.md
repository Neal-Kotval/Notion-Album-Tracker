# Notion-Album-Tracker

<img width="1440" alt="Preview" src="https://github.com/user-attachments/assets/5904de2c-00b5-437a-861a-e25486eb2cb2">

## Quickstart

A cool "automatic" album tracker I made in Notion! Can be used to track whatever albums you listened to.

To get started first [Duplicate Template](https://chemical-cord-2eb.notion.site/Album-Tracker-133d47abe9a580238e66c22acc8d2c6b)

Then clone this repository

```
git clone https://github.com/Neal-Kotval/Notion-Album-Tracker
```

Install dependencies

```
cd Notion-Album-Tracker
npm i
```

Set up your env file. Go to the [Spotify Developer Portal](https://developer.spotify.com/) and create an account to get your CLIENT_ID and CLIENT_SECRET. Go to your personal notion and click CONNECTIONS->MANAGE CONNECTIONS->DEVELOP OR MANAGE INTEGRATIONS. Set up your app from there while selecting "internal integration" to get your NOTION_AUTH. To get DATABASE_ID click view as full in the album gallery, and copy as a link. Copy the id after the so/ and before the ?

To run internally

```
npm run test
```

To install and run globally as "albumtracker"

```
chmod +x main.js
npm init -y
npm install -g .
albumtracker
```
