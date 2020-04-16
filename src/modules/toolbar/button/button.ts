import './button.less';

import {
	IControlTypeStrong,
	IToolbarButton,
	IViewBased,
	Nullable
} from '../../../types';
import { UIButton, UIButtonState } from '../../../core/ui/button';
import { watch } from '../../../core/decorators';
import { Dom } from '../../../core/dom';
import { PopupMenu } from '../../popup/';
import { makeCollection } from '../factory';
import {
	isFunction,
	isString,
	position,
	camelCase,
	attr,
	isJoditObject,
	call
} from '../../../core/helpers/';
import { Icon, ToolbarCollection } from '../..';
import { STATUSES } from '../../../core/component';

export class ToolbarButton<T extends IViewBased = IViewBased> extends UIButton
	implements IToolbarButton {
	state = {
		...UIButtonState(),
		hasTrigger: false
	};

	trigger!: HTMLElement;

	/**
	 * Button element
	 */
	get button(): HTMLElement {
		return this.container.querySelector(
			`button.${this.componentName}__button`
		) as HTMLElement;
	}

	/** @override **/
	update(): void {
		const { control, parentElement, state } = this;

		if (parentElement instanceof ToolbarCollection) {
			state.disabled = Boolean(parentElement.shouldBeDisabled(this));
			state.activated = Boolean(parentElement.shouldBeActive(this));
		}

		if (this.j.o.textIcons) {
			state.icon = UIButtonState().icon;
			state.text = control.text || control.name;
		} else {
			if (control.iconURL) {
				state.icon.iconURL = control.iconURL;
			} else {
				const name = control.icon || control.name;
				state.icon.name = Icon.exists(name) ? name : '';
			}

			if (!control.iconURL && !state.icon.name) {
				state.text = control.text || control.name;
			}
		}

		if (control.tooltip) {
			state.tooltip = this.j.i18n(control.tooltip);
		}

		state.hasTrigger = Boolean(control.list || control.popup);

		state.size = this.j.o.toolbarButtonSize || UIButtonState().size;

		if (isFunction(control.update)) {
			control.update(this);
		}

		super.update();
	}

	/** @override */
	protected onChangeText(): void {
		if (isFunction(this.control.template)) {
			this.text.innerHTML = this.control.template(
				this.j,
				this.control.name,
				this.state.text
			);
		} else {
			super.onChangeText();
		}
	}

	/** @override */
	protected createContainer(): HTMLElement {
		const cn = this.componentName;
		const container = this.j.c.span(cn),
			button = super.createContainer();

		button.classList.remove(cn);
		button.classList.add(cn + '__button');

		container.appendChild(button);

		this.trigger = this.j.c.fromHTML(
			`<span class="${cn}__trigger">${Icon.get('chevron')}</span>`
		);

		this.j.e.on(this.trigger, `click`, this.onTriggerClick.bind(this));

		return container;
	}

	/** @override */
	focus() {
		this.container.querySelector('button')?.focus();
	}

	@watch('state.hasTrigger')
	protected onChangeHasTrigger() {
		if (this.state.hasTrigger) {
			this.container.appendChild(this.trigger);
		} else {
			Dom.safeRemove(this.trigger);
		}

		this.container.classList.toggle(
			this.componentName + '_with-trigger',
			this.state.hasTrigger
		);
	}

	/** @override */
	protected onChangeDisabled(): void {
		const dsb = this.state.disabled ? 'disabled' : null;

		attr(this.trigger, 'disabled', dsb);
		attr(this.button, 'disabled', dsb);
		attr(this.container, 'disabled', dsb);
	}

	constructor(
		jodit: IViewBased,
		readonly control: IControlTypeStrong,
		readonly target: Nullable<HTMLElement> = null
	) {
		super(jodit);

		this.container.classList.add(
			`${this.componentName}_${this.clearName(control.name)}`
		);

		// Prevent lost focus
		this.j.e.on(this.button, 'mousedown', (e: MouseEvent) =>
			e.preventDefault()
		);

		this.onAction(this.onClick);

		this.setStatus(STATUSES.ready);

		this.update();
	}

	/**
	 * Click on trigger button
	 */
	protected onTriggerClick() {
		const { control } = this;

		if (control.list) {
			const list = control.list,
				menu = new PopupMenu(this.j),
				toolbar = makeCollection(this.j);

			toolbar.mode = 'vertical';

			const getButton = (key: string, value: string | number) => {
				const childControl: IControlTypeStrong = {
					name: key.toString(),
					template: control.template,
					exec: control.exec,
					command: control.command,
					isActive: control.isActiveChild,
					isDisabled: control.isChildDisabled,
					mode: control.mode,
					args: [...(control.args ? control.args : []), key, value]
				};

				if (isString(value)) {
					childControl.text = value;
				}

				return childControl;
			};

			toolbar.build(
				Array.isArray(list)
					? list.map(getButton)
					: Object.keys(list).map(key => getButton(key, list[key]))
			);

			menu.open(toolbar.container, () => position(this.container));

			this.state.activated = true;

			this.j.e.on(menu, 'afterClose', () => {
				this.state.activated = false;
			});

			return;
		}

		if (isFunction(control.popup)) {
			const popup = new PopupMenu(this.j);

			if (
				this.j.e.fire(
					camelCase(`before-${control.name}-open-popup`),
					this.target,
					control,
					popup
				) !== false
			) {
				const popupElm = control.popup(
					this.j,
					this.target || false,
					control,
					popup.close,
					this
				);

				if (popupElm) {
					popup.open(
						isString(popupElm)
							? this.j.c.fromHTML(popupElm)
							: popupElm,
						() => position(this.container)
					);
				}
			}

			/**
			 * Fired after popup was opened for some control button
			 * @event after{CONTROLNAME}OpenPopup
			 */

			/**
			 * Close all opened popups
			 *
			 * @event closeAllPopups
			 */
			this.j.e.fire(
				camelCase(`after-${control.name}-open-popup`),
				popup.container
			);
		}
	}

	/**
	 * Click handler
	 * @param originalEvent
	 */
	protected onClick(originalEvent: MouseEvent) {
		const { control } = this;

		if (isFunction(control.exec)) {
			control.exec(
				this.j,
				this.target || false,
				control,
				originalEvent,
				this.container as HTMLLIElement
			);

			this.j?.e.fire('synchro');

			if (this.parentElement) {
				this.parentElement.update();
			}

			/**
			 * Fired after calling `button.exec` function
			 * @event afterExec
			 */
			this.j?.e.fire('closeAllPopups afterExec');

			return;
		}

		if (control.command || control.name) {
			call(
				isJoditObject(this.j)
					? this.j.execCommand.bind(this.j)
					: this.j.od.execCommand.bind(this.j.od),
				control.command || control.name,
				(control.args && control.args[0]) || false,
				(control.args && control.args[1]) || null
			);

			this.j.e.fire('closeAllPopups');
		}
	}
}