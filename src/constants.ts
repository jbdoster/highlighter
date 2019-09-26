import * as vscode from 'vscode';

export const COLORS_PATH = 'resources/imgs/colors-picker/';
export const HIGHLIGHTS_KEY: string = '_highlights';
export const QUEUE_KEY:      string = '_queue';
export const COMMAND_HIGHLIGHT: string = 'extension.highlightLines';
export const COMMAND_FIND: string = 'extension.findHighlight';
export const COMMAND_REMOVE: string = 'extension.removeHighlight';
export const COMMAND_REMOVE_ALL: string = 'extension.removeAllHighlights';
export const USER_COLOR_CHOICE = "_user_color_choice";
export const NO_SAVED_HIGHLIGHTS = "You do not have any saved highlights";
export const NO_NAME_SET = "No name set for selection, please try again";
export const GIVE_A_NAME = "Give a name for this highlight to find it again!";
export const PICK_A_COLOR = "Pick a color";
export const EDITOR_BG_COLOR = 'editor.background';
export const EMPTY_STRING = "";
export enum Op { ADD, SUBTRACT }
export namespace lib {
    export type HIGHLIGHTS_KEY = "_highlights";
    export type r_void = Promise<void>;
}