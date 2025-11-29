'use strict';
//20/03/25

/* exported _wheel */

/**
 * Wheel helper.
 *
 * @name _wheel
 * @constructor
 * @param {object} o - argument
 * @param {'u'|'mu'|'%'|'log'} o.unit - [='u'] Change per unit, mili-unit, % of total variable or log scaling
 * @param {number} o.step - [=5] Wheel steps ratio
 * @param {boolean} o.bReversed - [=false] Flag to reverse direction
 * @param {'playbacktime'|'volume'|'variable'} o.mode - [='time'] Variable to control
 */
function _wheel({
	unit = 'u',
	step = 5,
	bReversed = false,
	mode = 'playbacktime'
} = {}) {
	/**
	 * Checks current settings are valid and overwrites invalid values.
	 * @property
	 * @name checkConfig
	 * @kind method
	 * @memberof _wheel
	 * @type {function}
	 * @returns {void(0)}
	*/
	this.checkConfig = () => {
		if (this.step < 0) { this.step = 1; }
		else if (this.step > 100 && this.unit === '%') { this.step = 100; }
		if (!['u', 'mu', '%', 'log'].includes(this.unit)) { this.unit = 'u'; }
		this.mode = this.mode.toLowerCase();
	};
	/**
	 * Called on on_mouse_wheel.
	 * @property
	 * @name change
	 * @kind method
	 * @memberof _wheel
	 * @type {function}
	 * @param {number} s - Wheel steps
	 * @param {number} current - Current value in 'variable' mode
	 * @param {number} total- Max value in 'variable' mode
	 * @returns {number}
	*/
	this.change = (s, current, total) => {
		let out;
		if (this.mode === 'playbacktime') {
			current = fb.PlaybackTime < Number.MAX_SAFE_INTEGER ? fb.PlaybackTime : 0;
			total = fb.PlaybackLength;
		} else if (this.mode === 'volume') {
			current = 100 + fb.Volume;
			total = 100;
		}
		const scroll = s * this.step * (this.bReversed ? -1 : 1);
		out = current;
		switch (this.unit.toLowerCase()) {
			case 'mu': out += scroll / 1000; break;
			case '%': out += scroll / 100 * total; break;
			case 'log': {
				const scale = Math.max((10 - 10 ** (current / total)), 0.5);
				out += scale * Math.sign(scroll);
				break;
			}
			case 'u':
			default: out += scroll; break;
		}
		if (out < 0) { out = 0; }
		else if (out > total) { out = total; }
		if (this.mode === 'volume') { out -= 100; }
		return out;
	};
	/**
	 * Inits panel variables.
	 * @property
	 * @name init
	 * @kind method
	 * @memberof _wheel
	 * @type {function}
	 * @returns {void(0)}
	*/
	this.init = () => {
		this.checkConfig();
	};
	this.unit = unit;
	this.step = step;
	this.bReversed = bReversed;
	this.mode = mode;
	this.init();
}