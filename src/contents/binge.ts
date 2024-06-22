import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://*.rapid-cloud.co/*"],
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

const adjustPlaybackRate = (playbackRate: number) => {
  const video = document.querySelector("video")
  if (!video) {
    return
  }
  if (video.playbackRate !== playbackRate) {
    video.playbackRate = playbackRate
  }
}

const main = () => {
  chrome.storage.sync.get(
    {
      skipIntroEnabled: true,
      skipOutroEnabled: true,
      changeSpeedEnabled: true,
      speed: 1
    },
    ({ skipIntroEnabled, skipOutroEnabled, changeSpeedEnabled, speed }) => {
      let isSkipIntroEnabled = JSON.parse(skipIntroEnabled)
      let isSkipOutroEnabled = JSON.parse(skipOutroEnabled)
      let isChangeSpeedEnabled = JSON.parse(changeSpeedEnabled)
      let playbackRate = JSON.parse(speed)

      if (isChangeSpeedEnabled) {
        adjustPlaybackRate(playbackRate)
      }

      console.log("add event listener")
      addEventListener("keydown", (event) => {
        console.log("is change speed enabled", isChangeSpeedEnabled)
        if (!isChangeSpeedEnabled) {
          return
        }

        const target = event.target as HTMLElement
        if (
          target.nodeName === "INPUT" ||
          target.nodeName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return
        }

        if (event.key === "s") {
          chrome.storage.sync.set({ speed: Math.max(0, playbackRate - 0.1) })
        }
        if (event.key === "d") {
          chrome.storage.sync.set({ speed: playbackRate + 0.1 })
        }
      })

      chrome.storage.onChanged.addListener(
        ({ skipIntroEnabled, skipOutroEnabled, changeSpeedEnabled, speed }) => {
          if (skipIntroEnabled) {
            isSkipIntroEnabled = JSON.parse(skipIntroEnabled?.newValue)
          }
          if (skipOutroEnabled) {
            isSkipOutroEnabled = JSON.parse(skipOutroEnabled?.newValue)
          }
          if (changeSpeedEnabled) {
            isChangeSpeedEnabled = JSON.parse(changeSpeedEnabled?.newValue)
          }
          if (speed) {
            playbackRate = JSON.parse(speed?.newValue)
          }

          if (isChangeSpeedEnabled) {
            adjustPlaybackRate(playbackRate)
          } else {
            adjustPlaybackRate(1)
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
        if (isChangeSpeedEnabled) {
          adjustPlaybackRate(playbackRate)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }
  )
}

window.addEventListener("load", () => {
  main()
})
