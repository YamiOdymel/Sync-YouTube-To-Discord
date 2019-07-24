var port=chrome.runtime.connect({name:portName}),
closeOK=false,
listening=false,
data=false
setInterval(refreshInfo,1000)
port.onMessage.addListener(msg=>{
	console.info(msg)
	if(msg.action)
	{
		switch(msg.action)
		{
			case"close":
			closeOK=true
			break;

			default:
			console.warn("Unknown action",msg.action)
		}
	}
	else
	{
		listening=msg.listen
		if(listening&&data)
		{
			chrome.runtime.sendMessage(data)
		}
	}
})
port.onDisconnect.addListener(()=>{
	console.info("port closed")
	if(closeOK)
	{
		closeOK=false
		listening=false
	}
	else
	{
		location.reload()
	}
})
