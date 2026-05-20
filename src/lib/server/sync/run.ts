import { syncPoliticians } from '.';
import { client } from '../db';

syncPoliticians().then(() => client.end());
