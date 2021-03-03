// Register Presence
function init() {
  waitForRegister();
  setTimeout(() => {
    chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
      console.log('Presence registred', response)
    });
  }, 500);
};

init();

var registerInterval;
function waitForRegister(){
  clearInterval(registerInterval);
  registerInterval = waitUntilTrue(() => {
    return document.getElementsByClassName("video-stream").length;
  },
  () => {
    var video = document.getElementsByClassName("video-stream")[0];
    video.onpause = function() {
      console.info('pause');
      chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
        console.log('Presence registred', response)
      });
    }
    video.onplaying = function() {
      console.info('playing');
      chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
        console.log('Presence registred', response)
      });
    }
    video.oncanplay = function() {
      console.info('canplay');
      setTimeout(() => {
        chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
          console.log('Presence registred', response)
        });
      }, 500)
    }

  })
}

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function(info, sender, sendResponse) {
  console.log('Presence requested', info);
  sendResponse(getPresence());
});

// Return Presence
function getPresence(){
  try{
    var video = document.querySelector(".video-stream");
    if (video !== null && !isNaN(video.duration)) {
      var oldYouTube;
      var title;

      var live = Boolean(document.querySelector(".ytp-live"))

      document.querySelector(".watch-title") !== null
      ? (oldYouTube = true)
      : (oldYouTube = false);

      if (!oldYouTube) {
        title =
        document.location.pathname !== "/watch"
        ? document.querySelector(".ytd-miniplayer .title").firstElementChild.textContent
        : document.querySelector(".title.ytd-video-primary-info-renderer").firstElementChild.textContent
      } else {
        if (document.location.pathname == "/watch")
          title = document.querySelector(".watch-title").textContent;
      }

      if (live) {
        var startTime = (Date.now() - Math.floor((video.currentTime * 1000)));
      } else {
        var endTime = (Date.now() + Math.floor((video.duration * 1000)) -Math.floor((video.currentTime * 1000)));
      }
      try{
        var uploader = document.querySelector(`
          #owner-name a,
          ytd-channel-name.ytd-video-owner-renderer > div > div > yt-formatted-string > a,
          .yt-user-info > a
        `).textContent
      }catch(e){
        console.error('Could not retrive uploader', e);
        var uploader = '';
      }


      if (video.paused == true) {
        return {
          clientId: '607934326151053332',
          presence: {
            state: 'Paused',
            details: title,
            largeImageKey: "youtube",
            smallImageKey: "pause",
            instance: true,
          }
        };
      } else if (!live) {
        var buttons = [];
        try {
          const url = document.URL.includes("/watch?v=")
            ? document.URL.split("&")[0]
            : `https://www.youtube.com/watch?v=${document
                .querySelector("#page-manager > ytd-watch-flexy")
                .getAttribute("video-id")}`
          if (url) buttons.push({
            label: 'Watch',
            url: url
          })
        } catch (e) {
          console.error('Could not retrive buttons', e);
          buttons = []
        }

        return {
          clientId: '607934326151053332',
          presence: {
            state: uploader,
            details: title,
            endTimestamp: endTime,
            largeImageKey: "youtube",
            smallImageKey: "play",
            buttons: buttons,
            instance: true,
          }
        };
      } else {
        var buttons = [];
        try {
          const url = document.URL.includes("/watch?v=")
            ? document.URL.split("&")[0]
            : `https://www.youtube.com/watch?v=${document
                .querySelector("#page-manager > ytd-watch-flexy")
                .getAttribute("video-id")}`
          if (url) buttons.push({
            label: 'Watch',
            url: url
          })
        } catch (e) {
          console.error('Could not retrive buttons', e);
          buttons = []
        }

        return {
          clientId: '607934326151053332',
          presence: {
            state: uploader,
            details: title,
            startTimestamp: startTime,
            largeImageKey: "youtube",
            smallImageKey: "play",
            buttons: buttons,
            instance: true,
          }
        };
      }
    } else {
      return {};
    }
  }catch(e){
    console.error(e);
    return {};
  }
};

//helper

function waitUntilTrue(condition, callback){
  var Interval = null;
  Interval = setInterval(function(){
      if (condition()){
          clearInterval(Interval);
          callback();
      }
  }, 100);
  return Interval;
}
