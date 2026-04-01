# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.3.0](#130---2026-01-12
- [1.2.0](#120---2025-12-23
- [1.1.1](#111---2025-12-13
- [1.1.0](#110---2025-12-12)
- [1.0.0](#100---2025-11-29)

## [Unreleased][]
### Added
- UI: added support for D2D draw mode if JS Host supports it (currently only JSplitter 3.7.8+ or 4.1.0+). It must be set per instance, at the properties panel ('Draw mode: GDI (0), D2D (1)'). If JS Host doesn't support it, it will fallback to GDI. Note D2D mode may produce UI artifacts under Wine or not be fully equivalent to GDI, use at your own consideration and only report problems to JS host component devs.
- UI: ported all background art effect settings to D2D effects. Note bloom will render in a similar way to GDI+ but mute and edge are noticeably different. There is a new setting while using D2D draw mode (see above) to force the GDI+ effect looks, in case D2D draw mode is preferred but also the previous effect looks. In the future, if the list of D2D effects is expanded, enabling that setting will make these new effects unavailable (since they will not have a GDI+ counterpart).
- UI: added multiple new background art effects and image histogram while using D2D draw mode. See [here](https://hydrogenaudio.org/index.php/topic,126743.msg1079362.html#msg1079362).
- UI: added new art mode 'By priority' which lets you set different art types by priority order to use if one is not available for current track. The submenu will show the list of art types set and the parent menu the actual one used. This feature also allows to specify between default, stub or embedded art (contrary to the other modes). Works like 'Album art' script bundled with JSP3 panel, see [here](https://hydrogenaudio.org/index.php/topic,116509.msg1079405.html#msg1079405).
### Changed
- Installation: panel menu, accessed through 'Ctrl + Win + R. Click' (which works globally on any script and panel, at any position), now also includes the script version number and a submenu to check and set auto-updates.
- UI: changed limits for Y-axis size.
- UI: improvements on dynamic colors handling for almost B&W art or with a lightly tinted by a single color.
- UI: improvements on dynamic colors handling related to K-means++ with OKLAB color space when using JSplitter v3.7.10+ or v4.1.0+ as JS host. See [here](https://hydrogenaudio.org/index.php/topic,126743.msg1078415.html#msg1078415).
- Helpers: support for long paths (>260 chars) in multiple internal file handling functions.
- Readmes: general cleanup.
### Removed
### Fixed
- UI: added some missing settings for 'Share UI settings' feature.
- UI: small fixes for background blend color mode.
- UI: fixed art cycling glitch on background folder mode after using the mouse wheel.
- Auto-update: fix error including a file when enabling auto-updates if it was previously disabled.

## [1.3.0] - 2026-01-12
### Added
- UI: added background y-axis margin setting. It only applies when cropping is set to none. While using any other mode, it stretches the image instead. This setting can be directly changed using the mouse wheel + CTRL + ALT + SHIFT too. Note in all my scripts UI elements can be resized using the mouse wheel + CTRL + ALT. And background settings are always accessed also pressing SHIFT.
- UI: added background art mode cycling when using the mouse wheel + SHIFT. It will only cycle between art actually present for current track, omitting not found ones.
- UI: added new background setting for art crop: center (default), bottom, top.
- UI: added new background setting for art zoom, similar to the effect at Library-Tree-SMP (in that case is based on blur level).
- UI: added new background art mode 'Folder' which allows to display any image from a given folder path, like 'thumbs.js' SMP/JSplitter sample. Along this mode, added new cycle settings and file sorting (by name or date) to control how images are chosen. Images within folder can be cycled using the mouse wheel + SHIFT too. Note background settings are always accessed pressing SHIFT.
- UI: added new background setting to prefer placement of dark colors at the outer edge of the panel in bigradient color mode.
- UI: added new background setting for art reflection effects. Only available when crop setting is set to none.
- UI: added new background settings for basic art manipulation.
- UI: added blend color mode which mimics [Library-Tree-SMP](https://github.com/regorxxx/Library-Tree-SMP/), Biography blend theme. Requires art enabled.
- UI: added DUI/CUI color settings for background, which are applied on the color mode used.
### Changed
- UI: cleanup and rework of background submenu and its integration with other settings.
- UI: 'Folder' and 'Path' art modes on background now support TF expressions.
- UI: improvements on dynamic colors handling related to background color identification (mixing the art, color settings, etc.).
- Code cleanup and performance improvements for background code. In particular when art has been set to be invisible for exclusive art colors processing or set to none.
### Removed
### Fixed

## [1.2.0] - 2025-12-23
### Added
- UI: added new setting to background to skip following selection if follow now playing is active.
- UI: added new setting to background when using art to apply a special circular blur effect instead of an homogeneous blur.
### Changed
- UI: changed default background settings for a more cohesive experience along [Library-Tree-SMP](https://github.com/regorxxx/Library-Tree-SMP/), Biography and dark mode.
- UI: improvements on dynamic colors handling in some extreme cases with main and secondary colors being almost equal.
- UI: improvements to dynamic colors handling for background and server-color sources. Added warning when trying to activate both at the same time.
### Removed
### Fixed
- UI: dynamic colors not being reapplied when changing elements' styles immediately.
- UI: fixed color-server not replying when third party panels asked for color scheme.

## [1.1.1] - 2025-12-13
### Added
### Changed
### Removed
### Fixed
- UI: background not being updated on real time if dynamic colors were disabled, which lead to glitches on transparent panels.

## [1.1.0] - 2025-12-12
### Added
- UI: added negative variant of playback time left for seekbar mode at right button. i.e. -x:xx instead of x:xx.
### Changed
### Removed
### Fixed
- JSplitter: fixed compatibility bug with JSplitter (any version) due to improper constructor used on JS Host as reported [here](https://github.com/regorxxx/Infinity-Tools-SMP/pull/6) and [here](https://hydrogenaudio.org/index.php/topic,126743.msg1073615.html#msg1073615).

## [1.0.0] - 2025-11-29
### Added
- First release.
### Changed
### Removed
### Fixed

### Fixed

[Unreleased]: ../../compare/v1.3.0...HEAD
[1.3.0]: ../../compare/v1.2.0...v1.3.0
[1.2.0]: ../../compare/v1.1.1...v1.2.0
[1.1.1]: ../../compare/v1.1.0...v1.1.1
[1.1.0]: ../../compare/v1.0.0...v1.1.0
[1.0.0]: ../../compare/59f412d...v1.0.0