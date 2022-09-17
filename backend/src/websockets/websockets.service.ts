import { Injectable } from '@nestjs/common';
import { IWebsocketClient } from '../interfaces/interfaces';

@Injectable()
export class WebsocketsService {

	private clients: IWebsocketClient[] = [];

	constructor() {}

	addClient(clientData: IWebsocketClient)
	{
		console.log(`New client ${clientData.login}:${clientData.id} connected to '${clientData.namespace}'`);

		const client = this.clients.find(client => client.id === clientData.id);
		if (client)
		{
			// Update
			client.login = clientData.login;
			client.namespace = clientData.namespace;
			return;
		}

		// Add
		this.clients.push(clientData);
	}

	removeClient(clientId: string)
	{
		const client = this.clients.find(client => client.id === clientId);

		if (!client)
			return;

		console.log(`Client ${client.login}:${client.id}  disconnected from '${client.namespace}'`);

		this.clients = this.clients.filter(client => client.id !== clientId);
	}

	getClient(clientId: string): IWebsocketClient
	{
		return this.clients.find(client => client.id === clientId);
	}

}
