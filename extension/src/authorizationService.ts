'use strict'
import { AuthorizationRequest } from "@openid/appauth/built/authorization_request";
import { AuthorizationServiceConfiguration } from "@openid/appauth/built/authorization_service_configuration";
import { NodeBasedHandler } from "@openid/appauth/built/node_support/node_request_handler";
import { NodeRequestor } from "@openid/appauth/built/node_support/node_requestor";
import { AuthorizationNotifier } from "@openid/appauth/built/authorization_request_handler";
import {
    GRANT_TYPE_AUTHORIZATION_CODE,
    TokenRequest
} from "@openid/appauth/built/token_request";
import { BaseTokenRequestHandler } from "@openid/appauth/built/token_request_handler";
import { TokenResponse } from '@openid/appauth/built/token_response';
import { AuthorizationResponse } from "@openid/appauth/built/authorization_response";

export default class AuthoriationService {
    
    private readonly clientId: string = 'sample-openId';
    private readonly authPort: number = 58805;
    private readonly redirectUri = 'http://localhost:' + this.authPort;
    private state!: string;

    async authorize(): Promise<boolean> {
        const nodeRequester = new NodeRequestor();
        const configuration = await this.fetchServiceConfiguration(nodeRequester);
        let response = await this.performAuthorization(configuration);
        if (response) {
            if (response.state === this.state){
                let token = await this.getTokenResponse(response.code, nodeRequester, configuration);
                console.log(token);
            } else {
                console.log('Failed to authorize');
            }
        }

        return false;
    }

    private performAuthorization(configuration: AuthorizationServiceConfiguration): Promise<AuthorizationResponse>{
        return new Promise((resolve, reject) => {
            let notifier = new AuthorizationNotifier();
            let authorizationHandler = new NodeBasedHandler(this.authPort);
            authorizationHandler.setAuthorizationNotifier(notifier);
            notifier.setAuthorizationListener(async (request, response, error) => {
                console.log('Authorization request complete ', request, response, error);
                if (error) {
                    reject(error);
                } else {
                    if (response !== null){
                        resolve(response);
                    }
                }
            });

            this.performAuthorizationRequest(authorizationHandler, configuration);
        });
    }

    private async fetchServiceConfiguration(nodeRequester: NodeRequestor): Promise<AuthorizationServiceConfiguration> {
        let configuration!: AuthorizationServiceConfiguration;
        await AuthorizationServiceConfiguration.fetchFromIssuer("http://127.0.0.1:80", nodeRequester).then(response => {
            console.log('Fetched service configuration', response);
            configuration = response;
        }).catch(error => {
            console.log('Something bad happened', error);
        });
        return configuration;
    }

    private async getTokenResponse(code: any, nodeRequester: NodeRequestor, configuration: AuthorizationServiceConfiguration): Promise<TokenResponse> {
        let request = new TokenRequest(
            this.clientId, 
            this.redirectUri, 
            GRANT_TYPE_AUTHORIZATION_CODE, 
            code, 
            undefined, 
            { 'client_secret': 'sampleOpenIdExtensionSecret' }
        );
        let tokenHandler = new BaseTokenRequestHandler(nodeRequester);
        return await tokenHandler.performTokenRequest(configuration, request)
            .then(response => {
                console.log(`Refresh Token is ${response}`);
                return response;
            });
    }

    private performAuthorizationRequest(authorizationHandler: NodeBasedHandler, configuration: AuthorizationServiceConfiguration) {
        this.state = this.getUniqueState();
        let request = new AuthorizationRequest(this.clientId, 
            this.redirectUri, 
            'openid profile audience:server:client_id:sample-openId', 
            AuthorizationRequest.RESPONSE_TYPE_CODE, 
            this.state, /* state */ 
            { 'prompt': 'consent', 'access_type': 'offline' 
        });
        authorizationHandler.performAuthorizationRequest(configuration, request);
    }

    private getUniqueState(): string{
        return Math.random().toString(32);
    }
}