var discordPort;
chrome.runtime.onConnect.addListener(port=>{
	if(port.name!="discord")
	{
		console.warn("Denied connection from non-Discord port")
		port.disconnect()
	}
	else
	{
		if(discordPort!==undefined)
			discordPort.disconnect()
		discordPort=port
		chrome.storage.local.get(["type","name","streamurl","details","state","partycur","partymax"],result=>discordPort.postMessage(result))
		port.onDisconnect.addListener(()=>discordPort=undefined)
	}
})
chrome.runtime.onMessage.addListener(request=>{
	chrome.storage.local.set(request)
	discordPort.postMessage(request)
})
