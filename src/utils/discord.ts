import DiscordOauth2 from 'discord-oauth2';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SERVER_URL } from '../constants';

const oauth = new DiscordOauth2({
    clientId: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    redirectUri: `${SERVER_URL}:80/auth/discord`,
});

export default oauth;
