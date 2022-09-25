import { Injectable } from '@nestjs/common';
import { IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { WsFirstConnectDto } from '../interfaces/dtos';
import { AuthService } from '../auth/auth.service';
import { Server } from 'socket.io';

@Injectable()
export class WebsocketsService {

	private clients: IWebsocketClient[] = [];

	constructor(
			private authService: AuthService,
	) {}

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

	async validateFirstConnect(payload: WsFirstConnectDto, namespace: string): Promise<IJwtPayload | null>
	{
		let jwtPayload: IJwtPayload = null;
		try
		{
			jwtPayload = await this.authService.getJwtFromCookie(payload.cookie);
		}
		catch (e)
		{
			console.log(`Error while handling first connect in ${namespace}: ${e}`);
			return null;
		}

		return jwtPayload;
	}

}
