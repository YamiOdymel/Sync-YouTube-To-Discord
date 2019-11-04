var lastPlaying = false, lastTitle = "", isEnabled = false

// 每 1 秒更新一次資訊。
refresh = () => {
	//
	if (!isEnabled) {
		return
	}

	let playing = false, title = ""

	//
	chrome.storage.sync.get(['filterList', 'detailType', 'filterType', 'emptyWhenPause'], (result) => {
		let lines = result.filterList.split('\n')
		let channelURL = document.querySelector(".ytd-video-owner-renderer .yt-formatted-string").href
		let shouldSkip = result.filterType === "in"

		//
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].startsWith("#")) {
				continue
			}
			switch (result.filterType) {
				case "in":
					if (lines[i].includes(channelURL)) {
						shouldSkip = false
					}
					break
				case "not":
					if (lines[i].includes(channelURL)) {
						shouldSkip = true
					}
					break
			}
		}

		//
		if (shouldSkip) {
			chrome.runtime.sendMessage({ action: "reset" })
			return
		}


		// 如果正處於 YouTube 的影片觀賞頁面。
		if (location.pathname == "/watch") {
			// 取得影片播放器的播放狀態。
			if (document.querySelector(".html5-video-player") != null) {
				if (result.emptyWhenPause) {
					playing = document.querySelector(".html5-video-player").classList.contains("playing-mode")
				} else {
					playing = true
				}
			}

			// 取得影片標題名稱。
			if (document.querySelector("#info .title") != null) {
				title = document.querySelector("#info .title").textContent
			}
		}

		// 如果本次狀態與上次不符，就檢查是否要改變狀態。
		if (lastPlaying != playing || lastTitle != title) {
			lastPlaying = playing
			lastTitle = title

			// 如果沒有播放任何影片的話就清空 Discord 狀態。
			if (!playing) {
				chrome.runtime.sendMessage({ action: "reset" })
				return
			}

			//
			let details

			switch (result.detailType) {
				case "view":
					details = document.querySelector(".view-count").textContent.trim()
					break
				case "name":
					details = document.querySelector(".ytd-video-owner-renderer .yt-formatted-string").textContent.trim()
					break
			}

			//
			chrome.runtime.sendMessage({
				type: 3,
				name: title,
				details: details,
				state: "youtu.be/" + location.search.substr(location.search.indexOf("v=") + 2, 11),
			})
		}
	})
}

//
setInterval(refresh, 3000)

//
var port = chrome.runtime.connect({ name: "youtube" })

//
port.onMessage.addListener(msg => {
	if (msg.enabled === undefined) {
		return
	}

	isEnabled = msg.enabled
})

//
port.onDisconnect.addListener(() => {
	isEnabled = false
})
