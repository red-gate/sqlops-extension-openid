'use strict';

import * as vscode from 'vscode';
import AuthoriationService from './authorizationService';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.signIn', async () => await signIn()));
}

export function deactivate() {
}


async function signIn(){
    let authService = new AuthoriationService();
    await authService.authorize();
}

