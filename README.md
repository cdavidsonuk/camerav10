# PhotographyCourses Virtual Camera — Version 12.1 Fixed Edition

This correction addresses the two problems visible in the Version 12 screenshot.

## Fixed

- Added all six missing shooting-scene images
- Mountain Lake, Portrait Studio, Waterfall, Cyclist, Night City and Wildlife now load locally
- Repositioned the two Version 12 command dials inside the camera body
- Dials now scale with the camera instead of using screen-percentage positions
- Prevented the dials from covering the exposure controls
- Updated the service-worker cache to Version 12.1
- Changed caching to prefer newly uploaded files instead of stale cached files

## Upload note

Upload every file and folder, including the new `assets/scenes` folder. After deployment, press Ctrl+F5. If an older service worker still appears, close the site tab and reopen it once.
