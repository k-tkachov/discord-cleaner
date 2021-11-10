require('dotenv').config();
const axios = require('./utils/axios');
const channels = require('./channels.json');

let failedRequests = 0;
let rateLimitErrors = 0;

if (!channels) {
    throw new Error('Channels IDs not found. Please check your channels.json file and/or read the docs');
}

const getDeleteMessageUrl = ({ channelId, messageId }) => `channels/${channelId}/messages/${messageId}`;
const getChannelMessagesUrl = ({
    channelId,
    lastMessageId = ''
}) => `channels/${channelId}/messages?limit=100${lastMessageId && '&before=' + lastMessageId}`;

const getUserMessagesIds = ({ messages }) => messages
    .filter(msg => msg?.author?.id === process.env.CLIENT_ID)
    .map(msg => msg.id);

const getAllMessages = async ({ channelId }) => {
    let lastMessageId = '';
    let fetchedMessages = null;
    let userMessages = [];
    while (fetchedMessages?.length !== 0) {
        try {
            axios.setRateLimitOptions({ maxRequests: 1, perMilliseconds: 25 });
            ({ data: fetchedMessages } = await axios.get(
                getChannelMessagesUrl({ channelId, lastMessageId })
            ));
        } catch (e) {
            console.error('getAllMessages:', e.message);
            failedRequests++;
            break;
        }

        if (fetchedMessages.length) {
            lastMessageId = fetchedMessages[fetchedMessages.length - 1].id;
            userMessages = [...userMessages, ...getUserMessagesIds({ messages: [...fetchedMessages] })];
        }
    }

    return userMessages;
};

const deleteMessages = async ({ channelId, messages }) => {
    if (!messages.length) {
        return;
    }

    try {
        const currentMessageId = messages.shift();
        axios.setRateLimitOptions({ maxRequests: 1, perMilliseconds: 500 });
        await axios.delete(getDeleteMessageUrl({ channelId, messageId: currentMessageId }));
        console.log(`Message #${currentMessageId} in channel #${channelId} was successfully deleted`);
        await deleteMessages({ channelId, messages });
    } catch (e) {
        console.error('deleteMessages:', e.message);
        if (e?.response?.status === 429) {
            rateLimitErrors++;
        }
        failedRequests++;
    }
};


const deleteMessagesInChannels = async () => {
    for (const channelId of channels) {
        await getAllMessages({ channelId })
            .then(messages => deleteMessages({ channelId, messages }))
            .then(() => console.log(`All messages were processed for channel #${channelId}`))
            .catch(e => {
                console.error('Something went wrong.', e.message);
                failedRequests++;
            });
    }

    if (rateLimitErrors) {
        rateLimitErrors = 0;
        console.log('Run again to process all cancelled request. The number of failed requests:', failedRequests);
        await deleteMessagesInChannels();
    }
}

const run = async () => {
    await deleteMessagesInChannels();
    console.log('All messages were processed for all channels.');
}

run();
