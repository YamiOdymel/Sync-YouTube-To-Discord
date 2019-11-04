//Load & show translations
/*let elms = document.querySelectorAll("[data-message]")
for (let i in elms) {
	let elm = elms[i]
	if (elm instanceof HTMLElement) {
		elm.textContent = chrome.i18n.getMessage(elm.getAttribute("data-message"))
	}
}

elms = document.querySelectorAll("[data-placeholder]")
for (let i in elms) {
	let elm = elms[i]
	if (elm instanceof HTMLElement) {
		elm.setAttribute("placeholder", chrome.i18n.getMessage(elm.getAttribute("data-placeholder")))
	}
}*/

//
document.querySelector("#emptyWhenPause").addEventListener("change", function () {
	chrome.storage.sync.set({ emptyWhenPause: this.checked });
});

//
document.querySelector("#typeView").addEventListener("change", function () {
	if (this.checked) {
		chrome.storage.sync.set({ detailType: "view" });
	}
});
document.querySelector("#typeName").addEventListener("change", function () {
	if (this.checked) {
		chrome.storage.sync.set({ detailType: "name" });
	}
});

//
document.querySelector("#filterIn").addEventListener("change", function () {
	if (this.checked) {
		chrome.storage.sync.set({ filterType: "in" });
	}
});
document.querySelector("#filterNot").addEventListener("change", function () {
	if (this.checked) {
		chrome.storage.sync.set({ filterType: "not" });
	}
});

//
document.querySelector("#filterList").addEventListener("change", function () {
	chrome.storage.sync.set({ filterList: this.value });
});

//
chrome.storage.sync.get(['emptyWhenPause', 'detailType', 'filterType', 'filterList'], function (result) {
	document.querySelector("#emptyWhenPause").checked = result.emptyWhenPause
	document.querySelector("#filterList").value = result.filterList

	switch (result.detailType) {
		case "view":
			document.querySelector("#typeView").checked = true
			break
		case "name":
			document.querySelector("#typeName").checked = true
			break
	}

	switch (result.filterType) {
		case "in":
			document.querySelector("#filterIn").checked = true
			break
		case "not":
			document.querySelector("#filterNot").checked = true
			break
	}
});

//
chrome.runtime.sendMessage({ action: "ports" }, response => {
	//
	if (!response.discord && !response.youtube) {
		document.getElementById("no-both").className = ""
		return
	} else if (response.discord && response.youtube) {
		document.getElementById("no-both").className = "hidden"
		document.getElementById("is-listening").className = ""
		return
	}
	//
	if (response.discord) {
		document.getElementById("no-discord").className = "hidden"
	}
	else {
		document.getElementById("no-discord").className = ""
	}
	//
	if (response.youtube) {
		document.getElementById("no-youtube").className = "hidden"
	}
	else {
		document.getElementById("no-youtube").className = ""
	}
})
