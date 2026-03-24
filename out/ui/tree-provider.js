"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
class DocsTreeProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        // Mock data for initial sidebar
        return Promise.resolve([
            new DependencyItem("Scan Dependencies", "Action", vscode.TreeItemCollapsibleState.None, {
                command: "watchdocs.scan",
                title: "Scan Dependencies"
            }, "play"),
            new DependencyItem("react", "18.2.0", vscode.TreeItemCollapsibleState.None, {
                command: "vscode.open",
                title: "Open Docs",
                arguments: [vscode.Uri.parse("https://reactjs.org/docs/getting-started.html")]
            }, "library"),
            new DependencyItem("express", "4.18.2", vscode.TreeItemCollapsibleState.None, {
                command: "vscode.open",
                title: "Open Docs",
                arguments: [vscode.Uri.parse("https://expressjs.com/en/starter/installing.html")]
            }, "library")
        ]);
    }
}
exports.DocsTreeProvider = DocsTreeProvider;
class DependencyItem extends vscode.TreeItem {
    label;
    version;
    collapsibleState;
    command;
    iconName;
    constructor(label, version, collapsibleState, command, iconName = "library") {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconName = iconName;
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
        this.iconPath = new vscode.ThemeIcon(iconName);
    }
}
//# sourceMappingURL=tree-provider.js.map