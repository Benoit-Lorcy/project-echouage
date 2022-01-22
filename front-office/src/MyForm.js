import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function MyForm(props) {
    //states
    const [form, setForm] = useState({ espece: "", start: 0, end: 0, id: -1 });

    // Je pourrais regrouper les useStates suivant en object mais étant donné qu'il faut travailler avec des liste
    // C'est très vite illisible
    const [autocomplete, setAutocomplete] = useState(false);
    const [autocompleteList, setAutocompleteList] = useState([]);
    const [cursor, setCursor] = useState(0);
    const [submit, setSubmit] = useState(false);

    //permet d'avoir la référence de l'icone pour le faire tourner après
    const icon = useRef();

    // Useffect qui permet de gérer le délai de react
    // On l'utilise pour être sur que les donnés ont été mises à jour avant d'envoyer le form
    useEffect(() => {
        if (submit) {
            setSubmit(false);
            handleSubmit();
        }
    }, [submit, form]); // eslint-disable-line react-hooks/exhaustive-deps

    // Quand le form s'update :
    useEffect(() => {
        // Fonction qui permet de fetch la data
        const fetchEspece = async (espece) => {
            // https://localhost:8000/api/v1/especes?search=ball
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/v1/especes?search=${espece}`
            );
            const especes = await response.json();
            await setAutocompleteList(especes);
        };

        // Condition d'apparition / de disparition de l'autocomplete
        if (
            autocompleteList[cursor] &&
            form.espece === autocompleteList[cursor].espece
        ) {
            setAutocomplete(false);
        } else if (form.espece.length >= 3) {
            // On met le cuseur de l'autocomplete à 0
            setCursor(0);
            fetchEspece(form.espece);
            setAutocomplete(true);
        } else {
            setAutocomplete(false);
        }
    }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle l'écriture de tout les inputs du form
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Récupère certaines touches utilisées dans l'input text
    // Permet une navigation avec les flèches grâce au cuseur
    const handleKeyDown = (e) => {
        if (e.keyCode === 40) {
            setCursor((cursor + 1) % autocompleteList.length);
        } else if (e.keyCode === 38) {
            setCursor(cursor === 0 ? cursor : cursor - 1);
        } else if (e.keyCode === 13) {
            // Obligé de faire ça parceque l'action par default d'entré est form submit
            e.preventDefault();
            if (autocomplete && autocompleteList.length > 0) {
                setForm({
                    ...form,
                    espece: autocompleteList[cursor].espece,
                    id: autocompleteList[cursor].id,
                });
            }
            setSubmit(true);
        }
    };

    // Permet de submit avec le boutton
    // La suggestion du curseur est envoyée
    const handleSubmitButton = (e) => {
        e.preventDefault();
        if (!autocomplete) {
            // Rien besoin de faire le bouton est déjà en submit :)
            setSubmit(true);
        } else if (autocompleteList[cursor]) {
            setForm({
                ...form,
                espece: autocompleteList[cursor].espece,
                id: autocompleteList[cursor].id,
            });
            setAutocomplete(false);
        }
        setSubmit(true);
    };

    // When user click on a autocomplete suggestion
    const handleAutocompleteClick = (e) => {
        setForm({
            ...form,
            espece: e.target.dataset.name,
            id: Number(e.target.dataset.id),
        });

        // Obligé de faire ça sinon le curseur n'est pas à 0
        // Et l'update du form réafiche la liste
        // Je pourrais set le curseur là où on click mais c'est plus rapide comme ça
        setAutocompleteList([
            { espece: e.target.dataset.name, id: Number(e.target.dataset.id) },
        ]);
        setAutocomplete(false);
        setSubmit(true);
    };

    // Handle the form submit and call the prop to pass the form object
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        //A suprimer (fait crasher volontairement react)
        if (form.espece === "uwu") e.poufPlusDeSite();

        if (autocompleteList.length === 0) {
            alert("aucun résultat 1");
            return;
        } else if (
            form.espece === "" ||
            form.id === "-1" ||
            autocompleteList[cursor].espece !== form.espece
        ) {
            console.log(autocompleteList);
            alert("aucun résultat 2");
            return;
        } else {
            doAFlip();
            //setCursor(0);
            props.onFormSubmit(form);
        }
    };

    // Le logo loupe effectue un salto avant :O
    const doAFlip = () => {
        icon.current.style.animation = "spin 1s linear";
        setTimeout(() => {
            icon.current.style.animation = "";
        }, 1000);
    };

    return (
        <form className="search" autoComplete="off" onSubmit={handleSubmit}>
            <div className="inputgroup">
                <label htmlFor="start">Année début</label>
                <input
                    className="field date"
                    name="start"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="1984"
                    onChange={handleChange}
                />
            </div>
            <div className="inputgroup">
                <label htmlFor="end">Année fin</label>
                <input
                    className="field date"
                    name="end"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="2020"
                    onChange={handleChange}
                />
            </div>
            <div className="inputgroup especegroup">
                <label htmlFor="espece">Espèce</label>
                <input
                    onKeyDown={handleKeyDown}
                    className="field espece"
                    name="espece"
                    type="text"
                    placeholder="Dauphin commun"
                    onChange={handleChange}
                    value={form.espece}
                />
                {autocomplete && (
                    <div className="autocomplete">
                        <div className="autocompleteItems">
                            {autocompleteList.length > 0 ? (
                                autocompleteList.map((elem, i) => (
                                    <div
                                        key={elem.id}
                                        className={
                                            cursor === i
                                                ? "autocompleteItem active"
                                                : "autocompleteItem"
                                        }
                                        onClick={handleAutocompleteClick}
                                        data-name={elem.espece}
                                        data-id={elem.id}
                                    >
                                        {elem.espece}
                                    </div>
                                ))
                            ) : (
                                <div className="autocompleteItem">
                                    Pas de résultat
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button className="field submit" onClick={handleSubmitButton}>
                <i
                    className="fas fa-search"
                    ref={icon}
                    style={{ color: "#fff" }}
                ></i>
            </button>
        </form>
    );
}

export default MyForm;
