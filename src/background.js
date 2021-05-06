const urls = [
  '*://*.facebook.com/',
  '*://*.twitter.com/',
  '*://*.youtube.com/',
  '*://*.instagram.com/'
]

const STORAGE = chrome.storage.local;

let active = {};

const update = async (host, seconds) => {
  const currentDate = new Date().toISOString().substr(0, 10);
  // get the data saved for the current date
  const data = await getData(currentDate);
  if (data[host]) {
    data[host] += seconds;
  } else {
    data[host] = seconds;
  }
  // save the updated value
  save(currentDate, data);
}

const save = (key, value) => {
  return new Promise((resolve) => {
    STORAGE.set({ [key]: value }, () => {
      resolve();
    });
  });
}

const getData = (key) => {
  return new Promise((resolve) => {
    STORAGE.get(key, result => (result[key] ? resolve(result[key]) : resolve({})));
  });
}

const end = () => {
  if (active.name) {
    const timeDiff = parseInt((Date.now() - active.time) / 1000);
    console.log(`You used ${timeDiff} seconds on ${active.name}`);
    // add it to the number of seconds already saved in chrome.storage.local
    update(active.name, timeDiff);
    active = {};
  }
}

const getActiveTab = () => {
  return new Promise(resolve => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, activeTab => {
      resolve(activeTab[0]);
    });
  });
}

const setActive = async () => {
  const activeTab = await getActiveTab();
  if (activeTab) {
    const { url } = activeTab;
    // check if the tab's url is among the arrays of url
    let host = new URL(url).hostname;
    host = host.replace('www.', '').replace('.com', '');
    if (urls.some(each => each.includes(host))) {
      // set the site and current time
      if (active.name !== host) {
        // if a different site is active then end the existing site's session
        end();
        active = {
          name: host,
          time: Date.now()
        };
        console.log(`${active.name} visited at ${active.time}`);
      }
    }
  }
}

chrome.tabs.onUpdated.addListener(() => {
  setActive();
});

chrome.tabs.onActivated.addListener(() => {
  if (active.name) {
    end();
  }
  // check to see if the active tab is among the sites being tracked
  setActive();
});

chrome.windows.onFocusChanged.addListener(window => {
  if (window === -1) {
    // browser lost focus
    end();
  } else {
    setActive();
  }
});