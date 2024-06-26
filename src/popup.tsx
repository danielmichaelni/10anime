import { useStorage } from "@plasmohq/storage/hook"

import "~style.css"

function IndexPopup() {
  const [skipIntroEnabled, setSkipIntroEnabled] = useStorage(
    "skipIntroEnabled",
    false
  )
  const [skipOutroEnabled, setSkipOutroEnabled] = useStorage(
    "skipOutroEnabled",
    false
  )
  const [changeSpeedEnabled, setChangeSpeedEnabled] = useStorage(
    "changeSpeedEnabled",
    false
  )
  const [speed, setSpeed] = useStorage<number>("speed", 1)

  return (
    <div className="container">
      <div className="titleContainer">
        <button
          className="title"
          onClick={() => {
            window.open("https://9animetv.to/home")
          }}>
          10Anime
        </button>
      </div>
      <label className="row">
        <input
          type="checkbox"
          className="checkbox"
          checked={skipIntroEnabled}
          onChange={(e) => {
            setSkipIntroEnabled(e.target.checked)
          }}
        />
        <div className="label">Skip intro</div>
      </label>
      <label className="row">
        <input
          type="checkbox"
          className="checkbox"
          checked={skipOutroEnabled}
          onChange={(e) => {
            setSkipOutroEnabled(e.target.checked)
          }}
        />
        <div className="label">Skip outro</div>
      </label>
      <label className="row">
        <input
          type="checkbox"
          className="checkbox"
          checked={changeSpeedEnabled}
          onChange={(e) => {
            setChangeSpeedEnabled(e.target.checked)
          }}
        />
        <div className="label">Change speed</div>
      </label>
      <div>
        <div className="row speedContainer">
          <button
            className="speedButton"
            onClick={() => {
              setSpeed(Math.max(0, speed - 0.1))
            }}>
            -
          </button>
          <div className="speedLabel">{speed.toFixed(2)}</div>
          <button
            className="speedButton"
            onClick={() => {
              setSpeed(speed + 0.1)
            }}>
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
