import re

with open('shared/storeCatalog.ts', 'r', encoding='utf-8') as f:
    content = f.read()

marker = '  /* ── Textiles ────────────────────────────────────────────────── */'

new_furniture = r'''  /* ── Furniture — tables & desks ─────────────────────────── */
  product(
    "MLWK-F04",
    "live-edge-dining-table",
    "furniture",
    2850,
    {
      en: "Live-Edge Walnut Dining Table",
      ar: "\u0637\u0627\u0648\u0644\u0629 \u0637\u0639\u0627\u0645 \u0645\u0646 \u062e\u0634\u0628 \u0627\u0644\u062c\u0648\u0632 \u0627\u0644\u0637\u0628\u064a\u0639\u064a",
      zh: "\u81ea\u7136\u8fb9\u80e1\u6843\u6728\u9910\u684c",
      de: "Baumkanten-Walnuss-Esstisch",
      fr: "Table a manger en noyer a bord vif",
    },
    {
      en: "A six-seater dining table in solid American black walnut with a hand-finished live edge and powder-coated steel legs.",
      ar: "\u0637\u0627\u0648\u0644\u0629 \u0637\u0639\u0627\u0645 \u0628\u0633\u062a\u0629 \u0645\u0642\u0627\u0639\u062f \u0645\u0646 \u062e\u0634\u0628 \u0627\u0644\u062c\u0648\u0632 \u0627\u0644\u0623\u0633\u0648\u062f \u0627\u0644\u0623\u0645\u0631\u064a\u0643\u064a \u0628\u062d\u0627\u0641\u0629 \u0637\u0628\u064a\u0639\u064a\u0629 \u0645\u0634\u063a\u0648\u0644\u0629 \u064a\u062f\u0648\u064a\u0627\u064b \u0648\u0623\u0631\u062c\u0644 \u0641\u0648\u0644\u0627\u0630\u064a\u0629 \u0645\u0637\u0644\u064a\u0629.",
      zh: "\u516d\u4eba\u4f4d\u5b9e\u5fc3\u9ed1\u80e1\u6843\u6728\u9910\u684c\uff0c\u624b\u5de5\u6253\u78e8\u81ea\u7136\u8fb9\uff0c\u7c89\u672b\u55b7\u6d82\u94a2\u817f\u3002",
      de: "6-sitziger Esstisch aus massivem Schwarznussbaum mit handbearbeiteter Baumkante und pulverbeschichteten Stahlbeinen.",
      fr: "Table 6 places en noyer noir massif avec bord vif fini main et pieds acier thermolaques.",
    },
    ["Natural walnut", "Smoked walnut", "Oiled walnut"],
    [["Size", "2000 x 950 mm"], ["Height", "760 mm"], ["Seats", "6"], ["Weight", "68 kg"], ["Material", "Solid black walnut"]],
  ),
  product(
    "MLWK-F05",
    "round-coffee-table",
    "furniture",
    1680,
    {
      en: "Sculptural Round Coffee Table",
      ar: "\u0637\u0627\u0648\u0644\u0629 \u0642\u0647\u0648\u0629 \u062f\u0627\u0626\u0631\u064a\u0629 \u0646\u062d\u062a\u064a\u0629",
      zh: "\u96d5\u5851\u611f\u5706\u5f62\u8336\u51e0",
      de: "Skulpturaler runder Couchtisch",
      fr: "Table basse ronde sculpturale",
    },
    {
      en: "A 1100 mm round coffee table in solid ash with a softly radiused edge and three intersecting solid-wood legs.",
      ar: "\u0637\u0627\u0648\u0644\u0629 \u0642\u0647\u0648\u0629 \u0642\u0637\u0631 1100 \u0645\u0645 \u0645\u0646 \u062e\u0634\u0628 \u0627\u0644\u062f\u0631\u062f\u0627\u0631 \u0628\u062d\u0627\u0641\u0629 \u0645\u0633\u062a\u062f\u064a\u0631\u0629 \u0648\u062b\u0644\u0627\u062b\u0629 \u0623\u0631\u062c\u0644 \u062e\u0634\u0628\u064a\u0629 \u0645\u062a\u0642\u0627\u0637\u0639\u0629.",
      zh: "\u76f4\u5f84 1100mm \u767d\u8721\u6728\u5706\u5f62\u8336\u51e0\uff0c\u67d4\u5f27\u8fb9\u7f18\uff0c\u4e09\u6761\u5b9e\u6728\u4ea4\u9519\u817f\u3002",
      de: "Runder Couchtisch O1100 mm aus Eschen-Massivholz mit sanft gerundeter Kante und drei sich kreuzenden Beinen.",
      fr: "Table basse ronde O1100 mm en frene massif avec bord doucement arrondi et trois pieds entrecroises.",
    },
    ["Natural ash", "Bleached ash", "Oiled walnut"],
    [["Diameter", "1100 mm"], ["Height", "380 mm"], ["Top thickness", "35 mm"], ["Material", "Solid ash"]],
  ),
'''

content = content.replace(marker, new_furniture + '\n' + marker)
with open('shared/storeCatalog.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Added 2 furniture products for testing')
