'use strict';
//29/12/25

/* exported _slider */

include('window_xxx_helpers.js');
/* global darkenColor:readable, lightenColor:readable, blendColors:readable, isDark:readable, toRGB:readable, opaqueColor:readable, IDC_HAND:readable, IDC_ARROW:readable, _gdiFont:readable, _scale:readable, DT_VCENTER:readable, DT_RIGHT:readable, DT_CALCRECT:readable, DT_CENTER:readable */

/**
 * Horizontal slider.
 *
 * @name _slider
 * @constructor
 * @param {object} o - argument
 * @param {number} o.x - [=0] X panel position.
 * @param {number} o.y - [=0] Y panel position.
 * @param {number} o.w - [=window.Width] Width panel size.
 * @param {number} o.h - [=window.Height] Height panel size.
 * @param {number} o.marginXPerc - [=2.5] % of x-margin relative to panel width.
 * @param {number} o.marginYPerc - [=20]  % of y-margin relative to panel height.
 * @param {number} o.selectorW - [=window.Width / 50] Button size.
 * @param {number} o.buttonY - [=100] % of height relative to bar size.
 * @param {object} o.style - Elements styles
 * @param {'rounded'|'triangle'|'histogram'|'roundedgradient'|'histogramgradient'} o.style.bar - [='rounded'] Bar style
 * @param {'none'|'rounded'|'roundedthemed'|'vertical'|'verticalthemed'} o.style.selector - [='rounded'] Button style
 * @param {'none'|'simple'|'complex'} o.style.shade - [='none'] Elements shading style
 * @param {buttonStyle} o.style.leftButton - [='none'] left button style
 * @param {buttonStyle} o.style.rightButton - [='none'] Right button style
 * @param {object} o.callbacks - Panel callbacks
 * @param {function(number):void} o.callbacks.wheelUp - [=(s) => void(0)] Called when using the mouse wheel
 * @param {function(number):void} o.callbacks.wheelDown - [=(s) => void(0)] Called when using the mouse wheel
 * @param {function(number, number, string):void} o.callbacks.tooltip - [=(dragLin, dragLog, buttonStyle) => void(0)] Called when mouse is over panel to display tooltip. Linear and log values scaled [0-100].
 * @param {function(number, number):void} o.callbacks.lDrag - [=(dragLin, dragLog) => void(0)] Called while mouse dragging. Linear and log values scaled [0-100].
 * @param {function():number} o.callbacks.pos - [=() => void(0)] Called when using .change() method. Must return a number scaled [0-1]
 * @param {function(number):[string, number, number]} o.callbacks.buttonIcon - [=null] Called when painting left/right buttons. Must return char for FontAwesome 4 font and its height scale.
 * @param {function(string):void} o.callbacks.customButton - [=(curValue) => void (0)] Called when clicking on custom button.
 * @param {function(number, string):void} o.callbacks.displayButton - [=(curValue, style) => void (0)] Called when clicking on display button.
 * @param {function(number, number):void} o.callbacks.dblclkSel - [=null] Called when double clicking on selector slider button. To override default behavior, a function must be provided.
 * @param {object} o.colors - Panel colors
 * @param {number} o.colors.background - [=RGB(50, 50, 50)] Panel background color. Set to -1 to disable it.
 * @param {number} o.colors.left - [=RGB(196, 30, 35)] Left fill bar color. Set to -1 to disable it.
 * @param {number} o.colors.right - [=RGB(70, 70, 70)] Right fill bar color. Set to -1 to disable it.
 * @param {number} o.colors.sel - [=RGB(50, 50, 50)] Selector slider button color. Set to -1 to disable it.
 * @param {number} o.colors.buttons - [=RGB(50, 50, 50)] Left/Right buttons color. Set to -1 to disable it.
 */
