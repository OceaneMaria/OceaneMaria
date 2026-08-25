# Projecteur d'image

Application web (sans installation) qui permet de projeter virtuellement une image sur une feuille de papier, pour la décalquer/reproduire à la main.

## Fonctionnement

L'appli affiche le flux de la caméra en plein écran, avec l'image choisie superposée par-dessus en transparence. Il suffit de poser la feuille sous l'appareil (téléphone, tablette ou webcam), de cadrer l'image sur le papier, puis de dessiner en suivant les contours visibles à travers la transparence.

## Utilisation

1. Ouvrir `index.html` dans un navigateur (nécessite HTTPS ou `localhost`, sinon la caméra est bloquée par le navigateur).
2. Autoriser l'accès à la caméra.
3. Appuyer sur **🖼️ Image** pour choisir la photo/dessin à reproduire.
4. Ajuster :
   - **Atténuation** : transparence de l'image (pour bien voir le papier en dessous).
   - **Taille** / **Rotation** : sliders, ou directement avec deux doigts sur l'écran (pincer pour zoomer, tourner pour pivoter).
   - Glisser avec un doigt pour déplacer l'image.
   - **📷 Figer** : fige l'image de la caméra (utile pour poser l'appareil sans que l'image bouge).
   - **↔️ Miroir** : retourne l'image horizontalement.
   - **🔄 Caméra** : bascule entre caméra avant/arrière.
   - **⛶ Plein écran**.
   - **↺ Réinitialiser** : remet la position/taille/rotation à zéro.
5. Un tap simple sur l'écran (sans glisser) affiche/masque la barre d'outils.

## Héberger en ligne (optionnel)

Le dossier est un site statique : il peut être publié tel quel via GitHub Pages (Settings → Pages → déployer depuis la branche, dossier `/image-projector`), ou ouvert directement en local.
