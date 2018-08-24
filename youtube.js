var portName="youtube",
lastPlaying=false,
lastTitle=""
refreshInfo=()=>{
	if(listening)
	{
		let playing=false,title=""
		if(location.pathname=="/watch")
		{
			if(document.querySelector(".html5-video-player")!=null)
				playing=document.querySelector(".html5-video-player").classList.contains("playing-mode")
			if(document.querySelector("#info .title")!=null)
				title=document.querySelector("#info .title").textContent
		}
		if(lastPlaying!=playing||lastTitle!=title)
		{
			lastPlaying=playing
			lastTitle=title
			if(playing)
			{
				data={
					dontSave:true,
					type:2,
					name:"YouTube",
					streamurl:"",
					details:title,
					state:"youtu.be/"+location.search.substr(location.search.indexOf("v=")+2,11),
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
