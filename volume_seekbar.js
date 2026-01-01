'use strict';
//29/12/2025

if (!window.ScriptInfo.PackageId) { window.DefineScript('Volume-Seekbar-SMP', { author: 'regorxxx', version: '1.2.0-beta' }); }

include('helpers\\helpers_xxx.js');
/* global folders:readable, globSettings:readable, globProfiler:readable, VK_CONTROL:readable, VK_ALT:readable, VK_SHIFT:readable */
include('helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable, _save:readable */
include('helpers\\helpers_xxx_flags.js');
/* global VK_LWIN:readable */
include('helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('helpers\\helpers_xxx_prototypes.js');
/* global isJSON:readable, isBoolean:readable, round:readable, clone:readable */
include('helpers\\helpers_xxx_prototypes_smp.js');
/* global extendGR:readable */
include('helpers\\helpers_xxx_properties.js');
/* global setProperties:readable, getPropertiesPairs:readable, overwriteProperties:readable */
include('helpers\\helpers_xxx_UI.js');
/* global RGB:readable, _scale:readable, _tt:readable, chars:readable */
include('main\\volume_seekbar\\volume_seekbar_menu.js');
/* global createSliderMenu:readable, importSettingsMenu:readable, WshShell:readable, popup:readable */
include('main\\window\\window_xxx_background.js');
/* global _background:readable */
include('main\\window\\window_xxx_dynamic_colors.js');
/* global dynamicColors:readable */
include('main\\window\\window_xxx_slider.js');
/* global _slider:readable */
include('main\\window\\window_xxx_wheel.js');
/* global _wheel:readable */

globProfiler.Print('helpers');

let properties = {
	colors: ['Colors', JSON.stringify({
		background: RGB(50, 50, 50),
		left: RGB(30, 70, 70),
		right: RGB(70, 70, 70),
		sel: RGB(55, 55, 55),
		buttons: RGB(200, 200, 200),
	}), { func: isJSON, forceDefaults: true }],
	style: ['Style', JSON.stringify({
		bar: 'rounded',
		selector: 'rounded',
		leftButton: 'decrease',
		rightButton: 'increase',
		shade: 'none'
	}), { func: isJSON, forceDefaults: true }],
	marginXPerc: ['X-axis margin (% of window width).', 2.5, { func: isFinite, range: [[0, 40]] }],
	marginYPerc: ['Y-axis margin (% of window width).', 20, { func: isFinite, range: [[0, 40]] }],
	offsetX: ['X-axis offset (% of window width).', 0, { func: isFinite, range: [[-100, 100]] }],
	buttonY: ['Y-axis button scale (% of bar height).', 100, { func: isFinite, range: [[0, Infinity]] }],
	selectorW: ['Slider button width (px)', Math.max(_scale(window.Width / 50), 8), { func: isFinite, range: [[8, Infinity]] }],
	background: ['Background options', JSON.stringify(_background.defaults()), { func: isJSON, forceDefaults: true }],
	bDynamicColors: ['Adjust colors to artwork', true, { func: isBoolean }],
	wheel: ['Wheel settings', JSON.stringify({
		unit: 'u',
		step: 5,
		bReversed: false
	}), { func: isJSON, forceDefaults: true }],
	mode: ['Slider mode', 'volume', { func: (val) => ['volume', 'seekbar'].includes(val) }, 'volume'],
	dblclkSel: ['Double click behavior', 1, { range: [[0, 2]] }, 1],
	bAutoUpdateCheck: ['Automatically check updates', globSettings.bAutoUpdateCheck, { func: isBoolean }],
	firstPopup: ['Volume/Seekbar slider: Fired once', false, { func: isBoolean }],
	bOnNotifyColors: ['Adjust colors on panel notify', true, { func: isBoolean }],
	bNotifyColors: ['Notify colors to other panels', false, { func: isBoolean }]
};
Object.keys(properties).forEach(p => properties[p].push(properties[p][1]));
setProperties(properties, '', 0); //This sets all the panel properties at once
properties = getPropertiesPairs(properties, '', 0);

globProfiler.Print('settings');
const wheel = new _wheel({
	...JSON.parse(properties.wheel[1]),
	mode: properties.mode[1] === 'seekbar' ? 'playbacktime' : 'volume'
});
wheel.callback = (s) => fb[wheel.mode === 'playbacktime' ? 'PlaybackTime' : 'Volume'] = wheel.change(s);

const volumeCallbacks = {
	wheelUp: wheel.callback, wheelDown: wheel.callback,
	tooltip: function (dragLin, dragLog, buttonStyle) {
		if (buttonStyle) {
			if (buttonStyle.includes('display')) { buttonStyle = 'display'; }
			switch (buttonStyle) {
				case 'min': tooltip.SetValue('Mute volume'); break;
				case 'max': tooltip.SetValue('Max volume'); break;
				case 'increase': tooltip.SetValue('Volume up'); break;
				case 'decrease': tooltip.SetValue('Volume down'); break;
				case 'display': tooltip.SetValue('Current volume\n\nClick to ' + (fb.Volume === -100 ? 'un' : '') + 'mute'); break;
				case 'custom': tooltip.SetValue((fb.Volume === -100 ? 'Unmute' : 'Mute')); break;
			}
		} else if (dragLin === null || dragLog === null) {
			tooltip.SetValue('');
		} else {
			tooltip.SetValueDebounced(
				(dragLog - 100).toFixed(2) + ' dB' +
				(this.isHoverSelector && properties.dblclkSel[1] === 1 ? '\n\nDouble. L. Click to set min/max volume' : '') +
				'\n' + '-'.repeat(60) +
				'\n(R. Click to open settings menu)' +
				'\n(Shift + Win + R. Click for SMP panel menu)' +
				'\n(Ctrl + Win + R. Click for script panel menu)'
			);
		}
	},
	lDrag: (dragLin, dragLog) => fb.Volume = dragLog - 100,
	pos: () => { // Minimum value is 0.0009765625 due to rounding errors
		const pos = Math.pow(2, fb.Volume / 10);
		return pos < 0.001 ? 0 : pos;
	},
	buttonIcon: function (style) {
		if (style.includes('display')) { style = 'display'; }
		switch (style) {
			case 'custom': return [fb.Volume === -100 ? chars.speakerOff + '  ' : chars.speaker, void (0)];
			case 'min': return [chars.speakerOff];
			case 'max': return [chars.speaker];
			case 'display': {
				const vol = this.current === 1 ? 0 : Math.max(-100, 10 * Math.log(this.current) / Math.LN2);
				const volS = vol > -10
					? Math.abs(vol).toFixed(2)
					: vol > -100
						? Math.abs(vol).toFixed(1)
						: Math.abs(vol).toFixed(0);
				return [(vol < 0 ? '\u2212' : '') + volS + ' dB', 11 / 10, this.calculateButtonHeight() * 3.5];
			}
		}
		return [];
	},
	customButton: function (vol) { fb.VolumeMute(); }, // eslint-disable-line no-unused-vars
	displayButton: function (vol, style) { fb.VolumeMute(); }, // eslint-disable-line no-unused-vars
	dblclkSel: properties.dblclkSel[1] === 0 ? () => void (0) : null,
};

const seekCallbacks = {
	wheelUp: wheel.callback, wheelDown: wheel.callback,
	tooltip: function (dragLin, dragLog, buttonStyle) {
		if (buttonStyle) {
			switch (buttonStyle) {
				case 'min': tooltip.SetValue('Restart track'); break;
				case 'max': tooltip.SetValue('Next track'); break;
				case 'increase': tooltip.SetValue('Seek ahead'); break;
				case 'decrease': tooltip.SetValue('Seek back'); break;
				case 'display':
				case 'displaycurrent': tooltip.SetValue('Current playback time\n(Click to seek)'); break;
				case 'displaytotal': tooltip.SetValue('Total playback length\n(Click to seek)'); break;
				case 'displayleft':
				case 'displayleftminus': tooltip.SetValue('Left playback time\n(Click to seek)'); break;
				case 'displaycurrenttotal': tooltip.SetValue('Playback time\\Total length\n(Click to seek)'); break;
				case 'custom': tooltip.SetValue('Prev. track'); break;
			}
		} else if (dragLin === null || dragLog === null) { tooltip.SetValue(''); }
		else if (fb.IsPlaying) {
			tooltip.SetValueDebounced(utils.FormatDuration(dragLin * fb.PlaybackLength) + '\\' + utils.FormatDuration(fb.PlaybackLength) + (this.isHoverSelector && properties.dblclkSel[1] === 1 ? '\n(Double. L. Click to restart/next track)' : ''));
		} else {
			const sel = fb.GetSelection();
			if (sel) {
				tooltip.SetValueDebounced('Playback paused\nClick to play at ' + utils.FormatDuration(dragLin * sel.Length) + '\\' + utils.FormatDuration(sel.Length));
			} else {
				tooltip.SetValueDebounced('Playback paused');
			}
		}
	},
	lDrag: (dragLin, dragLog) => { // eslint-disable-line no-unused-vars
		if (!fb.IsPlaying) {
			fb.Play();
			setTimeout(() => {
				fb.PlaybackTime = dragLin * fb.PlaybackLength;
			}, 100);
		} else {
			fb.PlaybackTime = dragLin * fb.PlaybackLength;
		}

	},
	pos: () => fb.PlaybackTime < Number.MAX_SAFE_INTEGER ? (fb.PlaybackTime / fb.PlaybackLength || 0) : 0,
	buttonIcon: function (style) {
		const total = style.includes('display') ? utils.FormatDuration(fb.PlaybackLength) : '';
		const minW = this.calculateButtonHeight() * (total.length >= 5 ? 2.1 : 1.7);
		switch (style) { // NOSONAR
			case 'custom': return ['\uf100'];
			case 'display':
			case 'displaycurrent': return [utils.FormatDuration(fb.PlaybackTime), 11 / 10, minW];
			case 'displaytotal': return [total, 11 / 10, minW];
			case 'displayleftminus': return [(style === 'displayleftminus' ? '-' : '') + utils.FormatDuration(fb.PlaybackLength - fb.PlaybackTime), 11 / 10, minW];
			case 'displaycurrenttotal': return [utils.FormatDuration(fb.PlaybackTime) + '\\' + total, 11 / 10, minW * 2];
		}
		return [];
	},
	customButton: function (time) { fb.Prev(); }, // eslint-disable-line no-unused-vars
	displayButton: function () {
		const time = Input.number('real positive', fb.PlaybackTime < Number.MAX_SAFE_INTEGER ? round(fb.PlaybackTime, 2) : 0, 'Jump to playback time (in s):', 'Seekbar', 60);
		if (time !== null) { fb.PlaybackTime = Math.min(fb.PlaybackLength, time); }
	},
	dblclkSel: properties.dblclkSel[1] === 0 ? () => void (0) : null,
};

const slider = new _slider({
	x: properties.offsetX[1] * window.Width, y: 0, w: window.Width, h: window.Height,
	marginXPerc: properties.marginXPerc[1], marginYPerc: properties.marginYPerc[1],
	selectorW: properties.selectorW[1], buttonY: properties.buttonY[1],
	callbacks: properties.mode[1] === 'volume'
		? volumeCallbacks
		: seekCallbacks,
	colors: JSON.parse(properties.colors[1]),
	style: JSON.parse(properties.style[1])
});
const background = new _background({
	...JSON.parse(properties.background[1]),
	x: 0, y: 0, w: window.Width, h: window.Height,
	callbacks: {
		change: function (config, changeArgs, callbackArgs) {
			if (callbackArgs && callbackArgs.bSaveProperties) {
				['x', 'y', 'w', 'h'].forEach((key) => delete config[key]);
				properties.background[1] = JSON.stringify(config);
				overwriteProperties(properties);
			}
		},
		artColors: (colArray, bForced) => {
			if (!bForced && !properties.bDynamicColors[1]) { return; }
			else if (colArray) {
				const { main, sec, note } = dynamicColors(
					colArray,
					slider.colors.background !== -1 ? slider.colors.background : background.getColors()[0],
					true
				);
				const bSwap = slider.style.bar.toLowerCase() !== 'roundedgradient';
				if (slider.colors.left !== -1) { slider.colors.left = bSwap ? sec : main; }
				if (slider.colors.right !== -1) { slider.colors.right = bSwap ? main : sec; }
				if (slider.colors.sel !== -1) { slider.colors.sel = note; }
				if (slider.colors.buttons !== -1) { slider.colors.buttons = note; }
			} else {
				const defColors = JSON.parse(properties.colors[1]);
				for (const key in slider.colors) {
					slider.colors[key] = defColors[key];
				}
			}
			if (window.IsVisible) { window.Repaint(); }
		},
		artColorsNotify: (colArray, bForced = false) => {
			if (!bForced && !properties.bNotifyColors[1]) { return; }
			else if (colArray) {
				background.scheme = colArray;
				window.NotifyOthers('Colors: set color scheme', colArray);
			}
		}
	}
});
const tooltip = new _tt(null, void (0), void (0), 600);

// Helpers
slider.shareUiSettings = function (mode = 'popup') {
	const settings = Object.fromEntries(
		['colors', 'style', 'marginXPerc', 'marginYPerc', 'selectorW', 'buttonY', 'offsetX', 'background', 'bDynamicColors']
			.map((key) => [key, clone(properties[key].slice(0, 2))])
	);
	switch (mode.toLowerCase()) {
		case 'popup': {
			const keys = ['Colors', 'Preset', 'Background'];
			const answer = WshShell.Popup('Share current UI settings with other panels?\nSettings which will be copied:\n\n' + keys.join(', '), 0, window.ScriptInfo.Name + ': share UI settings', popup.question + popup.yes_no);
			if (answer === popup.yes) {
				window.NotifyOthers(window.ScriptInfo.Name + ': share UI settings', settings);
				return true;
			}
			return false;
		}
		case 'path': {
			const input = Input.string('file', folders.export + 'ui_settings_' + window.Name + '.json', 'File name name:', window.ScriptInfo.Name + ': export UI settings', folders.export + 'ui_settings.json', void (0), true) || (Input.isLastEqual ? Input.lastInput : null);
			if (input === null) { return null; }
			return _save(input, JSON.stringify(settings, null, '\t').replace(/\n/g, '\r\n'))
				? input
				: null;
		}
		default:
			return settings;
	}
};

slider.applyUiSettings = function (settings, bForce) {
	window.highlight = true;
	if (window.IsVisible) { window.Repaint(); }
	const answer = bForce
		? popup.yes
		: WshShell.Popup('Apply current settings to highlighted panel?\nCheck UI.', 0, window.FullPanelName, popup.question + popup.yes_no);
	if (answer === popup.yes) {
		const newBg = JSON.parse(String(settings.background[1]));
		['x', 'y', 'w', 'h', 'callbacks'].forEach((key) => delete newBg[key]);
		['bDynamicColors'].forEach((key) => {
			properties[key][1] = !!settings[key][1];
			if (Object.hasOwn(this, key)) { this[key] = properties[key][1]; }
		});
		['colors', 'style'].forEach((key) => {
			properties[key][1] = String(settings[key][1]);
			if (Object.hasOwn(this, key)) { this[key] = JSON.parse(properties[key][1]); }
		});
		['marginXPerc', 'marginYPerc', 'selectorW', 'buttonY', 'offsetX'].forEach((key) => {
			properties[key][1] = Number(settings[key][1]);
			if (Object.hasOwn(this, key)) { this[key] = Number(properties[key][1]); }
		});
		background.changeConfig({ config: newBg, bRepaint: true, callbackArgs: { bSaveProperties: true } });
	}
	window.highlight = false;
	if (window.IsVisible) { window.Repaint(); }
};

globProfiler.Print('slider');

// Info Popup
if (!properties.firstPopup[1]) {
	properties.firstPopup[1] = true;
	overwriteProperties(properties); // Updates panel
	const readmePath = folders.xxx + 'helpers\\readme\\volume_seekbar.txt';
	const readme = _open(readmePath, utf8);
	if (readme.length) { fb.ShowPopupMessage(readme, window.ScriptInfo.Name); }
}

// Update check
if (properties.bAutoUpdateCheck[1]) {
	/* global checkUpdate:readable */
	include('helpers\\helpers_xxx_web_update.js');
	setTimeout(checkUpdate, 120000, { bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb });
}

addEventListener('on_mouse_lbtn_down', (x, y) => {
	slider.lbtn_down(x, y);
});

addEventListener('on_mouse_lbtn_up', (x, y) => {
	slider.lbtn_up(x, y);
});

addEventListener('on_mouse_rbtn_up', (x, y) => {
	if (utils.IsKeyPressed(VK_CONTROL) && utils.IsKeyPressed(VK_LWIN)) {
		return importSettingsMenu(slider, properties).btn_up(x, y);
	}
	return createSliderMenu(slider, background, wheel, properties).btn_up(x, y);
});

addEventListener('on_mouse_lbtn_dblclk', (x, y) => {
	slider.lbtn_dblclk(x, y);
});

addEventListener('on_mouse_move', (x, y, mask) => {
	slider.move(x, y);
	background.move(x, y, mask);
});

addEventListener('on_mouse_leave', () => {
	slider.move(-1, -1);
	background.leave();
});

addEventListener('on_mouse_wheel', (step) => {
	if (utils.IsKeyPressed(VK_CONTROL) && utils.IsKeyPressed(VK_ALT) && slider.wheelResize(step)) {
		if (utils.IsKeyPressed(VK_SHIFT)) { background.wheelResize(step, void (0), { bSaveProperties: true }); }
		else {
			['marginXPerc', 'marginYPerc', 'selectorW', 'buttonY'].forEach((key) => properties[key][1] = slider[key]);
			overwriteProperties(properties);
		}
	} else if (utils.IsKeyPressed(VK_SHIFT)) { background.cycleArtAsync(step); }
	else { slider.wheel(step); }
});

addEventListener('on_mouse_wheel_h', (s) => {
	slider.wheel(s);
});

addEventListener('on_paint', (gr) => {
	if (!window.ID) { return; }
	if (!window.Width || !window.Height) { return; }
	if (globSettings.bDebugPaint) { extendGR(gr, { Repaint: true, FillRoundRect: true }); }
	else { extendGR(gr, { DrawRoundRect: true, FillRoundRect: true }); }
	background.paint(gr);
	slider.paint(gr);
	if (window.highlight) { extendGR(gr, { Highlight: true }); }
	if (window.debugPainting) { window.drawDebugRectAreas(gr); }
});

addEventListener('on_size', (width, height) => {
	background.resize({ w: width, h: height, bPaint: false });
	slider.resize();
	slider.x = properties.offsetX[1] * width / 100;
});

addEventListener('on_volume_change', () => {
	if (properties.mode[1] === 'volume') { slider.change(); }
});

addEventListener('on_playback_time', () => {
	if (properties.mode[1] === 'seekbar') { slider.change(); }
});

addEventListener('on_playback_pause', () => {
	if (properties.mode[1] === 'seekbar') { slider.change(); }
});

addEventListener('on_playback_seek', () => {
	if (properties.mode[1] === 'seekbar') { slider.change(); }
});

addEventListener('on_selection_changed', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
});

addEventListener('on_item_focus_change', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
});

