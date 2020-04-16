/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import './symbols.less';

import { Config } from '../../config';
import {
	KEY_DOWN,
	KEY_ENTER,
	KEY_LEFT,
	KEY_RIGHT,
	KEY_UP
} from '../../core/constants';
import { Alert } from '../../modules/dialog';
import { IControlType, IJodit } from '../../types';
import { Dom } from '../../modules';
import { attr } from '../../core/helpers/utils';

declare module '../../config' {
	interface Config {
		specialCharacters: string[];
		usePopupForSpecialCharacters: boolean;
	}
}

Config.prototype.usePopupForSpecialCharacters = false;

Config.prototype.specialCharacters = [
	'!',
	'&quot;',
	'#',
	'$',
	'%',
	'&amp;',
	"'",
	'(',
	')',
	'*',
	'+',
	'-',
	'.',
	'/',
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	':',
	';',
	'&lt;',
	'=',
	'&gt;',
	'?',
	'@',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
	'[',
	']',
	'^',
	'_',
	'`',
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
	'{',
	'|',
	'}',
	'~',
	'&euro;',
	'&lsquo;',
	'&rsquo;',
	'&ldquo;',
	'&rdquo;',
	'&ndash;',
	'&mdash;',
	'&iexcl;',
	'&cent;',
	'&pound;',
	'&curren;',
	'&yen;',
	'&brvbar;',
	'&sect;',
	'&uml;',
	'&copy;',
	'&ordf;',
	'&laquo;',
	'&raquo;',
	'&not;',
	'&reg;',
	'&macr;',
	'&deg;',
	'&sup2;',
	'&sup3;',
	'&acute;',
	'&micro;',
	'&para;',
	'&middot;',
	'&cedil;',
	'&sup1;',
	'&ordm;',
	'&frac14;',
	'&frac12;',
	'&frac34;',
	'&iquest;',
	'&Agrave;',
	'&Aacute;',
	'&Acirc;',
	'&Atilde;',
	'&Auml;',
	'&Aring;',
	'&AElig;',
	'&Ccedil;',
	'&Egrave;',
	'&Eacute;',
	'&Ecirc;',
	'&Euml;',
	'&Igrave;',
	'&Iacute;',
	'&Icirc;',
	'&Iuml;',
	'&ETH;',
	'&Ntilde;',
	'&Ograve;',
	'&Oacute;',
	'&Ocirc;',
	'&Otilde;',
	'&Ouml;',
	'&times;',
	'&Oslash;',
	'&Ugrave;',
	'&Uacute;',
	'&Ucirc;',
	'&Uuml;',
	'&Yacute;',
	'&THORN;',
	'&szlig;',
	'&agrave;',
	'&aacute;',
	'&acirc;',
	'&atilde;',
	'&auml;',
	'&aring;',
	'&aelig;',
	'&ccedil;',
	'&egrave;',
	'&eacute;',
	'&ecirc;',
	'&euml;',
	'&igrave;',
	'&iacute;',
	'&icirc;',
	'&iuml;',
	'&eth;',
	'&ntilde;',
	'&ograve;',
	'&oacute;',
	'&ocirc;',
	'&otilde;',
	'&ouml;',
	'&divide;',
	'&oslash;',
	'&ugrave;',
	'&uacute;',
	'&ucirc;',
	'&uuml;',
	'&yacute;',
	'&thorn;',
	'&yuml;',
	'&OElig;',
	'&oelig;',
	'&#372;',
	'&#374',
	'&#373',
	'&#375;',
	'&sbquo;',
	'&#8219;',
	'&bdquo;',
	'&hellip;',
	'&trade;',
	'&#9658;',
	'&bull;',
	'&rarr;',
	'&rArr;',
	'&hArr;',
	'&diams;',
	'&asymp;'
];

Config.prototype.controls.symbol = {
	icon: 'omega',
	hotkeys: ['ctrl+shift+i', 'cmd+shift+i'],
	tooltip: 'Insert Special Character',
	popup: (editor: IJodit, current, control, close): any => {
		const container: HTMLElement | undefined = editor.e.fire(
			'generateSpecialCharactersTable.symbols'
		);
		if (container) {
			if (editor.o.usePopupForSpecialCharacters) {
				const box = editor.c.div();

				box.classList.add('jodit-symbols');
				box.appendChild(container);
				editor.e.on(container, 'close_dialog', close);
				return box;
			} else {
				const dialog = Alert(
					container,
					editor.i18n('Select Special Character'),
					undefined,
					'jodit-symbols'
				);

				const a: HTMLAnchorElement | null = container.querySelector(
					'a'
				);

				a && a.focus();
				editor.e.on('beforeDestruct', () => {
					dialog && dialog.close();
				});
			}
		}
	}
} as IControlType;

