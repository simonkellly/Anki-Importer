# Anki Importer
This tool allows simple markdown notes to be imported into anki

To-Do:
- Add option to append folder names to tags
- Support for images
- Support more markdown tags

Various markdown tags dictate the contents of each card.
Each of these must be present to generate cards
Title (#)
Section (##)
Question (###)
Answer (what follows the last question)

This [Anki] tag must be present on a line to begin creating cards

Example:
```
# Bones [Anki]
---
## Clavicle
### Parts
	Sternal end
	Acromial end
### Surfaces
	Anterior and posterior border
	Superior and inferior surface
[Anki]
### Landmarks
	Conoid tubercle
	Impression for costoclavcular ligament
	Trapezoid line
	Subclavian groove / sulcus
---
```
This will generate 2 cards as follows using the note type from the template apkg in the repository
```
[Bones] Clavicle - Parts
------------------------
Sternal End
Acromial End

[Bones] Clavicle - Surfaces
------------------------
Anterior and posterior border
Superior and inferior surface
```