function _slider({
	x = 0, y = 0, w = window.Width, h = window.Height,
	marginXPerc = 2.5, marginYPerc = 20,
	selectorW = window.Width / 50, buttonY = 100,
	style = {
		bar: 'rounded',
		selector: 'rounded',
		shade: 'none',
		leftButton: 'none',
		rightButton: 'none',
	},
	callbacks = {
		wheelUp: (s) => void (0), // eslint-disable-line no-unused-vars
		wheelDown: (s) => void (0), // eslint-disable-line no-unused-vars
		tooltip: (dragLin, dragLog, buttonStyle) => void (0), // eslint-disable-line no-unused-vars
		lDrag: (dragLin, dragLog) => void (0), // eslint-disable-line no-unused-vars
		pos: () => void (0),
		buttonIcon: null,
		customButton: (curValue) => void (0), // eslint-disable-line no-unused-vars,
		displayButton: (curValue, style) => void (0), // eslint-disable-line no-unused-vars,
		dblclkSel: null // eslint-disable-line no-unused-vars,
	},
	colors = {
		background: 0xff333333,
		left: 0xffc21e24,
		right: 0xff454545,
		sel: 0xff333333,
		buttons: 0xff333333,
	}
} = {}) {
	/**
	 * Repaints panel.
	 * @property
	 * @name repaint
	 * @kind method
	 * @memberof _slider
	 * @param {boolean} bForce - Force repainting.
	 * @returns {void(0)}
	*/
	this.repaint = (bForce = false) => {
		window.RepaintRect(this.x, this.y, this.w, this.h, bForce);
	};
	/**
	 * Paints panel. Called on_paint
	 * @property
	 * @name paint
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @returns {void(0)}
	*/
	this.paint = (gr) => {
		if (this.colors.background !== -1) {
			gr.FillSolidRect(this.x, this.y, this.w, this.h, this.colors.background);
		}
		const h = this.calculateBarHeight();
		this.offsetX = this.paintButton(gr, 'left', this.x + this.marginX, h, false);
		this.offsetW = this.paintButton(gr, 'right', this.x + this.w - this.marginX, h, true);
		this.barW = this.w - this.marginX * 2 - this.offsetX - this.offsetW;
		this.barX = this.x + this.marginX + this.offsetX;
		const currW = this.barW * this.current;
		this.paintBar(gr, this.barX, this.barW, h);
		this.paintSelector(gr, this.barX + currW, h);
		if (this.bDebug) { this.paintDebug(gr, this.barX, this.barW); }
	};
	/**
	 * Paints a vertical rect button at current position
	 * @property
	 * @name paintVerticalSel
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the button.
	 * @returns {void(0)}
	*/
	this.paintVerticalSel = (gr, x) => {
		const color = this.isDrag || this.isHoverSelector
			? lightenColor(this.colors.sel, 10)
			: this.colors.sel;
		const w = this.selectorW;
		const w2 = w / 2;
		if (['simple', 'complex'].includes(this.style.shade)) {
			const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 7);
			gr.FillSolidRect(x - w2 - w2 / 3, this.y, Math.max(w, 4) + 2 * w2 / 3, this.h, shadeCol);
		}
		gr.FillSolidRect(x - w2, this.y, w, this.h, color);
		gr.DrawRoundRect(x - w2, this.y, Math.max(w, 4), this.h, 2, 2, Math.round(w2 / 10) || 1, darkenColor(color, 15));
	};
	/**
	 * Paints a vertical themed rect button at current position
	 * @property
	 * @name paintVerticalThemedSel
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the button.
	 * @returns {void(0)}
	*/
	this.paintVerticalThemedSel = (gr, x) => {
		const color = this.isDrag || this.isHoverSelector
			? lightenColor(this.colors.sel, 10)
			: this.colors.sel;
		const colorInt = this.isDrag || this.isHoverSelector
			? darkenColor(this.colors.sel, 50)
			: darkenColor(this.colors.sel, 30);
		const w = this.selectorW;
		const h = this.h;
		const w2 = w / 2;
		gr.SetSmoothingMode(2);
		if (['simple', 'complex'].includes(this.style.shade)) {
			const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 7);
			gr.FillSolidRect(x - w2 - w2 / 3, this.y, Math.max(w, 4) + 2 * w2 / 3, this.h, shadeCol);
		}
		gr.FillGradRect(x - w2, this.y, w, h, 270, color, lightenColor(color, 15));
		const iconH = h / 8;
		gr.FillPolygon(colorInt, 0, [
			x + w / 4 - w2, this.y + iconH * 2,
			x + w / 2 - w2, this.y + iconH,
			x + w * 3 / 4 - w2, this.y + iconH * 2
		]);
		gr.FillPolygon(colorInt, 0, [
			x + w / 4 - w2, this.y + iconH + h / 2 + iconH,
			x + w / 2 - w2, this.y + iconH * 2 + h / 2 + iconH,
			x + w * 3 / 4 - w2, this.y + iconH + h / 2 + iconH
		]);
		let shadeW = Math.round(w2 / 3) || 1;
		gr.DrawRoundRect(x - w2 + shadeW / 2, this.y + shadeW / 2, w - shadeW, h / 2 - shadeW, 2, 2, shadeW, lightenColor(color, 3));
		gr.DrawRoundRect(x - w2 + shadeW / 2, this.y + h / 2 + shadeW / 2, w - shadeW, h / 2 - shadeW, 2, 2, shadeW, color);
		shadeW = Math.round(w2 / 10) || 1;
		gr.DrawLine(x - w2, (this.y + h) / 2, x + w2, (this.y + h) / 2, shadeW * 1.5, darkenColor(color, 15));
		gr.DrawRoundRect(x - w2, this.y, Math.max(w, 4), h, 2, 2, shadeW, darkenColor(color, 15));
		gr.SetSmoothingMode(0);
	};
	/**
	 * Paints a simple rounded button at current position
	 * @property
	 * @name paintRoundedSel
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the button.
	 * @param {number} h - Current volume position height. Varies at different volumes. Only used along triangle bar.
	 * @returns {void(0)}
	*/
	this.paintRoundedSel = (gr, x, h) => {
		const color = this.isDrag || this.isHoverSelector
			? lightenColor(this.colors.sel, 10)
			: this.colors.sel;
		const w = this.selectorW;
		const w2 = w / 2;
		gr.SetSmoothingMode(2);
		if (['simple', 'complex'].includes(this.style.shade)) {
			const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 7);
			if (['triangle', 'histogram', 'histogramgradient'].includes(this.style.bar.toLowerCase())) {
				gr.FillEllipse(x - w2 - w2 / 3, this.y + this.h - h / 2 - this.marginY - w2 - w2 / 3, w + 2 * w2 / 3, w + 2 * w2 / 3, shadeCol);
			} else {
				gr.FillEllipse(x - w2 - w2 / 3, (this.y + this.h - w) / 2 - w2 / 3, w + 2 * w2 / 3, w + 2 * w2 / 3, shadeCol);
			}
		}
		if (['triangle', 'histogram', 'histogramgradient'].includes(this.style.bar.toLowerCase())) {
			gr.FillEllipse(x - w2, this.y + this.h - h / 2 - this.marginY - w2, w, w, color);
			gr.DrawEllipse(x - w2, this.y + this.h - h / 2 - this.marginY - w2, w, w, Math.round(w2 / 10) || 1, darkenColor(color, 15));
		} else {
			gr.FillEllipse(x - w2, (this.y + this.h - w) / 2, w, w, color);
			gr.DrawEllipse(x - w2, (this.y + this.h - w) / 2, w, w, Math.round(w2 / 10) || 1, darkenColor(color, 15));
		}
		gr.SetSmoothingMode(0);
	};
	/**
	 * Paints a rounded themed button at current position
	 * @property
	 * @name paintRoundedThemedSel
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the button.
	 * @param {number} h - Current volume position height. Varies at different volumes. Only used along triangle bar.
	 * @returns {void(0)}
	*/
	this.paintRoundedThemedSel = (gr, x, h) => {
		const color = this.isDrag || this.isHoverSelector
			? lightenColor(this.colors.sel, 10)
			: this.colors.sel;
		const colorInt = this.isDrag || this.isHoverSelector
			? lightenColor(this.colors.sel, 20)
			: lightenColor(this.colors.sel, 10);
		const w = this.selectorW;
		const w2 = w / 2;
		const wInt = w * 0.65;
		const wInt2 = wInt / 3;
		const wInt3 = wInt / 10;
		gr.SetSmoothingMode(2);
		if (['simple', 'complex'].includes(this.style.shade)) {
			const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 7);
			if (['triangle', 'histogram', 'histogramgradient'].includes(this.style.bar.toLowerCase())) {
				gr.FillEllipse(x - w2 - w2 / 3, this.y + this.h - h / 2 - this.marginY - w2 - w2 / 3, w + 2 * w2 / 3, w + 2 * w2 / 3, shadeCol);
			} else {
				gr.FillEllipse(x - w2 - w2 / 3, (this.y + this.h - w) / 2 - w2 / 3, w + 2 * w2 / 3, w + 2 * w2 / 3, shadeCol);
			}
		}
		if (['triangle', 'histogram', 'histogramgradient'].includes(this.style.bar.toLowerCase())) {
			gr.FillEllipse(x - w2, this.y + this.h - h / 2 - this.marginY - w2, w, w, color);
			gr.FillEllipse(x - wInt / 2, this.y + this.h - h / 2 - this.marginY - wInt / 2, wInt, wInt, colorInt);
			gr.FillEllipse(x - wInt2 / 2, this.y + this.h - h / 2 - this.marginY - wInt2 / 2, wInt2, wInt2, darkenColor(color, 15));
			gr.FillEllipse(x - wInt3 / 2, this.y + this.h - h / 2 - this.marginY - wInt3 / 2, wInt3, wInt3, lightenColor(color, 30));
			gr.DrawEllipse(x - w2, this.y + this.h - h / 2 - this.marginY - w2, w, w, Math.round(w2 / 10) || 1, darkenColor(color, 15));
		} else {
			gr.FillEllipse(x - w2, (this.y + this.h) / 2 - w2, w, w, color);
			gr.FillEllipse(x - wInt / 2, (this.y + this.h - wInt) / 2, wInt, wInt, colorInt);
			gr.FillEllipse(x - wInt2 / 2, (this.y + this.h - wInt2) / 2, wInt2, wInt2, darkenColor(color, 15));
			gr.FillEllipse(x - wInt3 / 2, (this.y + this.h - wInt3) / 2, wInt3, wInt3, lightenColor(color, 30));
			gr.DrawEllipse(x - w2, (this.y + this.h - w) / 2, w, w, Math.round(w2 / 10) || 1, darkenColor(color, 15));
		}
		gr.SetSmoothingMode(0);
	};
	/**
	 * Paints a triangle x-bar which may be filled with 2 colors
	 *
	 * @property
	 * @name paintTriangleBar
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the bar.
	 * @param {number} currW - Current volume position.
	 * @param {number} h - Current volume position height. Varies at different volumes.
	 * @returns {void(0)}
	*/
	this.paintTriangleBar = (gr, x, w, h) => {
		if (typeof h === 'undefined') { h = (this.h - this.marginY * 2) * this.current; }
		const currW = w * this.current;
		const y = this.y + this.h - this.marginY;
		const points = [];
		if (this.colors.left === this.colors.right && this.colors.left !== -1) {
			points.push(
				{
					color: this.colors.left,
					coords: [
						x, y,
						x + w, y,
						x + w, y - (this.h - this.marginY * 2)
					]
				}
			);
		} else {
			if (this.colors.left !== -1 && this.current !== 0) {
				points.push(
					{
						color: this.colors.left,
						coords: [
							x, y,
							x + currW, y,
							x + currW, y - h
						]
					}
				);
			}
			if (this.colors.right !== -1 && this.current !== 1) {
				points.push(
					{
						color: this.colors.right,
						coords: [
							x + currW, y,
							x + w, y,
							x + w, y - (this.h - this.marginY * 2),
							x + currW, y - h
						]
					}
				);
			}
		}
		gr.SetSmoothingMode(2);
		if (points.length) {
			points.forEach((layer) => {
				gr.FillPolygon(layer.color, 1, layer.coords);
				const outCol = isDark(layer.color) ? lightenColor(layer.color, 15) : darkenColor(layer.color, 15);
				gr.DrawPolygon(outCol, 1, layer.coords);
			});
		}
		if (this.colors.background !== -1) {
			if (['simple', 'complex'].includes(this.style.shade)) {
				const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 30);
				const shadeW = Math.max(this.h / 30, 3);
				gr.FillPolygon(
					shadeCol, 0,
					[
						x, y,
						x + w, y - (this.h - this.marginY * 2),
						x + w, y - (this.h - this.marginY * 2) + shadeW
					]
				);
			}
		}
		gr.SetSmoothingMode(0);
	};
	/**
	 * Paints a triangle-histogram x-bar which may be filled with 2 colors or a gradient
	 *
	 * @property
	 * @name paintHistogramBar
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the bar.
	 * @param {number} currW - Current volume position.
	 * @param {number} h - Current volume position height. Varies at different volumes.
	 * @returns {void(0)}
	*/
	this.paintHistogramBar = (gr, x, w) => {
		const currW = w * this.current;
		const bGrad = this.style.bar.toLowerCase() === 'histogramgradient';
		const y = this.y + this.h - this.marginY;
		const bars = 10;
		const barW = w / (bars + 2);
		const margin = barW / bars;
		const points = [];
		const shade = [];
		const lColor = this.colors.left === -1
			? opaqueColor(this.colors.right, 0)
			: this.colors.left;
		const rColor = bGrad
			? isDark(...toRGB(this.colors.background))
				? lightenColor(this.colors.background, 10)
				: darkenColor(this.colors.background, 10)
			: this.colors.right;
		const shadeW = Math.min(Math.max(this.h / 30, 3), Math.max(this.w / 30, 3));
		for (let i = 0; i <= bars; i++) {
			const xBar = x + i * (barW + margin);
			const color = xBar > x + currW || !this.current
				? bGrad
					? rColor
					: this.colors.right
				: bGrad
					? blendColors(lColor, this.colors.right, i / bars)
					: this.colors.left;
			points.push(
				{
					color,
					coords: [
						xBar, y,
						xBar + barW, y,
						xBar + barW, y - (this.h - this.marginY * 2) / bars * i,
						xBar, y - (this.h - this.marginY * 2) / bars * i
					]
				}
			);
			if (i !== 0) {
				shade.push([
					xBar, y,
					xBar, y - (this.h - this.marginY * 2) / bars * i,
					xBar + barW, y - (this.h - this.marginY * 2) / bars * i,
					xBar + barW, y - (this.h - this.marginY * 2) / bars * i + shadeW,
					xBar + shadeW, y - (this.h - this.marginY * 2) / bars * i + shadeW,
					xBar + shadeW, y
				]);
			}
		}
		gr.SetSmoothingMode(2);
		if (points.length) {
			const paintShade = this.style.shade === 'complex'
				? (shadeW, tint, pointFunc) => {
					const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 80), tint);
					const shadeImg = gdi.CreateImage(window.Width, window.Height);
					const shadeGr = shadeImg.GetGraphics();
					shadeGr.SetSmoothingMode(2);
					pointFunc(shadeGr, shadeCol);
					shadeImg.StackBlur(shadeW);
					shadeImg.ReleaseGraphics(shadeGr);
					gr.DrawImage(shadeImg, 0, 0, window.Width, window.Height, 0, 0, shadeImg.Width, shadeImg.Height);
				}
				: null;
			if (this.colors.background !== -1) {
				if (this.style.shade === 'complex') {
					paintShade(barW / 10, 10, (shadeGr, shadeCol) => points.forEach((layer) => shadeGr.DrawPolygon(shadeCol, 2, layer.coords)));
				}
			}
			points.forEach((layer) => {
				gr.FillPolygon(layer.color, 1, layer.coords);
				const outCol = isDark(layer.color) ? lightenColor(layer.color, 15) : darkenColor(layer.color, 15);
				gr.DrawPolygon(outCol, 1, layer.coords);
			});
			if (this.colors.background !== -1) {
				if (this.style.shade === 'simple') {
					const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 80), 10);
					shade.forEach((coords) => gr.FillPolygon(shadeCol, 0, coords));
				} else if (this.style.shade === 'complex') {
					paintShade(barW / 10, 10, (shadeGr, shadeCol) => shade.forEach((coords) => shadeGr.FillPolygon(shadeCol, 0, coords)));
				}
			}
		}
		gr.SetSmoothingMode(0);
	};
	/**
	 * Paints a rounded x-bar which may be filled with 2 colors or a gradient
	 *
	 * @property
	 * @name paintRoundedBar
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left coordinate to paint the bar.
	 * @param {number} currW - Current position.
	 * @param {number} h - Height of the bar. Constant for all points.
	 * @returns {void(0)}
	*/
	this.paintRoundedBar = (gr, x, w, h) => {
		if (typeof h === 'undefined') { h = Math.max(Math.round((this.y + this.h - this.marginY) / 3), 2); }
		const currW = w * this.current;
		const bGrad = this.style.bar.toLowerCase() === 'roundedgradient';
		const y = (this.y + this.h - h) / 2;
		const arc = h / 2;
		gr.SetSmoothingMode(2);
		if (this.colors.left === this.colors.right && this.colors.left !== -1) {
			gr.FillRoundRect(x, y, w, h, arc, arc, this.colors.left, 15);
		} else {
			const paintLeft = (currW) => {
				if ((this.colors.left !== -1 || bGrad) && this.current !== 0) {
					const lColor = bGrad && this.colors.left === -1
						? opaqueColor(this.colors.right, 1)
						: this.colors.left;
					if (this.current !== 1 && currW > arc && (x + currW) <= (this.w - this.marginX - this.offsetW - arc)) {
						gr.FillSolidRect(x + currW - arc, y, arc, h, lColor);
					}
					gr.FillRoundRect(x, y, currW, h, arc, arc, lColor);
				}
			};
			const paintRight = (x, currW, scale = 2) => {
				if ((this.colors.right !== -1 || bGrad) && this.current !== 1) {
					const wR = Math.max(w - currW, 0.01);
					const rColor = bGrad
						? isDark(...toRGB(this.colors.background))
							? lightenColor(this.colors.background, 10)
							: darkenColor(this.colors.background, 10)
						: this.colors.right;
					if (currW && this.current !== 1 && currW > arc && (x - arc - this.offsetX) <= arc * scale) {
						gr.FillSolidRect(x - arc / scale, y, arc * scale, h, rColor);
					}
					gr.FillRoundRect(x, y, wR, h, arc, arc, rColor);
				}
			};
			let bSkipGrad = false;
			if (currW <= arc) {
				paintLeft(w - (this.colors.right !== -1 || bGrad ? arc : 0)); // Subtract a few px to minimize border overpainting bugs
				paintRight(x + currW, currW);
				bSkipGrad = true;
			} else if (currW <= arc * 2) {
				paintLeft(w - (this.colors.right !== -1 || bGrad ? arc : 0)); // Subtract a few px to minimize border overpainting bugs
				const scale = 1.25;
				paintRight(currW + arc * scale + this.offsetX, currW - this.marginX + arc * scale, scale * 2);
				bSkipGrad = true;
			} else {
				paintRight(x + 1, 1);
				paintLeft(bGrad ? arc * 2 : currW);
			}
			if (bGrad && !bSkipGrad && this.colors.right !== -1) {
				if (this.current === 1 || (x + currW) >= (this.w - this.marginX - this.offsetW - arc)) {
					gr.FillRoundRect(x + currW - arc * 2, y, arc * 2, h, arc, arc, this.colors.right);
				}
				const lColor = this.colors.left === -1
					? opaqueColor(this.colors.right, 0)
					: this.colors.left;
				const rColor = this.colors.left === -1
					? opaqueColor(this.colors.right, this.current * 100)
					: blendColors(lColor, this.colors.right, this.current);
				if (this.current !== 0) {
					const maxW = (x + currW) >= (this.w - this.marginX - this.offsetW - arc)
						? Math.min(currW - arc * 1.1 * 1.75, w - arc * 2)
						: Math.min(currW - arc * 1.1 * (this.current === 1 ? 2 : 1), w - arc * 2);
					gr.FillGradRect(x + arc * 1.1, y, maxW, h, 0.5, lColor, rColor);
				}
			}
		}
		if (this.colors.background !== -1) {
			if (this.style.shade === 'simple') {
				const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 25);
				const shadeW = Math.max(this.h / 30, 3);
				gr.DrawRoundRect(x, y, w, h, arc, arc, shadeW, shadeCol);

			} else if (this.style.shade === 'complex') {
				const shadeCol = opaqueColor((isDark(this.colors.background) ? lightenColor : darkenColor)(this.colors.background, 70), 50);
				const shadeW = Math.max(this.h / 30, 3);
				const shade = gdi.CreateImage(w + shadeW * 2, h + shadeW * 2);
				const shadeGr = shade.GetGraphics();
				shadeGr.SetSmoothingMode(2);
				shadeGr.DrawRoundRect(shadeW, shadeW, w, h, arc, arc, shadeW, shadeCol);
				shade.ReleaseGraphics(shadeGr);
				gr.DrawImage(shade, x - shadeW, y - shadeW, shade.Width, shade.Height / 2, 0, 0, shade.Width, shade.Height / 2, 0, 35);
				gr.DrawImage(shade, x - shadeW, y - shadeW + shade.Height / 2, shade.Width, shade.Height, 0, shade.Height / 2, shade.Width, shade.Height, 0, 75);

			}
		}
		gr.SetSmoothingMode(0);
	};
	/**
	 * Selects button icon according to style. Tries to retrieve icon from this.callbacks.buttonIcon() callback first; in case an empty string is returned, uses default values. If no scale is returned, fallbacks to 1.
	 *
	 * @property
	 * @name selectButtonIcon
	 * @kind method
	 * @memberof _slider
	 * @param {buttonStyle} style - Button style.
	 * @returns {{icon: string, scaleH: number, minW: number}} Icon and scaling modifiers
	*/
	this.selectButtonIcon = (style = '') => {
		let [icon, scaleH, minW] = this.callbacks.buttonIcon.call(this, style.toLowerCase());
		if (!scaleH) { scaleH = style.includes('display') ? 11 / 10 : 1; }
		if (!minW) { minW = 0; }
		if (icon === null || typeof icon === 'undefined' || !icon.length) {
			switch (style.toLowerCase()) {
				case 'increase': icon = '\uf067'; scaleH = 10 / 11; break; // +
				case 'decrease': icon = '\uf068'; scaleH = 10 / 11; break; // -
				case 'min': icon = '\uf100'; break; // <<
				case 'max': icon = '\uf101'; break; // >>
				case 'custom': icon = fb.Volume ? '\uf028' : '\uf026'; break; // Speaker on/off
				case 'display':
				case 'displaycurrent': icon = this.current.toFixed(2); break;
				case 'displaytotal': icon = this.current.toFixed(2); break;
				case 'displayleft':
				case 'displayleftminus': icon = (style === 'displayleftminus' ? '-' : '') +  (1 - this.current).toFixed(2); break;
				case 'displaycurrenttotal': icon = this.current.toFixed(2) + '\\' + '1.00'; break;
				case 'none':
				default:
			}
		}
		return { icon, scaleH, minW };
	};
	/**
	 * Paints button by given key. Coordinates object is modified on paint.
	 *
	 * @property
	 * @name paintButton
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {string} key - Button key.
	 * @param {number} x - Position.
	 * @param {number} h - Height of the bar.
	 * @param {Boolean} bRight - Flag to paint at right position of given coord.
	 * @returns {number} Button width (used as offset to paint other elements)
	*/
	this.paintButton = (gr, key, x, h, bRight = false) => {
		const button = this.button[key];
		if (button) {
			if (this.colors.buttons !== -1) {
				const { icon, scaleH, minW } = this.selectButtonIcon(this.style[key + 'Button']);
				if (icon) {
					const font = _gdiFont('FontAwesome', this.calculateButtonHeight());
					button.h = gr.CalcTextHeight(icon, font);
					button.w = Math.max(minW, gr.CalcTextWidth(icon, font));
					button.x = x - (bRight ? button.w : 0);
					button.y = this.y + (this.h - button.h * scaleH) / 2;
					const color = button.down
						? darkenColor(this.colors.buttons, 10)
						: button.hover
							? lightenColor(this.colors.buttons, 10)
							: this.colors.buttons;

					const createShadeImg = this.style.shade === 'complex'
						? (shadeW, tint) => {
							const shadeCol = (isDark(this.colors.background) ? lightenColor : darkenColor)(color, tint);
							const shade = gdi.CreateImage(button.w, button.h);
							const shadeGr = shade.GetGraphics();
							shadeGr.SetSmoothingMode(2);
							shadeGr.GdiDrawText(icon, font, shadeCol, 0, 0, button.w, button.h, DT_VCENTER | DT_CENTER | DT_CALCRECT);
							shade.StackBlur(shadeW);
							shade.ReleaseGraphics(shadeGr);
							return shade;
						}
						: null;
					if (this.colors.background !== -1) {
						if (this.style.shade === 'complex') {
							const shadeW = this.calculateButtonHeight() / 40;
							const shade = createShadeImg(shadeW, 50);
							gr.DrawImage(shade, button.x - shadeW / 2, button.y, button.w + shadeW, button.h, 0, 0, shade.Width, shade.Height, 0, 60);
						}
					}
					gr.GdiDrawText(icon, font, color, button.x, button.y, button.w, button.h, DT_VCENTER | DT_RIGHT);
					if (this.colors.background !== -1) {
						if (this.style.shade === 'simple') {
							const shadeW = - this.calculateButtonHeight() / 10;
							const shadeCol = (isDark(this.colors.background) ? lightenColor : darkenColor)(color, 10);
							gr.GdiDrawText(icon, _gdiFont('FontAwesome', this.calculateButtonHeight() + shadeW), shadeCol, button.x, button.y, button.w, button.h, DT_VCENTER | DT_CENTER | DT_CALCRECT);
						} else if (this.style.shade === 'complex') {
							const shadeW = this.calculateButtonHeight() / 30;
							const shade = createShadeImg(shadeW, 10);
							gr.DrawImage(shade, button.x + button.w / 6 - shadeW, button.y + button.h / 6 - shadeW, button.w * 2 / 3 + shadeW * 2, button.h * 2 / 3 + shadeW * 2, 0, 0, shade.Width, shade.Height, 0, 50);
						}
					}
					return button.w + Math.max(this.style.selector === 'none' ? 0 : this.selectorW * 3 / 4, button.h / 5);
				}
			}
			button.x = button.y = button.w = button.h = 0;
			button.hover = button.down = false;
		}
		return 0;
	};
	/**
	 * Paints selector at current position
	 *
	 * @property
	 * @name paintSelector
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Current position.
	 * @param {number} h - Height of the bar. Constant for all points.
	 * @returns {void(0)}
	*/
	this.paintSelector = (gr, x, h) => {
		if (this.selectorW && this.colors.sel !== -1) {
			if (['triangle', 'histogram', 'histogramgradient'].includes(this.style.bar.toLowerCase())) {
				h *= this.current;
			}
			switch (this.style.selector.toLowerCase()) {
				case 'rounded':
					this.paintRoundedSel(gr, x, h); break;
				case 'roundedthemed':
					this.paintRoundedThemedSel(gr, x, h); break;
				case 'verticalthemed':
					this.paintVerticalThemedSel(gr, x); break;
				case 'vertical':
					this.paintVerticalSel(gr, x); break;
				case 'none':
				default:
					break;
			}
		}
	};
	/**
	 * Paints bar
	 *
	 * @property
	 * @name paintBar
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @param {number} x - Left position.
	 * @param {number} w - Max width.
	 * @param {number} h? - [auto-calculated if not provided] Bar height.
	 * @returns {number} Bar height
	*/
	this.paintBar = (gr, x, w, h = this.calculateBarHeight()) => {
		if (['triangle', 'histogram', 'histogramgradient'].includes(this.style.bar.toLowerCase())) {
			h *= this.current;
		}
		switch (this.style.bar.toLowerCase()) {
			case 'roundedgradient':
			case 'rounded': this.paintRoundedBar(gr, x, w, h); break;
			case 'histogramgradient':
			case 'histogram': this.paintHistogramBar(gr, x, w); break;
			case 'triangle':
			default: this.paintTriangleBar(gr, x, w, h);
		}
		return h;
	};
	/**
	 * Estimates bar height for a given style.
	 *
	 * @property
	 * @name calculateBarHeight
	 * @kind method
	 * @memberof _slider
	 * @param {string} style - Bar style
	 * @returns {number} Bar height
	*/
	this.calculateBarHeight = (style = this.style.bar || '') => {
		switch (style.toLowerCase()) {
			case 'roundedgradient':
			case 'rounded': return Math.max(Math.round((this.y + this.h - this.marginY) / 3), 2);
			case 'histogramgradient':
			case 'histogram': return (this.h - this.marginY * 2);
			case 'triangle':
			default: return (this.h - this.marginY * 2);
		}
	};
	/**
	 * Estimates left/right button height for a given style.
	 *
	 * @property
	 * @name calculateButtonHeight
	 * @kind method
	 * @memberof _slider
	 * @returns {number} Button height
	*/
	this.calculateButtonHeight = (style = this.style.bar || '') => {
		return _scale(this.calculateBarHeight(style) * this.buttonY / 100);
	};
	/**
	 * Debug paint.
	 * @property
	 * @name repaint
	 * @kind method
	 * @memberof _slider
	 * @param {GdiGraphics} gr - GDI graphics object from on_paint callback.
	 * @returns {void(0)}
	*/
	this.paintDebug = (gr, x, w) => {
		// Panel
		gr.FillSolidRect(this.x, (this.y + this.h) / 2, this.w, 1, 0xffc21e24);
		gr.FillSolidRect(this.x + this.w / 2, this.y, 1, this.y + this.h, 0xffc21e24);
		gr.FillSolidRect(this.x, this.y + this.marginY, this.w, 1, -1);
		gr.FillSolidRect(this.x, (this.y + this.h) - this.marginY, this.w, 1, -1);
		// Bar
		gr.FillSolidRect(x + w / 2, this.y, 1, this.y + this.h, -1);
		gr.FillSolidRect(x + w * this.current, this.y, 1, this.y + this.h, -1);
	};
	/**
	 * Checks if mouse is within panel.
	 * @property
	 * @name trace
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.trace = (x, y) => {
		const m = this.isDrag ? 200 : 0;
		return x > this.x - m && x < this.x + this.w + (m * 2) && y > this.y - m && y < this.y + this.h + (m * 2);
	};
	/**
	 * Checks if mouse is within slider bar.
	 * @property
	 * @name traceBar
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.traceBar = (x, y) => {
		const m = this.isDrag ? 200 : 0;
		return x > this.x - m && x < this.x + this.barW + (m * 2) && y > this.y - m && y < this.y + this.h + (m * 2);
	};
	/**
	 * Checks if mouse is within button.
	 * @property
	 * @name traceSelector
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.traceSelector = (x, y) => {
		const selX = this.x + this.marginX + this.offsetX + this.barW * this.current;
		const selW = this.selectorW / 2 + Math.round(this.selectorW / 10) || 1;
		return x >= (selX - selW) && x <= (selX + selW) && y > this.y && y < (this.y + this.h);
	};
	/**
	 * Checks if mouse is within button.
	 * @property
	 * @name traceButton
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @param {'left'|'right'} key
	 * @returns {void(0)}
	*/
	this.traceButton = (x, y, key) => {
		const button = this.button[key];
		if (!button) { return false; }
		return this.style[key + 'Button'] !== 'none' && x >= button.x && x <= (button.x + button.w) && y > button.y && y < (button.y + button.h);
	};
	/**
	 * Called on on_mouse_wheel or on_mouse_wheel_h
	 * @property
	 * @name wheel
	 * @kind method
	 * @memberof _slider
	 * @param {number} s
	 * @returns {void(0)}
	*/
	this.wheel = (s) => {
		if (this.trace(this.mx, this.my) && s !== 0) {
			if (s > 0) {
				this.callbacks.wheelUp && this.callbacks.wheelUp.call(this, s);
			} else {
				this.callbacks.wheelDown && this.callbacks.wheelDown.call(this, s);
			}
			this.callbacks.tooltip && this.callbacks.tooltip.call(this, null);
			return true;
		} else {
			return false;
		}
	};
	/**
	 * Called on on_mouse_wheel.
	 * @property
	 * @name wheelResize
	 * @kind method
	 * @memberof _slider
	 * @param {number} step
	 * @param {boolean} bForce
	 * @returns {boolean}
	*/
	this.wheelResize = (step, bForce) => {
		if ((this.trace(this.mx, this.my) || bForce) && step !== 0) {
			let key, min, max;
			switch (true) {
				case this.traceButton(this.mx, this.my, 'left') || this.traceButton(this.mx, this.my, 'right'):
					key = 'buttonY'; min = 0;  max = Infinity; break;
				case this.traceSelector(this.mx, this.my):
					key = 'selectorW'; min = 8; max = Infinity; break;
				case this.traceBar(this.mx, this.my):
					key = 'margin'; min = 0; max = 40; break;
			}
			if (!key) { return; }
			else if (key === 'margin') {
				['marginXPerc', 'marginYPerc'].forEach((key) => {
					this[key] += Math.sign(step);
					this[key] = Math.min(Math.max(min, this[key]), max);
				});
			} else {
				this[key] += Math.sign(step);
				this[key] = Math.max(min, this[key]);
			}
			this.resize(this.w, this.h);
			this.repaint();
			return true;
		}
		return false;
	};
	/**
	 * Called on on_mouse_move. Used for dragging and updating button state.
	 * @property
	 * @name move
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.move = (x, y) => {
		this.mx = x;
		this.my = y;
		if (this.trace(x, y)) {
			x -= this.x + this.marginX + this.offsetX;
			const pos = x <= 0
				? 0
				: x >= this.barW
					? 1
					: x / this.barW;
			this.dragLin = pos;
			this.dragLog = 100 + (pos === 1 ? 0 : Math.max(-100, 10 * Math.log(pos) / Math.LN2));
			this.isHover = true;
			let bRepaint = false;
			if (this.isDrag) {
				this.callbacks.lDrag && this.callbacks.lDrag.call(this, this.dragLin, this.dragLog);
				bRepaint = true;
			} else if (this.traceSelector(this.mx, this.my)) {
				this.isHoverSelector = true;
				this.button.left.hover = this.button.right.hover = false;
				window.SetCursor(IDC_HAND);
				bRepaint = true;
			} else if (this.traceButton(this.mx, this.my, 'left')) {
				this.isDrag = false;
				this.isHoverSelector = false;
				this.button.left.hover = true;
				window.SetCursor(IDC_HAND);
				bRepaint = true;
			} else if (this.traceButton(this.mx, this.my, 'right')) {
				this.isDrag = false;
				this.isHoverSelector = false;
				this.button.right.hover = true;
				window.SetCursor(IDC_HAND);
				bRepaint = true;
			} else if (this.isHoverSelector || this.button.left.hover || this.button.right.hover) {
				this.isHoverSelector = false;
				this.button.left.hover = this.button.right.hover = false;
				window.SetCursor(IDC_ARROW);
				bRepaint = true;
			}
			if (this.callbacks.tooltip) {
				if (this.button.left.hover) {
					this.callbacks.tooltip.call(this, void (0), void (0), this.style.leftButton);
				} else if (this.button.right.hover) {
					this.callbacks.tooltip.call(this, void (0), void (0), this.style.rightButton);
				} else if (this.traceBar(x, y)) {
					this.callbacks.tooltip.call(this, this.dragLin, this.dragLog);
				} else {
					this.callbacks.tooltip.call(this, null, null, null);
				}
			}
			if (bRepaint) { this.repaint(); }
			return true;
		} else {
			window.SetCursor(IDC_ARROW);
			if (this.isHover) {
				this.callbacks.tooltip && this.callbacks.tooltip.call(this, null);
				this.isHover = false;
			}
			if (this.isHoverSelector || this.isDrag) {
				this.isHoverSelector = false;
				this.isDrag = false;
				this.repaint();
			}
			return false;
		}
	};
	/**
	 * Called on on_mouse_lbtn_down. Used for dragging.
	 * @property
	 * @name lbtn_down
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.lbtn_down = (x, y) => {
		if (this.trace(x, y)) {
			if (this.button.left.hover) {
				this.button.left.down = true;
				setTimeout(() => {
					if (this.button.left.down) {
						const id = setInterval(() => {
							if (this.button.left.down) { this.executeButton(this.style.leftButton); }
							else { clearInterval(id); }
						}, 150);
					}
				}, 100);
				this.repaint();
			} else if (this.button.right.hover) {
				this.button.right.down = true;
				setTimeout(() => {
					if (this.button.right.down) {
						const id = setInterval(() => {
							if (this.button.right.down) { this.executeButton(this.style.rightButton); }
							else { clearInterval(id); }
						}, 150);
					}
				}, 100);
				this.repaint();
			} else if (this.traceBar(x, y) || this.traceSelector(x, y)) {
				this.isDrag = true;
			}
			return true;
		} else {
			return false;
		}
	};
	/**
	 * Called on on_mouse_lbtn_up. Used for dragging and updating button state.
	 * @property
	 * @name lbtn_up
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.lbtn_up = (x, y) => {
		this.button.left.down = this.button.right.down = false;
		if (this.trace(x, y)) {
			if (this.button.left.hover) {
				this.executeButton(this.style.leftButton);
				this.isDrag = false;
				this.repaint();
			} else if (this.button.right.hover) {
				this.executeButton(this.style.rightButton);
				this.isDrag = false;
				this.repaint();
			} else if (this.isDrag) {
				this.isDrag = false;
				// Allows dragging update outside the panel
				if (x < 0 || y < 0) { this.isHoverSelector = false; }
				this.callbacks.lDrag && this.callbacks.lDrag.call(this, this.dragLin, this.dragLog);
				this.repaint();
			}
			return true;
		} else {
			if (this.isDrag || this.isHoverSelector || this.button.left.hover || this.button.right.hover) {
				this.isDrag = false;
				this.button.left.hover = this.button.right.hover = false;
				this.isHoverSelector = false;
				this.repaint();
			}
			return false;
		}
	};
	/**
	 * Executes button action
	 *
	 * @property
	 * @name executeButton
	 * @kind method
	 * @memberof _slider
	 * @param {string} style - Button style.
	 * @returns {{icon: string, scale: number}} Button width, used as offset to paint other elements
	*/
	this.executeButton = (style = '') => {
		switch (style.toLowerCase()) {
			case 'increase':
				this.callbacks.wheelUp && this.callbacks.wheelUp.call(this, 1); break;
			case 'decrease':
				this.callbacks.wheelDown && this.callbacks.wheelDown.call(this, -1); break;
			case 'min':
				this.callbacks.lDrag && this.callbacks.lDrag.call(this, 0, 0); break;
			case 'max':
				this.callbacks.lDrag && this.callbacks.lDrag.call(this, 100, 100); break;
			case 'custom':
				this.callbacks.customButton && this.callbacks.customButton.call(this, this.current); break;
			case 'display':
			case 'displaycurrent':
			case 'displaytotal':
			case 'displayleft':
			case 'displayleftminus':
			case 'displaycurrenttotal':
				this.callbacks.displayButton && this.callbacks.displayButton.call(this, this.current, style); break;
			case 'none':
			default:
				return false;
		}
		return true;
	};
	/**
	 * Called on on_mouse_lbtn_dblclk. Clicking on button sets value to max/min.
	 * @property
	 * @name lbtn_dblclk
	 * @kind method
	 * @memberof _slider
	 * @param {number} x
	 * @param {number} y
	 * @returns {void(0)}
	*/
	this.lbtn_dblclk = () => {
		if (!this.isHoverSelector || this.button.right.hover || this.button.left.hover) { return; }
		if (this.callbacks.dblclkSel) { this.callbacks.dblclkSel.call(this, this.dragLin, this.dragLog); }
		else {
			if (this.dragLin === 0 || this.mx <= this.x + this.marginX + this.offsetX + this.selectorW / 2) {
				this.dragLin = this.dragLog = 100;
			} else {
				this.dragLin = this.dragLog = 0;
			}
			this.callbacks.lDrag && this.callbacks.lDrag.call(this, this.dragLin, this.dragLog);
		}
	};
	/**
	 * Called on on_size. Resizes margins, width and height.
	 * @property
	 * @name resize
	 * @kind method
	 * @memberof _slider
	 * @param {number} w - [=window.Width]
	 * @param {number} h - [=window.Height]
	 * @returns {void(0)}
	*/
	this.resize = (w = window.Width, h = window.Height) => {
		this.w = w;
		this.h = h;
		this.marginX = this.w * this.marginXPerc / 100;
		this.marginY = this.h * this.marginYPerc / 100;
		this.offsetX = 0;
		this.offsetW = 0;
		this.barX = this.x + this.marginX + this.offsetX;
		this.barW = this.w - this.marginX * 2 - this.offsetX - this.offsetW;
	};
	/**
	 * Changes current value/position. If a value is provided, that's used (clamped between 0 and 1); otherwise it uses the set callback at init if available.
	 * @property
	 * @name resize
	 * @kind method
	 * @memberof _slider
	 * @param {number} w - [=window.Width]
	 * @param {number} h - [=window.Height]
	 * @returns {void(0)}
	*/
	this.change = (value, bRepaint = true) => {
		if (typeof value !== 'undefined') {
			this.current = Math.max(0, Math.min(value, 1));
		} else if (this.callbacks.pos) {
			this.current = Math.max(0, Math.min(this.callbacks.pos.call(this), 1));
		}
		if (bRepaint) { this.repaint(); }
	};
	/**
	 * Inits panel variables.
	 * @property
	 * @name init
	 * @kind method
	 * @memberof _slider
	 * @returns {void(0)}
	*/
	this.init = () => {
		['shade', 'leftButton', 'rightButton', 'selector'].forEach((key) => {
			if (!Object.hasOwn(this.style, key)) { this.style[key] = 'none'; }
		});
		['left', 'right', 'buttons', 'sel', 'background'].forEach((key) => {
			if (!Object.hasOwn(this.colors, key)) { this.colors[key] = -1; }
		});
		if (this.callbacks.pos) { this.current = Math.max(0, Math.min(this.callbacks.pos.call(this), 1)); }
	};
	/** @type {number} - Panel X position */
	this.x = x;
	/** @type {number} - Panel Y position */
	this.y = y;
	/** @type {number} - Panel W size */
	this.w = w;
	/** @type {number} - Panel h size */
	this.h = h;
	/** @type {number} - Selector slider button size */
	this.selectorW = selectorW;
	/** @type {number} - % of height relative to bar size */
	this.buttonY = buttonY;
	/** @type {number} - X-margin as percentage of width */
	this.marginXPerc = marginXPerc;
	/** @type {number} - Y-margin as percentage of height */
	this.marginYPerc = marginYPerc;
	/** @type {number} - X-margin absolute value. Changes on resizing. */
	this.marginX = this.w * this.marginXPerc / 100;
	/** @type {number} - Y-margin absolute value. Changes on resizing. */
	this.marginY = this.h * this.marginYPerc / 100;
	/** @type {number} - X-offset when using buttons */
	this.offsetX = 0;
	/** @type {number} - W-offset when using buttons */
	this.offsetW = 0;
	/** @type {number} - Bar real x position when using button */
	this.barX = this.x + this.marginX + this.offsetX;
	/** @type {number} - Bar real size when using button */
	this.barW = this.w - this.marginX * 2 - this.offsetX - this.offsetW;
	/** @type {number} - Slider current value/position */
	this.current = 1;
	/** @type {number} - Cached x-mouse position */
	this.mx = 0;
	/** @type {number} - Cached y-mouse position */
	this.my = 0;
	/** @type {{left: {x: number, y: number, w: number, h:number, hover:boolean, down:boolean}, right: {x: number, y: number, w: number, h:number, hover:boolean, down:boolean}}} - Cached y - mouse position */
	this.button = { left: { x: 0, y: 0, w: 0, h: 0, hover: false, down: false }, right: { x: 0, y: 0, w: 0, h: 0, hover: false, down: false } };
	/** @type {boolean} - Flag for mouse over panel */
	this.isHover = false;
	/** @type {boolean} - Flag for mouse over button */
	this.isHoverSelector = false;
	/** @type {boolean} - Flag for mouse dragging */
	this.isDrag = false;
	/**
	 * @typedef {object} callbacks
	 * @property {function(number):void} wheelUp - Called when using the mouse wheel
	 * @property {function(number):void} wheelDown - Called when using the mouse wheel
	 * @property {function(number, number, string):void} tooltip - Called when mouse is over panel to display tooltip. Linear and log values scaled [0-100].
	 * @property {function(number, number):void} lDrag - Called while mouse dragging. Linear and log values scaled [0-100].
	 * @property {function():number} pos - Called when using .change() method. Must return a number scaled [0-1]
	 * @property {function(string):[string, number, number]} buttonIcon - Called when painting left/right buttons. Must return a string for FontAwesome 4 font and its height scale.
	 * @property {function(number):void} customButton - Called when clicking on custom button.
	 * @property {function(number, string):void} displayButton - Called when clicking on display button.
	 * @property {function(number, number):void} dblclkSel - Called when double clicking on selector slider button.
	 */
	/** @type {callbacks} - Panel callbacks*/
	this.callbacks = callbacks;
	/**
	 * @typedef {'none'|'decrease'|'increase'|'min'|'max'|'display'|'displaycurrent'|'displaytotal'|'displayleft'|'displayleftminus'|'displaycurrenttotal'|'custom'} buttonStyle
	 */
	/**
	 * @typedef {object} style
	 * @property {'rounded'|'triangle'|'histogram'|'roundedgradient'|'trianglegradient'|'histogramgradient'} bar - Bar style
	 * @property {'none'|'rounded'|'roundedthemed'|'vertical'|'verticalthemed'} selector - Selector slider button style
	 * @property {'none'|'simple'|'complex'} shade - Elements shading style
	 * @property {buttonStyle} leftButton - Left button style
	 * @property {buttonStyle} rightButton - Right button style
	 */
	/** @type {style} - Elements styles*/
	this.style = style;
	/** @type {number} - Value at mouse position linearly scaled [0-100] */
	this.dragLin = 0;
	/** @type {number} - Value at mouse position log scaled [0-100] */
	this.dragLog = 0;
	/**
	 * @typedef {object} colors - Panel colors
	 * @property { number } background - Panel background color. -1 if disabled.
	 * @property { number } left - Left fill bar color. -1 if disabled.
	 * @property { number } right - Right fill bar color. -1 if disabled
	 * @property { number } sel - Selector slider button color. -1 if disabled.
	 * @property { number } buttons - Left/right buttons color. -1 if disabled.
	 */
	/** @type {colors} - Panel colors*/
	this.colors = colors;
	/** @type {boolean} - Debug flag */
	this.bDebug = false;
	this.init();
}