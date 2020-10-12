# GitLab Stats for Scriptable

![cover](https://github.com/p0fi/gitlab-stats-for-scribtable/blob/main/cover.png)

Note: This script requires at least [Scriptable](https://scriptable.app/) version 1.5.2!

## What's this?

This is a simple GitLab status widget for [Scriptable](https://scriptable.app/) by [@simonbs](https://twitter.com/simonbs). You can quickly see: 

* Number of issues assinged to you
* Number of merge requests assigned to you
* Number of todos for your account
* Number of contributions you made today

## Features
### Dark Mode Support
Supports different color configurations for light ☀️ and dark 🕶️ mode 

### Tap Targets
A tap on one of the items direclty\* opens GitLab at the corrosponding location 🚀

\**Caveat: The standard limitation with iOS 14 applies here: any URLs opened through a widget will require its host app to launch first before the URL can be opened.*

\**Caveat 2: Tap targets in widgets are only supported for medium and large widgets. **Small widgets can currently not have tap targets**.*

### Customizable
The widget can easily be adopted to any homescreen design with simple color configuration options. 

![customizable](https://github.com/p0fi/gitlab-stats-for-scribtable/blob/main/custom.png)

## Instructions

1. Download and extract the content of this repository into the Scriptable folder located in your iCloud Drive.

Your Scriptable folder structure should look like this:

```
iCloud Drive/
├─ Scriptable/
│  ├─ gitlab-stats.js
│  ├─ gitlab-stats/
│  │  ├─ assets/
│  │  │  ├─ gitlab-logo-gray.png
│  │  │  ├─ gitlab-logo-white.png
│  │  │  ├─ issues.png
│  │  │  ├─ merge.png
│  │  │  ├─ todo.png
```

2. Launch Scriptable and make sure that `gitlab-stats` is listed in the scripts view.
3. Configure your gitlab connection information
4. If you like, configure your color settings in the `colorConfig()` function to match the widget to your homescreen 🎨
5. Once everything is configured, run the script and verify that everything is working correctly.
6. Go back to your home screen and add a **medium** or **small** Scriptable widget.
7. Edit the Scriptable widget and choose `gitlab-stats` as the script. Next, set "When Interacting" to "Run Script" and you should be all set and ready to go. If you use a small size widget configure it to open a website when interacting and configure your GitLab URL there. 

## Known Issues

* Sometimes the images would fail to download. In the event where that happens, check the `gitlab-stats` folder in your iCloud Drive to make sure that the images are uploaded correctly. If you see 'Waiting...' on your files, try toggling Airplane Mode on and off to restart the upload.
* The support for dark mode detection does not work very well right now, according to [@simonbs](https://twitter.com/simonbs). It will change to light or dark appearance only some hours after it changed. I hope this gets resolved by Scriptable or iOS soon ™ 
* Right now the widget only supports the medium and small widget size. A Large sized version may follow in the future

## About this project

The script is authored by [@thartwi](https://twitter.com/thartwi) (me) on an ongoing quest to create productive homescreen pages. Since GitLab still offers no native app which could provide such features Scriptable is here to fill the gap! 

## Thanks 🙏

Thanks to [@andyngo](https://twitter.com/andyngo) for some code to load the images from your iCloud Drive folder and the project template!\
Thanks to [@simonbs](https://twitter.com/simonbs) for making an awesome app!\
Thanks to [@gitlab](https://twitter.com/gitlab) for a nice API and the nice icons 🙂
