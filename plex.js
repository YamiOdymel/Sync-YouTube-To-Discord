var portName="plex",
lastTitle=""
refreshInfo=()=>{
	if(listening)
	{
		let title=document.querySelector("title").textContent,playing=false
		if(lastTitle!=title)
		{
			lastTitle=title
			if(title.substr(0,2)=="▶ ")
			{
				playing=true
				title=title.substr(2)
			}
			if(playing)
			{
				data={
					dontSave:true,
					type:0,
					name:title,
					streamurl:"",
					details:chrome.i18n.getMessage("activitySource").replace("%","Plex"),
					state:"",
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
