/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { Config } from '../config';
import { Dom } from '../core/dom';
import { IControlType, IJodit } from '../types';
import { Plugin } from '../core/plugin';

function exec(editor: IJodit, event: Node | false, control: IControlType) {
	editor.e.fire(
		'insertList',
		control.command as string,
		control.args && control.args[0]
	);
}

Config.prototype.controls.ul = {
	command: 'insertUnorderedList',
	exec,
	tags: ['ul'],
	tooltip: 'Insert Unordered List',

	list: {
		default: 'Default',
		circle: 'Circle',
		disc: 'Disc',
		square: 'Square'
	}
} as IControlType;

Config.prototype.controls.ol = {
	command: 'insertOrderedList',
	exec,
	tags: ['ol'],
	tooltip: 'Insert Ordered List',

	list: {
		default: 'Default',
		'lower-alpha': 'Lower Alpha',
		'lower-greek': 'Lower Greek',
		'lower-roman': 'Lower Roman',
		'upper-alpha': 'Upper Alpha',
		'upper-roman': 'Upper Roman'
	}
} as IControlType;

/**
 * Process commands insertOrderedList and insertUnOrderedList
 */
export class orderedlist extends Plugin {
	protected afterInit(jodit: IJodit): void {
		jodit.e.on('insertList', (command: string): false | void => {
			let ul = Dom.up(
				jodit.selection.current() as Node,
				(tag: Node | null) => tag && /^UL|OL$/i.test(tag.nodeName),
				jodit.editor
			) as HTMLUListElement;

			if (!ul) {
				ul = this.j.c.inside.element('ul');
				const items = this.j.selection.wrapInTag('li');
				items.forEach(li => {
					ul.appendChild(li);
				});
			}

			ul && this.unwrapIfHasParent(ul);

			jodit.setEditorValue();
		});
	}

	private unwrapIfHasParent(ul: HTMLUListElement): void {
		if (Dom.isTag(ul.parentNode, 'p')) {
			const selection = this.j.selection.save();

			Dom.unwrap(ul.parentNode);

			Array.from(ul.childNodes).forEach(li => {
				if (Dom.isTag(li.lastChild, 'br')) {
					Dom.safeRemove(li.lastChild);
				}
			});

			this.j.selection.restore(selection);
		}
	}

	protected beforeDestruct(jodit: IJodit): void {}
}
