'use strict';

import * as vscode from 'vscode';
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

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.signIn', async () => await signIn()));
}

export function deactivate() {
}

let clientId: string = 'sample-openId';
let authPort: number = 58805;
let redirectUri = 'http://localhost:' + authPort;
let state: string;

function signIn(){
    let configuration: AuthorizationServiceConfiguration;
    let nodeRequester = new NodeRequestor();
    let result = new Promise<boolean>((async (resolve, reject) => {
        configuration = await fetchServiceConfiguration(nodeRequester, configuration);

        let notifier = new AuthorizationNotifier();
        let authorizationHandler = new NodeBasedHandler(authPort);
        authorizationHandler.setAuthorizationNotifier(notifier);

        notifier.setAuthorizationListener(async (request, response, error) => {
            console.log('Authorization request complete ', request, response, error);
            if (response) {
                if (response.state === state){
                    let token = await getTokenResponse(response.code, nodeRequester, configuration);
                    console.log(token);
                } else {
                    console.log('Failed to authorize', error);
                }
            }
        });

        perfromAutorizationRequest(authorizationHandler, configuration);
    }));

   return result;
}

async function fetchServiceConfiguration(nodeRequester: NodeRequestor, configuration: AuthorizationServiceConfiguration) {
    await AuthorizationServiceConfiguration.fetchFromIssuer("http://127.0.0.1:80", nodeRequester).then(response => {
        console.log('Fetched service configuration', response);
        configuration = response;
    }).catch(error => {
        console.log('Something bad happened', error);
    });
    return configuration;
}

async function getTokenResponse(code: any, nodeRequester: NodeRequestor, configuration: AuthorizationServiceConfiguration): Promise<TokenResponse> {
    let request = new TokenRequest(
        clientId, 
        redirectUri, 
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

async function perfromAutorizationRequest(authorizationHandler: NodeBasedHandler, configuration: AuthorizationServiceConfiguration) {
    state = getUniqueState();
    let request = new AuthorizationRequest(clientId, 
        redirectUri, 
        'openid profile audience:server:client_id:sample-openId', 
        AuthorizationRequest.RESPONSE_TYPE_CODE, 
        state, /* state */ 
        { 'prompt': 'consent', 'access_type': 'offline' 
    });
    authorizationHandler.performAuthorizationRequest(configuration, request);
}

function getUniqueState(): string{
    return Math.random().toString(32);
}