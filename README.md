# Volume-Seekbar-SMP
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/Volume-Seekbar-SMP/overview/main)
[![CodacyBadge][codacy_badge]](https://www.codacy.com/gh/regorxxx/Volume-Seekbar-SMP/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/Volume-Seekbar-SMP&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/Volume-Seekbar-SMP)  
Volume bar and seekbar for [foobar2000](https://www.foobar2000.org/) and [Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel/)/[JSplitter](https://foobar2000.ru/forum/viewtopic.php?t=6378), with theme support and custom actions. 

![volume](https://github.com/user-attachments/assets/9332e102-5772-4e7a-b24d-298073ab2972)

## Features
- Drag + L. Click to set volume (volume bar) or time (seekbar).
- Double L. Click on button to mute\set full volume (volume bar).
- Double L. Click on button to restart\skip playback (seekbar).
- Vertical and horizontal mouse wheel scrolling.
- Configurable layout, buttons, actions and colors using R. Click menu.
- Elements may be disabled removing color or setting size to 0.
- Tool-tip shows info about actions or elements.
- Fully Wine - Unix - non IE SOs compatible.
- Automatically check for updates (configurable).

<img width="563" height="36" alt="{E5115F8A-2CEF-4006-B99F-0E233FE43A7A}" src="https://github.com/user-attachments/assets/0e196853-632e-4696-95a4-39a477b24b85" />

## Requirements (only one host component required)
 1. [Spider Monkey Panel (foobar2000 v2.x)](hydrogenaudio.org/index.php/topic,116669.new.html#new): JavaScript host component required to install this. Both [x86](https://github.com/marc2k3/spider-monkey-panel-x86) and [x64](https://github.com/marc2k3/spider-monkey-panel-x64). **(host component)**
 2. [Spider Monkey Panel (foobar2000 v1.6.x)](https://theqwertiest.github.io/foo_spider_monkey_panel):  JavaScript host component required to install this. Only x86. **(host component)**
 3. [JSplitter (any foobar2000 version)](https://foobar2000.ru/forum/viewtopic.php?t=6378): JavaScript host component required to install this. Both x86 and x64. **(host component)**
 4. [Required fonts](https://github.com/regorxxx/foobar2000-assets/tree/main/Fonts): FontAwesome, Segoe UI, Arial Unicode MS

<img width="565" height="37" alt="{13777530-6D8F-4509-8306-CC5AC1FC2DA5}" src="https://github.com/user-attachments/assets/799c7746-ad6b-4a1a-b840-90782ae74c55" />

## Installation
See [Wiki](../../wiki/Installation) or the [_INSTALLATION (txt)](../blob/main/_INSTALLATION.txt).
Not properly following the installation instructions will result in scripts not working as intended. Please don't report errors before checking this.

<img width="563" height="134" alt="{D879AF36-79F8-42DD-8082-FD35799C9E08}" src="https://github.com/user-attachments/assets/5cb58b68-3d57-415e-bd92-0e10b0436a82" />

## Support
 1. [Issues tracker](../../issues).
 2. [Hydrogenaudio forum](https://hydrogenaudio.org/index.php/topic,128811.html).
 3. [Wiki](../../wiki).

## Nightly releases
Automatic package [built from GitHub](https://nightly.link/regorxxx/Volume-Seekbar-SMP/workflows/build/main/file.zip) (using the latest commit). Unzip 'file.zip' downloaded and load the '*-package.zip' inside as package within your JS host component.

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/Volume-Seekbar-SMP.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/e04be28637dd40d99fae7bd92f740677
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/Volume-Seekbar-SMP/badge/main
