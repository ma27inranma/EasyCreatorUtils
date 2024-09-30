execute unless entity @s[tag="Util:Op"] run tellraw @s {"rawtext":[{"translate":"text.command.kit.requiresOpTag"}]}

execute if entity @s[tag="Util:Op"] run give @s sf:map_pin