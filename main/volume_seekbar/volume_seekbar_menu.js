'use strict';
//24/12/25

/* exported createSliderMenu, importSettingsMenu */

include('..\\..\\helpers\\helpers_xxx.js');
/* global folders:readable, MF_GRAYED:readable, MF_STRING:readable, VK_CONTROL:readable, globSettings:readable, checkUpdate:readable */
include('..\\..\\helpers\\helpers_xxx_properties.js');
/* global  overwriteProperties:readable */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global require:readable, capitalize:readable, _b:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global _open:readable, utf8:readable */
include('..\\..\\helpers\\helpers_xxx_export.js');
/* global exportSettings:readable, importSettings:readable */
include('..\\..\\helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('..\\window\\window_xxx_background_menu.js');
/* global _menu:readable, createBackgroundMenu:readable */
include('..\\..\\helpers-external\\namethatcolor\\ntc.js');
/* global ntc:readable */
const Chroma = require('..\\helpers-external\\chroma.js\\chroma.min'); // Relative to helpers folder

/**
 * Creates a slider menu.
 *
 * @name createSliderMenu
 * @function
 * @param {_slider} parent - Slider object
 * @param {_background} parentBackground - Background object
 * @param {_wheel} wheel - Wheel object
 * @param {object} properties - Panel properties object
 */
function createSliderMenu(parent, parentBackground, wheel, properties = {}) {
	const menu = new _menu();
	// Header
	menu.newEntry({ entryText: capitalize(properties.mode[1]) + ' slider configuration:', func: null, flags: MF_GRAYED });
	menu.newSeparator();
	{
		const menuName = menu.newMenu('Mode');
		const options = ['volume', 'seekbar'];
		options.forEach((mode) => {
			menu.newEntry({
				menuName, entryText: capitalize(mode), func: () => {
					properties.mode[1] = mode;
					overwriteProperties(properties);
					window.Reload();
				}
			});
		});
		menu.newCheckMenuLast(() => options.indexOf(properties.mode[1]), options);
	}
	menu.newSeparator();
	{
		const menuName = menu.newMenu('Style');
		menu.newEntry({ menuName, entryText: 'Elements style: (Ctrl + Click to reset)', flags: MF_GRAYED });
		menu.newSeparator(menuName);
		{
			const subMenuName = menu.newMenu('Slider button', menuName);
			const options = [
				{ entryText: 'None', val: 'none' },
				{ entryText: 'Rounded', val: 'rounded' },
				{ entryText: 'Rounded themed', val: 'roundedthemed' },
				{ entryText: 'Vertical bar', val: 'vertical' },
				{ entryText: 'Vertical themed bar', val: 'verticalthemed' },
			];
			options.forEach((opt) => {
				menu.newEntry({
					menuName: subMenuName, entryText: opt.entryText, func: () => {
						const defStyle = JSON.parse(properties.style[3]);
						if (utils.IsKeyPressed(VK_CONTROL)) {
							parent.style.selector = defStyle.selector;
						} else {
							parent.style.selector = opt.val;
						}
						properties.style[1] = JSON.stringify(parent.style);
						overwriteProperties(properties);
						parent.repaint();
					}
				});
			});
			menu.newCheckMenuLast(() => Math.max(options.findIndex((opt) => opt.val === parent.style.selector), 0), options);
		}
		{
			const subMenuName = menu.newMenu('Bar fill', menuName);
			const options = [
				{ entryText: 'Rounded', val: 'rounded' },
				{ entryText: 'Rounded gradient', val: 'roundedgradient' },
				{ entryText: 'Triangle', val: 'triangle' },
				{ entryText: 'Histogram', val: 'histogram' },
				{ entryText: 'Histogram gradient', val: 'histogramgradient' },
			];
			options.forEach((opt) => {
				menu.newEntry({
					menuName: subMenuName, entryText: opt.entryText, func: () => {
						const defStyle = JSON.parse(properties.style[3]);
						if (utils.IsKeyPressed(VK_CONTROL)) {
							parent.style.bar = defStyle.bar;
						} else {
							parent.style.bar = opt.val;
						}
						properties.style[1] = JSON.stringify(parent.style);
						overwriteProperties(properties);
						parent.repaint();
						if (properties.bDynamicColors[1]) { parentBackground.applyArtColors(true); }
						else if (properties.bOnNotifyColors[1]) {
							window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
							window.NotifyOthers('Colors: ask colors', window.ScriptInfo.Name + ': set colors');
						}
					}
				});
			});
			menu.newCheckMenuLast(() => Math.max(options.findIndex((opt) => opt.val === parent.style.bar), 0), options);
		}
		['left', 'right'].forEach((key) => {
			const subMenuName = menu.newMenu(capitalize(key) + ' button', menuName);
			const options = [
				{ entryText: 'None', val: 'none' },
				{ entryText: wheel.mode === 'volume' ? 'Volume down' : 'Seek back', val: 'decrease' },
				{ entryText: wheel.mode === 'volume' ? 'Volume up' : 'Seek ahead', val: 'increase' },
				{ entryText: wheel.mode === 'volume' ? 'Min' : 'Restart track', val: 'min' },
				{ entryText: wheel.mode === 'volume' ? 'Max' : 'Next track', val: 'max' },
				{ entryText: wheel.mode === 'volume' ? 'Mute' : 'Prev. track', val: 'custom' },
				{ entryText: 'Display (current)', val: 'displaycurrent' },
				{ entryText: 'Display (left)', val: 'displayleft', flags: wheel.mode === 'volume' ? MF_GRAYED : MF_STRING },
				{ entryText: 'Display (-left)', val: 'displayleftminus', flags: wheel.mode === 'volume' ? MF_GRAYED : MF_STRING },
				{ entryText: 'Display (total)', val: 'displaytotal', flags: wheel.mode === 'volume' ? MF_GRAYED : MF_STRING },
				{ entryText: 'Display (current/total)', val: 'displaycurrenttotal', flags: wheel.mode === 'volume' ? MF_GRAYED : MF_STRING }
			];
			const buttonKey = key + 'Button';
			options.forEach((opt) => {
				menu.newEntry({
					menuName: subMenuName, entryText: opt.entryText, func: () => {
						const defStyle = JSON.parse(properties.style[3]);
						if (utils.IsKeyPressed(VK_CONTROL)) {
							parent.style[buttonKey] = defStyle[buttonKey];
						} else {
							parent.style[buttonKey] = opt.val;
						}
						properties.style[1] = JSON.stringify(parent.style);
						overwriteProperties(properties);
						parent.repaint();
					}, flags: opt.flags
				});
			});
			menu.newCheckMenuLast(() => Math.max(options.findIndex((opt) => opt.val === parent.style[buttonKey]), 0), options);
		});
		{
			const subMenuName = menu.newMenu('Shading', menuName);
			const options = [
				{ entryText: 'None', val: 'none' },
				{ entryText: 'Simple', val: 'simple' },
				{ entryText: 'Complex', val: 'complex' }
			];
			options.forEach((opt) => {
				menu.newEntry({
					menuName: subMenuName, entryText: opt.entryText, func: () => {
						const defStyle = JSON.parse(properties.style[3]);
						if (utils.IsKeyPressed(VK_CONTROL)) {
							parent.style.shade = defStyle.shade;
						} else {
							parent.style.shade = opt.val;
						}
						properties.style[1] = JSON.stringify(parent.style);
						overwriteProperties(properties);
						parent.repaint();
					}
				});
			});
			menu.newCheckMenuLast(() => Math.max(options.findIndex((opt) => opt.val === parent.style.shade), 0), options);
		}
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName, entryText: 'Restore defaults...', func: () => {
				const defStyle = JSON.parse(properties.style[3]);
				for (const key in parent.style) {
					parent.style[key] = defStyle[key];
				}
				properties.style[1] = JSON.stringify(parent.style);
				overwriteProperties(properties);
				parent.repaint();
			}
		});
	}
	menu.newSeparator();
	{
		const menuName = menu.newMenu('Colors');
		const getColorName = (val) => val !== -1 && val !== null && typeof val !== 'undefined'
			? (ntc.name(Chroma(val).hex())[1] || '').toString() || 'unknown'
			: '-none-';
		menu.newEntry({ menuName, entryText: 'UI colors: (Ctrl + Click to disable)', flags: MF_GRAYED });
		menu.newSeparator(menuName);
		[
			{ entryText: 'Slider button', key: 'sel' },
			{ entryText: 'Bar fill (left)', key: 'left' },
			{ entryText: 'Bar fill (right)', key: 'right' },
			{ entryText: 'Left/Right buttons', key: 'buttons' },
			{ entryText: 'Background', key: 'background' }
		].forEach((opt) => {
			menu.newEntry({
				menuName, entryText: opt.entryText + '\t[' + getColorName(parent.colors[opt.key]) + ']', func: () => {
					if (utils.IsKeyPressed(VK_CONTROL)) {
						if (opt.key === 'right' && parent.style.bar.toLowerCase() === 'roundedgradient') {
							fb.ShowPopupMessage('Right color can not be disabled in this bar style.', window.ScriptInfo.Name + ': Colors');
							return;
						}
						parent.colors[opt.key] = -1;
					} else {
						parent.colors[opt.key] = utils.ColourPicker(window.ID, parent.colors[opt.key]);
						console.log('Volume Bar: Selected color ->\n\t Android: ' + parent.colors[opt.key] + ' - RGB: ' + Chroma(parent.colors[opt.key]).rgb());
					}
					properties.colors[1] = JSON.stringify(parent.colors);
					overwriteProperties(properties);
					parent.repaint();
				}
			});
		});
		if (parentBackground) {
			menu.newSeparator(menuName);
			const subMenu = menu.newMenu('Dynamic colors', menuName);
			menu.newEntry({
				menuName: subMenu, entryText: 'Dynamic (background art mode)', func: () => {
					properties.bDynamicColors[1] = !properties.bDynamicColors[1];
					if (properties.bDynamicColors[1] && properties.bOnNotifyColors[1]) { fb.ShowPopupMessage('Warning: Dynamic colors (background art mode) and Color-server listening are enabled at the same time.\n\nThis setting may probably produce glitches since 2 color sources are being used, while one tries to override the other.\n\nIt\'s recommended to only use one of these features, unless you know what you are DOMStringList.', window.ScriptInfo.Name + ': Dynamic colors'); }
					overwriteProperties(properties);
					if (properties.bDynamicColors[1]) {
						// Ensure it's applied with compatible settings
						parentBackground.changeConfig({ config: { coverModeOptions: { bProcessColors: true } }, callbackArgs: { bSaveProperties: true } });
						if (parentBackground.coverMode === 'none') {
							parentBackground.changeConfig({ config: { coverMode: 'front', coverModeOptions: { alpha: 0 } }, callbackArgs: { bSaveProperties: true } });
						}
						parentBackground.updateImageBg(true);
					} else {
						const defColors = JSON.parse(properties.colors[1]);
						for (const key in parent.colors) {
							parent.colors[key] = defColors[key];
						}
						parentBackground.changeConfig({ config: { colorModeOptions: { color: JSON.parse(properties.background[1]).colorModeOptions.color } }, callbackArgs: { bSaveProperties: false } });
						parent.repaint();
					}
				}
			});
			menu.newCheckMenuLast(() => properties.bDynamicColors[1]);
			menu.newSeparator(subMenu);
			menu.newEntry({
				menuName: subMenu, entryText: 'Listen to color-servers', func: () => {
					properties.bOnNotifyColors[1] = !properties.bOnNotifyColors[1];
					if (properties.bDynamicColors[1] && properties.bOnNotifyColors[1]) { fb.ShowPopupMessage('Warning: Dynamic colors (background art mode) and Color-server listening are enabled at the same time.\n\nThis setting may probably produce glitches since 2 color sources are being used, while one tries to override the other.\n\nIt\'s recommended to only use one of these features, unless you know what you are DOMStringList.', window.ScriptInfo.Name + ': Dynamic colors'); }
					overwriteProperties(properties);
					if (properties.bOnNotifyColors[1]) {
						window.NotifyOthers('Colors: ask color scheme', window.ScriptInfo.Name + ': set color scheme');
						window.NotifyOthers('Colors: ask color', window.ScriptInfo.Name + ': set colors');
					}
				}
			});
			menu.newCheckMenuLast(() => properties.bOnNotifyColors[1]);
			menu.newEntry({
				menuName: subMenu, entryText: 'Act as color-server', func: () => {
					properties.bNotifyColors[1] = !properties.bNotifyColors[1];
					overwriteProperties(properties);
					if (properties.bNotifyColors[1] && parentBackground.scheme) {
						window.NotifyOthers('Colors: set color scheme', parentBackground.scheme);
					}
				}
			});
			menu.newCheckMenuLast(() => properties.bNotifyColors[1]);
		}
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName, entryText: 'Restore defaults...', func: () => {
				const defColors = JSON.parse(properties.colors[3]);
				for (const key in parent.colors) {
					parent.colors[key] = defColors[key];
				}
				properties.colors[1] = JSON.stringify(parent.colors);
				overwriteProperties(properties);
				parent.repaint();
			}
		});
	}
	{
		const menuName = menu.newMenu('Size and placement');
		menu.newEntry({ menuName, entryText: 'UI placement: (Ctrl + Click to reset)', flags: MF_GRAYED });
		menu.newSeparator(menuName);
		[
			{ entryText: 'X-axis margin', key: 'marginXPerc' },
			{ entryText: 'Y-axis margin', key: 'marginYPerc' },
		].forEach((opt) => {
			menu.newEntry({
				menuName, entryText: opt.entryText + '\t[' + parent[opt.key] + '%]', func: () => {
					let input;
					if (utils.IsKeyPressed(VK_CONTROL)) {
						input = properties[opt.key][3];
					} else {
						input = Input.number('real positive', parent[opt.key], 'Enter value:\n(real number ≥0 and <40)', 'Volume-Seekbar: ' + opt.entryText, 20, [n => n >= 0 && n < 40]);
						if (input === null) { return; }
					}
					properties[opt.key][1] = parent[opt.key] = input;
					overwriteProperties(properties);
					parent.resize();
					parent.repaint();
				}
			});
		});
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName, entryText: 'X-axis offset' + '\t[' + properties.offsetX[1] + '%]', func: () => {
				let input;
				if (utils.IsKeyPressed(VK_CONTROL)) {
					input = properties.offsetX[3];
				} else {
					input = Input.number('real', properties.offsetX[1], 'Enter value:\n(real number > -100 and < 100)', 'Volume-Seekbar: X-axis offset', 20, [n => n > -100 && n < 100]);
					if (input === null) { return; }
				}
				properties.offsetX[1] = input;
				overwriteProperties(properties);
				parent.x = properties.offsetX[1] * parent.w / 100;
				parent.resize();
				parent.repaint();
			}
		});
		menu.newSeparator(menuName);
		[
			{ entryText: 'Slider button size', key: 'selectorW' },
		].forEach((opt) => {
			menu.newEntry({
				menuName, entryText: opt.entryText + '\t[' + parent[opt.key] + ' px]', func: () => {
					let input;
					if (utils.IsKeyPressed(VK_CONTROL)) {
						input = properties[opt.key][3];
					} else {
						input = Input.number('int positive', parent[opt.key], 'Enter value in px:\n(integer number ≥8)\n\nSet to 0 to disable it.', 'Volume-Seekbar: Slider button size', 20, [n => n >= 8]);
						if (input === null) { return; }
					}
					properties[opt.key][1] = parent[opt.key] = input;
					overwriteProperties(properties);
					parent.repaint();
				}
			});
		});
		menu.newEntry({
			menuName, entryText: 'Y-Axis buttons scale' + '\t[' + properties.buttonY[1] + '%]', func: () => {
				let input;
				if (utils.IsKeyPressed(VK_CONTROL)) {
					input = properties.buttonY[3];
				} else {
					input = Input.number('real', properties.buttonY[1], 'Enter value:\n(real number ≥0)', 'Volume-Seekbar: Y-Axis buttons scale', 100, [n => n >= 0 && n < Infinity]);
					if (input === null) { return; }
				}
				parent.buttonY = properties.buttonY[1] = input;
				overwriteProperties(properties);
				parent.repaint();
			}
		});
	}
	if (parentBackground) {
		menu.newSeparator();
		createBackgroundMenu.call(
			parentBackground,
			{ menuName: menu.newMenu('Background') },
			menu,
			{ nameColors: true }
		);
	}
	menu.newSeparator();
	if (wheel) {
		const menuName = menu.newMenu('Wheel scrolling');
		menu.newEntry({
			menuName, entryText: 'Scrolling ratio' + '\t' + _b(wheel.unit === 'log' ? 'x' : wheel.step), func: () => {
				let input;
				switch (wheel.unit.toLowerCase()) {
					case 'u':
						input = Input.number('int', wheel.step, 'Enter value:\n(' + (wheel.mode === 'volume' ? 'dB' : 's') + ')', 'Volume-Seekbar: Scrolling ratio', 5, [(n) => n > 0 && n < Infinity]);
						break;
					case 'mu':
						input = Input.number('int', wheel.step, 'Enter value:\n(ms)', 'Volume-Seekbar: Scrolling ratio', 250, [(n) => n > 0 && n < Infinity]);
						break;
					case '%':
						input = Input.number('int', wheel.step, 'Enter value:\n(% of Length)', 'Volume-Seekbar: Scrolling ratio', 10, [(n) => n > 0 && n <= 100]);
						break;
				}
				if (input === null) { return; }
				wheel.step = input;
				properties.wheel[1] = JSON.stringify(wheel, (key, value) => key === 'mode' ? void (0) : value);
				overwriteProperties(properties);
			}, flags: wheel.unit === 'log' ? MF_GRAYED : MF_STRING
		});
		{
			const subMenuThree = menu.newMenu('Unit\t' + _b(wheel.unit.replace('u', wheel.mode === 'volume' ? 'dB' : 's')), menuName);
			const options = [
				{ entryText: wheel.mode === 'volume' ? 'Decibels' : 'Seconds', val: 'u' },
				wheel.mode === 'volume' ? null : { entryText: 'Milliseconds', val: 'mu' },
				wheel.mode === 'volume' ? null : { entryText: '% of Length', val: '%' },
				wheel.mode === 'playbacktime' ? null : { entryText: 'Linear steps of Volume', val: 'log' }
			].filter(Boolean);
			options.forEach((opt) => {
				menu.newEntry({
					menuName: subMenuThree, entryText: opt.entryText, func: () => {
						wheel.unit = opt.val;
						properties.wheel[1] = JSON.stringify(wheel, (key, value) => key === 'mode' ? void (0) : value);
						overwriteProperties(properties);
					}
				});
			});
			menu.newCheckMenuLast(() => options.findIndex((e) => e.val === wheel.unit), options);
		}
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName, entryText: 'Reverse scrolling', func: () => {
				wheel.bReversed = !wheel.bReversed;
				properties.wheel[1] = JSON.stringify(wheel, (key, value) => key === 'mode' ? void (0) : value);
				overwriteProperties(properties);
			}
		});
		menu.newCheckMenuLast(() => wheel.bReversed);
	}
	{
		const menuName = menu.newMenu('Double L. Click');
		const options = [
			{ entryText: 'None', val: 0 },
			{ entryText: wheel.mode === 'volume' ? 'Min/Max volume' : 'Restart/Next track', val: 1 },
			{ entryText: wheel.mode === 'volume' ? 'Min/Max volume (no tooltip)' : 'Restart/Next track (no tooltip)', val: 2 },
		].filter(Boolean);
		options.forEach((opt) => {
			menu.newEntry({
				menuName, entryText: opt.entryText, func: () => {
					properties.dblclkSel[1] = opt.val;
					overwriteProperties(properties);
					parent.callbacks.dblclkSel = properties.dblclkSel[1] === 0 ? () => void (0) : null;
				}
			});
		});
		menu.newCheckMenuLast(() => options.findIndex((e) => e.val === properties.dblclkSel[1]), options);
	}
	menu.newSeparator();
	{
		const subMenu = menu.newMenu('Updates');
		menu.newEntry({
			menuName: subMenu, entryText: 'Automatically check for updates', func: () => {
				properties.bAutoUpdateCheck[1] = !properties.bAutoUpdateCheck[1];
				overwriteProperties(properties);
				if (properties.bAutoUpdateCheck[1]) {
					if (typeof checkUpdate === 'undefined') { include('helpers\\helpers_xxx_web_update.js'); }
					setTimeout(checkUpdate, 1000, { bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false });
				}
			}
		});
		menu.newCheckMenuLast(() => properties.bAutoUpdateCheck[1]);
		menu.newEntry({
			menuName: subMenu, entryText: 'Check for updates...', func: () => {
				if (typeof checkUpdate === 'undefined') { include('helpers\\helpers_xxx_web_update.js'); }
				checkUpdate({ bDownload: globSettings.bAutoUpdateDownload, bOpenWeb: globSettings.bAutoUpdateOpenWeb, bDisableWarning: false })
					.then((bFound) => !bFound && fb.ShowPopupMessage('No updates found.', window.FullPanelName + ': Update check'));
			}
		});
	}
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Share UI settings...', func: () => {
			parent.shareUiSettings('popup');
		}
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Open readme...', func: () => {
			const readmePath = folders.xxx + 'helpers\\readme\\volume_seekbar.txt';
			const readme = _open(readmePath, utf8);
			if (readme.length) { fb.ShowPopupMessage(readme, window.ScriptInfo.Name); }
		}
	});
	return menu;
}

function importSettingsMenu(parent, properties = {}) {
	const menu = new _menu();
	menu.newEntry({ entryText: 'Panel menu: ' + window.Name, flags: MF_GRAYED });
	menu.newSeparator();
	// Generic code is left from other packages, but only JSON settings is used
	menu.newEntry({
		entryText: 'Export panel settings...', func: () => {
			exportSettings(
				properties,
				[],
				window.ScriptInfo.Name
			);
		}
	});
	menu.newEntry({
		entryText: 'Import panel settings...', func: () => {
			importSettings(
				void (0),
				properties,
				window.ScriptInfo.Name
			);
		}
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Share UI settings...', func: () => {
			parent.shareUiSettings('popup');
		}
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Configure panel...', func: () => window.ShowConfigureV2()
	});
	menu.newEntry({
		entryText: 'Panel properties...', func: () => window.ShowProperties()
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Reload panel', func: () => window.Reload()
	});
	return menu;
}