/**
 * The plugin inserts characters that are not part of the standard keyboard.
 */
export class symbols {
	private countInRow: number = 17;

	constructor(editor: IJodit) {
		editor.e.on('generateSpecialCharactersTable.symbols', () => {
			const container: HTMLDivElement = editor.c.fromHTML(
					'<div class="jodit-symbols__container">' +
						'<div class="jodit-symbols__container_table"><table><tbody></tbody></table></div>' +
						'<div class="jodit-symbols__container_preview"><div class="jodit-symbols__preview"></div></div>' +
						'</div>'
				) as HTMLDivElement,
				preview: HTMLDivElement = container.querySelector(
					'.jodit-symbols__preview'
				) as HTMLDivElement,
				table: HTMLTableElement = container.querySelector(
					'table'
				) as HTMLTableElement,
				body: HTMLTableSectionElement = table.tBodies[0],
				chars: HTMLAnchorElement[] = [];

			for (let i: number = 0; i < editor.o.specialCharacters.length; ) {
				const tr = editor.c.element('tr');

				for (
					let j: number = 0;
					j < this.countInRow &&
					i < editor.o.specialCharacters.length;
					j += 1, i += 1
				) {
					const td = editor.c.element('td'),
						a = editor.c.fromHTML(
							`<a
											data-index="${i}"
											data-index-j="${j}"
											href="javascript:void(0)"
											role="option"
											tabindex="-1"
									>${editor.o.specialCharacters[i]}</a>`
						) as HTMLAnchorElement;

					chars.push(a);
					td.appendChild(a);
					tr.appendChild(td);
				}

				body.appendChild(tr);
			}

			const self: symbols = this;

			editor.e
				.on(chars, 'focus', function(this: HTMLAnchorElement) {
					preview.innerHTML = this.innerHTML;
				})
				.on(chars, 'mousedown', function(
					this: HTMLAnchorElement,
					e?: MouseEvent
				) {
					if (Dom.isTag(this, 'a')) {
						editor.selection.focus();
						editor.selection.insertHTML(this.innerHTML);
						editor.e.fire(this, 'close_dialog');
						e && e.preventDefault();
						e && e.stopImmediatePropagation();
					}
				})
				.on(chars, 'mouseenter', function(this: HTMLAnchorElement) {
					if (Dom.isTag(this, 'a')) {
						this.focus();
					}
				})
				.on(chars, 'keydown', (e: KeyboardEvent) => {
					const target = e.target;

					if (Dom.isTag(target, 'a')) {
						const index = parseInt(
								attr(target, '-index') || '0',
								10
							),
							jIndex = parseInt(
								attr(target, 'data-index-j') || '0',
								10
							);

						let newIndex: number;

						switch (e.which) {
							case KEY_UP:
							case KEY_DOWN:
								newIndex =
									e.which === KEY_UP
										? index - self.countInRow
										: index + self.countInRow;
								if (chars[newIndex] === undefined) {
									newIndex =
										e.which === KEY_UP
											? Math.floor(
													chars.length /
														self.countInRow
											  ) *
													self.countInRow +
											  jIndex
											: jIndex;

									if (newIndex > chars.length - 1) {
										newIndex -= self.countInRow;
									}
								}

								chars[newIndex] && chars[newIndex].focus();
								break;
							case KEY_RIGHT:
							case KEY_LEFT:
								newIndex =
									e.which === KEY_LEFT
										? index - 1
										: index + 1;
								if (chars[newIndex] === undefined) {
									newIndex =
										e.which === KEY_LEFT
											? chars.length - 1
											: 0;
								}

								chars[newIndex] && chars[newIndex].focus();
								break;
							case KEY_ENTER:
								editor.e.fire(target, 'mousedown');
								e.stopImmediatePropagation();
								e.preventDefault();
								break;
						}
					}
				});

			return container;
		});
	}
}
