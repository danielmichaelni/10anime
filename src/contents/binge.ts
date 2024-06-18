import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://*.9animetv.to/*", "https://*.rapid-cloud.co/*"],
  all_frames: true
}

const createButtonClickAttempt = (id: string) => () => {
  const button = document.querySelector<HTMLElement>(`a[id*="${id}"]`)
  if (button !== null && button.style.display !== "none") {
    button.click()
  }
}

const skipIntroAttempt = createButtonClickAttempt("skip-intro")
const skipOutroAttempt = createButtonClickAttempt("skip-outro")

const createObserver = () => {
  chrome.storage.sync.get(
    {
      skipIntroEnabled: true,
      skipOutroEnabled: true,
      changeSpeedEnabled: true,
      speed: 1
    },
    ({ skipIntroEnabled, skipOutroEnabled, changeSpeedEnabled, speed }) => {
      let isSkipIntroEnabled = skipIntroEnabled
      let isSkipOutroEnabled = skipOutroEnabled
      let isChangeSpeedEnabled = changeSpeedEnabled
      let playbackRate = speed

      if (isChangeSpeedEnabled) {
        const video = document.querySelector("video")
        if (video) {
          video.playbackRate = playbackRate
        }
      }

      chrome.storage.onChanged.addListener(
        ({ skipIntroEnabled, skipOutroEnabled, changeSpeedEnabled, speed }) => {
          if (skipIntroEnabled) {
            isSkipIntroEnabled = skipIntroEnabled.newValue
          }
          if (skipOutroEnabled) {
            isSkipOutroEnabled = skipOutroEnabled.newValue
          }
          if (changeSpeedEnabled || speed) {
            if (changeSpeedEnabled) {
              isChangeSpeedEnabled = changeSpeedEnabled.newValue
            }
            if (speed) {
              playbackRate = speed.newValue
            }
            const video = document.querySelector("video")
            if (!video) {
              return
            }
            if (isChangeSpeedEnabled) {
              video.playbackRate = playbackRate
            } else {
              video.playbackRate = 1
            }
          }
        }
      )

      const observer = new MutationObserver(() => {
        if (isSkipIntroEnabled) {
          skipIntroAttempt()
        }
        if (isSkipOutroEnabled) {
          skipOutroAttempt()
        }
        const video = document.querySelector("video")
        if (
          isChangeSpeedEnabled &&
          video &&
          video.playbackRate !== playbackRate
        ) {
          video.playbackRate = playbackRate
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }
  )
}

window.addEventListener("load", () => {
  createObserver()
})