addEventListener('on_playlist_switch', () => {
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
});

addEventListener('on_playlists_changed', () => { // To show/hide loaded playlist indicators...
	if (background.coverMode.toLowerCase() !== 'none' && (!background.coverModeOptions.bNowPlaying || !fb.IsPlaying)) {
		background.updateImageBg();
	}
});

addEventListener('on_playback_new_track', () => {
	if (properties.mode[1] === 'seekbar') { slider.change(); }
	if (background.coverMode.toLowerCase() !== 'none') { background.updateImageBg(); }
});

addEventListener('on_playback_stop', (reason) => {
	if (properties.mode[1] === 'seekbar') { slider.change(); }
	if (reason !== 2) { // Invoked by user or Starting another track
		if (background.coverMode.toLowerCase() !== 'none' && background.coverModeOptions.bNowPlaying) { background.updateImageBg(); }
	}
});

addEventListener('on_notify_data', (name, info) => {
	if (name === 'bio_imgChange' || name === 'bio_chkTrackRev' || name === 'xxx-scripts: panel name reply') { return; }
	switch (name) { // NOSONAR
		case window.ScriptInfo.Name + ': share UI settings': {
			if (info) { slider.applyUiSettings(clone(info)); }
			break;
		}
		case window.ScriptInfo.Name + ': set colors': { // Needs an array of 5 colors or an object {background, left, right, sel, buttons}
			if (info && properties.bOnNotifyColors[1]) {
				const colors = clone(info);
				const getColor = (key) => Object.hasOwn(colors, key) ? colors.background : colors[['background', 'left', 'right', 'sel', 'buttons'].indexOf(key)];
				const hasColor = (key) => typeof getColor(key) !== 'undefined';
				if (background.colorMode !== 'none' && hasColor('background')) {
					background.changeConfig({ config: { colorModeOptions: { color: getColor('background') } }, callbackArgs: { bSaveProperties: false } });
				}
				if (slider.colors.left !== -1 && hasColor('left')) { slider.colors.left = getColor('left'); }
				if (slider.colors.right !== -1 && hasColor('right')) { slider.colors.right = getColor('right'); }
				if (slider.colors.sel !== -1 && hasColor('sel')) { slider.colors.sel = getColor('sel'); }
				if (slider.colors.buttons !== -1 && hasColor('buttons')) { slider.colors.buttons = getColor('buttons'); }
				if (window.IsVisible) { window.Repaint(); }
			}
			break;
		}
		case 'Colors: set color scheme':
		case window.ScriptInfo.Name + ': set color scheme': { // Needs an array of at least 6 colors to automatically adjust dynamic colors
			if (info && properties.bOnNotifyColors[1]) { background.callbacks.artColors(clone(info), true); }
			break;
		}
		case 'Colors: ask color scheme': {
			if (info && properties.bNotifyColors[1] && background.scheme) {
				window.NotifyOthers(String(info), background.scheme);
			}
			break;
		}
	}
});

if (properties.bOnNotifyColors[1]) { // Ask color-servers at init
	setTimeout(() => {
		window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
		window.NotifyOthers('Colors: ask colors', window.ScriptInfo.Name + ': set colors');
	}, 1000);
}

globProfiler.Print('callbacks');