# Project CIR3 Symfony & React

## Base de données
La base de données utilisée n'a pas été modifée de celle donnée avec le sujet.

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
### Front-end
Ce virtual  host sert juste de proxy vers l'application nodejs
```apache

```
### Back-end
```apache

```
## URLs

### Front-end
* `front.prj-frm-52` Page d'accueil du front-end

### Back-end
* `back.prj-frm-52/back-office` Page d'accueil du back-office
* `back.prj-frm-52/back-office/echouage` Page d'accueil pour le CRUD de l'entité échouage
    * `back.prj-frm-52/back-office/echouage/new` Création d'une nouvelle entité échouage
    * `back.prj-frm-52/back-office/echouage/{echouage_id}` Aperçu d'une seule entité échouage
    * `back.prj-frm-52/back-office/echouage/{echouage_id}/edit` Modification d'une entité échouage
* `back.prj-frm-52/back-office/espece` Page d'accueil pour le CRUD de l'entité espèce
    * `back.prj-frm-52/back-office/espece/new` Création d'une nouvelle entité espèce
    * `back.prj-frm-52/back-office/espece/{espece_id}` Aperçu d'une seule entité espèce
    * `back.prj-frm-52/back-office/espece/{espece_id}/edit` Modification d'une entité espèce
* `back.prj-frm-52/back-office/zone` Page d'accueil pour le CRUD de l'entité zone
    * `back.prj-frm-52/back-office/zone/new` Création d'une nouvelle entité zone
    * `back.prj-frm-52/back-office/zone/{zone_id}` Aperçu d'une seule entité zone
    * `back.prj-frm-52/back-office/zone/{zone_id}/edit` Modification d'une entité zone

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
