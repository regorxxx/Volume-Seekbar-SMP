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
### Changed
- Installation: panel menu, accessed through 'Ctrl + Win + R. Click' (which works globally on any script and panel, at any position), now also includes the script version number and a submenu to check and set auto-updates.
- UI: changed limits for Y-axis size.
### Removed
### Fixed
- UI: added some missing settings for 'Share UI settings' feature.
- UI: small fixes for background blend color mode.
- UI: fixed art cycling glitch on background folder mode after using the mouse wheel.

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