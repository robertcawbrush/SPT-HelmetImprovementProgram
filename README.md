# What

This mod adds the ability for helmets that block using ear protection to now use ear protection as well as lowers the deafness rating if you are not using ear pro. It does this by first scanning the database, then programmatically setting the debuffs to whatever the config is.



This is compatible with other mods that add new helmets like TACTICAL GEAR COMPONENT by civicIam. It should work for any helmet in the database. The ear blocking value and deafness value are evaluated separately. For the deafness value, there are only three options which are [tt]High, Low, None[/tt], if you use anything wrong it will just default to [tt]None[/tt]. In order for this mod to remove other mod's debuffs you will need to load this mod AFTER those mods. Use LOE (LOAD ORDER EDITOR) by Hazelify to modify your "order.json" file. Remember this only changes what it sees in the database, if a helmet is added after it then this mod will never know about it.



# Why

All the cool rooskie helmets are useless if you can't hear. That goes double if you are using realism.



# How to install

This is a server side mod, just unzip it and place it in your "user/mods" folder and ensure it loads after any mod that adds helmets that you want to change.



in the server log you will see lines starting with "[Helmet Improvement Program]", every log from this mod should start with this. The number in the log line

[tt]" [Helmet Improvement Program] {{number}} Item Penalties removed"[/tt] should be self explanatory but only helmets that had values worse than the modifiers in the config should count towards this number. If only one value is changed it will count toward this number so keep that in mind if it is not behaving how you want it to. If you want to exempt certain helmets for whatever reason than use the config section below.



# Default config



{
  "debug": false,
  "debugHelmetScanLog": false,
  "blocksEarWear": false,
  "deafnessStrengthBasedOnArmorType": false,
  "deafnessStrength": "None",
  "deafnessStrengthPossibleValues": "None, Low, High",
  "deafnessStrengthExplanation": "if deafnessStrengthBasedOnArmorType is true then this value is not used",
  "deafnessStrengthExplanation2": "If deafnessStrengthBasedOnArmorType is false then it will apply this value to everything",
  "helmetsToIgnore": [
    "ItemIdHere",
    "If Your Helmet Is A Vanilla Tarkov Item Use This Site { https://db.sp-tarkov.com/ }",
    "Otherwise You Will Either Need To Buy It From The Store And Look At The Running Server Log",
    "Or Read The Code Of The Mod You Are Using"
  ]
}


# debug

changing debug to true will set logging to verbose. If you are having an issue with an item not being modified this should be the first place you look



# debugHelmetScanLog

This is another debug logging level that scans every single item in the database. It is set to false so that normal debugging is still readable. If you are not seeing your item id in the original debug logs and set this to true and you should be able to find logs from this mod and what it does with those Id's. this one is very verbose so turn it off if the logs from this mod are annoying.



# blocksEarWear

This value does what it says. If a helmet covers the ears than it will block adding ear protection. Set it to false to remove blocking, true to block.



# deafnessStrengthBasedOnArmorType

This is a little more involved that it steps down the existing deafness volumes. If a helmet had a very high deafness volume, like the SFERA (Sphere), than it will now have a low deafness volume. If it was Low than it will be None. You can also just ignore this and set deafnessStrength to None if you don't want to be deaf anymore.



# deafnessStrength

This is field is another debuff that helmets that block earpro have, they make it very hard to hear. There are only 3 values which are "High", "Low", "None" and the config has fake variables that explain this as well. Keep in mind that you have to have the parenthesis ( -> " " ) around the value or it wont work.



# helmetsToIgnore

this is a list of the helmets in which you intend for their debuffs to remain. You will need to place the items id here. Use https://db.sp-tarkov.com/ if the item you want to ignore is a vanilla item. You want the [tt]_id[/tt] field, not the tpl. If the item you want to be ignored is a modded item then you will have to either buy the item from the store and note the Node server's running log as it will specify what itemId was just purchased or sold OR you will have to read the database template json file of the mod you added. This is much easier than you think, an example of TacticalGearComponent is the PARACLETE APC is like this. Little less readable than some mods but there are other clues like the locales you can use to just look up the description you see in game.



...
"CCG_APC": {      
    "_id": "CCG_APC",
    "_name": "CCG_APC",
... ,
"locales": {
            "en": {
                "Name": "PARACLETE APC",
                "ShortName": "APC",
                "Description": "Designed to allow the operator to gain immediate protection against high powered assault weapons, the Advanced Plate Carrier (APC) takes performance to new levels. Blending the functionality of a tactical vest with the simplicity of a plate carrier, the APC accommodates soft ballistic panels, Level III or IV hard armor plates and equipment pouches."
            }
}






Expect very little help concerning this mod. You have every ability to read what the code is doing and fix it. I am planning on abandoning this very quickly just like the other one I updated twice after saying that. I'm an old disgusting semi cripple, I don't wanna make time for your problems that I caused.





## Note to other Developers

The code in its base state is completely free to use or incorporate into other mods. I wouldn't ask permission if I wanted to make something and I won't expect anything different from anyone else. That includes merely changing the version numbers in the future to make it compatible with newer version of SPT and uploading under your own name. The code should be completely fine for future versions of SPT unless the database object changes. Make sure to grab the types folder from the modding resource to compare the expected database structure. SPT @Types should really be on npm or something.



smooches XOXOXO <3:whistling::love::whistling::love::whistling:<3
