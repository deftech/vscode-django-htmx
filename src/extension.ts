// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

var attrs: any;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "django-htmx" is now active!');

	if(attrs === undefined){
		const jsonPath = path.join(context.extensionPath, 'django-html.htmx-data.json');
		try {
			const fileContent = fs.readFileSync(jsonPath, 'utf8');
			attrs = JSON.parse(fileContent);
		} catch (error) {
			console.error('Failed to load attribute descriptions:', error);
			return null;
		}
	}

	vscode.languages.registerHoverProvider('django-html', {
		provideHover(document, position, token) {
			const wr = document.getWordRangeAtPosition(position, /hx-[a-z]+/);
			if(wr){
				const word = document.getText(wr);
				if (word in attrs.attributes){
					return new vscode.Hover(attrs.attributes[word].description);
				}	
			}
			else{
				return null;
			}
		}
	});

	const completionProvider = vscode.languages.registerCompletionItemProvider(
		'django-html', 
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				//const linePrefix = document.lineAt(position).text.substr(0, position.character);
				const range = document.getWordRangeAtPosition(position, /hx-[a-z]*/);
				if(range){
					var word = document.getText(new vscode.Range(range.start, position));
				}
				else{
					return null;
				}
				
				const completionItems: vscode.CompletionItem[] = [];
				
				Object.keys(attrs.attributes).forEach(attr => {
					if(attr.startsWith(word)){
						const item = new vscode.CompletionItem(
							attr.substring(word.length), 
							vscode.CompletionItemKind.Property
						);
						item.detail = `Value for ${attr}`;
						completionItems.push(item);
					}
				});
	
				return completionItems;
			},
		},
		'-' // Trigger characters
	);	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('django-htmx.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello VSCode from django-htmx!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(completionProvider);	
}

// This method is called when your extension is deactivated
export function deactivate() {}
