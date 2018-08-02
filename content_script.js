let injectionCode=()=>{
	let props=["binaryType","bufferedAmount","extensions","onclose","onmessage","onopen","protocol","readyState","url"],
	WS=window.WebSocket,status="online",activitySince=1,isAFK=false,timer
	window.activityChanged=false
	window.activityType=0
	window.activityName="Set Discord Activity"
	window.activityUrl="https://twitch.tv/settings"
	window.activityDetails=undefined;
	window.activityState=undefined;
	window.activityPartyCur=undefined;
	window.activityPartyMax=undefined;
	window.WebSocket=function(u,p)
	{
		this.sock=new WS(u,p)
		if(u.indexOf("gateway.discord.gg")>-1)
			window.activeSock=this.sock
		for(let i in props)
		{
			Object.defineProperty(this,props[i],{
				get:function()
				{
					return this.sock[props[i]]
				},
				set:function(v)
				{
					this.sock[props[i]]=v
				}
			})
		}
	}
	window.WebSocket.prototype.send=function(d)
	{
		if(this.sock==activeSock)
		{
			if(d.substr(0,8)=='{"op":3,')
			{
				let j=JSON.parse(d)
				status=j.d.status
				activitySince=j.d.since
				isAFK=j.d.afk
				window.sendStatus()
			}
			else
			{
				if(d.substr(0,8)=='{"op":2,')
				{
					clearInterval(timer)
					timer=setInterval(()=>{
						if(activityChanged)
						{
							activityChanged=false
							window.sendStatus()
						}
					},500)
				}
				this.sock.send(d)
			}
		}
		else
		{
			this.sock.send(d)
		}
	}
	window.WebSocket.prototype.close=function(c,r)
	{
		this.sock.close(c,r)
	}
	window.WebSocket.CONNECTING=WS.CONNECTING
	window.WebSocket.OPEN=WS.OPEN
	window.WebSocket.CLOSING=WS.CLOSING
	window.WebSocket.CLOSED=WS.CLOSED
	window.sendStatus=()=>{
		if(window.activeSock&&window.activeSock.readyState==WS.OPEN)
		{
			let game={type:window.activityType,name:window.activityName}
			if(window.activityType==1)
				game.url=window.activityUrl
			if(window.activityPartyMax)
				game.party={size:[window.activityPartyCur,window.activityPartyMax]}
			if(window.activityDetails)
				game.details=window.activityDetails
			if(window.activityState)
				game.state=window.activityState
			window.activeSock.send(JSON.stringify({op:3,d:{
				status:status,
				game:game,
				since:activitySince,
				afk:isAFK
			}}))
		}
	}
}
injectScript=text=>{
	let script=document.createElement("script")
	script.innerHTML=text
	script=document.documentElement.appendChild(script)
	setTimeout(()=>{
		document.documentElement.removeChild(script)
	},10)
}
encodeString=str=>{
	if(str)
		return str.split("\\").join("\\\\").split("\"").join("\\\"")
	else
		return str
}
injectScript("("+injectionCode.toString()+")()")
var port=chrome.runtime.connect({name:"discord"})
port.onMessage.addListener(msg=>{
	if(msg.type!==undefined&&msg.name!==undefined)
	{
		injectScript([
			"window.activityType="+encodeString(msg.type),
			"window.activityName=\""+encodeString(msg.name)+"\"",
			"window.activityUrl=\""+encodeString(msg.streamurl)+"\"",
			"window.activityDetails=\""+encodeString(msg.details)+"\"",
			"window.activityState=\""+encodeString(msg.state)+"\"",
			"window.activityPartyCur=\""+encodeString(msg.partycur)+"\"",
			"window.activityPartyMax=\""+encodeString(msg.partymax)+"\"",
			"window.activityChanged=true"
			].join(";"))
	}
})
