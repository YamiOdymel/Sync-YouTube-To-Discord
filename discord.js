var isEnabled = false

const injectionCode = () => {
	const originalWebSocket = window.WebSocket,
		originalWebSocketProperties = ["binaryType", "bufferedAmount", "extensions", "onclose", "onmessage", "onopen", "protocol", "readyState", "url"]
	let status = "online",
		since = 0,
		afk = false, timer
	window.SetDiscordActivityData = {
		sendUpdate: false,
		activityType: 0,
		activityName: "Set Discord Activity",
		activityUrl: "https://twitch.tv/settings",
		activityDetails: "",
		activityState: "",
		activityPartyCur: "",
		activityPartyMax: ""
	}
	window.WebSocket = function (u, p) {
		this.downstreamSocket = new originalWebSocket(u, p)
		if (u.indexOf("gateway.discord.gg") > -1) {
			window.SetDiscordActivityActiveSocket = this.downstreamSocket
		}
		for (let i in originalWebSocketProperties) {
			Object.defineProperty(this, originalWebSocketProperties[i], {
				get: () => this.downstreamSocket[originalWebSocketProperties[i]],
				set: v => this.downstreamSocket[originalWebSocketProperties[i]] = v
			})
		}
	}

	window.WebSocket.prototype.send = function (d) {
		if (this.downstreamSocket == window.SetDiscordActivityActiveSocket) {
			const start = d.substr(0, 8)
			if (start == '{"op":3,') {
				const j = JSON.parse(d)
				status = j.d.status
				since = j.d.since
				afk = j.d.afk
				window.SetDiscordActivitySendStatus()
			}
			else {
				if (start == '{"op":2,') {
					clearInterval(timer)
					timer = setInterval(() => {
						if (window.SetDiscordActivityData.sendUpdate) {
							window.SetDiscordActivityData.sendUpdate = false
							window.SetDiscordActivitySendStatus()
						}
					}, 500)
				}
				this.downstreamSocket.send(d)
			}
		}
		else {
			this.downstreamSocket.send(d)
		}
	}
	window.WebSocket.prototype.close = function (c, r) {
		this.downstreamSocket.close(c, r)
	}
	window.WebSocket.CONNECTING = originalWebSocket.CONNECTING
	window.WebSocket.OPEN = originalWebSocket.OPEN
	window.WebSocket.CLOSING = originalWebSocket.CLOSING
	window.WebSocket.CLOSED = originalWebSocket.CLOSED
	window.SetDiscordActivitySendStatus = () => {
		if (window.SetDiscordActivityActiveSocket && window.SetDiscordActivityActiveSocket.readyState == originalWebSocket.OPEN) {
			let activity = {
				type: window.SetDiscordActivityData.activityType,
				name: window.SetDiscordActivityData.activityName
			}
			if (window.SetDiscordActivityData.activityType == 1) {
				activity.url = window.activityUrl
			}
			if (window.SetDiscordActivityData.activityPartyCur != "" && window.SetDiscordActivityData.activityPartyMax != "") {
				activity.party = { size: [window.SetDiscordActivityData.activityPartyCur, window.SetDiscordActivityData.activityPartyMax] }
			}
			if (window.SetDiscordActivityData.activityDetails) {
				activity.details = window.SetDiscordActivityData.activityDetails
			}
			if (window.SetDiscordActivityData.activityState) {
				activity.state = window.SetDiscordActivityData.activityState
			}
			window.SetDiscordActivityActiveSocket.send(JSON.stringify({
				op: 3, d: {
					status,
					activities: [activity],
					since,
					afk
				}
			}))
		}
	}
},
	injectScript = text => {
		let script = document.createElement("script")
		script.innerHTML = text
		script = document.documentElement.appendChild(script)
		setTimeout(() => {
			document.documentElement.removeChild(script)
		}, 10)
	},
	encodeString = str => str ? str.split("\\").join("\\\\").split("\"").join("\\\"") : str
injectScript("(" + injectionCode.toString() + ")()")

let port = chrome.runtime.connect({ name: "discord" }), closeOK = false

port.onMessage.addListener(msg => {
	if (msg.enabled !== undefined) {
		isEnabled = msg.enabled
		return
	}
	if (msg.type === undefined) {
		return
	}

	injectScript(`window.SetDiscordActivityData={
		sendUpdate:true,
		activityType:`+ msg.type + `,
		activityName:\"`+ encodeString(msg.name) + `\",
		activityUrl:\"\",
		activityDetails:\"`+ encodeString(msg.details) + `\",
		activityState:\"`+ encodeString(msg.state) + `\",
		activityPartyCur:\"\",
		activityPartyMax:\"\"
	}`)
})

port.onDisconnect.addListener(() => {
	isEnabled = true
})
