# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.1.1](#111---2025-12-13
- [1.1.0](#110---2025-12-12)
- [1.0.0](#100---2025-11-29)

## [Unreleased][]
### Added
- UI: added new setting to background to skip following selection if follow now playing is active.
- UI: added new setting to background when using art to apply a special circular blur effect instead of an homogeneous blur.
### Changed
- UI: changed default background settings for a more cohesive experience along [Library-Tree-SMP](https://github.com/regorxxx/Library-Tree-SMP/), Biography and dark mode.
- UI: improvements on dynamic colors handling in some extreme cases with main and secondary colors being almost equal.
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

[Unreleased]: ../../compare/v1.1.1...HEAD
[1.1.1]: ../../compare/v1.1.0...v1.1.1
[1.1.0]: ../../compare/v1.0.0...v1.1.0
[1.0.0]: ../../compare/59f412d...v1.0.0