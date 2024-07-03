import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://*.9animetv.to/*", "https://*.rapid-cloud.co/*"],
  all_frames: true
}

const storage = new Storage()

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

const main = async () => {
  let isSkipIntroEnabled =
    (await storage.get<boolean>("skipIntroEnabled")) ?? true
  let isSkipOutroEnabled =
    (await storage.get<boolean>("skipOutroEnabled")) ?? true
  let isChangeSpeedEnabled =
    (await storage.get<boolean>("changeSpeedEnabled")) ?? true
  let playbackRate = (await storage.get<number>("speed")) ?? 1

  storage.watch({
    skipIntroEnabled: (c) => {
      isSkipIntroEnabled = c.newValue
    },
    skipOutroEnabled: (c) => {
      isSkipOutroEnabled = c.newValue
    },
    isChangeSpeedEnabled: (c) => {
      isChangeSpeedEnabled = c.newValue
      if (isChangeSpeedEnabled) {
        adjustPlaybackRate(playbackRate)
      } else {
        adjustPlaybackRate(1)
      }
    },
    speed: (c) => {
      playbackRate = c.newValue
      adjustPlaybackRate(playbackRate)
    }
  })

  if (isChangeSpeedEnabled) {
    adjustPlaybackRate(playbackRate)
  }

  addEventListener("keydown", async (event) => {
    if (!isChangeSpeedEnabled) {
      return
    }

    if (
      event.getModifierState("Alt") ||
      event.getModifierState("Control") ||
      event.getModifierState("Meta") ||
      event.getModifierState("OS")
    ) {
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
      await storage.set("speed", Math.max(0, playbackRate - 0.1))
    }
    if (event.key === "d") {
      await storage.set("speed", playbackRate + 0.1)
    }
  })

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

window.addEventListener("load", () => {
  main()
})
