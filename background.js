let discordPort, youtubePort

// resetActivity 會重設 Discord 的狀態。
const resetActivity = () => {
	if (discordPort === undefined) {
		return
	}
	discordPort.postMessage({
		type: 0,
		name: "",
		streamurl: "",
		details: "",
		state: "",
		partycur: "",
		partymax: ""
	})
}

//
chrome.runtime.onInstalled.addListener((details) => {
	chrome.storage.sync.get(['emptyWhenPause', 'detailType', 'filterType', 'filterList'], function (result) {
		//
		if (result.emptyWhenPause === undefined) {
			chrome.storage.sync.set({ emptyWhenPause: true });
		}
		if (result.detailType === undefined) {
			chrome.storage.sync.set({ detailType: "view" });
		}
		if (result.filterType === undefined) {
			chrome.storage.sync.set({ filterType: "not" });
		}
		if (result.filterList === undefined) {
			chrome.storage.sync.set({ filterList: "# 你可以插入註釋（格式為每個網址一行）\nhttps://www.youtube.com/channel/UC0aDOH-qC-l-_evnNlqWtPA" });
		}
	})
})

//
chrome.runtime.onConnect.addListener(port => {
	switch (port.name) {
		// Discord
		case "discord":
			// 如果有先前的 Discord 埠口則先關閉。
			if (discordPort !== undefined) {
				discordPort.postMessage({ enabled: false })
				discordPort.disconnect()
			}
			// 保存新的 Discord 埠口。
			discordPort = port
			// 當 Discord 埠口被關閉時，就先不要監聽 YouTube 埠口。
			port.onDisconnect.addListener(() => {
				discordPort = undefined
				if (youtubePort !== undefined) {
					youtubePort.postMessage({ enabled: false })
				}
			})
			// 如果 YouTube 埠口同時也準備好了，那麼就開始監聽。
			if (youtubePort !== undefined) {
				youtubePort.postMessage({ enabled: true })

			}
			// 否則就先清空 Discord 狀態。
			resetActivity()
			break

		// YouTube
		case "youtube":
			// 如果有先前的 YouTube 埠口則先關閉。
			if (youtubePort !== undefined) {
				youtubePort.postMessage({ enabled: false })
				youtubePort.disconnect()
			}
			// 保存新的 YouTube 埠口。
			youtubePort = port
			// 如果 YouTube 埠口被關閉的話則清空 Discord 狀態。
			port.onDisconnect.addListener(() => {
				youtubePort = undefined
				resetActivity()
			})
			// 如果 Discord 埠口已經準備好的話就監聽 YouTube 埠口狀態。
			if (discordPort !== undefined) {
				youtubePort.postMessage({ enabled: true })
			}
			break

		//
		default:
			port.disconnect()
			break
	}

})

//
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === undefined) {
		if (discordPort !== undefined) {
			discordPort.postMessage(request)
		}
		return
	}

	switch (request.action) {
		case "ports":
			sendResponse({
				discord: discordPort !== undefined,
				youtube: youtubePort !== undefined
			})
			break

		case "reset":
			resetActivity()
			sendResponse()
			break

		default:
			console.error("Unknown action", request.action)
	}
})
