# discord-cleaner
A tool for deleting your messages posted to public discord channels.

## Why?
Because you don't want to get canceled in 10 years for some message you left in discord when you were a teenager.

## How?
1. Clone the repo;
2. Run `yarn`;
3. Create `.env` file in a root directory with `CLIENT_TOKEN` (Developer tools > Network > XHR > refresh a page > `messages?limit=50` request > `Authorization` header) and `CLIENT_ID` (check `Response` for the `messages?limit=50` request, find any your message and copy `author.id`).;
4. Create `channels.json` file in a root directory with an array of all channels you want to process;
5. Run `yarn start`.

## TODOs and notes:
- For recent messages (no older than 2 weeks), we can use bulk deletion endpoint;
- Rate limiter (or Discord's API) sometimes misbehaves. You can use `TIME_BETWEEN_REQUESTS` (in milliseconds) env variable to adjust the rate;
- Stay calm. The script will run again and again if a 429 error occurs;
- Messages in threads are not deleted currently.