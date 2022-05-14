const path = require('path')
const fs = require('fs')
const SettingsUI = require('tera-mod-ui').Settings
module.exports = function MoreDressingRoomItems(mod) {
	
	let	data = reloadJSON('./data/dressingroom.json'),
		jobs = ['warrior','lancer','slayer','berserker','sorcerer','archer','priest','mystic','reaper','gunner','brawler','ninja','valkyrie'],
		races = ['human-male','human-female','elf-male','elf-female','aman-male','aman-female','castanic-male','castanic-female','popori','elin','baraka'],
		genders = ['male','female','male','female','male','female','male','female','male','female','male'],
		my = { gameId:0, race:-1, job:-1 },
		itemList = []
	
	mod.hook('S_LOGIN', 15, event => {
		my.gameId = event.gameId
		my.race = Math.floor((event.templateId - 10101) / 100)
		my.job = (event.templateId - 10101) % 100
		loadData()
	})
	mod.hook('S_REQUEST_CONTRACT', 2, event => {
		if (!mod.settings.enabled) return
		if (Number(event.type) == 77) {
			mod.send('S_REQUEST_STYLE_SHOP_MARK_PRODUCTLIST', 1, {
				list: itemList
			})
		}
	})
	mod.hook('S_REQUEST_STYLE_SHOP_MARK_PRODUCTLIST', 1, () => {
		if (!mod.settings.enabled) return
		return false
	})
	
	mod.command.add('dr', (arg1, arg2, arg3) => {
		if(arg1 && arg1.length > 0) arg1 = arg1.toLowerCase()
		if(arg2 && arg2.length > 0) arg2 = arg2.toLowerCase()
		if(arg3 && arg3.length > 0) arg3 = arg3.toLowerCase()
		switch (arg1) {
			case 'ui':
				showGui()
				break
			case 'r':
			case 'reload':
				data = reloadJSON('./data/dressingroom.json')
				loadData()
				mod.command.message('data reloaded')
				break
			default:
				mod.settings.enabled = !mod.settings.enabled
				mod.command.message(mod.settings.enabled?'Enabled'.clr('56B4E9'):'Disabled'.clr('E69F00'))
				break
		}
		return false
	})
	function reloadJSON(fileName) {
		let file = {}
		try {
			file = JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf8'))
		} catch (e) {
			return
		}
		return file
	}
	function convertList(list) {
		let convertedList = []
		for (let item of list) {
			convertedList.push({
				type: 0,
				id: item,
				unk1: 0xFFFFFFFF,
				unk2: 0,
				unk3: 0,
				unk4: false,
				unk5: 0,
				unk6: 1,
				unk7: ""
			})
		}
		return convertedList
	}
	function loadData() {
		itemList = []
		// style weapon
		if (mod.settings.weapon) { for (let item of data.weapon[jobs[my.job]]) { itemList.push(item) }}
		// style body
		if (mod.settings.body) { for (let item of data.body[races[my.race]]) { itemList.push(item) }}
		// style face
		if (mod.settings.face) { for (let item of data.face) { itemList.push(item) }}
		// style hair
		if (mod.settings.hair) { for (let item of data.hair[genders[my.race]]) { itemList.push(item) }}
		// style back
		if (mod.settings.back) { for (let item of data.back) { itemList.push(item) }}
		// style effect
		if (mod.settings.effect) { for (let item of data.effect) { itemList.push(item) }}
		// style underwear
		if (mod.settings.underwear) { for (let item of data.underwear) { itemList.push(item) }}
		// style mount
		if (mod.settings.mount) { for (let item of data.mount) { itemList.push(item) }}
		// style servant
		if (mod.settings.servant) { for (let item of data.servant) { itemList.push(item) }}
		// style service
		if (mod.settings.service) { for (let item of data.service[genders[my.race]]) { itemList.push(item) }}
		itemList = convertList(itemList)
	}
	let gui = null;
    if (global.TeraProxy.GUIMode) {
        gui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 370, resizable: false });
        gui.on('update', settings => { mod.settings = settings; loadData() });

        this.destructor = () => {
            if (gui) {
                gui.close();
                gui = null;
            }
        };
    }
	function showGui() {
		if (!gui) return;
		gui.show();
		if (gui.ui.window) {
			gui.ui.window.webContents.on("did-finish-load", () => {
				gui.ui.window.webContents.executeJavaScript(
					"!function(){var e=document.getElementById('close-btn');e.style.cursor='default',e.onclick=function(){window.parent.close()}}();"
				);
			});
		}
	}
}