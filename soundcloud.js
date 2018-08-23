var port=chrome.runtime.connect({name:"soundcloud"}),
closeOK=false,
listening=false,
lastPlaying=false,
lastSong="",
data=false
refreshInfo=()=>{
	if(listening)
	{
		let playing=false,song="",songLink=""
		if(document.querySelector(".playControls__play")!=null)
			playing=document.querySelector(".playControls__play").classList.contains("playing")
		if(document.querySelector(".playbackSoundBadge__title > a[href][title]")!=null)
		{
			song=document.querySelector(".playbackSoundBadge__title > a[href][title]").getAttribute("title")
			songLink="soundcloud.com"+document.querySelector(".playbackSoundBadge__title a[href][title]").getAttribute("href").split("?in=")[0]
		}
		if(lastPlaying!=playing||lastSong!=song)
		{
			lastPlaying=playing
			lastSong=song
			if(playing)
			{
				data={
					dontSave:true,
					type:2,
					name:"SoundCloud",
					streamurl:"",
					details:song,
					state:songLink,
					partycur:"",
					partymax:""
				}
				chrome.runtime.sendMessage(data)
			}
			else
			{
				data=false
				chrome.runtime.sendMessage({action:"reset"})
			}
		}
	}
}
setInterval(refreshInfo,1000)
port.onMessage.addListener(msg=>{
	console.info(msg)
	if(msg.action)
	{
		switch(msg.action)
		{
			case"close":
			closeOK=true
			break
			default:
			console.warn("Unknown action",msg.action)
		}
	}
	else
	{
		listening=msg.listen
		if(listening&&data)
			chrome.runtime.sendMessage(data)
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
		location.reload()
})
