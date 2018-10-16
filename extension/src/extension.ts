'use strict';

import * as vscode from 'vscode';
import fetch from 'node-fetch'
import AuthoriationService from './authorizationService';
import TokenStore from './tokenStore';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.signIn', async () => await signIn()));
    context.subscriptions.push(vscode.commands.registerCommand('extension.performRestrictedAction', () => performRestrictedAction()));
}

export function deactivate() {
}


async function signIn(){
    let authService = new AuthoriationService();
    await authService.authorize();
}

async function performRestrictedAction(){
    const response = await fetch('http://localhost:5000/api/values', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + TokenStore.token
        }
    });

    if (response.ok) {
        const panel = vscode.window.createWebviewPanel('results', 'Results', vscode.ViewColumn.One);
        panel.webview.html = await response.text();
    } else if (response.status === 401) {
        vscode.window.showErrorMessage("Access denied. Please login.");
    } else {
        vscode.window.showErrorMessage(response.statusText);
    }
}

