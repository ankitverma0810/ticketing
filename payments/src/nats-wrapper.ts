import nats, { Stan } from 'node-nats-streaming';

//singleton class which will provide same instance of nats client to all the files.
//used in 'index.ts' file to connect to NATS server. 
class NatsWrapper {
    private _client?: Stan;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access NATS client before connecting');
        }
        return this._client;
    }

    // clusterId: defined in the nats-depl file
    // clientId: any random id
    // url: name of service defined in the nats-depl file
    connect(clusterId: string, clientId: string, url: string): Promise<void> {
        this._client = nats.connect(clusterId, clientId, { url });

        //Adding ! after 'this._client' otherwise typescript will assume we will redefine it's value since it has being used inside a callback.
        return new Promise((resolve, reject) => {
            this._client!.on('connect', () => {
                console.log('Connected to NATS');
                resolve();
            });
            this._client!.on('error', (err) => {
                reject(err);
            });
        });
    }
}

//returning single instance of the class instead of the entire class.
export const natsWrapper = new NatsWrapper();