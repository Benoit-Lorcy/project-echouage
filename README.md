# Project CIR3 Symfony & React

####Contexte (ajout au readme)
Dans le cadre d’un projet de CIR3, nous avons dû créer un site comportant un front end et un back end. Le front end permet de rechercher dans une base de données le nombre d'échouages sur la côte par espèces et par années. Le back end permet de mettre à jour la base de données.

## Tester le projet en local
#### Back-office
Dans le fichier `back-office`, faire `composer install` pour installer les dépendances, puis
`symfony server:start -d` pour lancer le serveur Symfony en tâche de fond.

#### Front-office
Dans le fichier `front-office`, faire `npm install` pour installer les dépendances, puis
`npm start` pour lancer le serveur NodeJS.

Sans avoir changé les ports par défaut, le front-office sera accessible à [http://localhost:8000](http://localhost:8000)
et le back-office à [http://localhost:3000](http://localhost:3000).

**Attention**, l'URL que le front-office va utiliser pour accéder à l'API du back-end est
spécifiée dans `front-office/.env` sous le nom `REACT_APP_API_URL`.

## Base de données
La base de données utilisée n'a pas été modifiée de celle donnée avec le sujet.

### Tables
<table>
  <thead>
    <tr>
        <th colspan="3">Echouage</th>
    </tr>
    <tr>
        <th>Champ</th>
        <th>Type</th>
        <th>Relation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>id</td>
        <td>int</td>
        <td> </td>
    </tr>
    <tr>
        <td>date</td>
        <td>int</td>
        <td> </td>
    </tr>
    <tr>
        <td>nombre</td>
        <td>int</td>
        <td> </td>
    </tr>
    <tr>
        <td>zone_id</td>
        <td>int</td>
        <td>1,1 avec zone</td>
    </tr>
    <tr>
        <td>espece_id</td>
        <td>int</td>
        <td>1,1 avec espece</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th colspan="3">Espece</th>
    </tr>
    <tr>
        <th>Champ</th>
        <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>id</td>
        <td>int</td>
    </tr>
    <tr>
        <td>espece</td>
        <td>varchar</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
        <th colspan="3">Zone</th>
    </tr>
    <tr>
        <th>Champ</th>
        <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>id</td>
        <td>zone</td>
    </tr>
    <tr>
        <td>espece</td>
        <td>varchar</td>
    </tr>
  </tbody>
</table>

## Virtual Hosts
### Serveur de production ISEN
Les enregistrements suivants sont nécessaires dans le fichier `/etc/hosts`
pour pouvoir accéder au site sur le serveur de production à l'ISEN.
```
172.31.3.52 back.prj-frm-52
172.31.3.52 front.prj-frm-52
```
### Front-end
Ce virtual renvois le build statique généré par `npm run build`.
```apache
<VirtualHost *:80>
        ServerName front.prj-frm-52
        ServerAlias www.front.prj-frm-52

        DocumentRoot /var/www/cir3-TP-symf4-TP/front-office/build
</VirtualHost>
```
### Back-end
```apache
<VirtualHost *:80>
        ServerName back.prj-frm-52
        ServerAlias www.back.prj-frm-52

        DocumentRoot /var/www/cir3-TP-symf4-TP/back-office/public

        <Directory /var/www/cir3-TP-symf4-TP/back-office/public>
                AllowOverride None
                DirectoryIndex index.php

                <IfModule mod_rewrite.c>
                        RewriteEngine On

                        RewriteCond %{REQUEST_URI}::$0 ^(/.+)/(.*)::\2$
                        RewriteRule .* - [E=BASE:%1]

                        RewriteCond %{HTTP:Authorization} .+
                        RewriteRule ^ - [E=HTTP_AUTHORIZATION:%0]

                        RewriteCond %{ENV:REDIRECT_STATUS} =""
                        RewriteRule ^index\.php(?:/(.*)|$) %{ENV:BASE}/$1 [R=301,L]

                        RewriteCond %{REQUEST_FILENAME} !-f
                        RewriteRule ^ %{ENV:BASE}/index.php [L]
                </IfModule>

                <IfModule !mod_rewrite.c>
                        <IfModule mod_alias.c>
                                RedirectMatch 307 ^/$ /index.php/
                        </IfModule>
                </IfModule>
        </Directory>
</VirtualHost>
```
## URLs

### URLs alternatives
Le site a aussi été mis en production aux URLs suivantes :
* [https://back.prj-frm-cir3.vanamerongen.fr](https://back.prj-frm-cir3.vanamerongen.fr)
* [https://front.prj-frm-cir3.vanamerongen.fr](https://front.prj-frm-cir3.vanamerongen.fr)

### Front-end
* `front.prj-frm-52` Page d'accueil du front-end

### Back-end
* `back.prj-frm-52/back-office` Page d'accueil du back-office
* `back.prj-frm-52/show_data?espece={espece_id}&zone={zone_id|"all"}` Affichage des données d'échouages sous forme de tableau
* `back.prj-frm-52/echouage` Page d'accueil pour le CRUD de l'entité échouage
    * `back.prj-frm-52/echouage/new` Création d'une nouvelle entité échouage
    * `back.prj-frm-52/echouage/{echouage_id}` Aperçu d'une seule entité échouage
    * `back.prj-frm-52/echouage/{echouage_id}/edit` Modification d'une entité échouage
* `back.prj-frm-52/espece` Page d'accueil pour le CRUD de l'entité espèce
    * `back.prj-frm-52/espece/new` Création d'une nouvelle entité espèce
    * `back.prj-frm-52/espece/{espece_id}` Aperçu d'une seule entité espèce
    * `back.prj-frm-52/espece/{espece_id}/edit` Modification d'une entité espèce
* `back.prj-frm-52/zone` Page d'accueil pour le CRUD de l'entité zone
    * `back.prj-frm-52/zone/new` Création d'une nouvelle entité zone
    * `back.prj-frm-52/zone/{zone_id}` Aperçu d'une seule entité zone
    * `back.prj-frm-52/zone/{zone_id}/edit` Modification d'une entité zone

## API

L'API renvoie toutes les données en format JSON.

* `/api/v1/echouages` Renvois tous ou certains enregistrements de la table echouage
  |Paramètre|Requis|Type|Description|
  |---|:---:|---|---|
  |start|❌|number|Année de départ, enlève les échouages avant cette année|
  |end|❌|number|Année de fin, enlève les échouages après cette année|
  |zone|❌|number|ID d'une zone, enlève tous les échouages qui ne sont pas dans cette zone|
  |espece|❌|number ou string|ID ou nom d'une espèce, enlève tous les échouages qui n'impliquent pas cette espèce|
* `/api/v1/especes` Renvois tous ou certains enregistrements de la table espece
  |Paramètre|Requis|Type|Description|
  |---|:---:|---|---|
  |search|❌|string|Filtre le résultat en cherchant les espèces qui ont un nom qui ressemble au paramètre|
