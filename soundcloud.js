var portName="soundcloud",
lastPlaying=false,
lastSong=""
refreshInfo=()=>{
	if(listening)
	{
		let playing=false,song="",songLink=""
		if(document.querySelector(".playControls__play")!=null)
		{
			playing=document.querySelector(".playControls__play").classList.contains("playing")
		}
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
					name:song,
					streamurl:"",
					details:chrome.i18n.getMessage("activitySource").replace("%","SoundCloud"),
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
